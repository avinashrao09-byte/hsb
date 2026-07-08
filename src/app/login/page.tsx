"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
    router.push("/");
  }

  const field =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-hsb-blue focus:outline-none focus:ring-2 focus:ring-hsb-blue/20";

  return (
    <div className="mx-auto mt-10 max-w-sm sm:mt-16">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-hsb-navy text-lg font-bold text-white shadow-sm">
          H
        </span>
        <div>
          <div className="font-display text-lg font-semibold tracking-tight text-hsb-navy">
            HSB Career Readiness
          </div>
          <div className="text-sm text-slate-400">Mentor sign in</div>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="you@hsb.edu.in"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder="••••••••"
          />
        </label>
        {error ? (
          <p className="rounded-lg bg-rag-red-soft px-3 py-2 text-sm text-rag-red">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-hsb-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700 focus:outline-none focus:ring-2 focus:ring-hsb-blue/40 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs text-slate-400">
          Accounts are provisioned by the program admin. No public sign-up.
        </p>
      </form>
    </div>
  );
}
