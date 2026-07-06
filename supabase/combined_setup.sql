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

-- ===== SEED: role_competency (9 roles) =====
insert into role_competency (code, role, name, weight, target_level, is_signature, definition, remediation_training, remediation_reading, remediation_project) values
  ('product.C1', 'product', 'Product Sense & User Empathy', 0.22, 3, true, 'Frames a real user problem before solutioning and ties it to a metric.', 'Reforge / SVPG PM fundamentals', 'Inspired (Cagan)', 'Write a PRD + metric tree'),
  ('product.C2', 'product', 'Execution & Delivery', 0.2, 2, false, 'Drives a cross-functional effort to ship under constraints.', 'Agile/Scrum', 'Making Things Happen (Berkun)', 'Run a mini delivery sprint'),
  ('product.C3', 'product', 'Stakeholder Communication & Influence', 0.18, 2, false, 'Influences without authority; crisp written and verbal.', 'Comms/writing', 'Crucial Conversations', 'One-pager + present a recommendation'),
  ('product.C4', 'product', 'Data & Analytics Fluency', 0.16, 2, false, 'Defines metrics, forms hypotheses, uses data to decide.', 'SQL + product analytics', 'Lean Analytics', 'Analyze a dataset -> recommendation'),
  ('product.C5', 'product', 'Technical Fluency', 0.12, 2, false, 'Converses with engineers; understands system tradeoffs.', 'Technical foundations for PMs', null, 'Spec a feature with technical constraints'),
  ('product.C6', 'product', 'Strategic / Market Thinking', 0.12, 2, false, 'Understands market, competition, business model.', null, 'Good Strategy Bad Strategy (Rumelt)', 'Competitive analysis for a product'),
  ('ai_analytics.C1', 'ai_analytics', 'Statistical & ML Foundations', 0.22, 3, true, 'Chooses the right method, interprets output, validates.', 'Andrew Ng ML', 'Intro to Statistical Learning', 'Build + validate a predictive model'),
  ('ai_analytics.C2', 'ai_analytics', 'Business Translation & Storytelling with Data', 0.2, 3, false, 'Turns analysis into a recommendation execs act on.', null, 'Storytelling with Data (Knaflic)', 'Exec-ready insight deck'),
  ('ai_analytics.C3', 'ai_analytics', 'Data Wrangling & SQL', 0.18, 2, false, 'Extracts, cleans, transforms; reproducible.', 'SQL + Python for data', 'Python for Data Analysis (McKinney)', 'Clean + analyze a messy dataset'),
  ('ai_analytics.C4', 'ai_analytics', 'Applied AI / LLM Fluency', 0.16, 2, false, 'Uses LLMs effectively and critically; evaluates output.', 'Applied GenAI', null, 'LLM-powered analysis with evaluation'),
  ('ai_analytics.C5', 'ai_analytics', 'Analytical Rigor & Problem Framing', 0.14, 2, false, 'Turns an ambiguous question into an analyzable one.', null, 'Thinking with Data (Shron)', 'Frame + answer an ambiguous business question'),
  ('ai_analytics.C6', 'ai_analytics', 'Data Engineering / Tooling Literacy', 0.1, 1, false, 'Understands pipelines, reproducibility, version control.', 'Data-engineering fundamentals', null, 'Reproducible pipeline with Git'),
  ('consulting.C1', 'consulting', 'Structured Problem-Solving', 0.24, 3, true, 'Breaks an ambiguous problem into a MECE structure.', 'Case prep (LOMS)', 'The Pyramid Principle (Minto)', 'Structured case writeup'),
  ('consulting.C2', 'consulting', 'Executive Communication', 0.2, 3, false, 'Answer-first, top-down, synthesized, client-ready.', null, 'The Pyramid Principle', 'Answer-first exec summary + slide'),
  ('consulting.C3', 'consulting', 'Quantitative & Analytical Reasoning', 0.18, 2, false, 'Market-sizes and estimates cleanly under pressure.', 'Case math + market-sizing drills', null, 'Market sizing + sensitivity'),
  ('consulting.C4', 'consulting', 'Business Acumen & Commercial Sense', 0.16, 2, false, 'Understands how businesses make money.', null, 'HBR/FT habit', 'Profitability diagnosis of a company'),
  ('consulting.C5', 'consulting', 'Client Presence & Influence', 0.12, 2, false, 'Credible fast; listens; handles pushback.', null, 'The Trusted Advisor (Maister)', 'Mock client session with pushback'),
  ('consulting.C6', 'consulting', 'Drive & Coachability', 0.1, 2, false, 'Seeks and applies feedback; iterates to a high bar.', null, null, 'Mentoring feedback loops'),
  ('sales.C1', 'sales', 'Communication, Storytelling & Persuasion', 0.22, 3, true, 'Compelling, tailored narrative; confident presence.', null, 'Pitch Anything (Klaff)', 'Deliver a sales pitch'),
  ('sales.C2', 'sales', 'Resilience & Drive', 0.2, 3, false, 'Sustains high activity through rejection.', null, 'Grit (Duckworth)', 'Sustained-activity outreach challenge'),
  ('sales.C3', 'sales', 'Discovery & Needs Analysis', 0.18, 2, false, 'Uncovers real needs; qualifies; listens.', null, 'SPIN Selling (Rackham)', 'Run a discovery call + qualify'),
  ('sales.C4', 'sales', 'Objection Handling & Negotiation', 0.16, 2, false, 'Reframes objections; negotiates on value; closes.', null, 'Never Split the Difference (Voss)', 'Objection-handling role-play'),
  ('sales.C5', 'sales', 'Prospecting & Pipeline Discipline', 0.14, 2, false, 'Builds and works a pipeline; CRM hygiene.', null, 'Fanatical Prospecting (Blount)', 'Prospect list + outreach sequence'),
  ('sales.C6', 'sales', 'Business & Product Acumen', 0.1, 2, false, 'Understands the buyer''s business; frames ROI.', null, null, 'Build an ROI/value case'),
  ('marketing.C1', 'marketing', 'Customer & Market Insight', 0.2, 3, true, 'Identifies segments; articulates positioning.', null, 'Obviously Awesome (Dunford)', 'Segmentation + positioning statement'),
  ('marketing.C2', 'marketing', 'Digital & Performance Marketing', 0.2, 2, false, 'Understands channels, funnel, CAC/LTV.', 'Performance-marketing course', null, 'Plan + model a multi-channel campaign'),
  ('marketing.C3', 'marketing', 'Marketing Analytics & Measurement', 0.18, 2, false, 'Measures ROI, attribution, experiments.', 'Marketing analytics', 'Lean Analytics', 'Measurement plan + dashboard'),
  ('marketing.C4', 'marketing', 'Brand, Content & Storytelling', 0.16, 2, false, 'Crafts a brand narrative and content that resonates.', null, 'Building a StoryBrand (Miller)', 'Campaign concept + content set'),
  ('marketing.C5', 'marketing', 'Product Marketing / GTM', 0.14, 2, false, 'Plans a launch; crafts messaging; enables sales.', 'PMM course (PMA)', null, 'GTM/launch plan'),
  ('marketing.C6', 'marketing', 'Strategic & Commercial Thinking', 0.12, 2, false, 'Ties marketing to business goals; budget by ROI.', null, 'Marketing strategy', 'Marketing plan tied to an objective'),
  ('finance.C1', 'finance', 'Financial Modeling & Analysis', 0.24, 3, true, 'Builds and interprets models; three-statement, forecasting.', 'Financial modeling (WSP/BIWS)', 'Investment Banking (Rosenbaum & Pearl)', 'Three-statement model + DCF'),
  ('finance.C2', 'finance', 'Valuation & Corporate Finance', 0.18, 2, false, 'DCF, comps, WACC, capital structure.', 'Valuation course', 'Valuation (Koller)', 'Value a public company two ways'),
  ('finance.C3', 'finance', 'Accounting & Statement Fluency', 0.16, 2, false, 'Reads the three statements and their linkages.', null, 'Accounting fundamentals', 'Analyze a company''s 10-K'),
  ('finance.C4', 'finance', 'Quantitative & Analytical Reasoning', 0.14, 2, false, 'Comfortable with numbers and estimation.', 'Quant / case-math drills', null, 'Sensitivity + scenario analysis'),
  ('finance.C5', 'finance', 'Communication & Executive Presence', 0.16, 2, false, 'Explains a financial insight to non-finance; answer-first.', null, 'The Pyramid Principle', 'Investment memo with a recommendation'),
  ('finance.C6', 'finance', 'Markets & Commercial Acumen', 0.12, 2, false, 'Understands markets, macro, industry.', null, 'WSJ/FT habit', 'An industry or market thesis'),
  ('operations.C1', 'operations', 'Process Optimization & Analytical Problem-Solving', 0.22, 3, true, 'Diagnoses inefficiency; improves throughput/cost/quality.', 'Lean Six Sigma (Green Belt)', 'The Goal (Goldratt)', 'Process map + improvement plan'),
  ('operations.C2', 'operations', 'Project & Program Management', 0.18, 2, false, 'Plans, sequences, delivers on time and budget.', 'PM / Agile', 'Making Things Happen (Berkun)', 'Full project plan for an ops initiative'),
  ('operations.C3', 'operations', 'Supply Chain & Logistics', 0.18, 2, false, 'Understands end-to-end flow; procurement, inventory, S&OP.', 'Supply-chain fundamentals', 'Supply Chain Management (Chopra)', 'End-to-end supply-chain analysis'),
  ('operations.C4', 'operations', 'Data & Analytics for Operations', 0.16, 2, false, 'Uses data to monitor and improve operations.', 'Ops analytics', null, 'Build an ops KPI dashboard'),
  ('operations.C5', 'operations', 'Cross-functional Communication & Change', 0.14, 2, false, 'Aligns functions and drives change.', null, 'Leading Change (Kotter)', 'Stakeholder-alignment memo'),
  ('operations.C6', 'operations', 'Quality & Continuous Improvement', 0.12, 2, false, 'Kaizen mindset; sets standards; measures.', null, 'Lean/Kaizen fundamentals', 'Run one improvement cycle'),
  ('general_mgmt.C1', 'general_mgmt', 'Strategic Thinking & Business Judgment', 0.22, 3, true, 'Sees the whole board; prioritizes for impact.', null, 'Good Strategy Bad Strategy (Rumelt)', 'A business/strategy plan'),
  ('general_mgmt.C2', 'general_mgmt', 'Leadership & People Management', 0.2, 3, false, 'Leads and develops teams; motivates; delegates.', null, 'The Making of a Manager (Zhuo)', 'Leadership/team-development plan'),
  ('general_mgmt.C3', 'general_mgmt', 'Financial & Commercial Acumen', 0.18, 2, false, 'P&L literacy; unit economics; drives results.', 'Finance for managers', null, 'A P&L analysis'),
  ('general_mgmt.C4', 'general_mgmt', 'Cross-functional Breadth', 0.14, 2, false, 'Conversant across finance, ops, marketing, product.', null, null, 'A cross-functional case'),
  ('general_mgmt.C5', 'general_mgmt', 'Executive Communication & Influence', 0.14, 2, false, 'Aligns stakeholders; crisp and top-down.', null, 'The Pyramid Principle', 'An executive recommendation'),
  ('general_mgmt.C6', 'general_mgmt', 'Execution & Results Orientation', 0.12, 2, false, 'Gets things done; accountable; drives outcomes.', null, 'Execution (Bossidy & Charan)', 'Own an outcome end to end'),
  ('entrepreneurship.C1', 'entrepreneurship', 'Opportunity Identification & Customer Discovery', 0.22, 3, true, 'Finds real problems and validates before building.', null, 'The Mom Test (Fitzpatrick)', '15 customer-discovery interviews + synthesis'),
  ('entrepreneurship.C2', 'entrepreneurship', 'Building & Execution (0->1)', 0.2, 3, false, 'Ships an MVP with scarce resources.', 'No-code / rapid MVP', 'The Lean Startup (Ries)', 'Ship a working MVP'),
  ('entrepreneurship.C3', 'entrepreneurship', 'Resourcefulness & Grit', 0.18, 3, false, 'Does more with less; persists through setbacks.', null, 'Grit (Duckworth)', 'A self-directed build sprint'),
  ('entrepreneurship.C4', 'entrepreneurship', 'Business Model & Commercial Sense', 0.16, 2, false, 'Unit economics, monetization, GTM, fundraising basics.', null, 'Business Model Generation (Osterwalder)', 'Business-model canvas + unit economics'),
  ('entrepreneurship.C5', 'entrepreneurship', 'Storytelling & Pitch / Fundraising', 0.14, 2, false, 'Compelling narrative; sells the vision.', null, 'Pitch Anything (Klaff)', 'An investor pitch deck'),
  ('entrepreneurship.C6', 'entrepreneurship', 'Leadership & Team-Building', 0.1, 2, false, 'Recruits, aligns, and leads a small team.', null, 'The Hard Thing About Hard Things (Horowitz)', 'Founding-team/hiring plan')
on conflict (code) do update set
  name = excluded.name, weight = excluded.weight, target_level = excluded.target_level,
  is_signature = excluded.is_signature, definition = excluded.definition,
  remediation_training = excluded.remediation_training, remediation_reading = excluded.remediation_reading,
  remediation_project = excluded.remediation_project;
