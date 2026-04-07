"use client";

import Link from "next/link";
import { SketchPad } from "@/components/SketchPad";
import { FanNav } from "@/components/FanNav";

export default function SketchPage() {
  return (
    <div className="min-h-screen washi-surface washi-base">
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto max-w-2xl flex items-center gap-2">
          <Link
            href="/reader/guided"
            className="quilt-text-sm flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <h1 className="quilt-text font-semibold">Sketch Pad</h1>
        </div>
      </header>

      <SketchPad />

      <div className="fixed bottom-6 right-6 z-40">
        <FanNav />
      </div>
    </div>
  );
}
