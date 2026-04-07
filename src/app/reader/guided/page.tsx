"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getPatternById, getDifficultyLabel } from "@/lib/sample-patterns";
import { getGuideForPattern } from "@/lib/guided-steps";
import { analyzeStepSequence } from "@/lib/construction-sequence";
import { useGuidedStore, estimateRemaining, formatDuration } from "@/lib/stores/guided-store";
import { useAccessibilityStore } from "@/lib/stores/accessibility-store";
import { AccessibilityControls, QuickSetup } from "@/components/AccessibilityControls";
import { AskCompanion } from "@/components/AskCompanion";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Completion sound via Web Audio API                                 */
/* ------------------------------------------------------------------ */

function playCompletionSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 523.25; // C5 — gentle, pleasant
    osc.type = "sine";
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not supported — that's fine
  }
}

/* ------------------------------------------------------------------ */
/*  Pattern grid mini-preview with progressive fill                    */
/* ------------------------------------------------------------------ */

function PatternMiniPreview({
  grid,
  colors,
  progress,
}: {
  grid: number[][];
  colors: string[];
  progress: number; // 0–1
}) {
  const rows = grid.length;
  const cols = grid[0]?.length || 1;
  const totalCells = rows * cols;
  const filledCells = Math.round(totalCells * progress);
  const cellSize = 12;
  const gap = 1;

  return (
    <svg
      viewBox={`0 0 ${cols * (cellSize + gap)} ${rows * (cellSize + gap)}`}
      className="w-full max-w-[200px]"
      aria-hidden="true"
    >
      {grid.map((row, r) =>
        row.map((colorIdx, c) => {
          const cellNumber = r * cols + c;
          const isFilled = cellNumber < filledCells;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * (cellSize + gap)}
              y={r * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={1}
              fill={isFilled ? colors[colorIdx] || "#ccc" : "transparent"}
              stroke={isFilled ? colors[colorIdx] || "#ccc" : "var(--border)"}
              strokeWidth={0.5}
              opacity={isFilled ? 1 : 0.25}
              style={{ transition: "fill 0.5s ease, opacity 0.5s ease" }}
            />
          );
        })
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Session Summary                                                    */
/* ------------------------------------------------------------------ */

function SessionSummary({
  patternName,
  sessionStart,
  lastActive,
  completedCount,
  totalSteps,
}: {
  patternName: string;
  sessionStart: number;
  lastActive: number;
  completedCount: number;
  totalSteps: number;
}) {
  const started = new Date(sessionStart);
  const elapsed = lastActive - sessionStart;

  return (
    <div
      className="rounded-xl border px-5 py-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <h3 className="quilt-text font-semibold mb-2">Session Summary</h3>
      <div className="quilt-text-sm space-y-1" style={{ color: "var(--text-muted)" }}>
        <p>
          <strong>Pattern:</strong> {patternName}
        </p>
        <p>
          <strong>Started:</strong>{" "}
          {started.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}{" "}
          at{" "}
          {started.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p>
          <strong>Time spent:</strong> {formatDuration(elapsed)}
        </p>
        <p>
          <strong>Progress:</strong> {completedCount} of {totalSteps} steps
          complete
        </p>
        {completedCount < totalSteps && (
          <p>
            <strong>Next up:</strong> Step {completedCount + 1}
          </p>
        )}
        {completedCount === totalSteps && (
          <p className="mt-2 font-semibold" style={{ color: "var(--success)" }}>
            All steps complete! Your block is finished.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Guided Mode (inner, needs searchParams)                       */
/* ------------------------------------------------------------------ */

function GuidedModeInner() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("pattern") || "nine-patch";

  const pattern = getPatternById(patternId);
  const guide = getGuideForPattern(patternId);

  const { hasCompletedSetup, soundEnabled } = useAccessibilityStore();
  const [showSetup, setShowSetup] = useState(false);
  const [checkAnimating, setCheckAnimating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const store = useGuidedStore();
  const session = store.getSession(patternId);

  // Initialize session
  useEffect(() => {
    store.startSession(patternId);
  }, [patternId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show quick setup on first visit
  useEffect(() => {
    if (!hasCompletedSetup) {
      setShowSetup(true);
    }
  }, [hasCompletedSetup]);

  if (!pattern || !guide) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="quilt-text-xl mb-4">Pattern not found</p>
          <Link
            href="/gallery"
            className="quilt-text underline"
            style={{ color: "var(--accent)" }}
          >
            Browse patterns
          </Link>
        </div>
      </div>
    );
  }

  const totalSteps = guide.steps.length;
  const currentStep = session?.currentStep ?? 0;
  const completedSteps = session?.completedSteps ?? [];
  const isCurrentComplete = completedSteps.includes(currentStep);
  const progress = completedSteps.length / totalSteps;
  const step = guide.steps[currentStep];
  const sequenceFlag = analyzeStepSequence(step.text, step.isSequenceCritical);

  const goToStep = (idx: number) => {
    if (idx >= 0 && idx < totalSteps) {
      store.setCurrentStep(patternId, idx);
    }
  };

  const toggleComplete = () => {
    if (isCurrentComplete) {
      store.unmarkStepComplete(patternId, currentStep);
    } else {
      store.markStepComplete(patternId, currentStep);
      setCheckAnimating(true);
      setTimeout(() => setCheckAnimating(false), 400);
      if (soundEnabled) {
        playCompletionSound();
      }
    }
  };

  const metadataStr = [
    `Difficulty: ${getDifficultyLabel(pattern.difficulty)} (${pattern.difficulty}/10)`,
    `Techniques: ${pattern.techniques.join(", ")}`,
    `Pieces: ${pattern.pieceCount}`,
  ].join("\n");

  return (
    <div className="min-h-screen paper-texture" style={{ background: "var(--background)" }}>
      {/* Quick Setup overlay */}
      {showSetup && <QuickSetup onComplete={() => setShowSetup(false)} />}

      {/* Accessibility gear button */}
      <AccessibilityControls />

      {/* Top bar: pattern name + progress */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/reader/${patternId}`}
              className="quilt-text-sm flex items-center gap-1"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {pattern.name}
            </Link>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="quilt-text-sm underline"
              style={{ color: "var(--accent)" }}
            >
              {showSummary ? "Hide summary" : "Session info"}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div
              className="h-3 flex-1 overflow-hidden rounded-full"
              style={{ background: "var(--progress-bg)" }}
            >
              <div
                className="h-full rounded-full progress-animate transition-all duration-500"
                style={{
                  width: `${progress * 100}%`,
                  background: "var(--progress-fill)",
                }}
              />
            </div>
            <span className="quilt-text-sm whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Estimated time remaining */}
          {session && completedSteps.length > 0 && completedSteps.length < totalSteps && (
            <p
              className="mt-1 text-right"
              style={{ fontSize: "calc(0.75rem * var(--font-scale))", color: "var(--text-muted)" }}
            >
              ~{estimateRemaining(session, totalSteps)} remaining
            </p>
          )}
        </div>
      </header>

      {/* Session summary (collapsible) */}
      {showSummary && session && (
        <div className="mx-auto max-w-2xl px-4 pt-4 animate-fade-in">
          <SessionSummary
            patternName={pattern.name}
            sessionStart={session.sessionStartTime}
            lastActive={session.lastActiveTime}
            completedCount={completedSteps.length}
            totalSteps={totalSteps}
          />
        </div>
      )}

      {/* Main step content */}
      <main className="mx-auto max-w-2xl px-4 pb-40 pt-6">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Pattern mini-preview */}
          <div className="flex-shrink-0">
            <PatternMiniPreview
              grid={pattern.grid}
              colors={pattern.colors}
              progress={progress}
            />
            <p
              className="mt-2 text-center"
              style={{ fontSize: "calc(0.7rem * var(--font-scale))", color: "var(--text-muted)" }}
            >
              {Math.round(progress * 100)}% complete
            </p>
          </div>

          {/* Step content */}
          <div className="w-full animate-fade-in" key={currentStep}>
            {/* Sequence warning */}
            {sequenceFlag.isCritical && (
              <div
                className="mb-4 flex items-start gap-3 rounded-xl border px-4 py-3"
                style={{
                  background: "var(--accent-muted)",
                  borderColor: "var(--accent)",
                }}
              >
                <span className="mt-0.5 text-lg flex-shrink-0" aria-hidden="true">&#x26A0;&#xFE0F;</span>
                <p className="quilt-text-sm" style={{ color: "var(--accent-hover)" }}>
                  {sequenceFlag.warning}
                </p>
              </div>
            )}

            {/* Step number badge */}
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
              style={{ background: "var(--surface)", color: "var(--text-muted)" }}
            >
              <span className="quilt-text-sm font-medium">
                Step {currentStep + 1}
              </span>
              {isCurrentComplete && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>

            {/* THE instruction */}
            <p className="quilt-text-xl">{step.text}</p>

            {/* Mark complete */}
            <button
              onClick={toggleComplete}
              className={`touch-target-lg mt-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 px-6 py-4 transition-all ${checkAnimating ? "check-complete" : ""}`}
              style={{
                borderColor: isCurrentComplete ? "var(--success)" : "var(--border)",
                background: isCurrentComplete ? "var(--success-muted)" : "transparent",
                color: isCurrentComplete ? "var(--success)" : "var(--foreground)",
              }}
            >
              {/* Checkbox circle */}
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  borderColor: isCurrentComplete ? "var(--success)" : "var(--border)",
                  background: isCurrentComplete ? "var(--success)" : "transparent",
                }}
              >
                {isCurrentComplete && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="quilt-text font-medium">
                {isCurrentComplete ? "Completed!" : "Mark as complete"}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom navigation — fixed, large touch targets */}
      <nav
        className="fixed inset-x-0 bottom-0 z-10 border-t px-4 py-3"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="touch-target-lg flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-4 font-medium transition-colors disabled:opacity-30"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="quilt-text-sm">Previous</span>
          </button>

          {/* Step dots (condensed if many steps) */}
          <div className="hidden sm:flex items-center gap-1">
            {guide.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className="h-2.5 w-2.5 rounded-full transition-all"
                style={{
                  background:
                    i === currentStep
                      ? "var(--accent)"
                      : completedSteps.includes(i)
                        ? "var(--success)"
                        : "var(--border)",
                  transform: i === currentStep ? "scale(1.4)" : "scale(1)",
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep === totalSteps - 1}
            className="touch-target-lg flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-4 font-medium text-white transition-colors disabled:opacity-30"
            style={{ background: "var(--accent)" }}
          >
            <span className="quilt-text-sm">Next</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Ask Companion floating button */}
      <AskCompanion
        patternName={pattern.name}
        currentStepIndex={currentStep}
        currentStep={step}
        allSteps={guide.steps}
        metadata={metadataStr}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper with Suspense (useSearchParams needs it)              */
/* ------------------------------------------------------------------ */

export default function GuidedModePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="quilt-text animate-gentle-pulse" style={{ color: "var(--text-muted)" }}>
            Loading your quilting companion&hellip;
          </p>
        </div>
      }
    >
      <GuidedModeInner />
    </Suspense>
  );
}
