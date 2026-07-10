-- 0005_ask_and_future_work.sql
-- The Ask exercise capture (feeds the role diagnosis) plus the separate
-- Future of Work skills track. Both are dated snapshots so growth shows.

-- ---------- Ask exercise snapshot (stamped each diagnosis cycle) ----------
create table if not exists exercise_snapshot (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references student(id) on delete cascade,
  role           role not null,
  -- problem-solving deliverable
  deliverable_url        text,
  deliverable_problem    text,
  deliverable_target     text,
  deliverable_quality    smallint check (deliverable_quality between 0 and 3),
  deliverable_authorship smallint check (deliverable_authorship between 0 and 3), -- 0 AI-only .. 3 human-driven
  -- mentor subjectives
  communication  smallint check (communication between 0 and 3),
  responsiveness smallint check (responsiveness between 0 and 3),
  drive          smallint check (drive between 0 and 3),
  game_changer   text,
  assessed_by    text,
  snapshot_at    timestamptz not null default now()
);
create index if not exists idx_exercise_student on exercise_snapshot(student_id, snapshot_at);

-- ---------- Future of Work skills snapshot (separate track, filled later) ----------
create table if not exists future_work_snapshot (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references student(id) on delete cascade,
  stay_the_course   smallint check (stay_the_course between 0 and 3),
  direction         smallint check (direction between 0 and 3),
  navigate_maze     smallint check (navigate_maze between 0 and 3),
  take_people_along smallint check (take_people_along between 0 and 3),
  use_ai            smallint check (use_ai between 0 and 3),
  fow_index      smallint,   -- 0-100 rollup
  fow_tier       tier,       -- green / yellow / red rollup on its own thresholds
  assessed_by    text,
  snapshot_at    timestamptz not null default now()
);
create index if not exists idx_fow_student on future_work_snapshot(student_id, snapshot_at);

-- ---------- RLS (authenticated-only, matches the existing model) ----------
do $$
declare tbl text;
begin
  foreach tbl in array array['exercise_snapshot','future_work_snapshot'] loop
    execute format('alter table %I enable row level security;', tbl);
    execute format('drop policy if exists auth_all_%1$s on %1$I;', tbl);
    execute format(
      'create policy auth_all_%1$s on %1$I for all to authenticated using (true) with check (true);',
      tbl
    );
  end loop;
end $$;
