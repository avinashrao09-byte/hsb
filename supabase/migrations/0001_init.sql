-- HSB Career Readiness & Mentoring System — schema v0.2
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type track as enum ('product_mgmt','ai_analytics','foresight_intrapreneurship');
exception when duplicate_object then null; end $$;

do $$ begin
  create type role as enum
    ('product','ai_analytics','consulting','sales','marketing',
     'finance','operations','general_mgmt','entrepreneurship');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tier as enum ('green','yellow','red');
exception when duplicate_object then null; end $$;

do $$ begin
  create type journey_phase as enum
    ('orient','build','position','internship','recalibrate','convert','launch');
exception when duplicate_object then null; end $$;

-- ---------- reference: role competency library ----------
create table if not exists role_competency (
  code            text primary key,          -- e.g. product.C1
  role            role not null,
  name            text not null,
  weight          numeric not null,          -- sums to ~1.0 per role
  target_level    smallint not null check (target_level between 0 and 3),
  is_signature    boolean not null default false,
  definition      text,
  remediation_training text,
  remediation_reading  text,
  remediation_project  text
);

-- ---------- students ----------
create table if not exists student (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text,
  cohort      text,                            -- e.g. "MBA 2026"
  track       track not null,
  phase       journey_phase not null default 'orient',
  created_at  timestamptz not null default now()
);

-- versioned role declaration (student can re-declare; only one current)
create table if not exists role_declaration (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references student(id) on delete cascade,
  role         role not null,
  is_current   boolean not null default true,
  declared_at  timestamptz not null default now(),
  note         text
);
create index if not exists idx_roledecl_student on role_declaration(student_id);

-- student self-assessment at intake (their voice, before diagnosis)
create table if not exists self_assessment (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references student(id) on delete cascade,
  goals        text,
  why          text,
  self_confidence smallint check (self_confidence between 0 and 3),
  self_gaps    text,
  created_at   timestamptz not null default now()
);

-- ---------- diagnosis ----------
create table if not exists competency_score (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references student(id) on delete cascade,
  role           role not null,
  competency_code text not null references role_competency(code),
  level          smallint not null check (level between 0 and 3),
  evidence_note  text,
  scored_by      text,
  scored_at      timestamptz not null default now()
);
create index if not exists idx_score_student on competency_score(student_id, scored_at);

create table if not exists soft_assessment (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references student(id) on delete cascade,
  source_label   text,                          -- which deliverable
  s1_instruction_fidelity smallint check (s1_instruction_fidelity between 0 and 3),
  s2_ai_judgment          smallint check (s2_ai_judgment between 0 and 3),
  s3_deliverable_quality  smallint check (s3_deliverable_quality between 0 and 3),
  self_awareness_delta    numeric,
  critique_response       smallint check (critique_response between 0 and 3),
  note           text,
  assessed_by    text,
  assessed_at    timestamptz not null default now()
);

create table if not exists artifact_state (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references student(id) on delete cascade,
  kind         text not null check (kind in ('resume','linkedin')),
  level        smallint not null check (level between 0 and 3),
  url          text,
  note         text,
  version      int not null default 1,
  assessed_by  text,
  assessed_at  timestamptz not null default now()
);

-- dated tier snapshot (derived, but stored so movement is queryable)
create table if not exists readiness_snapshot (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references student(id) on delete cascade,
  role         role not null,
  hard_gap             numeric,
  hard_readiness_pct   smallint,
  coachability         smallint,
  tier                 tier not null,
  signature_floor_fired boolean not null default false,
  snapshot_at  timestamptz not null default now()
);
create index if not exists idx_snap_student on readiness_snapshot(student_id, snapshot_at);

-- ---------- prescriptions ----------
create table if not exists prescription (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references student(id) on delete cascade,
  competency_code text references role_competency(code),
  kind           text not null check (kind in ('training','reading','project')),
  detail         text not null,
  status         text not null default 'assigned' check (status in ('assigned','in_progress','done','waived')),
  assigned_at    timestamptz not null default now(),
  due_at         timestamptz,
  completed_at   timestamptz
);

-- ---------- mentoring loop ----------
create table if not exists check_in (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references student(id) on delete cascade,
  phase          journey_phase not null default 'build',
  occurred_on    date not null default current_date,
  task_progress  smallint check (task_progress between 0 and 100),
  deliverable_quality smallint check (deliverable_quality between 0 and 3),
  sentiment      smallint check (sentiment between 0 and 3),
  blockers       text,
  next_actions   text,
  notes          text,
  logged_by      text,
  created_at     timestamptz not null default now()
);

create table if not exists hard_conversation (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references student(id) on delete cascade,
  occurred_on  date not null default current_date,
  summary      text not null,
  visibility   text not null default 'mentor' check (visibility in ('mentor','student_shared','dean_aggregate')),
  logged_by    text,
  created_at   timestamptz not null default now()
);

-- ---------- audit log (append-only, immutable) ----------
create table if not exists audit_log (
  id         bigint generated always as identity primary key,
  actor      text,
  action     text not null,          -- create | update | tier_change | ...
  entity     text not null,          -- table name
  entity_id  text,
  before     jsonb,
  after      jsonb,
  at         timestamptz not null default now()
);
create index if not exists idx_audit_entity on audit_log(entity, entity_id);

-- Block edits/deletes on the audit log so it stays immutable.
create or replace function audit_immutable() returns trigger as $$
begin
  raise exception 'audit_log is append-only';
end $$ language plpgsql;

drop trigger if exists trg_audit_no_update on audit_log;
create trigger trg_audit_no_update before update or delete on audit_log
  for each row execute function audit_immutable();
