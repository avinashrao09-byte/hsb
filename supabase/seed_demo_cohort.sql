-- ===== HSB pilot demo cohort (9 students). Wipe with:  delete from student where cohort = 'MBA 2026 (demo)';  =====

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Ananya Sharma','ananya@hsb.edu.in','MBA 2026 (demo)','foresight_intrapreneurship','position','2026-07-17','{}'::text[]) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'consulting',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Break into management consulting from a B.Com background.','Loves structured problem-solving and client work.',2);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',2),(sid,'linkedin',2);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',2,3,2,2,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'consulting','consulting.C1',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'consulting','consulting.C2',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'consulting','consulting.C3',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'consulting','consulting.C4',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'consulting','consulting.C5',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'consulting','consulting.C6',1,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'consulting',1.56,36,1,'red',true,'2026-04-09T12:02:48.579Z'),(sid,'consulting',0.6,75,2,'yellow',false,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'consulting.C2','project','Answer-first exec summary + slide','done'),(sid,'consulting.C3','project','Market sizing + sensitivity','done'),(sid,'consulting.C5','project','Mock client session with pushback','assigned'),(sid,'consulting.C6','project','Mentoring feedback loops','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Accenture Strategy',1),(sid,'BCG',2),(sid,'Bain',3),(sid,'McKinsey',4),(sid,'Kearney',5);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-14',40,2,'Case math speed','20 market-sizing drills','mentor'),(sid,'position','2026-06-28',70,3,null,'Book 3 alumni chats','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','yellow','from','red'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Kabir Mehta','kabir@hsb.edu.in','MBA 2026 (demo)','ai_analytics','build','2026-07-13',array['coachability gate triggered']) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'finance',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Investment banking / IB analyst role.','Set on high-finance since undergrad.',3);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',2),(sid,'linkedin',1);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',3,2,2,1,1);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'finance','finance.C1',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'finance','finance.C2',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'finance','finance.C3',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'finance','finance.C4',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'finance','finance.C5',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'finance','finance.C6',1,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'finance',1.24,45,1,'red',true,'2026-04-09T12:02:48.579Z'),(sid,'finance',0.76,66,1,'yellow',true,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'finance.C1','project','Three-statement model + DCF','done'),(sid,'finance.C3','project','Analyze a company''s 10-K','assigned'),(sid,'finance.C6','project','An industry or market thesis','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Goldman Sachs',1),(sid,'Morgan Stanley',2),(sid,'JP Morgan',3),(sid,'Avendus',4);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-26',30,2,'Modeling fundamentals','WSP modeling course','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','yellow','from','red'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Dev Malhotra','dev@hsb.edu.in','MBA 2026 (demo)','product_mgmt','build','2026-07-05',array['resistant to feedback']) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'product',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'APM roles.','Wants a prestigious PM title.',3);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',1),(sid,'linkedin',1);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',1,1,1,0,2);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'product','product.C1',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'product','product.C2',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'product','product.C3',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'product','product.C4',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'product','product.C5',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'product','product.C6',1,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'product',1.22,45,1,'red',true,'2026-04-09T12:02:48.579Z'),(sid,'product',1.22,45,0,'red',true,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'product.C1','project','Write a PRD + metric tree','assigned'),(sid,'product.C2','project','Run a mini delivery sprint','assigned'),(sid,'product.C3','project','One-pager + present a recommendation','assigned'),(sid,'product.C4','project','Analyze a dataset -> recommendation','assigned'),(sid,'product.C5','project','Spec a feature with technical constraints','assigned'),(sid,'product.C6','project','Competitive analysis for a product','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Zomato',1),(sid,'Swiggy',2);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-24',0,1,'Missed all commitments','Re-set expectations','mentor');
  insert into hard_conversation(student_id,occurred_on,summary,logged_by) values (sid,'2026-06-30','Direct conversation about missed commitments and dismissive responses to feedback. Agreed to a two-week trial with clear deliverables.','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','red','from','red'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Priya Nair','priya@hsb.edu.in','MBA 2026 (demo)','foresight_intrapreneurship','convert','2026-07-28','{}'::text[]) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'marketing',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Brand management at an FMCG major.','Strong creative + analytical blend.',3);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',3),(sid,'linkedin',3);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',3,3,3,3,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'marketing','marketing.C1',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'marketing','marketing.C2',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'marketing','marketing.C3',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'marketing','marketing.C4',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'marketing','marketing.C5',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'marketing','marketing.C6',2,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'marketing',1,55,2,'yellow',true,'2026-04-09T12:02:48.579Z'),(sid,'marketing',0,100,3,'green',false,'2026-07-07T12:02:48.579Z');
  insert into target_company(student_id,name,priority) values (sid,'Unilever',1),(sid,'P&G',2),(sid,'Nykaa',3);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'convert','2026-07-02',100,3,null,'Final-round prep with Unilever','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','green','from','yellow'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Rohan Iyer','rohan@hsb.edu.in','MBA 2026 (demo)','ai_analytics','position','2026-07-19','{}'::text[]) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'ai_analytics',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Data science / analytics roles at a top tech firm.','Strong quant, wants applied ML.',2);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',2),(sid,'linkedin',2);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',2,3,2,2,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'ai_analytics','ai_analytics.C1',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'ai_analytics','ai_analytics.C2',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'ai_analytics','ai_analytics.C3',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'ai_analytics','ai_analytics.C4',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'ai_analytics','ai_analytics.C5',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'ai_analytics','ai_analytics.C6',1,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'ai_analytics',1.42,39,1,'red',true,'2026-04-09T12:02:48.579Z'),(sid,'ai_analytics',0.52,78,2,'yellow',false,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'ai_analytics.C2','project','Exec-ready insight deck','done'),(sid,'ai_analytics.C3','project','Clean + analyze a messy dataset','done'),(sid,'ai_analytics.C5','project','Frame + answer an ambiguous business question','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Google',1),(sid,'Microsoft',2),(sid,'Fractal Analytics',3);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-18',50,2,'Storytelling with data','Build exec deck','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','yellow','from','red'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Sara Khan','sara@hsb.edu.in','MBA 2026 (demo)','product_mgmt','build','2026-07-15','{}'::text[]) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'sales',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Enterprise SaaS sales / account exec.','Energised by people and targets.',2);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',2),(sid,'linkedin',2);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',2,2,2,2,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'sales','sales.C1',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'sales','sales.C2',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'sales','sales.C3',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'sales','sales.C4',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'sales','sales.C5',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'sales','sales.C6',2,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'sales',1.22,50,2,'yellow',true,'2026-04-09T12:02:48.579Z'),(sid,'sales',0.38,84,2,'yellow',true,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'sales.C1','project','Deliver a sales pitch','done'),(sid,'sales.C4','project','Objection-handling role-play','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Salesforce',1),(sid,'HubSpot',2),(sid,'Freshworks',3);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-23',45,2,'Discovery questioning','SPIN role-play','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','yellow','from','yellow'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Aditya Verma','aditya@hsb.edu.in','MBA 2026 (demo)','foresight_intrapreneurship','recalibrate','2026-07-24','{}'::text[]) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'general_mgmt',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Leadership GM track at a conglomerate.','Broad interests, strong leadership record.',3);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',3),(sid,'linkedin',2);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',3,3,3,2,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'general_mgmt','general_mgmt.C1',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'general_mgmt','general_mgmt.C2',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'general_mgmt','general_mgmt.C3',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'general_mgmt','general_mgmt.C4',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'general_mgmt','general_mgmt.C5',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'general_mgmt','general_mgmt.C6',2,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'general_mgmt',0.86,64,2,'yellow',true,'2026-04-09T12:02:48.579Z'),(sid,'general_mgmt',0,100,3,'green',false,'2026-07-07T12:02:48.579Z');
  insert into target_company(student_id,name,priority) values (sid,'Tata Administrative Service',1),(sid,'Aditya Birla Group',2);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'recalibrate','2026-06-29',80,3,null,'Post-internship reset','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','green','from','yellow'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Neha Gupta','neha@hsb.edu.in','MBA 2026 (demo)','product_mgmt','position','2026-07-21','{}'::text[]) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'operations',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Ops / supply-chain leadership.','Process-minded, likes scale.',2);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',2),(sid,'linkedin',2);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',2,2,2,2,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'operations','operations.C1',3,'mentor','2026-06-18T12:02:48.579Z'),(sid,'operations','operations.C2',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'operations','operations.C3',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'operations','operations.C4',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'operations','operations.C5',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'operations','operations.C6',1,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'operations',1.36,39,1,'red',true,'2026-04-09T12:02:48.579Z'),(sid,'operations',0.62,72,2,'yellow',false,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'operations.C2','project','Full project plan for an ops initiative','done'),(sid,'operations.C3','project','End-to-end supply-chain analysis','done'),(sid,'operations.C5','project','Stakeholder-alignment memo','assigned'),(sid,'operations.C6','project','Run one improvement cycle','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Amazon Operations',1),(sid,'Flipkart',2),(sid,'Delhivery',3);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-20',55,2,'Supply-chain fundamentals','Chopra ch. 1-4','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','yellow','from','red'));
