"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SeasonalTint, useTipOfTheDay } from "@/components/JapaneseTextures";

/* ------------------------------------------------------------------ */
/*  TipOfTheDay component                                              */
/* ------------------------------------------------------------------ */

function TipOfTheDay() {
  const [tips, setTips] = useState<{ id: number; tip: string; category: string }[]>([]);

  useEffect(() => {
    import("@/data/quilting_tips.json")
      .then((mod) => setTips(mod.default || mod))
      .catch(() => {});
  }, []);

  const tip = useTipOfTheDay(tips);

  if (!tip) return null;

  return (
    <div
      className="washi-card rounded-xl border px-5 py-4 max-w-xl mx-auto"
      style={{
        borderColor: "var(--border-light)",
        background: "var(--surface)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5"
          >
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5L12 21l-2-11.5A4 4 0 0 1 12 2z" />
            <path d="M12 10v2" />
          </svg>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
              Quilter&rsquo;s Tip of the Day
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {tip.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] washi-surface washi-base">
      <SeasonalTint />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>Quiltographer</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/stash" className="hover:underline underline-offset-4" style={{ color: "var(--text-secondary)" }}>
            Stash
          </Link>
          <Link href="/calculator" className="hover:underline underline-offset-4" style={{ color: "var(--text-secondary)" }}>
            Calculator
          </Link>
          <Link href="/gallery" className="hover:underline underline-offset-4" style={{ color: "var(--text-secondary)" }}>
            Gallery
          </Link>
          <Link href="/community" className="hover:underline underline-offset-4" style={{ color: "var(--text-secondary)" }}>
            Community
          </Link>
          <Link href="/design" className="hover:underline underline-offset-4" style={{ color: "var(--text-secondary)" }}>
            Design
          </Link>
          <a href="#pricing" className="hover:underline underline-offset-4" style={{ color: "var(--text-secondary)" }}>
            Pricing
          </a>
          <a
            href="/api/auth/signin"
            className="rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", color: "white" }}
          >
            Sign in
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1">
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ color: "var(--foreground)" }}>
            Turn any quilt pattern into
            <br />
            step-by-step instructions
          </h1>
          <p className="mt-6 text-lg max-w-xl" style={{ color: "var(--text-muted)" }}>
            Upload a pattern or describe your quilt idea. Quiltographer uses AI
            to parse it into structured cutting lists, fabric requirements, and
            assembly order — so you can focus on sewing.
          </p>
          <div className="mt-10 flex gap-4 flex-col sm:flex-row">
            <a
              href="/api/auth/signin"
              className="rounded-full px-8 py-3 text-base font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Get started free
            </a>
            <a
              href="#pricing"
              className="rounded-full border px-8 py-3 text-base font-medium transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              View pricing
            </a>
          </div>
        </section>

        {/* Tip of the Day */}
        <section className="px-6 pb-12">
          <TipOfTheDay />
        </section>

        {/* How it works */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12" style={{ color: "var(--foreground)" }}>
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3" style={{ color: "var(--accent)" }}>1</div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>Upload or describe</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Paste a pattern PDF, image, or just describe the quilt you want
                to make.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3" style={{ color: "var(--accent)" }}>2</div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>AI parses it</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Quiltographer breaks down the pattern into fabric yardage,
                cutting dimensions, and block assembly.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3" style={{ color: "var(--accent)" }}>3</div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>Start quilting</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Follow the structured steps at your own pace. Check off tasks as
                you go.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: "var(--foreground)" }}>Pricing</h2>
          <p className="text-center mb-12" style={{ color: "var(--text-muted)" }}>
            Start free, upgrade when you need more.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free tier */}
            <div
              className="washi-card rounded-2xl border p-8"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative z-10">
                <h3 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Free</h3>
                <div className="mt-4 text-4xl font-bold" style={{ color: "var(--foreground)" }}>$0</div>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>forever</p>
                <ul className="mt-6 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <li>3 pattern parses per month</li>
                  <li>Basic cutting lists</li>
                  <li>Fabric stash library</li>
                  <li>Email support</li>
                </ul>
                <a
                  href="/api/auth/signin"
                  className="mt-8 block text-center rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Get started
                </a>
              </div>
            </div>
            {/* Pro tier */}
            <div
              className="washi-card rounded-2xl border-2 p-8 relative"
              style={{ borderColor: "var(--accent)" }}
            >
              <div className="relative z-10">
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  Popular
                </div>
                <h3 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Pro</h3>
                <div className="mt-4 text-4xl font-bold" style={{ color: "var(--foreground)" }}>$12</div>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>per month</p>
                <ul className="mt-6 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <li>Unlimited pattern parses</li>
                  <li>Advanced fabric optimization</li>
                  <li>AI stash suggestions</li>
                  <li>PDF export</li>
                  <li>Priority support</li>
                </ul>
                <a
                  href="/api/auth/signin"
                  className="mt-8 block text-center rounded-full px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  Start free trial
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t px-6 py-6 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
