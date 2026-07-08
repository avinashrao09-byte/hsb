import Link from "next/link";
import { createClient, isConfigured } from "@/lib/supabase/server";
import { ROLE_LABELS, TRACK_LABELS } from "@/lib/roleLibrary";
import type { Role, Tier } from "@/lib/types";

export const dynamic = "force-dynamic";

type StudentRow = {
  id: string;
  full_name: string;
  cohort: string | null;
  track: string;
  phase: string;
};
type SnapRow = {
  student_id: string;
  role: Role;
  tier: Tier;
  hard_readiness_pct: number | null;
  signature_floor_fired: boolean;
  snapshot_at: string;
};

const TIER_META: Record<Tier, { label: string; dot: string; pill: string; bar: string }> = {
  green: {
    label: "Green",
    dot: "bg-rag-green",
    pill: "bg-rag-green-soft text-rag-green ring-rag-green/30",
    bar: "bg-rag-green",
  },
  yellow: {
    label: "Yellow",
    dot: "bg-rag-amber",
    pill: "bg-rag-amber-soft text-rag-amber ring-rag-amber/30",
    bar: "bg-rag-amber",
  },
  red: {
    label: "Red",
    dot: "bg-rag-red",
    pill: "bg-rag-red-soft text-rag-red ring-rag-red/30",
    bar: "bg-rag-red",
  },
};

export default async function Dashboard() {
  if (!isConfigured()) return <ConnectPrompt />;

  const supabase = createClient();
  const [{ data: students }, { data: snaps }] = await Promise.all([
    supabase.from("student").select("id,full_name,cohort,track,phase").order("created_at"),
    supabase
      .from("readiness_snapshot")
      .select("student_id,role,tier,hard_readiness_pct,signature_floor_fired,snapshot_at")
      .order("snapshot_at", { ascending: false }),
  ]);

  const latest = new Map<string, SnapRow>();
  for (const s of (snaps ?? []) as SnapRow[]) {
    if (!latest.has(s.student_id)) latest.set(s.student_id, s);
  }

  const rows = (students ?? []) as StudentRow[];
  const counts = { green: 0, yellow: 0, red: 0, unrated: 0 };
  for (const st of rows) {
    const snap = latest.get(st.id);
    if (!snap) counts.unrated++;
    else counts[snap.tier]++;
  }
  const total = rows.length;
  const cohort = rows.find((r) => r.cohort)?.cohort;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-hsb-navy">
            Batch overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} student{total === 1 ? "" : "s"}
            {cohort ? ` · ${cohort}` : ""}
          </p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-hsb-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700 focus:outline-none focus:ring-2 focus:ring-hsb-blue/40"
        >
          <span className="text-base leading-none">+</span> Enroll student
        </Link>
      </div>

      {total > 0 ? <DistributionBar counts={counts} total={total} /> : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Green" value={counts.green} total={total} dot="bg-rag-green" />
        <Stat label="Yellow" value={counts.yellow} total={total} dot="bg-rag-amber" />
        <Stat label="Red" value={counts.red} total={total} dot="bg-rag-red" />
        <Stat label="Not diagnosed" value={counts.unrated} total={total} dot="bg-slate-300" />
      </div>

      {total === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Track</th>
                <th className="px-5 py-3">Target role</th>
                <th className="px-5 py-3">Phase</th>
                <th className="px-5 py-3">Readiness</th>
                <th className="px-5 py-3 text-right">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((st) => {
                const snap = latest.get(st.id);
                const meta = snap ? TIER_META[snap.tier] : null;
                return (
                  <tr key={st.id} className="group transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <Link href={`/students/${st.id}`} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hsb-tint text-xs font-semibold text-hsb-navy">
                          {st.full_name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-medium text-slate-900 group-hover:text-hsb-blue">
                            {st.full_name}
                          </span>
                          {st.cohort ? (
                            <span className="block text-xs text-slate-400">{st.cohort}</span>
                          ) : null}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {TRACK_LABELS[st.track] ?? st.track}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {snap ? ROLE_LABELS[snap.role] : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                        {st.phase}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {snap?.hard_readiness_pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${meta?.bar ?? "bg-slate-300"}`}
                              style={{ width: `${snap.hard_readiness_pct}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-slate-500">
                            {snap.hard_readiness_pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {snap && meta ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.pill}`}
                        >
                          {meta.label}
                          {snap.signature_floor_fired ? (
                            <span className="opacity-60">· floor</span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">not diagnosed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DistributionBar({
  counts,
  total,
}: {
  counts: { green: number; yellow: number; red: number; unrated: number };
  total: number;
}) {
  const seg = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="bg-rag-green" style={{ width: seg(counts.green) }} />
        <div className="bg-rag-amber" style={{ width: seg(counts.yellow) }} />
        <div className="bg-rag-red" style={{ width: seg(counts.red) }} />
        <div className="bg-slate-200" style={{ width: seg(counts.unrated) }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        <Legend dot="bg-rag-green" label="Green" n={counts.green} />
        <Legend dot="bg-rag-amber" label="Yellow" n={counts.yellow} />
        <Legend dot="bg-rag-red" label="Red" n={counts.red} />
        <Legend dot="bg-slate-300" label="Not diagnosed" n={counts.unrated} />
      </div>
    </div>
  );
}

function Legend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label} <span className="font-semibold text-slate-700">{n}</span>
    </span>
  );
}

function Stat({
  label,
  value,
  total,
  dot,
}: {
  label: string;
  value: number;
  total: number;
  dot: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
        <span className="text-xs text-slate-400">/ {total}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-14 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-hsb-tint text-hsb-navy">
        <span className="text-xl">+</span>
      </div>
      <p className="font-medium text-slate-700">No students yet</p>
      <p className="mt-1 text-sm text-slate-500">Enroll your first student to see the batch here.</p>
      <Link
        href="/students/new"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-hsb-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700"
      >
        <span className="text-base leading-none">+</span> Enroll a student
      </Link>
    </div>
  );
}

function ConnectPrompt() {
  return (
    <div className="rounded-md border border-hsb-soft/60 bg-hsb-tint p-8">
      <h1 className="font-display text-xl font-semibold text-hsb-navy">Connect Supabase to begin</h1>
      <p className="mt-2 max-w-2xl text-sm text-hsb-navy/80">
        Copy <code className="rounded bg-white px-1 py-0.5">.env.example</code> to{" "}
        <code className="rounded bg-white px-1 py-0.5">.env.local</code>, add your Supabase URL and
        anon key, run the migrations, then <code className="rounded bg-white px-1 py-0.5">npm run seed</code>. See the README.
      </p>
    </div>
  );
}
