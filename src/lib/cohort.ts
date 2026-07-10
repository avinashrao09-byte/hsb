import { createClient } from "./supabase/server";
import type { Role, Tier } from "./types";

export type EnrichedStudent = {
  id: string;
  full_name: string;
  cohort: string | null;
  track: string;
  phase: string;
  next_check_in_on: string | null;
  flags: string[];
  role: Role | null;
  tier: Tier | null;
  readiness: number | null;
  coachability: number | null;
  signatureFloor: boolean;
  intakeTier: Tier | null;
  intakeReadiness: number | null;
  taskTotal: number;
  taskDone: number;
  fowTier: Tier | null;
  fowIndex: number | null;
};

const TIER_RANK: Record<Tier, number> = { red: 0, yellow: 1, green: 2 };

/** True when the latest tier is better than the intake tier. */
export function hasImproved(s: EnrichedStudent): boolean {
  if (!s.tier || !s.intakeTier) return false;
  return TIER_RANK[s.tier] > TIER_RANK[s.intakeTier];
}

/** At-risk: Red, or low coachability, or an overdue check-in. */
export function isAtRisk(s: EnrichedStudent, today = new Date()): boolean {
  if (s.tier === "red") return true;
  if (s.coachability != null && s.coachability <= 1) return true;
  if (s.next_check_in_on && new Date(s.next_check_in_on) < today) return true;
  return false;
}

export function taskPct(s: EnrichedStudent): number | null {
  if (!s.taskTotal) return null;
  return Math.round((s.taskDone / s.taskTotal) * 100);
}

export async function getCohort(): Promise<EnrichedStudent[]> {
  const supabase = createClient();
  const [{ data: students }, { data: snaps }, { data: rx }, { data: fowRows }] = await Promise.all([
    supabase
      .from("student")
      .select("id,full_name,cohort,track,phase,next_check_in_on,flags")
      .order("created_at"),
    supabase
      .from("readiness_snapshot")
      .select("student_id,role,tier,hard_readiness_pct,coachability,signature_floor_fired,snapshot_at")
      .order("snapshot_at", { ascending: true }),
    supabase.from("prescription").select("student_id,status"),
    supabase
      .from("future_work_snapshot")
      .select("student_id,fow_tier,fow_index,snapshot_at")
      .order("snapshot_at", { ascending: true }),
  ]);

  const first = new Map<string, any>();
  const last = new Map<string, any>();
  for (const s of (snaps ?? []) as any[]) {
    if (!first.has(s.student_id)) first.set(s.student_id, s);
    last.set(s.student_id, s);
  }

  const taskTotal = new Map<string, number>();
  const taskDone = new Map<string, number>();
  for (const p of (rx ?? []) as any[]) {
    taskTotal.set(p.student_id, (taskTotal.get(p.student_id) ?? 0) + 1);
    if (p.status === "done") taskDone.set(p.student_id, (taskDone.get(p.student_id) ?? 0) + 1);
  }

  const fowLast = new Map<string, any>();
  for (const f of (fowRows ?? []) as any[]) fowLast.set(f.student_id, f);

  return ((students ?? []) as any[]).map((st) => {
    const l = last.get(st.id);
    const f = first.get(st.id);
    return {
      id: st.id,
      full_name: st.full_name,
      cohort: st.cohort ?? null,
      track: st.track,
      phase: st.phase,
      next_check_in_on: st.next_check_in_on ?? null,
      flags: (st.flags ?? []) as string[],
      role: (l?.role ?? null) as Role | null,
      tier: (l?.tier ?? null) as Tier | null,
      readiness: l?.hard_readiness_pct ?? null,
      coachability: l?.coachability ?? null,
      signatureFloor: l?.signature_floor_fired ?? false,
      intakeTier: (f?.tier ?? null) as Tier | null,
      intakeReadiness: f?.hard_readiness_pct ?? null,
      taskTotal: taskTotal.get(st.id) ?? 0,
      taskDone: taskDone.get(st.id) ?? 0,
      fowTier: (fowLast.get(st.id)?.fow_tier ?? null) as Tier | null,
      fowIndex: fowLast.get(st.id)?.fow_index ?? null,
    } satisfies EnrichedStudent;
  });
}
