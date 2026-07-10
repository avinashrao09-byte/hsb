"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
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
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Success: keep the button disabled and do a FULL navigation so the
    // middleware reliably sees the freshly-set auth cookie. router.push() here
    // raced the cookie write and could silently bounce back to /login.
    window.location.assign("/");
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-hsb-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700 focus:outline-none focus:ring-2 focus:ring-hsb-blue/40 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:hover:bg-slate-200"
        >
          {loading ? (
            <>
              <Spinner />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
        <p className="text-center text-xs text-slate-400">
          Accounts are provisioned by the program admin. No public sign-up.
        </p>
      </form>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
