"use client";

import { useRef } from "react";
import type { PatternGuide, GuidedStep } from "@/lib/guided-steps";
import type { QuiltPattern } from "@/lib/sample-patterns";
import { getDifficultyLabel } from "@/lib/sample-patterns";

/* ================================================================
   PRINT-FRIENDLY PATTERN VIEW

   Generates a clean, printer-optimized version of a parsed pattern.
   Designed to be better than the original PDF — large text, clear
   numbering, checkboxes, generous spacing, materials checklist.

   Usage:
     <PrintView pattern={pattern} guide={guide} />
   ================================================================ */

interface PrintViewProps {
  pattern: QuiltPattern;
  guide: PatternGuide;
  /** Optional cutting layout image (data URL or src) */
  cuttingLayoutSrc?: string;
}

export default function PrintView({ pattern, guide, cuttingLayoutSrc }: PrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Print trigger button — hidden in print */}
      <div className="print:hidden mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-full bg-[var(--foreground)] text-[var(--background)] px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          🖨 Print this pattern
        </button>
        <span className="text-xs text-[var(--text-muted)]">
          Optimized for paper — better than the original PDF
        </span>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="print-view">
        {/* Cover / Header */}
        <div className="print-page-header">
          <div className="flex items-start justify-between border-b-2 border-[var(--foreground)] pb-4 mb-6 print:border-black">
            <div>
              <h1 className="text-3xl font-bold tracking-tight print:text-[24pt]">
                {pattern.name}
              </h1>
              <p className="text-[var(--text-muted)] mt-1 print:text-[10pt] print:text-gray-600">
                {getDifficultyLabel(pattern.difficulty)} · {pattern.pieceCount} pieces · ~{guide.estimatedHours} hours
              </p>
            </div>
            <div className="text-right text-xs text-[var(--text-muted)] print:text-[8pt] print:text-gray-500">
              <div className="font-semibold">Prepared by Quiltographer</div>
              <div>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-6 print:text-[10pt] print:leading-relaxed">
            {pattern.description}
          </p>
        </div>

        {/* Materials Checklist */}
        <section className="mb-8 print:mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold mb-4 print:text-[16pt] border-b border-[var(--border)] pb-2 print:border-gray-300">
            Materials Checklist
          </h2>
          <div className="space-y-2">
            {guide.materials.map((m, i) => (
              <label
                key={i}
                className="flex items-center gap-3 py-1.5 text-sm print:text-[11pt]"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-[var(--border)] rounded print:border-gray-400 shrink-0">
                  {/* Empty checkbox for printing */}
                </span>
                <span className="font-medium">{m.name}</span>
                <span className="text-[var(--text-muted)] ml-auto font-[family-name:var(--font-geist-mono)] print:text-gray-600">
                  {m.quantity}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Tools Needed */}
        <section className="mb-8 print:mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold mb-4 print:text-[16pt] border-b border-[var(--border)] pb-2 print:border-gray-300">
            Tools Needed
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {guide.tools.map((tool, i) => (
              <div key={i} className="flex items-center gap-2 text-sm print:text-[10pt]">
                <span className="inline-flex items-center justify-center w-4 h-4 border-2 border-[var(--border)] rounded print:border-gray-400 shrink-0" />
                <span>{tool}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Techniques */}
        <section className="mb-8 print:mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold mb-3 print:text-[16pt] border-b border-[var(--border)] pb-2 print:border-gray-300">
            Techniques Used
          </h2>
          <div className="flex flex-wrap gap-2">
            {pattern.techniques.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border)] print:border-gray-400 print:text-[9pt]"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Cutting Layout (if provided) */}
        {cuttingLayoutSrc && (
          <section className="mb-8 print:break-before-page print:mb-6">
            <h2 className="text-xl font-bold mb-4 print:text-[16pt] border-b border-[var(--border)] pb-2 print:border-gray-300">
              Cutting Layout
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cuttingLayoutSrc}
              alt="Cutting layout diagram"
              className="w-full max-w-[600px] mx-auto"
            />
          </section>
        )}

        {/* Step-by-Step Instructions */}
        <section className="print:break-before-page">
          <h2 className="text-xl font-bold mb-6 print:text-[16pt] border-b border-[var(--border)] pb-2 print:border-gray-300">
            Step-by-Step Instructions
          </h2>
          <div className="space-y-6 print:space-y-4">
            {guide.steps.map((step, i) => (
              <StepBlock key={i} step={step} index={i} total={guide.steps.length} />
            ))}
          </div>
        </section>

        {/* Completion note */}
        <div className="mt-10 pt-6 border-t-2 border-[var(--foreground)] text-center print:border-black print:mt-8">
          <p className="text-lg font-semibold print:text-[14pt]">
            You did it! Your {pattern.name} is complete.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1 print:text-[9pt] print:text-gray-500">
            Pattern guide prepared by Quiltographer · quiltographer.app
          </p>
        </div>
      </div>

      {/* Print-specific global styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except printable content */
          body > * { visibility: hidden; }
          .print-view, .print-view * { visibility: visible; }
          .print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Page setup */
          @page {
            size: letter;
            margin: 0.6in 0.75in;
          }

          /* Force black and white friendly */
          .print-view {
            color: black !important;
            background: white !important;
          }

          /* Page headers */
          .print-page-header {
            page-break-after: avoid;
          }

          /* Prevent orphan steps */
          .step-block {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Hide screen-only elements */
          .print\\:hidden,
          header, footer, nav,
          button:not(.print-keep) {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

// --- Step Block ---

function StepBlock({
  step,
  index,
  total,
}: {
  step: GuidedStep;
  index: number;
  total: number;
}) {
  return (
    <div className="step-block flex gap-4 print:gap-3">
      {/* Step number + checkbox */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--foreground)] flex items-center justify-center text-sm font-bold print:border-black print:w-7 print:h-7 print:text-[10pt]">
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="w-px flex-1 bg-[var(--border)] mt-2 print:bg-gray-300" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-4">
        {step.isSequenceCritical && (
          <div className="text-xs font-semibold text-[var(--accent)] mb-1 print:text-gray-700 print:text-[8pt]">
            ⚠ SEQUENCE CRITICAL — Do this step in order
          </div>
        )}
        <p className="text-sm leading-relaxed print:text-[11pt] print:leading-[1.6]">
          {step.text}
        </p>
        {/* Completion checkbox line */}
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)] print:text-[8pt]">
          <span className="inline-flex items-center justify-center w-4 h-4 border border-[var(--border)] rounded-sm print:border-gray-400" />
          <span>Done</span>
          <span className="ml-auto">Step {index + 1} of {total}</span>
        </div>
      </div>
    </div>
  );
}
