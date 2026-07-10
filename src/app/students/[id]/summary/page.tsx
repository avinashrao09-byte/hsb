import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isConfigured } from "@/lib/supabase/server";
import { getRoleProfile, ROLE_LABELS, TRACK_LABELS } from "@/lib/roleLibrary";
import { TIER_META } from "@/lib/tierUi";
import { FUTURE_WORK_SKILLS } from "@/lib/futureWork";
import type { Role, Tier } from "@/lib/types";

export const dynamic = "force-dynamic";

const AUTHORSHIP = ["AI-only", "Mostly AI", "Human-led, AI-assisted", "Human-driven"];

export default async function SummaryPage({ params }: { params: { id: string } }) {
  if (!isConfigured()) return <p className="text-sm text-slate-500">Connect Supabase first.</p>;
  const supabase = createClient();
  const id = params.id;

  const { data: student } = await supabase
    .from("student")
    .select("id,full_name,cohort,track,phase,flags")
    .eq("id", id)
    .single();
  if (!student) notFound();

  const [
    { data: snaps },
    { data: scores },
    { data: arts },
    { data: companies },
    { data: exRows },
    { data: roleDecl },
    { data: fowRows },
  ] = await Promise.all([
    supabase.from("readiness_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: true }),
    supabase.from("competency_score").select("*").eq("student_id", id).order("scored_at", { ascending: false }),
    supabase.from("artifact_state").select("*").eq("student_id", id).order("assessed_at", { ascending: false }),
    supabase.from("target_company").select("*").eq("student_id", id).order("priority"),
    supabase.from("exercise_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: false }),
    supabase.from("role_declaration").select("role").eq("student_id", id).eq("is_current", true).order("declared_at", { ascending: false }).limit(1),
    supabase.from("future_work_snapshot").select("*").eq("student_id", id).order("snapshot_at", { ascending: false }),
  ]);

  const snapList = (snaps ?? []) as any[];
  const snap = snapList[snapList.length - 1];
  const declaredRole = (roleDecl ?? [])[0]?.role as Role | undefined;
  const role = (declaredRole ?? snap?.role ?? "product") as Role;
  const profile = getRoleProfile(role);
  const ex = (exRows ?? [])[0];
  const fow = (fowRows ?? [])[0];
  const resume = (arts ?? []).find((a: any) => a.kind === "resume");
  const linkedin = (arts ?? []).find((a: any) => a.kind === "linkedin");

  const latestScore = new Map<string, number>();
  for (const s of (scores ?? []) as any[])
    if (!latestScore.has(s.competency_code)) latestScore.set(s.competency_code, s.level);
  const below = profile.competencies
    .filter((c) => (latestScore.get(c.code) ?? 0) < c.target)
    .sort((a, b) => Number(b.isSignature) - Number(a.isSignature));
  const topGap = below[0];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/board" className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-hsb-blue">
        <span aria-hidden>&larr;</span> Back to dashboard
      </Link>

      <div className="rounded-md border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-hsb-navy">
              {student.full_name}
              {student.cohort === "MBA 2026 (demo)" ? (
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                  Illustrative
                </span>
              ) : null}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {TRACK_LABELS[student.track] ?? student.track} &middot; Target: {ROLE_LABELS[role]} &middot;{" "}
              <span className="capitalize">{student.phase.replace(/_/g, " ")}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <ReadCard label="Role fitment" tier={snap?.tier ?? null} sub={snap ? `${snap.hard_readiness_pct}% ready${snap.signature_floor_fired ? " · floor" : ""}` : "Not diagnosed"} />
            <ReadCard label="Future of Work" tier={fow?.fow_tier ?? null} sub={fow ? `${fow.fow_index}% index` : "Not yet assessed"} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card title="Aspiration & gap">
          {snap ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                Targeting <span className="font-medium text-slate-800">{ROLE_LABELS[role]}</span>, {snap.hard_readiness_pct}% ready.
              </p>
              {topGap ? (
                <p>
                  Close first: <span className="font-medium text-slate-800">{topGap.name}</span>
                  {topGap.isSignature ? " (signature)" : ""}.
                </p>
              ) : (
                <p>No competencies below target.</p>
              )}
              {snap.signature_floor_fired ? (
                <p className="text-rag-red">Signature floor is holding the tier below Green.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not diagnosed yet.</p>
          )}
        </Card>

        <Card title="Resume & LinkedIn">
          <div className="space-y-2 text-sm">
            <ArtifactRow label="Resume" level={resume?.level} url={resume?.url} />
            <ArtifactRow label="LinkedIn" level={linkedin?.level} url={linkedin?.url} />
          </div>
        </Card>

        <Card title="Target companies">
          <div className="flex flex-wrap gap-2">
            {(companies ?? []).length ? (
              (companies as any[]).map((c) => (
                <span key={c.id} className="rounded-full bg-hsb-tint px-3 py-1 text-sm font-medium text-hsb-navy ring-1 ring-hsb-soft/40">
                  {c.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">None set.</span>
            )}
          </div>
        </Card>

        <Card title="Subjective read">
          {ex ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <ScorePill label="Communication" v={ex.communication} />
              <ScorePill label="Responsiveness" v={ex.responsiveness} />
              <ScorePill label="Drive" v={ex.drive} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not captured.</p>
          )}
        </Card>
      </div>

      <Card title="Problem-solving deliverable">
        {ex ? (
          <div className="space-y-3">
            {ex.deliverable_problem ? <p className="text-sm text-slate-700">{ex.deliverable_problem}</p> : null}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {ex.deliverable_target ? (
                <span className="text-slate-500">Aimed at: <span className="font-medium text-slate-800">{ex.deliverable_target}</span></span>
              ) : null}
              <span className="text-slate-500">Quality: <span className="font-semibold text-slate-800">{ex.deliverable_quality ?? "—"}/3</span></span>
              <span className="text-slate-500">
                Authorship:{" "}
                <span className="font-semibold text-slate-800">
                  {ex.deliverable_authorship != null ? `${ex.deliverable_authorship}/3 (${AUTHORSHIP[ex.deliverable_authorship]})` : "—"}
                </span>
              </span>
            </div>
            {ex.deliverable_url ? (
              <a href={ex.deliverable_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-hsb-blue hover:underline">
                Open deliverable <span aria-hidden>&#8599;</span>
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No deliverable captured.</p>
        )}
      </Card>

      {ex?.game_changer ? (
        <div className="rounded-md border border-hsb-soft/50 bg-hsb-tint p-5">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-hsb-navy/70">Game changer</h2>
          <p className="text-sm leading-relaxed text-hsb-navy">{ex.game_changer}</p>
        </div>
      ) : null}

      <Card title="Future of Work skills">
        {fow ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FUTURE_WORK_SKILLS.map((s) => (
              <ScorePill key={s.key} label={s.name} v={fow[s.key]} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Not yet assessed. Filled by the Future of Work exercise later in the journey:{" "}
            {FUTURE_WORK_SKILLS.map((s) => s.name).join(", ")}.
          </p>
        )}
      </Card>

      <Link href={`/students/${id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-hsb-soft hover:text-hsb-navy">
        View full profile <span aria-hidden>&rarr;</span>
      </Link>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

function ReadCard({ label, tier, sub }: { label: string; tier: Tier | null; sub: string }) {
  const meta = tier ? TIER_META[tier] : null;
  return (
    <div className="min-w-[130px] rounded-md border border-slate-200 bg-paper/60 px-4 py-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1">
        {meta ? (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${meta.pill}`}>{meta.label}</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function ArtifactRow({ label, level, url }: { label: string; level?: number | null; url?: string | null }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="flex items-center gap-2">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-hsb-blue hover:underline">link</a>
        ) : null}
        <span className="font-semibold tabular-nums text-slate-800">{level != null ? `${level}/3` : "—"}</span>
      </span>
    </div>
  );
}

function ScorePill({ label, v }: { label: string; v?: number | null }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-2">
      <div className="truncate text-[10px] font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">{v != null ? `${v}/3` : "—"}</div>
    </div>
  );
}
