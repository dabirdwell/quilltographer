"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getPatternById,
  getDifficultyLabel,
  getDifficultyColor,
  samplePatterns,
} from "@/lib/sample-patterns";
import { getGuideForPattern } from "@/lib/guided-steps";
import { useGuidedStore, formatDuration } from "@/lib/stores/guided-store";
import { AccessibilityControls } from "@/components/AccessibilityControls";

/* ------------------------------------------------------------------ */
/*  Difficulty visual (filled dots)                                    */
/* ------------------------------------------------------------------ */

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Difficulty ${level} out of 10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="inline-block h-3 w-3 rounded-full transition-colors"
          style={{
            background:
              i < level ? "var(--accent)" : "var(--border)",
            opacity: i < level ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pattern grid preview (large)                                       */
/* ------------------------------------------------------------------ */

function PatternPreview({ grid, colors }: { grid: number[][]; colors: string[] }) {
  const rows = grid.length;
  const cols = grid[0]?.length || 1;
  const cellSize = 28;
  const gap = 2;

  return (
    <svg
      viewBox={`0 0 ${cols * (cellSize + gap)} ${rows * (cellSize + gap)}`}
      className="w-full max-w-xs mx-auto"
      aria-hidden="true"
    >
      {grid.map((row, r) =>
        row.map((colorIdx, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * (cellSize + gap)}
            y={r * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={colors[colorIdx] || "#ccc"}
          />
        ))
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PatternWelcomePage() {
  const params = useParams();
  const patternId = params.id as string;

  const pattern = getPatternById(patternId);
  const guide = getGuideForPattern(patternId);
  const session = useGuidedStore((s) => s.getSession(patternId));

  if (!pattern || !guide) {
    return (
      <div className="flex min-h-screen items-center justify-center paper-texture" style={{ background: "var(--background)" }}>
        <div className="text-center px-6">
          <p className="quilt-text-xl mb-4">Pattern not found</p>
          <Link
            href="/gallery"
            className="quilt-text underline"
            style={{ color: "var(--accent)" }}
          >
            Browse all patterns
          </Link>
        </div>
      </div>
    );
  }

  const hasExistingSession =
    session && session.completedSteps.length > 0;

  return (
    <div
      className="min-h-screen paper-texture"
      style={{ background: "var(--background)" }}
    >
      <AccessibilityControls />

      {/* Back nav */}
      <div className="px-4 pt-4">
        <Link
          href="/gallery"
          className="quilt-text-sm inline-flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to gallery
        </Link>
      </div>

      <main className="mx-auto max-w-xl px-6 pb-12 pt-6">
        {/* Pattern preview */}
        <div className="mb-8">
          <PatternPreview grid={pattern.grid} colors={pattern.colors} />
        </div>

        {/* Pattern name */}
        <h1 className="quilt-text-heading text-center font-semibold mb-3">
          {pattern.name}
        </h1>

        {/* Difficulty */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${getDifficultyColor(pattern.difficulty)}`}
            >
              {getDifficultyLabel(pattern.difficulty)}
            </span>
            <span className="quilt-text-sm" style={{ color: "var(--text-muted)" }}>
              {pattern.difficulty}/10
            </span>
          </div>
          <DifficultyDots level={pattern.difficulty} />
        </div>

        {/* Description */}
        <p
          className="quilt-text text-center mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          {pattern.description}
        </p>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {/* Estimated time */}
          <div
            className="rounded-xl border px-5 py-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="quilt-text-sm mb-1" style={{ color: "var(--text-muted)" }}>
              Estimated Time
            </p>
            <p className="quilt-text-lg font-semibold">
              {guide.estimatedHours < 2
                ? `${guide.estimatedHours * 60} minutes`
                : `${guide.estimatedHours} hours`}
            </p>
          </div>

          {/* Steps */}
          <div
            className="rounded-xl border px-5 py-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="quilt-text-sm mb-1" style={{ color: "var(--text-muted)" }}>
              Guided Steps
            </p>
            <p className="quilt-text-lg font-semibold">{guide.steps.length} steps</p>
          </div>
        </div>

        {/* Materials checklist */}
        <div
          className="rounded-xl border px-5 py-4 mb-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="quilt-text font-semibold mb-3">Materials Needed</h2>
          <ul className="space-y-2">
            {guide.materials.map((m, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border"
                  style={{ borderColor: "var(--border)" }}
                />
                <span className="quilt-text-sm">
                  <strong>{m.name}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>&mdash; {m.quantity}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools */}
        <div
          className="rounded-xl border px-5 py-4 mb-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="quilt-text font-semibold mb-3">Tools You&rsquo;ll Need</h2>
          <div className="flex flex-wrap gap-2">
            {guide.tools.map((t, i) => (
              <span
                key={i}
                className="rounded-full border px-3 py-1"
                style={{
                  fontSize: "calc(0.8rem * var(--font-scale))",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Techniques */}
        <div
          className="rounded-xl border px-5 py-4 mb-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="quilt-text font-semibold mb-3">Techniques</h2>
          <div className="flex flex-wrap gap-2">
            {pattern.techniques.map((t, i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1"
                style={{
                  fontSize: "calc(0.8rem * var(--font-scale))",
                  background: "var(--accent-muted)",
                  color: "var(--accent)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Warm welcome message */}
        <div
          className="rounded-2xl border-2 px-6 py-6 text-center mb-8"
          style={{
            borderColor: "var(--accent-muted)",
            background: "var(--surface-raised)",
          }}
        >
          <p className="text-3xl mb-3" aria-hidden="true">&#x1F9F5;</p>
          <p className="quilt-text-lg font-medium mb-2">
            Ready to begin?
          </p>
          <p className="quilt-text" style={{ color: "var(--text-muted)" }}>
            Take your time &mdash; your companion is here whenever you need help.
            There&rsquo;s no rush. Every stitch is part of the journey.
          </p>
        </div>

        {/* Resume or Start button */}
        {hasExistingSession ? (
          <div className="space-y-3">
            <Link
              href={`/reader/guided?pattern=${patternId}`}
              className="touch-target-lg flex w-full items-center justify-center gap-2 rounded-xl px-6 py-5 text-center font-semibold text-white transition-colors quilt-text-lg"
              style={{ background: "var(--accent)" }}
            >
              Continue where you left off
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <p
              className="text-center quilt-text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {session!.completedSteps.length} of {guide.steps.length} steps
              complete &middot; Last active{" "}
              {formatDuration(Date.now() - session!.lastActiveTime)} ago
            </p>
          </div>
        ) : (
          <Link
            href={`/reader/guided?pattern=${patternId}`}
            className="touch-target-lg flex w-full items-center justify-center gap-2 rounded-xl px-6 py-5 text-center font-semibold text-white transition-colors quilt-text-lg"
            style={{ background: "var(--accent)" }}
          >
            Begin Guided Mode
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )}

        {/* Color palette */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {pattern.colors.map((color, i) => (
            <span
              key={i}
              className="h-6 w-6 rounded-full border"
              style={{ background: color, borderColor: "var(--border)" }}
              title={color}
            />
          ))}
        </div>

        {/* Other patterns */}
        <div className="mt-12">
          <h2 className="quilt-text font-semibold mb-4 text-center">
            Explore Other Patterns
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {samplePatterns
              .filter((p) => p.id !== patternId)
              .slice(0, 6)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/reader/${p.id}`}
                  className="rounded-xl border p-3 transition-colors hover:border-accent"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {getDifficultyLabel(p.difficulty)}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
