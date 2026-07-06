"use client";

import { useMemo, useState } from "react";
import { ROLE_LIBRARY, ROLE_LABELS, TRACK_LABELS, getRoleProfile } from "@/lib/roleLibrary";
import type { Role } from "@/lib/types";
import { enrollStudent } from "./actions";

const LEVELS = [
  { v: 0, label: "0 · Absent" },
  { v: 1, label: "1 · Emerging" },
  { v: 2, label: "2 · Competent" },
  { v: 3, label: "3 · Strong" },
];

function LevelSelect({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-hsb-blue focus:outline-none"
    >
      {LEVELS.map((l) => (
        <option key={l.v} value={l.v}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-hsb-navy">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
    </label>
  );
}

const input =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-hsb-blue focus:outline-none";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold text-hsb-navy">{title}</h2>
      {desc ? <p className="mt-0.5 text-sm text-gray-500">{desc}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function IntakeForm() {
  const [role, setRole] = useState<Role>("product");
  const profile = useMemo(() => getRoleProfile(role), [role]);

  return (
    <form action={enrollStudent} className="space-y-6">
      <Section title="Student" desc="Basics.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input name="full_name" required className={input} placeholder="e.g. Aditi Sharma" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={input} placeholder="student@hsb.edu.in" />
          </Field>
          <Field label="Cohort">
            <input name="cohort" className={input} placeholder="MBA 2026" defaultValue="MBA 2026" />
          </Field>
          <Field label="Track (given by HSB)">
            <select name="track" className={input} defaultValue="product_mgmt">
              {Object.entries(TRACK_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Target role (declared)" desc="The role the student is aiming for — separate from the track.">
        <Field label="Declared role">
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={input}
          >
            {ROLE_LIBRARY.map((r) => (
              <option key={r.role} value={r.role}>
                {ROLE_LABELS[r.role]}
              </option>
            ))}
          </select>
        </Field>
        <p className="rounded-md bg-hsb-tint px-3 py-2 text-xs text-hsb-navy">
          Signature competency (hard floor): <strong>{profile.competencies.find((c) => c.isSignature)?.name}</strong>.
          Below target here caps the tier under Green.
        </p>
      </Section>

      <Section title="Self-assessment" desc="Captured before diagnosis — the student's own voice.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Their goals">
            <textarea name="goals" rows={2} className={input} />
          </Field>
          <Field label="Their why">
            <textarea name="why" rows={2} className={input} />
          </Field>
          <Field label="Self-rated confidence" hint="Feeds the self-awareness delta vs measured quality.">
            <LevelSelect name="self_confidence" defaultValue={2} />
          </Field>
          <Field label="Where they think their gaps are">
            <textarea name="self_gaps" rows={2} className={input} />
          </Field>
        </div>
      </Section>

      <Section title="Resume & LinkedIn — current state" desc="Scored artifacts, re-scored on each resubmission.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Resume state">
            <LevelSelect name="resume_level" />
          </Field>
          <Field label="Resume link">
            <input name="resume_url" className={input} placeholder="https://…" />
          </Field>
          <Field label="LinkedIn state">
            <LevelSelect name="linkedin_level" />
          </Field>
          <Field label="LinkedIn URL">
            <input name="linkedin_url" className={input} placeholder="https://linkedin.com/in/…" />
          </Field>
        </div>
      </Section>

      <Section
        title="Soft-readiness"
        desc="Instrument-agnostic output from any deliverable. Seeds the coachability axis."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Source deliverable">
            <input name="soft_source" className={input} defaultValue="Intake exercise" />
          </Field>
          <div className="hidden sm:block" />
          <Field label="S1 · Instruction fidelity">
            <LevelSelect name="s1" defaultValue={2} />
          </Field>
          <Field label="S2 · AI judgment" hint="U-shape: non-use and blind-use both score low.">
            <LevelSelect name="s2" defaultValue={2} />
          </Field>
          <Field label="S3 · Deliverable quality">
            <LevelSelect name="s3" defaultValue={2} />
          </Field>
          <Field label="Response to critique" hint="If you ran a revision loop.">
            <LevelSelect name="critique" defaultValue={2} />
          </Field>
        </div>
      </Section>

      <Section
        title={`Diagnosis — ${ROLE_LABELS[role]}`}
        desc="Score each competency 0–3 on evidence from resume, LinkedIn, and the exercise."
      >
        <div className="space-y-3">
          {profile.competencies.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between gap-4 rounded-md border border-gray-100 px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-hsb-navy">
                  {c.name}
                  {c.isSignature ? (
                    <span className="ml-2 rounded bg-hsb-magenta/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-hsb-magenta">
                      signature
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-gray-400">
                  target {c.target} · weight {(c.weight * 100).toFixed(0)}% — {c.definition}
                </div>
              </div>
              <LevelSelect name={`score.${c.code}`} />
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-hsb-green px-6 py-2.5 font-semibold text-hsb-navy hover:brightness-95"
        >
          Enroll & diagnose
        </button>
      </div>
    </form>
  );
}
