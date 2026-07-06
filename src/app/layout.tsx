import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSB Career Readiness",
  description: "HSB mentoring & career-readiness system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-hsb-ink">
        <header className="bg-hsb-navy text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded bg-white font-display text-lg font-bold text-hsb-navy">
                H
              </span>
              <span className="font-display text-lg font-semibold tracking-wide">
                HSB Career Readiness
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/" className="hover:text-hsb-soft">
                Dashboard
              </Link>
              <Link
                href="/students/new"
                className="rounded-md bg-hsb-green px-3 py-1.5 font-medium text-hsb-navy hover:brightness-95"
              >
                + Enroll student
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
