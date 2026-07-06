/**
 * Seeds the role_competency reference table from the single source of truth
 * (src/lib/roleLibrary.ts). Run once after applying the migration:
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { ROLE_LIBRARY } from "../src/lib/roleLibrary";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const rows = ROLE_LIBRARY.flatMap((profile) =>
  profile.competencies.map((c) => ({
    code: c.code,
    role: profile.role,
    name: c.name,
    weight: c.weight,
    target_level: c.target,
    is_signature: c.isSignature,
    definition: c.definition,
    remediation_training: c.remediation.training ?? null,
    remediation_reading: c.remediation.reading ?? null,
    remediation_project: c.remediation.project ?? null,
  }))
);

async function main() {
  const { error } = await supabase.from("role_competency").upsert(rows, { onConflict: "code" });
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} competencies across ${ROLE_LIBRARY.length} roles.`);
}

main();
