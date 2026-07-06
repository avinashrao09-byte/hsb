import IntakeForm from "./IntakeForm";
import { isConfigured } from "@/lib/supabase";

export default function NewStudentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-hsb-navy">Enroll a student</h1>
        <p className="text-sm text-gray-500">
          Intake → self-assessment → resume/LinkedIn state → soft-readiness → diagnosis → tier.
        </p>
      </div>
      {!isConfigured() ? (
        <div className="mb-6 rounded-md border border-hsb-soft bg-hsb-tint px-4 py-3 text-sm text-hsb-navy">
          Supabase isn&apos;t connected yet — submitting will fail until you set{" "}
          <code>.env.local</code>. See the README.
        </div>
      ) : null}
      <IntakeForm />
    </div>
  );
}
