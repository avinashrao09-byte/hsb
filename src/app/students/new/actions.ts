"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoleProfile } from "@/lib/roleLibrary";
import { computeTier, coachabilityFromSoft } from "@/lib/tiering";
import type { CompetencyScore, Level, Role } from "@/lib/types";

function lvl(v: FormDataEntryValue | null): Level {
  const n = Number(v ?? 0);
  return (Number.isFinite(n) ? Math.max(0, Math.min(3, n)) : 0) as Level;
}

export async function enrollStudent(formData: FormData) {
  const supabase = createClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role")) as Role;
  const track = String(formData.get("track"));
  if (!fullName || !role || !track) throw new Error("Name, track and role are required.");

  const actor = "intake-form";
  const profile = getRoleProfile(role);

  // 1. Student
  const { data: student, error: e1 } = await supabase
    .from("student")
    .insert({
      full_name: fullName,
      email: String(formData.get("email") ?? "") || null,
      cohort: String(formData.get("cohort") ?? "") || null,
      track,
      phase: "orient",
    })
    .select("id")
    .single();
  if (e1 || !student) throw new Error(e1?.message ?? "Failed to create student");
  const studentId = student.id as string;

  // 2. Role declaration (versioned)
  await supabase.from("role_declaration").insert({ student_id: studentId, role, is_current: true });

  // 3. Self-assessment (their voice, before diagnosis)
  const selfConfidence = lvl(formData.get("self_confidence"));
  await supabase.from("self_assessment").insert({
    student_id: studentId,
    goals: String(formData.get("goals") ?? "") || null,
    why: String(formData.get("why") ?? "") || null,
    self_confidence: selfConfidence,
    self_gaps: String(formData.get("self_gaps") ?? "") || null,
  });

  // 4. Resume + LinkedIn current state
  await supabase.from("artifact_state").insert([
    {
      student_id: studentId,
      kind: "resume",
      level: lvl(formData.get("resume_level")),
      url: String(formData.get("resume_url") ?? "") || null,
    },
    {
      student_id: studentId,
      kind: "linkedin",
      level: lvl(formData.get("linkedin_level")),
      url: String(formData.get("linkedin_url") ?? "") || null,
    },
  ]);

  // 5. Soft-readiness output
  const s1 = lvl(formData.get("s1"));
  const s2 = lvl(formData.get("s2"));
  const s3 = lvl(formData.get("s3"));
  const critique = formData.get("critique") ? lvl(formData.get("critique")) : undefined;
  const selfAwarenessDelta = selfConfidence - s3; // self-rating minus measured quality
  await supabase.from("soft_assessment").insert({
    student_id: studentId,
    source_label: String(formData.get("soft_source") ?? "Intake exercise"),
    s1_instruction_fidelity: s1,
    s2_ai_judgment: s2,
    s3_deliverable_quality: s3,
    self_awareness_delta: selfAwarenessDelta,
    critique_response: critique ?? null,
  });

  // 6. Competency scores for the declared role
  const scores: CompetencyScore[] = profile.competencies.map((c) => ({
    competencyCode: c.code,
    level: lvl(formData.get(`score.${c.code}`)),
  }));
  await supabase.from("competency_score").insert(
    scores.map((s) => ({
      student_id: studentId,
      role,
      competency_code: s.competencyCode,
      level: s.level,
    }))
  );

  // 7. Tier (signature floor applied inside)
  const coachability = coachabilityFromSoft({
    instructionFidelity: s1,
    critiqueResponse: critique,
    selfAwarenessDelta,
  });
  const result = computeTier(role, scores, coachability);

  // 8. Readiness snapshot (dated, so movement is queryable)
  await supabase.from("readiness_snapshot").insert({
    student_id: studentId,
    role,
    hard_gap: result.hardGap,
    hard_readiness_pct: result.hardReadinessPct,
    coachability,
    tier: result.tier,
    signature_floor_fired: result.signatureFloorFired,
  });

  // 9. Auto-prescriptions for every below-target competency (signature first)
  const belowTarget = profile.competencies
    .map((c) => ({ c, level: scores.find((s) => s.competencyCode === c.code)!.level }))
    .filter((x) => x.level < x.c.target)
    .sort((a, b) => Number(b.c.isSignature) - Number(a.c.isSignature));

  const prescriptions = belowTarget.flatMap(({ c }) => {
    const items: { student_id: string; competency_code: string; kind: string; detail: string }[] = [];
    if (c.remediation.project)
      items.push({ student_id: studentId, competency_code: c.code, kind: "project", detail: c.remediation.project });
    if (c.remediation.reading)
      items.push({ student_id: studentId, competency_code: c.code, kind: "reading", detail: c.remediation.reading });
    return items;
  });
  if (prescriptions.length) await supabase.from("prescription").insert(prescriptions);

  // 10. Audit log
  await supabase.from("audit_log").insert([
    { actor, action: "create", entity: "student", entity_id: studentId, after: { full_name: fullName, role, track } },
    {
      actor,
      action: "tier_change",
      entity: "readiness_snapshot",
      entity_id: studentId,
      after: { tier: result.tier, signature_floor_fired: result.signatureFloorFired, readiness: result.hardReadinessPct },
    },
  ]);

  redirect(`/students/${studentId}`);
}
