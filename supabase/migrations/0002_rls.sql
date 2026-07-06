-- 0002_rls.sql — Row Level Security
-- v1 model: only authenticated staff (mentors/admins) can access anything.
-- Anonymous access is fully closed. Refine to per-mentor scoping later.

-- Reference data: read-only to authenticated
alter table role_competency enable row level security;
drop policy if exists read_role_competency on role_competency;
create policy read_role_competency on role_competency
  for select to authenticated using (true);

-- Operational tables: full access to any authenticated user (staff tool)
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'student','role_declaration','self_assessment','competency_score',
    'soft_assessment','artifact_state','readiness_snapshot','prescription',
    'check_in','hard_conversation'
  ] loop
    execute format('alter table %I enable row level security;', tbl);
    execute format('drop policy if exists auth_all_%1$s on %1$I;', tbl);
    execute format(
      'create policy auth_all_%1$s on %1$I for all to authenticated using (true) with check (true);',
      tbl
    );
  end loop;
end $$;

-- Audit log: authenticated may insert + read; updates/deletes already blocked by trigger
alter table audit_log enable row level security;
drop policy if exists read_audit on audit_log;
drop policy if exists insert_audit on audit_log;
create policy read_audit on audit_log
  for select to authenticated using (true);
create policy insert_audit on audit_log
  for insert to authenticated with check (true);
