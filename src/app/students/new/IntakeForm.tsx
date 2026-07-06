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

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-hsb-blue focus:outline-none focus:ring-2 focus:ring-hsb-blue/20";

function LevelSelect({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  return (
    <select name={name} defaultValue={defaultValue} className={`${input} cursor-pointer`}>
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
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

function Section({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-hsb-tint text-xs font-semibold text-hsb-navy">
          {n}
        </span>
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {desc ? <p className="mt-0.5 text-sm text-slate-500">{desc}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function IntakeForm() {
  const [role, setRole] = useState<Role>("product");
  const profile = useMemo(() => getRoleProfile(role), [role]);
  const signature = profile.competencies.find((c) => c.isSignature);

  return (
    <form action={enrollStudent} className="space-y-5">
      <Section n={1} title="Student" desc="The basics.">
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
            <select name="track" className={`${input} cursor-pointer`} defaultValue="product_mgmt">
              {Object.entries(TRACK_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section
        n={2}
        title="Target role"
        desc="What the student is aiming for — separate from the track."
      >
        <Field label="Declared role">
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={`${input} cursor-pointer`}
          >
            {ROLE_LIBRARY.map((r) => (
              <option key={r.role} value={r.role}>
                {ROLE_LABELS[r.role]}
              </option>
            ))}
          </select>
        </Field>
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-hsb-soft/50 bg-hsb-tint px-3.5 py-2.5 text-xs text-hsb-navy">
          <span className="mt-px text-hsb-blue">◆</span>
          <span>
            Signature competency (hard floor): <strong>{signature?.name}</strong>. Scoring below
            target here caps the tier under Green.
          </span>
        </div>
      </Section>

      <Section n={3} title="Self-assessment" desc="Captured before diagnosis — the student's own voice.">
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

      <Section n={4} title="Resume & LinkedIn" desc="Current state — scored artifacts, re-scored on each resubmission.">
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
        n={5}
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
        n={6}
        title={`Diagnosis — ${ROLE_LABELS[role]}`}
        desc="Score each competency 0–3 on evidence from resume, LinkedIn, and the exercise."
      >
        <div className="space-y-2">
          {profile.competencies.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 transition hover:border-slate-200"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <span className="truncate">{c.name}</span>
                  {c.isSignature ? (
                    <span className="shrink-0 rounded-md bg-hsb-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hsb-blue">
                      signature
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  target {c.target} · weight {(c.weight * 100).toFixed(0)}% — {c.definition}
                </div>
              </div>
              <div className="shrink-0">
                <LevelSelect name={`score.${c.code}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-hsb-blue px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-hsb-blue-700 focus:outline-none focus:ring-2 focus:ring-hsb-blue/40"
        >
          Enroll &amp; diagnose
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}
