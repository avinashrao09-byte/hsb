import Link from "next/link";
import { isConfigured } from "@/lib/supabase/server";
import { getCohort, taskPct, type EnrichedStudent } from "@/lib/cohort";
import { ROLE_LABELS } from "@/lib/roleLibrary";
import { TIER_META, COACH_META } from "@/lib/tierUi";
import type { Tier } from "@/lib/types";

export const dynamic = "force-dynamic";

const COLUMNS: { key: Tier | "unrated"; label: string; head: string }[] = [
  { key: "green", label: "Green", head: "bg-emerald-500" },
  { key: "yellow", label: "Yellow", head: "bg-amber-500" },
  { key: "red", label: "Red", head: "bg-rose-500" },
  { key: "unrated", label: "Not diagnosed", head: "bg-slate-300" },
];

export default async function BoardPage() {
  if (!isConfigured())
    return <p className="text-sm text-slate-500">Connect Supabase first.</p>;

  const cohort = await getCohort();
  const byCol: Record<string, EnrichedStudent[]> = { green: [], yellow: [], red: [], unrated: [] };
  for (const s of cohort) byCol[s.tier ?? "unrated"].push(s);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-hsb-navy">
            Cohort board
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {cohort.length} student{cohort.length === 1 ? "" : "s"} · sorted by readiness tier
          </p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-hsb-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700"
        >
          <span className="text-base leading-none">+</span> Enroll student
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = byCol[col.key];
          return (
            <div key={col.key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.head}`} />
                  <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map((s) => (
                  <StudentCard key={s.id} s={s} />
                ))}
                {items.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-slate-400">Empty</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentCard({ s }: { s: EnrichedStudent }) {
  const pct = taskPct(s);
  const coach = s.coachability != null ? COACH_META[s.coachability] : null;
  const barColor = s.tier ? TIER_META[s.tier].bar : "bg-slate-300";

  return (
    <Link
      href={`/students/${s.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-3.5 shadow-card transition hover:border-hsb-soft hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{s.full_name}</div>
          <div className="truncate text-xs text-slate-500">
            {s.role ? ROLE_LABELS[s.role] : "—"}
          </div>
        </div>
        {coach ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${coach.pill}`}
          >
            {coach.label}
          </span>
        ) : null}
      </div>

      {pct != null ? (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tasks</span>
            <span className="tabular-nums">
              {s.taskDone}/{s.taskTotal}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {s.next_check_in_on ? (
            <span
              className={
                new Date(s.next_check_in_on) < new Date() ? "font-medium text-rose-500" : ""
              }
            >
              Next: {s.next_check_in_on}
            </span>
          ) : (
            "No check-in set"
          )}
        </span>
        {s.signatureFloor ? <span className="text-rose-400">◆ floor</span> : null}
      </div>

      {s.flags && s.flags.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {s.flags.map((f) => (
            <span
              key={f}
              className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600"
            >
              {f}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
