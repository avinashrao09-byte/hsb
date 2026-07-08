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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-slate-700">
        <header className="border-b border-slate-200 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/" className="flex items-baseline gap-2.5">
              <span className="font-display text-xl font-semibold tracking-tight text-hsb-navy">
                HSB
              </span>
              <span className="h-4 w-px translate-y-0.5 bg-slate-300" />
              <span className="text-[13px] font-medium tracking-wide text-slate-500">
                Career Readiness
              </span>
            </Link>

            {email ? (
              <nav className="flex items-center gap-1">
                <NavLink href="/">Overview</NavLink>
                <NavLink href="/board">Dashboard</NavLink>
                <NavLink href="/dean">Dean</NavLink>
                <Link
                  href="/students/new"
                  className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-hsb-navy px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-hsb-navy/30"
                >
                  Enroll
                </Link>
                <div className="mx-2 h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 text-[11px] font-semibold text-slate-600">
                    {initials(email)}
                  </span>
                  <span className="hidden text-sm text-slate-500 md:inline">{email}</span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-hsb-navy"
    >
      {children}
    </Link>
  );
}
