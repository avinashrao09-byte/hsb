import Link from "next/link";
import { getServerClient, isConfigured } from "@/lib/supabase";
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

const TIER_STYLE: Record<Tier, string> = {
  green: "bg-tier-green/15 text-green-800 ring-tier-green/40",
  yellow: "bg-tier-yellow/15 text-yellow-800 ring-tier-yellow/50",
  red: "bg-tier-red/15 text-hsb-magenta ring-tier-red/40",
};

export default async function Dashboard() {
  if (!isConfigured()) return <ConnectPrompt />;

  const supabase = getServerClient()!;
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

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-hsb-navy">Batch Dashboard</h1>
          <p className="text-sm text-gray-500">
            {rows.length} student{rows.length === 1 ? "" : "s"} enrolled
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Green" value={counts.green} color="bg-tier-green" />
        <Stat label="Yellow" value={counts.yellow} color="bg-tier-yellow" />
        <Stat label="Red" value={counts.red} color="bg-tier-red" />
        <Stat label="Not yet diagnosed" value={counts.unrated} color="bg-gray-300" />
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-hsb-tint text-left text-xs uppercase tracking-wide text-hsb-navy">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Target role</th>
                <th className="px-4 py-3">Phase</th>
                <th className="px-4 py-3">Readiness</th>
                <th className="px-4 py-3">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((st) => {
                const snap = latest.get(st.id);
                return (
                  <tr key={st.id} className="hover:bg-hsb-tint/40">
                    <td className="px-4 py-3">
                      <Link href={`/students/${st.id}`} className="font-medium text-hsb-blue hover:underline">
                        {st.full_name}
                      </Link>
                      {st.cohort ? <div className="text-xs text-gray-400">{st.cohort}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{TRACK_LABELS[st.track] ?? st.track}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {snap ? ROLE_LABELS[snap.role] : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{st.phase}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {snap?.hard_readiness_pct != null ? `${snap.hard_readiness_pct}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {snap ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${TIER_STYLE[snap.tier]}`}
                        >
                          {snap.tier}
                          {snap.signature_floor_fired ? " · floor" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">not diagnosed</span>
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

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <div className="mt-1 font-display text-3xl font-semibold text-hsb-navy">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="text-gray-600">No students yet.</p>
      <Link
        href="/students/new"
        className="mt-3 inline-block rounded-md bg-hsb-green px-4 py-2 font-medium text-hsb-navy"
      >
        Enroll your first student
      </Link>
    </div>
  );
}

function ConnectPrompt() {
  return (
    <div className="rounded-lg border border-hsb-soft bg-hsb-tint p-8">
      <h1 className="font-display text-xl font-semibold text-hsb-navy">Connect Supabase to begin</h1>
      <p className="mt-2 max-w-2xl text-sm text-hsb-navy/80">
        Copy <code className="rounded bg-white px-1">.env.example</code> to{" "}
        <code className="rounded bg-white px-1">.env.local</code>, add your Supabase URL and anon
        key, run the migration in <code className="rounded bg-white px-1">supabase/migrations</code>,
        then <code className="rounded bg-white px-1">npm run seed</code>. See the README.
      </p>
    </div>
  );
}
