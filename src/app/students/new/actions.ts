"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Level, Role } from "@/lib/types";

function lvl(v: FormDataEntryValue | null): Level {
  const n = Number(v ?? 0);
  return (Number.isFinite(n) ? Math.max(0, Math.min(3, n)) : 0) as Level;
}

// Enrollment creates the student and captures intake facts (declared role,
// self-assessment, resume/LinkedIn state). It does NOT diagnose — the student
// lands "Not diagnosed" on the board. Diagnosis is a separate step on the 360,
// run after the exercise.
export async function enrollStudent(formData: FormData) {
  const supabase = createClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role")) as Role;
  const track = String(formData.get("track"));
  if (!fullName || !role || !track) throw new Error("Name, track and role are required.");

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

  // 2. Declared role (versioned)
  await supabase.from("role_declaration").insert({ student_id: studentId, role, is_current: true });

  // 3. Self-assessment (their voice, before diagnosis)
  await supabase.from("self_assessment").insert({
    student_id: studentId,
    goals: String(formData.get("goals") ?? "") || null,
    why: String(formData.get("why") ?? "") || null,
    self_confidence: lvl(formData.get("self_confidence")),
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

  await supabase.from("audit_log").insert({
    actor: "intake-form",
    action: "create",
    entity: "student",
    entity_id: studentId,
    after: { full_name: fullName, role, track },
  });

  redirect(`/students/${studentId}`);
}
