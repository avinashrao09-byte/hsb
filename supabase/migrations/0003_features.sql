-- 0003_features.sql — cohort board, check-ins, hard conversations, target companies

alter table student add column if not exists next_check_in_on date;
alter table student add column if not exists flags text[] not null default '{}';

create table if not exists target_company (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references student(id) on delete cascade,
  name        text not null,
  priority    int,
  created_at  timestamptz not null default now()
);
create index if not exists idx_company_student on target_company(student_id);

-- RLS for the new table (matches the authenticated-only model)
alter table target_company enable row level security;
drop policy if exists auth_all_target_company on target_company;
create policy auth_all_target_company on target_company
  for all to authenticated using (true) with check (true);
