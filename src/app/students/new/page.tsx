import Link from "next/link";
import IntakeForm from "./IntakeForm";
import { isConfigured } from "@/lib/supabase/server";

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-hsb-blue"
        >
          <span aria-hidden>←</span> Back to batch
        </Link>
        <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-hsb-navy">
          Enroll a student
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Intake → self-assessment → resume/LinkedIn state → soft-readiness → diagnosis → tier.
        </p>
      </div>
      {!isConfigured() ? (
        <div className="mb-6 rounded-md border border-rag-amber/30 bg-rag-amber-soft px-4 py-3 text-sm text-rag-amber">
          Supabase isn&apos;t connected yet — submitting will fail until you set{" "}
          <code className="rounded bg-white px-1">.env.local</code>. See the README.
        </div>
      ) : null}
      <IntakeForm />
    </div>
  );
}
