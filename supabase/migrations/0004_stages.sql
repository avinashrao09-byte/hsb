-- 0004_stages.sql — simplify journey stages to plain English
-- orient->onboarding, build->skill_building, position->internship_prep,
-- internship->internship, recalibrate + convert -> job_search, launch->placed

alter table student alter column phase drop default;
alter table check_in alter column phase drop default;
alter table student alter column phase type text;
alter table check_in alter column phase type text;

update student set phase = case phase
  when 'orient' then 'onboarding'
  when 'build' then 'skill_building'
  when 'position' then 'internship_prep'
  when 'recalibrate' then 'job_search'
  when 'convert' then 'job_search'
  when 'launch' then 'placed'
  else phase end;
update check_in set phase = case phase
  when 'orient' then 'onboarding'
  when 'build' then 'skill_building'
  when 'position' then 'internship_prep'
  when 'recalibrate' then 'job_search'
  when 'convert' then 'job_search'
  when 'launch' then 'placed'
  else phase end;

alter type journey_phase rename to journey_phase_old;
create type journey_phase as enum
  ('onboarding','skill_building','internship_prep','internship','job_search','placed');

alter table student alter column phase type journey_phase using phase::journey_phase;
alter table check_in alter column phase type journey_phase using phase::journey_phase;

alter table student alter column phase set default 'onboarding';
alter table check_in alter column phase set default 'skill_building';

drop type journey_phase_old;

-- plain-English demo flags
update student set flags = array['Coaching needed'] where cohort='MBA 2026 (demo)' and full_name='Kabir Mehta';
update student set flags = array['Resists feedback'] where cohort='MBA 2026 (demo)' and full_name='Dev Malhotra';
update student set flags = array['High potential, big gap'] where cohort='MBA 2026 (demo)' and full_name='Arjun Reddy';
