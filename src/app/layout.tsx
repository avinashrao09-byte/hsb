import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient, isConfigured } from "@/lib/supabase/server";
import { signOut } from "./auth/actions";

export const metadata: Metadata = {
  title: "HSB Career Readiness",
  description: "HSB mentoring & career-readiness system",
};

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let email: string | null = null;
  if (isConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-slate-800">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-hsb-navy text-sm font-bold text-white shadow-sm">
                H
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-[15px] font-semibold tracking-tight text-hsb-navy">
                  HSB
                </span>
                <span className="text-[13px] font-medium text-slate-400">Career Readiness</span>
              </span>
            </Link>

            {email ? (
              <nav className="flex items-center gap-1.5">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/students/new"
                  className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-hsb-blue px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-hsb-blue-700 focus:outline-none focus:ring-2 focus:ring-hsb-blue/40"
                >
                  <span className="text-base leading-none">+</span> Enroll
                </Link>
                <div className="mx-2 h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-hsb-tint text-xs font-semibold text-hsb-navy">
                    {initials(email)}
                  </span>
                  <span className="hidden text-sm text-slate-500 md:inline">{email}</span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </nav>
            ) : null}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
