import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isConfigured } from "@/lib/supabase/server";
import { getRoleProfile, ROLE_LABELS, TRACK_LABELS } from "@/lib/roleLibrary";
import { TIER_META, COACH_META } from "@/lib/tierUi";
import { FUTURE_WORK_SKILLS } from "@/lib/futureWork";
import type { Role, Tier } from "@/lib/types";
import {
  addCheckIn,
  addHardConversation,
  setCompanies,
  updateTask,
  setFlagsPhase,
  reDiagnose,
} from "./actions";

export const dynamic = "force-dynamic";

const PHASES = ["onboarding", "skill_building", "internship_prep", "internship", "job_search", "placed"];
const LEVELS = [0, 1, 2, 3];
const AUTHORSHIP = ["AI-only", "Mostly AI", "Human-led, AI-assisted", "Human-driven"];
const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-hsb-blue focus:outline-none focus:ring-2 focus:ring-hsb-blue/20";

export default async function StudentPage({ params }: { params: { id: string } }) {
  if (!isConfigured()) return <p className="text-sm text-slate-500">Connect Supabase first.</p>;
  const supabase = createClient();
  const id = params.id;

  const { data: student } = await supabase
    .from("student")
    .select("id,full_name,email,cohort,track,phase,next_check_in_on,flags")
    .eq("id", id)
    .single();
  if (!student) notFound();

  const [
    { data: snapsAsc },
    { data: scores },
    { data: soft },
    { data: arts },
    { data: rx },
    { data: self },
    { data: audit },
    { data: companies },
    { data: checkins },
    { data: hardConvos },
    { data: roleDecl },
    { data: exRows },
    { data: fowRows },
  ] = await Promise.all([
    supabase.from("readiness_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: true }),
    supabase.from("competency_score").select("*").eq("student_id", id).order("scored_at", { ascending: false }),
    supabase.from("soft_assessment").select("*").eq("student_id", id).order("assessed_at", { ascending: false }),
    supabase.from("artifact_state").select("*").eq("student_id", id).order("assessed_at", { ascending: false }),
    supabase.from("prescription").select("*").eq("student_id", id).order("assigned_at"),
    supabase.from("self_assessment").select("*").eq("student_id", id).order("created_at", { ascending: false }),
    supabase.from("audit_log").select("*").eq("entity_id", id).order("at", { ascending: false }),
    supabase.from("target_company").select("*").eq("student_id", id).order("priority"),
    supabase.from("check_in").select("*").eq("student_id", id).order("occurred_on", { ascending: false }),
    supabase.from("hard_conversation").select("*").eq("student_id", id).order("occurred_on", { ascending: false }),
    supabase
      .from("role_declaration")
      .select("role")
      .eq("student_id", id)
      .eq("is_current", true)
      .order("declared_at", { ascending: false })
      .limit(1),
    supabase.from("exercise_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: false }),
    supabase.from("future_work_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: false }),
  ]);

  const snaps = (snapsAsc ?? []) as any[];
  const snap = snaps[snaps.length - 1];
  const declaredRole = (roleDecl ?? [])[0]?.role as Role | undefined;
  const role = (declaredRole ?? snap?.role ?? "product") as Role;
  const diagnosed = snaps.length > 0;
  const profile = getRoleProfile(role);
  const softA = (soft ?? [])[0];
  const exA = (exRows ?? [])[0] as any;
  const fowA = (fowRows ?? [])[0] as any;
  const selfA = (self ?? [])[0];
  const resume = (arts ?? []).find((a: any) => a.kind === "resume");
  const linkedin = (arts ?? []).find((a: any) => a.kind === "linkedin");
  const latestScore = new Map<string, number>();
  for (const s of (scores ?? []) as any[])
    if (!latestScore.has(s.competency_code)) latestScore.set(s.competency_code, s.level);
  const meta = snap ? TIER_META[snap.tier as Tier] : null;
  const coach = snap?.coachability != null ? COACH_META[snap.coachability as number] : null;

  const radarItems = profile.competencies.map((c) => ({
    label: c.name,
    value: latestScore.get(c.code) ?? 0,
    target: c.target,
    signature: c.isSignature,
  }));

  return (
    <div className="space-y-6">
      <Link href="/board" className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-hsb-blue">
        <span aria-hidden>←</span> Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-md border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-hsb-tint text-lg font-semibold text-hsb-navy">
            {student.full_name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-hsb-navy">
              {student.full_name}
              {student.cohort === "MBA 2026 (demo)" ? <IllustrativeTag /> : null}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <span>{TRACK_LABELS[student.track] ?? student.track}</span>
              <span className="text-slate-300">•</span>
              <span>Target: {ROLE_LABELS[role]}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                {student.phase.replace(/_/g, " ")}
              </span>
              {coach ? (
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${coach.pill}`}>
                  {coach.label}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        {snap && meta ? (
          <div className="text-right">
            <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${meta.pill}`}>
              {meta.label}
            </span>
            <div className="mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{snap.hard_readiness_pct}%</span> ready
              {snap.signature_floor_fired ? <span className="ml-1 text-rag-red">· floor</span> : null}
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center rounded-full border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-500">
            Not diagnosed
          </span>
        )}
      </div>

      {/* Target companies */}
      <Card title="Target companies">
        <div className="flex flex-wrap gap-2">
          {(companies ?? []).length ? (
            (companies as any[]).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center rounded-full bg-hsb-tint px-3 py-1 text-sm font-medium text-hsb-navy ring-1 ring-hsb-soft/40"
              >
                {c.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">None set.</span>
          )}
        </div>
        <Detail label="Edit companies">
          <form action={setCompanies} className="mt-3 flex gap-2">
            <input type="hidden" name="student_id" value={id} />
            <input
              name="companies"
              className={input}
              placeholder="Accenture Strategy, BCG, Bain, McKinsey, Kearney"
              defaultValue={(companies ?? []).map((c: any) => c.name).join(", ")}
            />
            <SaveButton />
          </form>
        </Detail>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Diagnosis: radar + bars */}
          <Card title={`Gap profile — ${ROLE_LABELS[role]}`}>
            {!diagnosed ? (
              <p className="text-sm text-slate-400">
                Not diagnosed yet — run the diagnosis below to score the six competencies and set
                the baseline tier.
              </p>
            ) : (
            <div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
              <Radar items={radarItems} />
              <div className="space-y-3">
                {radarItems.map((it, i) => {
                  const meetsTarget = it.value >= it.target;
                  const barColor = meetsTarget ? "bg-rag-green" : it.signature ? "bg-rag-red" : "bg-rag-amber";
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                        {i + 1}
                      </span>
                      <span className="w-40 shrink-0 truncate text-xs text-slate-600">
                        {it.label}
                        {it.signature ? <span className="ml-1 text-hsb-blue">◆</span> : null}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(it.value / 3) * 100}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500">
                        {it.value}/{it.target}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </Card>

          {/* RAG movement */}
          <Card title="RAG movement — intake → now">
            {snaps.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {snaps.map((s: any, i: number) => {
                  const m = TIER_META[s.tier as Tier];
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="rounded-xl border border-slate-200 px-3 py-2 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${m.pill}`}>
                          {m.label}
                        </span>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {s.hard_readiness_pct}% · {new Date(s.snapshot_at).toLocaleDateString()}
                        </div>
                      </div>
                      {i < snaps.length - 1 ? <span className="text-slate-300">→</span> : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No snapshots yet.</p>
            )}
          </Card>

          {/* 12-month plan */}
          <Card title="12-month plan">
            <ol className="flex flex-wrap gap-1.5">
              {PHASES.map((p) => {
                const active = p === student.phase;
                return (
                  <li
                    key={p}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ring-1 ${
                      active
                        ? "bg-hsb-navy text-white ring-hsb-navy"
                        : "bg-white text-slate-500 ring-slate-200"
                    }`}
                  >
                    {p.replace(/_/g, " ")}
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Tasks */}
          <Card title="Assigned tasks">
            {rx && rx.length ? (
              <ul className="space-y-2">
                {(rx as any[]).map((p) => (
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
                      <span className={p.status === "done" ? "text-slate-400 line-through" : ""}>
                        {p.detail}
                      </span>
                    </span>
                    <form action={updateTask}>
                      <input type="hidden" name="student_id" value={id} />
                      <input type="hidden" name="prescription_id" value={p.id} />
                      <select
                        name="status"
                        defaultValue={p.status}
                        className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs capitalize text-slate-600"
                      >
                        {["assigned", "in_progress", "done", "waived"].map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      <button className="ml-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200">
                        Set
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No gaps flagged — curriculum suffices.</p>
            )}
          </Card>

          {/* Check-in history */}
          <Card title="Check-in history">
            <div className="space-y-2">
              {(checkins ?? []).length ? (
                (checkins as any[]).map((ci) => (
                  <div key={ci.id} className="rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium capitalize text-slate-700">{ci.phase.replace(/_/g, " ")}</span>
                      <span>{ci.occurred_on}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      {ci.task_progress != null ? <span>Tasks {ci.task_progress}%</span> : null}
                      {ci.sentiment != null ? <span>Sentiment {ci.sentiment}/3</span> : null}
                      {ci.deliverable_quality != null ? <span>Quality {ci.deliverable_quality}/3</span> : null}
                    </div>
                    {ci.blockers ? <p className="mt-1 text-xs text-slate-600"><b>Blockers:</b> {ci.blockers}</p> : null}
                    {ci.next_actions ? <p className="text-xs text-slate-600"><b>Next:</b> {ci.next_actions}</p> : null}
                    {ci.notes ? <p className="text-xs text-slate-500">{ci.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No check-ins yet.</p>
              )}
            </div>
            <Detail label="Log a check-in">
              <form action={addCheckIn} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="student_id" value={id} />
                <LabeledSelect name="phase" label="Phase" options={PHASES} defaultValue={student.phase} />
                <Labeled label="Date">
                  <input type="date" name="occurred_on" className={input} />
                </Labeled>
                <Labeled label="Task progress %">
                  <input type="number" name="task_progress" min={0} max={100} className={input} />
                </Labeled>
                <LabeledSelect name="sentiment" label="Sentiment (0-3)" options={LEVELS.map(String)} />
                <Labeled label="Blockers">
                  <input name="blockers" className={input} />
                </Labeled>
                <Labeled label="Next actions">
                  <input name="next_actions" className={input} />
                </Labeled>
                <Labeled label="Next check-in date">
                  <input type="date" name="next_check_in_on" className={input} />
                </Labeled>
                <div className="flex items-end">
                  <SaveButton label="Log check-in" />
                </div>
              </form>
            </Detail>
          </Card>

          {/* Hard conversations */}
          <Card title="Hard conversations">
            <div className="space-y-2">
              {(hardConvos ?? []).length ? (
                (hardConvos as any[]).map((h) => (
                  <div key={h.id} className="rounded-xl border border-rag-red/20 bg-rag-red-soft/50 px-3.5 py-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-rag-red">Captured</span>
                      <span>{h.occurred_on}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{h.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">None captured.</p>
              )}
            </div>
            <Detail label="Capture a hard conversation">
              <form action={addHardConversation} className="mt-3 space-y-3">
                <input type="hidden" name="student_id" value={id} />
                <Labeled label="Date">
                  <input type="date" name="occurred_on" className={input} />
                </Labeled>
                <Labeled label="Summary">
                  <textarea name="summary" rows={2} required className={input} />
                </Labeled>
                <SaveButton label="Capture" />
              </form>
            </Detail>
          </Card>

          {/* Diagnosis */}
          <Card title="Diagnosis">
            <p className="mb-3 text-sm text-slate-500">
              {diagnosed
                ? `Last diagnosed ${new Date(snap.snapshot_at).toLocaleDateString()} · ${snaps.length} snapshot${
                    snaps.length === 1 ? "" : "s"
                  }. Running a new diagnosis (e.g. the 3-month re-check) adds a dated snapshot — the Red → Yellow movement then shows here and on the Dean view.`
                : "Not diagnosed yet. Run the first diagnosis once the student has completed the exercise — it sets their baseline tier and generates their prescriptions."}
            </p>
            <Detail label={diagnosed ? "Run a re-diagnosis" : "Run first diagnosis"}>
              <form action={reDiagnose} className="mt-3 space-y-4">
                <input type="hidden" name="student_id" value={id} />
                <input type="hidden" name="role" value={role} />
                <div className="grid gap-3 sm:grid-cols-4">
                  <LabeledSelect name="s1" label="S1 fidelity" options={LEVELS.map(String)} defaultValue="2" />
                  <LabeledSelect name="s2" label="S2 AI" options={LEVELS.map(String)} defaultValue="2" />
                  <LabeledSelect name="s3" label="S3 quality" options={LEVELS.map(String)} defaultValue="2" />
                  <LabeledSelect name="critique" label="Critique" options={LEVELS.map(String)} defaultValue="2" />
                </div>
                <div className="space-y-2">
                  {profile.competencies.map((c) => (
                    <div key={c.code} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-600">
                        {c.name}
                        {c.isSignature ? <span className="ml-1 text-hsb-blue">◆</span> : null}
                      </span>
                      <select
                        name={`score.${c.code}`}
                        defaultValue={latestScore.get(c.code) ?? 0}
                        className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Deliverable & subjectives
                  </p>
                  <Labeled label="Problem chosen">
                    <textarea name="deliverable_problem" rows={2} className={input} />
                  </Labeled>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Labeled label="Aimed at (company)">
                      <input name="deliverable_target" className={input} />
                    </Labeled>
                    <Labeled label="Deliverable URL">
                      <input name="deliverable_url" className={input} placeholder="https://…" />
                    </Labeled>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5">
                    <LabeledSelect name="deliverable_quality" label="Quality" options={LEVELS.map(String)} defaultValue="2" />
                    <LabeledSelect name="deliverable_authorship" label="Authorship" options={LEVELS.map(String)} defaultValue="2" />
                    <LabeledSelect name="communication" label="Comms" options={LEVELS.map(String)} defaultValue="2" />
                    <LabeledSelect name="responsiveness" label="Responsive" options={LEVELS.map(String)} defaultValue="2" />
                    <LabeledSelect name="drive" label="Drive" options={LEVELS.map(String)} defaultValue="2" />
                  </div>
                  <Labeled label="Game changer">
                    <textarea name="game_changer" rows={2} className={input} />
                  </Labeled>
                </div>
                <SaveButton label="Save diagnosis" />
              </form>
            </Detail>
          </Card>

          <Card title="Ask exercise">
            {exA ? (
              <div className="space-y-3">
                {exA.deliverable_problem ? <p className="text-sm text-slate-700">{exA.deliverable_problem}</p> : null}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                  {exA.deliverable_target ? (
                    <span>Aimed at <b className="text-slate-700">{exA.deliverable_target}</b></span>
                  ) : null}
                  <span>Quality {exA.deliverable_quality ?? "—"}/3</span>
                  <span>
                    Authorship{" "}
                    {exA.deliverable_authorship != null
                      ? `${exA.deliverable_authorship}/3 (${AUTHORSHIP[exA.deliverable_authorship]})`
                      : "—"}
                  </span>
                  <span>Comms {exA.communication ?? "—"}/3</span>
                  <span>Responsiveness {exA.responsiveness ?? "—"}/3</span>
                  <span>Drive {exA.drive ?? "—"}/3</span>
                </div>
                {exA.deliverable_url ? (
                  <a href={exA.deliverable_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-hsb-blue hover:underline">
                    Open deliverable
                  </a>
                ) : null}
                {exA.game_changer ? (
                  <div className="rounded-lg border border-hsb-soft/50 bg-hsb-tint px-3.5 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-hsb-navy/70">Game changer</div>
                    <p className="mt-1 text-sm text-hsb-navy">{exA.game_changer}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No exercise captured yet.</p>
            )}
          </Card>

          <Card title="Future of Work skills">
            {fowA ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {FUTURE_WORK_SKILLS.map((s) => (
                  <div key={s.key} className="rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-2 text-center">
                    <div className="truncate text-[10px] font-medium text-slate-500">{s.name}</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                      {fowA[s.key] != null ? `${fowA[s.key]}/3` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Not yet assessed. Filled by the Future of Work exercise later in the journey.
              </p>
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
              {!(audit ?? []).length ? <li className="text-xs text-slate-400">No entries.</li> : null}
            </ol>
          </Card>
        </div>

        {/* Right rail */}
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
                {selfA.goals ? <p><span className="font-medium text-slate-800">Goals: </span>{selfA.goals}</p> : null}
                {selfA.why ? <p><span className="font-medium text-slate-800">Why: </span>{selfA.why}</p> : null}
                <dl className="divide-y divide-slate-100">
                  <ScoreRow k="Self-confidence" v={selfA.self_confidence} />
                </dl>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not captured.</p>
            )}
          </Card>

          <Card title="Flags & phase">
            <form action={setFlagsPhase} className="space-y-3">
              <input type="hidden" name="student_id" value={id} />
              <Labeled label="Flags (comma-separated)">
                <input
                  name="flags"
                  className={input}
                  placeholder="Coaching needed, at risk of no offer"
                  defaultValue={(student.flags ?? []).join(", ")}
                />
              </Labeled>
              <LabeledSelect name="phase" label="Phase" options={PHASES} defaultValue={student.phase} />
              <SaveButton label="Update" />
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
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

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="mt-3 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer text-xs font-medium text-hsb-blue">+ {label}</summary>
      {children}
    </details>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function LabeledSelect({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <Labeled label={label}>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-800 focus:border-hsb-blue focus:outline-none focus:ring-2 focus:ring-hsb-blue/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </Labeled>
  );
}

function SaveButton({ label = "Save" }: { label?: string }) {
  return (
    <button
      type="submit"
      className="rounded-lg bg-hsb-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700"
    >
      {label}
    </button>
  );
}

function Radar({
  items,
}: {
  items: { label: string; value: number; target: number; signature?: boolean }[];
}) {
  const R = 72;
  const cx = 100;
  const cy = 100;
  const n = items.length;
  const pt = (i: number, val: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (val / 3) * R;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const valuePoly = poly(items.map((it) => it.value));
  const targetPoly = poly(items.map((it) => it.target));

  return (
    <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[220px]" role="img" aria-label="Gap radar">
      {[1, 2, 3].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={(r / 3) * R} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {items.map((_, i) => {
        const [x, y] = pt(i, 3);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={targetPoly} fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points={valuePoly} fill="rgba(14,76,126,0.12)" stroke="#0E4C7E" strokeWidth="2" />
      {items.map((_, i) => {
        const [x, y] = pt(i, 3.42);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#64748b">
            {i + 1}
          </text>
        );
      })}
    </svg>
  );
}


function IllustrativeTag() {
  return (
    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
      Illustrative
    </span>
  );
}
