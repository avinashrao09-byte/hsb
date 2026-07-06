# HSB Career Readiness & Mentoring System

A Next.js + Supabase app that runs HSB students through the readiness lifecycle:
**intake → self-assessment → resume/LinkedIn state → soft-readiness → diagnosis → tier (R/Y/G) → auto-prescriptions → batch dashboard**, with a full append-only audit log.

Built on the [Role Competency Library](../HSB-Role-Competency-Library.md) (9 roles). Brand tokens (navy `#1D3C74`, blue `#1955A6`, CTA green `#61CE70`, Lexend type) are pulled from hsb.edu.in.

## Stack
- **Next.js 14** (App Router, TypeScript, Server Actions)
- **Tailwind** with HSB brand tokens (`tailwind.config.ts`)
- **Supabase** (Postgres) — schema in `supabase/migrations`

---

## Setup (local)

```bash
npm install
cp .env.example .env.local     # fill in the three keys below
```

### 1. Create the Supabase project
- Log in to Supabase (use the team Google login) and create a **new project** — e.g. `hsb-mentoring`.
- Project Settings → API gives you the **Project URL**, the **anon key**, and the **service_role key**.
- Put them in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, used only by the seed script)

### 2. Apply the schema
Open the Supabase **SQL editor** and run the contents of
`supabase/migrations/0001_init.sql` (creates tables, enums, and the immutable audit log).

### 3. Seed the role library
```bash
npm run seed        # loads the 9-role competency library into role_competency
```

### 4. Run
```bash
npm run dev         # http://localhost:3000
```
Go to **Enroll student** and enter your first students. Each enrollment computes a tier
(with the signature-competency hard floor), writes a dated readiness snapshot, auto-generates
prescriptions for every below-target competency, and records audit entries.

---

## Deploy

### GitHub (account: avinashrao09@gmail.com)
```bash
git init && git add . && git commit -m "HSB mentoring system — initial"
# create a new EMPTY repo on github.com under avinashrao09@gmail.com, then:
git remote add origin https://github.com/<your-user>/hsb-mentoring.git
git push -u origin main
```

### Vercel (same login)
- Import the new repo in Vercel.
- Add the same three env vars in **Vercel → Project → Settings → Environment Variables**
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Deploy. (Run `npm run seed` once locally against the same Supabase project — the seed is data, not code.)

> The app renders a "Connect Supabase" state until the env vars are present, so a first deploy
> won't crash before the database is wired.

---

## Auth & security

The app is **gated behind Supabase Auth** — every route redirects to `/login` unless signed in —
and **Row Level Security** closes anonymous access to the database.

Setup:
1. Run `supabase/migrations/0002_rls.sql` in the SQL editor (enables RLS + authenticated-only policies).
2. In Supabase → **Authentication → Providers → Email**, keep Email enabled and **turn OFF
   "Allow new users to sign up"** (accounts are provisioned by the admin, not self-serve).
3. In **Authentication → Users → Add user**, create each mentor/admin account (email + password).
4. Sign in at `/login`.

Notes:
- v1 policy model: any authenticated staff user has full access (a small-team mentoring tool).
  Per-mentor scoping can be layered on later without schema changes.
- `audit_log` is append-only (a trigger blocks updates/deletes; RLS allows insert + read only).
- `SUPABASE_SERVICE_ROLE_KEY` must never reach the browser — it is only read by `scripts/seed.ts`.

## Project map
```
supabase/migrations/0001_init.sql   schema + audit log
scripts/seed.ts                     seeds role_competency from the library
src/lib/roleLibrary.ts              single source of truth (9 roles)
src/lib/tiering.ts                  tier logic + signature hard floor
src/app/page.tsx                    batch dashboard (RAG distribution)
src/app/students/new/               intake form + enroll action
src/app/students/[id]/              student profile (diagnosis, prescriptions, audit)
```

## What's stubbed for next iterations
Check-in loop UI, re-diagnosis flow, internship mode, hard-conversation capture UI, and the
Dean's movement view all have tables in the schema but no screens yet.
