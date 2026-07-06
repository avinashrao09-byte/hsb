import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerClient, isConfigured } from "@/lib/supabase";
import { getRoleProfile, ROLE_LABELS, TRACK_LABELS } from "@/lib/roleLibrary";
import type { Role, Tier } from "@/lib/types";

export const dynamic = "force-dynamic";

const TIER_STYLE: Record<Tier, string> = {
  green: "bg-tier-green text-white",
  yellow: "bg-tier-yellow text-white",
  red: "bg-tier-red text-white",
};

export default async function StudentPage({ params }: { params: { id: string } }) {
  if (!isConfigured()) return <p className="text-sm text-gray-500">Connect Supabase first.</p>;
  const supabase = getServerClient()!;
  const id = params.id;

  const { data: student } = await supabase
    .from("student")
    .select("id,full_name,email,cohort,track,phase")
    .eq("id", id)
    .single();
  if (!student) notFound();

  const [{ data: snaps }, { data: scores }, { data: soft }, { data: arts }, { data: rx }, { data: self }, { data: audit }] =
    await Promise.all([
      supabase.from("readiness_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: false }),
      supabase.from("competency_score").select("*").eq("student_id", id).order("scored_at", { ascending: false }),
      supabase.from("soft_assessment").select("*").eq("student_id", id).order("assessed_at", { ascending: false }),
      supabase.from("artifact_state").select("*").eq("student_id", id).order("assessed_at", { ascending: false }),
      supabase.from("prescription").select("*").eq("student_id", id).order("assigned_at"),
      supabase.from("self_assessment").select("*").eq("student_id", id).order("created_at", { ascending: false }),
      supabase.from("audit_log").select("*").eq("entity_id", id).order("at", { ascending: false }),
    ]);

  const snap = snaps?.[0];
  const role = (snap?.role ?? "product") as Role;
  const profile = getRoleProfile(role);
  const softA = soft?.[0];
  const selfA = self?.[0];
  const resume = arts?.find((a: any) => a.kind === "resume");
  const linkedin = arts?.find((a: any) => a.kind === "linkedin");
  const latestScore = new Map<string, number>();
  for (const s of scores ?? []) if (!latestScore.has(s.competency_code)) latestScore.set(s.competency_code, s.level);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-hsb-blue hover:underline">
          ← Dashboard
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-hsb-navy">{student.full_name}</h1>
            <p className="text-sm text-gray-500">
              {TRACK_LABELS[student.track] ?? student.track} · target {ROLE_LABELS[role]} · phase{" "}
              <span className="capitalize">{student.phase}</span>
            </p>
          </div>
          {snap ? (
            <div className="text-right">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${TIER_STYLE[snap.tier as Tier]}`}>
                {snap.tier}
              </span>
              <div className="mt-1 text-xs text-gray-500">
                {snap.hard_readiness_pct}% ready
                {snap.signature_floor_fired ? " · signature floor fired" : ""}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={`Diagnosis — ${ROLE_LABELS[role]}`}>
            <div className="space-y-2">
              {profile.competencies.map((c) => {
                const level = latestScore.get(c.code) ?? 0;
                const gap = c.target - level;
                return (
                  <div key={c.code} className="flex items-center gap-3">
                    <div className="w-56 shrink-0 text-sm text-hsb-navy">
                      {c.name}
                      {c.isSignature ? <span className="ml-1 text-hsb-magenta">◆</span> : null}
                    </div>
                    <div className="h-2 flex-1 rounded bg-gray-100">
                      <div
                        className={`h-2 rounded ${gap > 0 ? "bg-tier-yellow" : "bg-tier-green"}`}
                        style={{ width: `${(level / 3) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 shrink-0 text-right text-xs text-gray-500">
                      {level}/{c.target}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Prescriptions">
            {rx && rx.length ? (
              <ul className="space-y-2 text-sm">
                {rx.map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2">
                    <span>
                      <span className="rounded bg-hsb-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase text-hsb-navy">
                        {p.kind}
                      </span>{" "}
                      {p.detail}
                    </span>
                    <span className="text-xs capitalize text-gray-400">{p.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No gaps flagged — curriculum suffices.</p>
            )}
          </Card>

          <Card title="Audit log">
            <ul className="space-y-1 text-xs text-gray-500">
              {(audit ?? []).map((a: any) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-gray-400">{new Date(a.at).toLocaleString()}</span>
                  <span className="font-medium text-hsb-navy">{a.action}</span>
                  <span>{a.entity}</span>
                </li>
              ))}
              {!audit?.length ? <li>No entries.</li> : null}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Soft-readiness">
            {softA ? (
              <dl className="space-y-1 text-sm">
                <Row k="Instruction fidelity" v={softA.s1_instruction_fidelity} />
                <Row k="AI judgment" v={softA.s2_ai_judgment} />
                <Row k="Deliverable quality" v={softA.s3_deliverable_quality} />
                <Row k="Coachability" v={snap?.coachability} />
                <Row k="Self-awareness delta" v={softA.self_awareness_delta} raw />
              </dl>
            ) : (
              <p className="text-sm text-gray-400">Not captured.</p>
            )}
          </Card>

          <Card title="Artifacts">
            <dl className="space-y-1 text-sm">
              <Row k="Resume state" v={resume?.level} />
              <Row k="LinkedIn state" v={linkedin?.level} />
            </dl>
          </Card>

          <Card title="Self-assessment">
            {selfA ? (
              <div className="space-y-2 text-sm text-gray-600">
                {selfA.goals ? <p><span className="font-medium text-hsb-navy">Goals:</span> {selfA.goals}</p> : null}
                {selfA.why ? <p><span className="font-medium text-hsb-navy">Why:</span> {selfA.why}</p> : null}
                <Row k="Self-confidence" v={selfA.self_confidence} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not captured.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-hsb-navy">{title}</h2>
      {children}
    </div>
  );
}

function Row({ k, v, raw }: { k: string; v: number | null | undefined; raw?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{k}</dt>
      <dd className="font-medium text-hsb-navy">{v == null ? "—" : raw ? v : `${v}/3`}</dd>
    </div>
  );
}
