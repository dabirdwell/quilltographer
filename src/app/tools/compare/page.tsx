"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  samplePatterns,
  getDifficultyLabel,
  getDifficultyColor,
  type QuiltPattern,
} from "@/lib/sample-patterns";
import { getGuideForPattern, type PatternGuide } from "@/lib/guided-steps";

/* ================================================================
   PATTERN COMPARISON

   Load two patterns side by side and compare:
   difficulty, material cost, time estimate, skill overlap.
   Helps quilters choose their next project.
   ================================================================ */

// --- Cost estimation ---

const DEFAULT_PRICE_PER_YARD = 12;
const PRICE_THREAD = 3;
const PRICE_PAPER = 4;

function parseYardage(quantity: string): number | null {
  const cleaned = quantity.toLowerCase().replace(/yards?|yds?/g, "").trim();
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function estimatePatternCost(guide: PatternGuide): number {
  let total = 0;
  for (const m of guide.materials) {
    const n = m.name.toLowerCase();
    const yards = parseYardage(m.quantity);
    if (n.includes("thread") || n.includes("spool")) {
      total += PRICE_THREAD;
    } else if (n.includes("paper") || n.includes("foundation") || n.includes("template")) {
      total += PRICE_PAPER;
    } else if (yards !== null) {
      total += yards * DEFAULT_PRICE_PER_YARD;
    }
  }
  return total;
}

// --- Difficulty bar ---

function DifficultyBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="w-3 h-5 rounded-sm transition-all"
          style={{
            backgroundColor: i < level ? "var(--accent)" : "var(--border-light)",
            opacity: i < level ? 0.4 + (i / 10) * 0.6 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// --- Pattern card (compact preview) ---

function PatternPreview({ pattern }: { pattern: QuiltPattern }) {
  const gridSize = pattern.grid.length;
  const cellSize = Math.min(6, 48 / gridSize);

  return (
    <svg
      width={pattern.grid[0].length * cellSize}
      height={gridSize * cellSize}
      className="mx-auto"
      aria-label={`${pattern.name} preview`}
    >
      {pattern.grid.map((row, ri) =>
        row.map((colorIdx, ci) => (
          <rect
            key={`${ri}-${ci}`}
            x={ci * cellSize}
            y={ri * cellSize}
            width={cellSize}
            height={cellSize}
            fill={pattern.colors[colorIdx] || "#ccc"}
            stroke="white"
            strokeWidth={0.3}
          />
        ))
      )}
    </svg>
  );
}

// --- Comparison row ---

function CompareRow({
  label,
  left,
  right,
  highlight,
}: {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
  highlight?: "left" | "right" | "equal";
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 py-3 border-b border-[var(--border-light)]">
      <div className={`text-right ${highlight === "left" ? "font-semibold" : ""}`}>
        {left}
      </div>
      <div className="text-xs text-[var(--text-muted)] self-center w-24 text-center">
        {label}
      </div>
      <div className={`text-left ${highlight === "right" ? "font-semibold" : ""}`}>
        {right}
      </div>
    </div>
  );
}

// --- Main page ---

export default function ComparePage() {
  const [leftId, setLeftId] = useState(samplePatterns[0]?.id || "");
  const [rightId, setRightId] = useState(samplePatterns[3]?.id || "");

  const leftPattern = samplePatterns.find((p) => p.id === leftId);
  const rightPattern = samplePatterns.find((p) => p.id === rightId);
  const leftGuide = leftId ? getGuideForPattern(leftId) : undefined;
  const rightGuide = rightId ? getGuideForPattern(rightId) : undefined;

  const comparison = useMemo(() => {
    if (!leftPattern || !rightPattern || !leftGuide || !rightGuide) return null;

    const leftCost = estimatePatternCost(leftGuide);
    const rightCost = estimatePatternCost(rightGuide);

    // Technique overlap
    const leftTech = new Set(leftPattern.techniques.map((t) => t.toLowerCase()));
    const rightTech = new Set(rightPattern.techniques.map((t) => t.toLowerCase()));
    const shared = [...leftTech].filter((t) => rightTech.has(t));
    const leftOnly = [...leftTech].filter((t) => !rightTech.has(t));
    const rightOnly = [...rightTech].filter((t) => !leftTech.has(t));

    return { leftCost, rightCost, shared, leftOnly, rightOnly };
  }, [leftPattern, rightPattern, leftGuide, rightGuide]);

  const selectClass =
    "w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--foreground)] transition-colors";

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity">
          Quiltographer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/calculator" className="hover:underline underline-offset-4">Calculator</Link>
          <Link href="/tools/cutting" className="hover:underline underline-offset-4">Cutting</Link>
          <Link href="/tools/compare" className="underline underline-offset-4">Compare</Link>
          <Link href="/gallery" className="hover:underline underline-offset-4">Gallery</Link>
          <Link href="/stash" className="hover:underline underline-offset-4">Stash</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
          Pattern Comparison
        </h1>
        <p className="mt-4 text-center text-[var(--text-muted)] max-w-xl mx-auto">
          Choose two patterns to compare side by side — difficulty, cost, time,
          and what skills you&apos;ll practice.
        </p>

        {/* Selectors */}
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 mt-10 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Pattern A</label>
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className={selectClass}
            >
              {samplePatterns.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getDifficultyLabel(p.difficulty)})
                </option>
              ))}
            </select>
          </div>

          <div className="text-center text-[var(--text-muted)] text-lg font-bold self-center hidden sm:block">
            vs
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pattern B</label>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className={selectClass}
            >
              {samplePatterns.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getDifficultyLabel(p.difficulty)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison */}
        {leftPattern && rightPattern && leftGuide && rightGuide && comparison && (
          <div className="mt-10">
            {/* Pattern previews */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-8">
              <div className="text-center">
                <PatternPreview pattern={leftPattern} />
                <h3 className="text-lg font-semibold mt-3">{leftPattern.name}</h3>
              </div>
              <div />
              <div className="text-center">
                <PatternPreview pattern={rightPattern} />
                <h3 className="text-lg font-semibold mt-3">{rightPattern.name}</h3>
              </div>
            </div>

            {/* Comparison rows */}
            <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] px-6">
              <CompareRow
                label="Difficulty"
                left={
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(leftPattern.difficulty)}`}>
                      {getDifficultyLabel(leftPattern.difficulty)}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-sm">{leftPattern.difficulty}/10</span>
                  </div>
                }
                right={
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-geist-mono)] text-sm">{rightPattern.difficulty}/10</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(rightPattern.difficulty)}`}>
                      {getDifficultyLabel(rightPattern.difficulty)}
                    </span>
                  </div>
                }
                highlight={leftPattern.difficulty < rightPattern.difficulty ? "left" : leftPattern.difficulty > rightPattern.difficulty ? "right" : "equal"}
              />

              <CompareRow
                label="Difficulty"
                left={<DifficultyBar level={leftPattern.difficulty} />}
                right={<DifficultyBar level={rightPattern.difficulty} />}
              />

              <CompareRow
                label="Time Estimate"
                left={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    ~{leftGuide.estimatedHours}h
                  </span>
                }
                right={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    ~{rightGuide.estimatedHours}h
                  </span>
                }
                highlight={leftGuide.estimatedHours < rightGuide.estimatedHours ? "left" : leftGuide.estimatedHours > rightGuide.estimatedHours ? "right" : "equal"}
              />

              <CompareRow
                label="Material Cost"
                left={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    ~${comparison.leftCost.toFixed(0)}
                  </span>
                }
                right={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    ~${comparison.rightCost.toFixed(0)}
                  </span>
                }
                highlight={comparison.leftCost < comparison.rightCost ? "left" : comparison.leftCost > comparison.rightCost ? "right" : "equal"}
              />

              <CompareRow
                label="Piece Count"
                left={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    {leftPattern.pieceCount}
                  </span>
                }
                right={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    {rightPattern.pieceCount}
                  </span>
                }
              />

              <CompareRow
                label="Colors"
                left={
                  <div className="flex justify-end gap-1">
                    {leftPattern.colors.map((c, i) => (
                      <span key={i} className="w-4 h-4 rounded-full inline-block border border-white/20" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                }
                right={
                  <div className="flex gap-1">
                    {rightPattern.colors.map((c, i) => (
                      <span key={i} className="w-4 h-4 rounded-full inline-block border border-white/20" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                }
              />

              <CompareRow
                label="Steps"
                left={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    {leftGuide.steps.length} steps
                  </span>
                }
                right={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    {rightGuide.steps.length} steps
                  </span>
                }
              />

              <CompareRow
                label="Materials"
                left={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    {leftGuide.materials.length} items
                  </span>
                }
                right={
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                    {rightGuide.materials.length} items
                  </span>
                }
              />
            </div>

            {/* Technique Comparison */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Skill Overlap</h2>

              {comparison.shared.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                    Shared techniques ({comparison.shared.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {comparison.shared.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-xs font-medium border-2 border-[var(--success)]"
                        style={{ color: "var(--success)", backgroundColor: "var(--success-muted)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                {comparison.leftOnly.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                      Only in {leftPattern.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {comparison.leftOnly.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {comparison.rightOnly.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                      Only in {rightPattern.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {comparison.rightOnly.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {comparison.shared.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">
                  These patterns use completely different techniques — great for broadening your skills!
                </p>
              )}
            </div>

            {/* Recommendation */}
            <div className="mt-8 rounded-xl border border-[var(--border)] p-6 bg-[var(--surface)]">
              <h2 className="text-lg font-semibold mb-2">Quick Take</h2>
              {leftPattern.difficulty <= rightPattern.difficulty ? (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong>{leftPattern.name}</strong> is the easier project
                  {leftGuide.estimatedHours < rightGuide.estimatedHours ? " and quicker to finish" : ""}.
                  {comparison.leftCost < comparison.rightCost
                    ? ` It's also more affordable (~$${comparison.leftCost.toFixed(0)} vs ~$${comparison.rightCost.toFixed(0)}).`
                    : ""}
                  {" "}If you&apos;re looking for a challenge,{" "}
                  <strong>{rightPattern.name}</strong> will teach you{" "}
                  {comparison.rightOnly.length > 0
                    ? comparison.rightOnly.slice(0, 2).join(" and ")
                    : "more advanced skills"}.
                  {comparison.shared.length > 0 && (
                    <> Both patterns share {comparison.shared.join(", ")} — skills that transfer between them.</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong>{rightPattern.name}</strong> is the easier project
                  {rightGuide.estimatedHours < leftGuide.estimatedHours ? " and quicker to finish" : ""}.
                  {comparison.rightCost < comparison.leftCost
                    ? ` It's also more affordable (~$${comparison.rightCost.toFixed(0)} vs ~$${comparison.leftCost.toFixed(0)}).`
                    : ""}
                  {" "}If you&apos;re looking for a challenge,{" "}
                  <strong>{leftPattern.name}</strong> will teach you{" "}
                  {comparison.leftOnly.length > 0
                    ? comparison.leftOnly.slice(0, 2).join(" and ")
                    : "more advanced skills"}.
                  {comparison.shared.length > 0 && (
                    <> Both patterns share {comparison.shared.join(", ")} — skills that transfer between them.</>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-sm text-[var(--text-muted)]">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
