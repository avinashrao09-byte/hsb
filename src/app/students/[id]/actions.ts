"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRoleProfile } from "@/lib/roleLibrary";
import { computeTier, coachabilityFromSoft } from "@/lib/tiering";
import type { CompetencyScore, Level, Role } from "@/lib/types";

function lvl(v: FormDataEntryValue | null): Level {
  const n = Number(v ?? 0);
  return (Number.isFinite(n) ? Math.max(0, Math.min(3, n)) : 0) as Level;
}
function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v).trim();
}

export async function addCheckIn(formData: FormData) {
  const supabase = createClient();
  const id = str(formData.get("student_id"));
  const payload: Record<string, unknown> = {
    student_id: id,
    phase: str(formData.get("phase")) || "build",
    task_progress: formData.get("task_progress") ? Number(formData.get("task_progress")) : null,
    deliverable_quality: str(formData.get("deliverable_quality"))
      ? lvl(formData.get("deliverable_quality"))
      : null,
    sentiment: str(formData.get("sentiment")) ? lvl(formData.get("sentiment")) : null,
    blockers: str(formData.get("blockers")) || null,
    next_actions: str(formData.get("next_actions")) || null,
    notes: str(formData.get("notes")) || null,
    logged_by: "mentor",
  };
  const occ = str(formData.get("occurred_on"));
  if (occ) payload.occurred_on = occ;
  await supabase.from("check_in").insert(payload);

  const next = str(formData.get("next_check_in_on"));
  if (next) await supabase.from("student").update({ next_check_in_on: next }).eq("id", id);

  await supabase
    .from("audit_log")
    .insert({ actor: "mentor", action: "check_in", entity: "check_in", entity_id: id });
  revalidatePath(`/students/${id}`);
}

export async function addHardConversation(formData: FormData) {
  const supabase = createClient();
  const id = str(formData.get("student_id"));
  const summary = str(formData.get("summary"));
  if (!summary) return;
  const payload: Record<string, unknown> = {
    student_id: id,
    summary,
    visibility: str(formData.get("visibility")) || "mentor",
    logged_by: "mentor",
  };
  const occ = str(formData.get("occurred_on"));
  if (occ) payload.occurred_on = occ;
  await supabase.from("hard_conversation").insert(payload);
  await supabase.from("audit_log").insert({
    actor: "mentor",
    action: "hard_conversation",
    entity: "hard_conversation",
    entity_id: id,
  });
  revalidatePath(`/students/${id}`);
}

export async function setCompanies(formData: FormData) {
  const supabase = createClient();
  const id = str(formData.get("student_id"));
  const names = str(formData.get("companies"))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  await supabase.from("target_company").delete().eq("student_id", id);
  if (names.length)
    await supabase
      .from("target_company")
      .insert(names.map((name, i) => ({ student_id: id, name, priority: i + 1 })));
  await supabase.from("audit_log").insert({
    actor: "mentor",
    action: "set_companies",
    entity: "target_company",
    entity_id: id,
  });
  revalidatePath(`/students/${id}`);
}

export async function updateTask(formData: FormData) {
  const supabase = createClient();
  const id = str(formData.get("student_id"));
  const pid = str(formData.get("prescription_id"));
  const status = str(formData.get("status"));
  const patch: Record<string, unknown> = { status };
  if (status === "done") patch.completed_at = new Date().toISOString();
  await supabase.from("prescription").update(patch).eq("id", pid);
  await supabase.from("audit_log").insert({
    actor: "mentor",
    action: `task_${status}`,
    entity: "prescription",
    entity_id: id,
  });
  revalidatePath(`/students/${id}`);
}

export async function setFlagsPhase(formData: FormData) {
  const supabase = createClient();
  const id = str(formData.get("student_id"));
  const flags = str(formData.get("flags"))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const patch: Record<string, unknown> = { flags };
  const phase = str(formData.get("phase"));
  if (phase) patch.phase = phase;
  await supabase.from("student").update(patch).eq("id", id);
  await supabase
    .from("audit_log")
    .insert({ actor: "mentor", action: "update", entity: "student", entity_id: id });
  revalidatePath(`/students/${id}`);
}

export async function reDiagnose(formData: FormData) {
  const supabase = createClient();
  const id = str(formData.get("student_id"));
  const role = str(formData.get("role")) as Role;
  const profile = getRoleProfile(role);

  const s1 = lvl(formData.get("s1"));
  const s2 = lvl(formData.get("s2"));
  const s3 = lvl(formData.get("s3"));
  const critique = str(formData.get("critique")) ? lvl(formData.get("critique")) : undefined;

  const scores: CompetencyScore[] = profile.competencies.map((c) => ({
    competencyCode: c.code,
    level: lvl(formData.get(`score.${c.code}`)),
  }));
  await supabase.from("competency_score").insert(
    scores.map((s) => ({
      student_id: id,
      role,
      competency_code: s.competencyCode,
      level: s.level,
      scored_by: "mentor",
    }))
  );

  // First diagnosis: generate the plan (prescriptions) if the student has none yet.
  const { count: rxCount } = await supabase
    .from("prescription")
    .select("id", { count: "exact", head: true })
    .eq("student_id", id);
  if (!rxCount) {
    const below = profile.competencies
      .filter((c) => (scores.find((s) => s.competencyCode === c.code)?.level ?? 0) < c.target)
      .sort((a, b) => Number(b.isSignature) - Number(a.isSignature));
    const rx = below.flatMap((c) => {
      const items: { student_id: string; competency_code: string; kind: string; detail: string }[] = [];
      if (c.remediation.project)
        items.push({ student_id: id, competency_code: c.code, kind: "project", detail: c.remediation.project });
      if (c.remediation.reading)
        items.push({ student_id: id, competency_code: c.code, kind: "reading", detail: c.remediation.reading });
      return items;
    });
    if (rx.length) await supabase.from("prescription").insert(rx);
  }

  await supabase.from("soft_assessment").insert({
    student_id: id,
    source_label: str(formData.get("soft_source")) || "Re-diagnosis",
    s1_instruction_fidelity: s1,
    s2_ai_judgment: s2,
    s3_deliverable_quality: s3,
    critique_response: critique ?? null,
    assessed_by: "mentor",
  });

  const coachability = coachabilityFromSoft({
    instructionFidelity: s1,
    critiqueResponse: critique,
    selfAwarenessDelta: 0,
  });
  const result = computeTier(role, scores, coachability);

  await supabase.from("readiness_snapshot").insert({
    student_id: id,
    role,
    hard_gap: result.hardGap,
    hard_readiness_pct: result.hardReadinessPct,
    coachability,
    tier: result.tier,
    signature_floor_fired: result.signatureFloorFired,
  });
  await supabase.from("audit_log").insert({
    actor: "mentor",
    action: "tier_change",
    entity: "readiness_snapshot",
    entity_id: id,
    after: { tier: result.tier, readiness: result.hardReadinessPct },
  });
  revalidatePath(`/students/${id}`);
}