end $$;

do $$
declare sid uuid;
begin
  insert into student(full_name,email,cohort,track,phase,next_check_in_on,flags) values ('Arjun Reddy','arjun@hsb.edu.in','MBA 2026 (demo)','foresight_intrapreneurship','build','2026-07-14',array['high-gap · high-coachability']) returning id into sid;
  insert into role_declaration(student_id,role,is_current) values (sid,'entrepreneurship',true);
  insert into self_assessment(student_id,goals,why,self_confidence) values (sid,'Launch a venture; intrapreneur fallback.','Relentless builder energy.',2);
  insert into artifact_state(student_id,kind,level) values (sid,'resume',1),(sid,'linkedin',1);
  insert into soft_assessment(student_id,source_label,s1_instruction_fidelity,s2_ai_judgment,s3_deliverable_quality,critique_response,self_awareness_delta) values (sid,'Intake exercise',3,2,2,3,0);
  insert into competency_score(student_id,role,competency_code,level,scored_by,scored_at) values (sid,'entrepreneurship','entrepreneurship.C1',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'entrepreneurship','entrepreneurship.C2',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'entrepreneurship','entrepreneurship.C3',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'entrepreneurship','entrepreneurship.C4',1,'mentor','2026-06-18T12:02:48.579Z'),(sid,'entrepreneurship','entrepreneurship.C5',2,'mentor','2026-06-18T12:02:48.579Z'),(sid,'entrepreneurship','entrepreneurship.C6',1,'mentor','2026-06-18T12:02:48.579Z');
  insert into readiness_snapshot(student_id,role,hard_gap,hard_readiness_pct,coachability,tier,signature_floor_fired,snapshot_at) values (sid,'entrepreneurship',1.6,38,3,'yellow',true,'2026-04-09T12:02:48.579Z'),(sid,'entrepreneurship',0.86,67,3,'yellow',true,'2026-07-07T12:02:48.579Z');
  insert into prescription(student_id,competency_code,kind,detail,status) values (sid,'entrepreneurship.C1','project','15 customer-discovery interviews + synthesis','done'),(sid,'entrepreneurship.C2','project','Ship a working MVP','assigned'),(sid,'entrepreneurship.C3','project','A self-directed build sprint','assigned'),(sid,'entrepreneurship.C4','project','Business-model canvas + unit economics','assigned'),(sid,'entrepreneurship.C6','project','Founding-team/hiring plan','assigned');
  insert into target_company(student_id,name,priority) values (sid,'Own venture',1),(sid,'AIC JKLU',2),(sid,'Antler',3);
  insert into check_in(student_id,phase,occurred_on,task_progress,sentiment,blockers,next_actions,logged_by) values (sid,'build','2026-06-27',35,3,'Customer discovery rigor','15 interviews','mentor');
  insert into audit_log(actor,action,entity,entity_id,after) values ('seed','create','student',sid::text,'{"demo":true}'::jsonb),('seed','tier_change','readiness_snapshot',sid::text,jsonb_build_object('tier','yellow','from','yellow'));
end $$;
