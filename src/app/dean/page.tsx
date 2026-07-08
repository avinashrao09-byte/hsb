import { isConfigured } from "@/lib/supabase/server";
import { getCohort, hasImproved, isAtRisk, type EnrichedStudent } from "@/lib/cohort";
import type { Tier } from "@/lib/types";

export const dynamic = "force-dynamic";

const FULL_COHORT = 38;

type Counts = { green: number; yellow: number; red: number; unrated: number };

function tally(pick: (s: EnrichedStudent) => Tier | null, cohort: EnrichedStudent[]): Counts {
  const c: Counts = { green: 0, yellow: 0, red: 0, unrated: 0 };
  for (const s of cohort) {
    const t = pick(s);
    if (!t) c.unrated++;
    else c[t]++;
  }
  return c;
}

export default async function DeanPage() {
  if (!isConfigured())
    return <p className="text-sm text-slate-500">Connect Supabase first.</p>;

  const cohort = await getCohort();
  const total = cohort.length;
  const intake = tally((s) => s.intakeTier, cohort);
  const now = tally((s) => s.tier, cohort);

  const diagnosed = cohort.filter((s) => s.readiness != null);
  const readinessIndex = diagnosed.length
    ? Math.round(diagnosed.reduce((a, s) => a + (s.readiness ?? 0), 0) / diagnosed.length)
    : 0;
  const movers = cohort.filter(hasImproved).length;
  const atRisk = cohort.filter((s) => isAtRisk(s)).length;

  // task completion by tier segment
  const segments: Tier[] = ["green", "yellow", "red"];
  const segData = segments.map((t) => {
    const inSeg = cohort.filter((s) => s.tier === t);
    const done = inSeg.reduce((a, s) => a + s.taskDone, 0);
    const totalT = inSeg.reduce((a, s) => a + s.taskTotal, 0);
    return { tier: t, pct: totalT ? Math.round((done / totalT) * 100) : null, n: inSeg.length };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-hsb-navy">
          Dean dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Readiness of the pilot cohort — and how far it has moved.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Readiness index" value={`${readinessIndex}%`} sub="avg across diagnosed" accent="text-hsb-navy" />
        <Kpi label="Moved up a tier" value={`${movers}`} sub="since intake" accent="text-rag-green" />
        <Kpi label="At risk" value={`${atRisk}`} sub="Red / low-coach / overdue" accent="text-rag-red" />
        <Kpi label="Enrolled" value={`${total}`} sub={`of ${FULL_COHORT} full cohort`} accent="text-slate-900" />
      </div>

      {/* Intake vs now */}
      <div className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          RAG distribution — intake vs now
        </h2>
        <div className="space-y-5">
          <DistRow label="At intake" counts={intake} total={total} />
          <DistRow label="Now" counts={now} total={total} />
        </div>
        <Legend />
      </div>

      {/* Task completion by segment */}
      <div className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Task completion by segment
        </h2>
        <div className="space-y-4">
          {segData.map((s) => (
            <div key={s.tier} className="flex items-center gap-4">
              <div className="w-20 text-sm capitalize text-slate-600">
                {s.tier} <span className="text-slate-400">({s.n})</span>
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    s.tier === "green"
                      ? "bg-rag-green"
                      : s.tier === "yellow"
                      ? "bg-rag-amber"
                      : "bg-rag-red"
                  }`}
                  style={{ width: `${s.pct ?? 0}%` }}
                />
              </div>
              <div className="w-12 text-right text-sm tabular-nums text-slate-500">
                {s.pct == null ? "—" : `${s.pct}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Shown for the {total}-student pilot. The same views scale unchanged to the full{" "}
        {FULL_COHORT}-student batch.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-2 font-display text-3xl font-semibold tracking-tight ${accent}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-400">{sub}</div>
    </div>
  );
}

function DistRow({ label, counts, total }: { label: string; counts: Counts; total: number }) {
  const seg = (n: number) => (total ? `${(n / total) * 100}%` : "0%");
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="tabular-nums text-slate-400">
          {counts.green}G · {counts.yellow}Y · {counts.red}R
          {counts.unrated ? ` · ${counts.unrated}·` : ""}
        </span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="bg-rag-green" style={{ width: seg(counts.green) }} />
        <div className="bg-rag-amber" style={{ width: seg(counts.yellow) }} />
        <div className="bg-rag-red" style={{ width: seg(counts.red) }} />
        <div className="bg-slate-200" style={{ width: seg(counts.unrated) }} />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
      <Item dot="bg-rag-green" label="Green" />
      <Item dot="bg-rag-amber" label="Yellow" />
      <Item dot="bg-rag-red" label="Red" />
      <Item dot="bg-slate-300" label="Not diagnosed" />
    </div>
  );
}

function Item({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
    </span>
  );
}
