import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isConfigured } from "@/lib/supabase/server";
import { getRoleProfile, ROLE_LABELS, TRACK_LABELS } from "@/lib/roleLibrary";
import type { Role, Tier } from "@/lib/types";

export const dynamic = "force-dynamic";

const TIER_META: Record<Tier, { label: string; badge: string }> = {
  green: { label: "Green", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  yellow: { label: "Yellow", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  red: { label: "Red", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export default async function StudentPage({ params }: { params: { id: string } }) {
  if (!isConfigured()) return <p className="text-sm text-slate-500">Connect Supabase first.</p>;
  const supabase = createClient();
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
  const meta = snap ? TIER_META[snap.tier as Tier] : null;

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-hsb-blue">
        <span aria-hidden>←</span> Back to batch
      </Link>

      {/* Header card */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-hsb-tint text-lg font-semibold text-hsb-navy">
            {student.full_name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-hsb-navy">
              {student.full_name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <span>{TRACK_LABELS[student.track] ?? student.track}</span>
              <span className="text-slate-300">•</span>
              <span>Target: {ROLE_LABELS[role]}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                {student.phase}
              </span>
            </p>
          </div>
        </div>
        {snap && meta ? (
          <div className="text-right">
            <span
              className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${meta.badge}`}
            >
              {meta.label}
            </span>
            <div className="mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{snap.hard_readiness_pct}%</span> ready
              {snap.signature_floor_fired ? (
                <span className="ml-1 text-rose-500">· signature floor fired</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={`Diagnosis — ${ROLE_LABELS[role]}`}>
            <div className="space-y-3.5">
              {profile.competencies.map((c) => {
                const level = latestScore.get(c.code) ?? 0;
                const meetsTarget = level >= c.target;
                const barColor = meetsTarget
                  ? "bg-emerald-500"
                  : c.isSignature
                  ? "bg-rose-500"
                  : "bg-amber-500";
                return (
                  <div key={c.code} className="flex items-center gap-3">
                    <div className="flex w-60 shrink-0 items-center gap-1.5 text-sm text-slate-700">
                      <span className="truncate">{c.name}</span>
                      {c.isSignature ? (
                        <span className="text-hsb-blue" title="Signature competency">
                          ◆
                        </span>
                      ) : null}
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${(level / 3) * 100}%` }}
                      />
                    </div>
                    <div className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500">
                      {level} / {c.target}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Prescriptions">
            {rx && rx.length ? (
              <ul className="space-y-2">
                {rx.map((p: any) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5"
                  >
                    <span className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          p.kind === "project"
                            ? "bg-hsb-tint text-hsb-navy"
                            : p.kind === "reading"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {p.kind}
                      </span>
                      {p.detail}
                    </span>
                    <span className="text-xs capitalize text-slate-400">{p.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No gaps flagged — curriculum suffices.</p>
            )}
          </Card>

          <Card title="Audit log">
            <ol className="relative space-y-3 border-l border-slate-100 pl-4">
              {(audit ?? []).map((a: any) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-300 ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-x-2 text-xs">
                    <span className="font-medium capitalize text-slate-700">
                      {String(a.action).replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400">{a.entity}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">{new Date(a.at).toLocaleString()}</span>
                  </div>
                </li>
              ))}
              {!audit?.length ? <li className="text-xs text-slate-400">No entries.</li> : null}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Soft-readiness">
            {softA ? (
              <dl className="divide-y divide-slate-100">
                <ScoreRow k="Instruction fidelity" v={softA.s1_instruction_fidelity} />
                <ScoreRow k="AI judgment" v={softA.s2_ai_judgment} />
                <ScoreRow k="Deliverable quality" v={softA.s3_deliverable_quality} />
                <ScoreRow k="Coachability" v={snap?.coachability} />
                <ScoreRow k="Self-awareness delta" v={softA.self_awareness_delta} raw />
              </dl>
            ) : (
              <p className="text-sm text-slate-400">Not captured.</p>
            )}
          </Card>

          <Card title="Artifacts">
            <dl className="divide-y divide-slate-100">
              <ScoreRow k="Resume state" v={resume?.level} />
              <ScoreRow k="LinkedIn state" v={linkedin?.level} />
            </dl>
          </Card>

          <Card title="Self-assessment">
            {selfA ? (
              <div className="space-y-3 text-sm text-slate-600">
                {selfA.goals ? (
                  <p>
                    <span className="font-medium text-slate-800">Goals: </span>
                    {selfA.goals}
                  </p>
                ) : null}
                {selfA.why ? (
                  <p>
                    <span className="font-medium text-slate-800">Why: </span>
                    {selfA.why}
                  </p>
                ) : null}
                <dl className="divide-y divide-slate-100">
                  <ScoreRow k="Self-confidence" v={selfA.self_confidence} />
                </dl>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not captured.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ScoreRow({ k, v, raw }: { k: string; v: number | null | undefined; raw?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-semibold tabular-nums text-slate-800">
        {v == null ? "—" : raw ? v : `${v} / 3`}
      </dd>
    </div>
  );
}
