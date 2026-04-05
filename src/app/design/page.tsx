"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuiltPattern } from "@/lib/sample-patterns";
import { FanRadial } from "@/components/fan/FanRadial";
import { DesignCanvas } from "@/components/DesignCanvas";

export default function DesignPage() {
  const [selectedPattern, setSelectedPattern] = useState<QuiltPattern | null>(
    null
  );

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 shrink-0">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          Quiltographer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/gallery"
            className="hover:underline underline-offset-4"
          >
            Gallery
          </Link>
          <Link
            href="/community"
            className="hover:underline underline-offset-4"
          >
            Community
          </Link>
          <Link
            href="/calculator"
            className="hover:underline underline-offset-4"
          >
            Calculator
          </Link>
          <span className="text-black/30 dark:text-white/30 font-medium">
            Design
          </span>
        </nav>
      </header>

      {/* Canvas */}
      <DesignCanvas pattern={selectedPattern} />

      {/* Fan Radial */}
      <FanRadial
        onSelectPattern={setSelectedPattern}
        selectedPatternId={selectedPattern?.id}
      />
    </div>
  );
}
