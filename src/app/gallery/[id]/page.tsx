import Link from "next/link";
import { notFound } from "next/navigation";
import {
  samplePatterns,
  getPatternById,
  getDifficultyLabel,
  getDifficultyColor,
} from "@/lib/sample-patterns";
import type { Metadata } from "next";

export function generateStaticParams() {
  return samplePatterns.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pattern = getPatternById(id);
  if (!pattern) return { title: "Pattern Not Found — Quiltographer" };
  return {
    title: `${pattern.name} — Quiltographer`,
    description: pattern.description,
  };
}

function LargePreview({
  grid,
  colors,
}: {
  grid: number[][];
  colors: string[];
}) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellSize = 100 / Math.max(rows, cols);

  return (
    <svg
      viewBox={`0 0 ${cols * cellSize} ${rows * cellSize}`}
      className="w-full max-w-md aspect-square rounded-xl"
      aria-hidden="true"
    >
      {grid.map((row, y) =>
        row.map((colorIdx, x) => (
          <rect
            key={`${y}-${x}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={colors[colorIdx] ?? "#ccc"}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={0.3}
          />
        ))
      )}
    </svg>
  );
}

function DifficultyBar({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-label={`Difficulty ${level} out of 10`}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 flex-1 rounded-full ${
            i < level
              ? "bg-foreground"
              : "bg-black/10 dark:bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pattern = getPatternById(id);
  if (!pattern) notFound();

  const gridRows = pattern.grid.length;
  const gridCols = pattern.grid[0].length;

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Quiltographer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/calculator"
            className="hover:underline underline-offset-4"
          >
            Calculator
          </Link>
          <Link
            href="/gallery"
            className="hover:underline underline-offset-4"
          >
            Gallery
          </Link>
          <a
            href="/api/auth/signin"
            className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </a>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        <Link
          href="/gallery"
          className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
        >
          &larr; Back to gallery
        </Link>

        <div className="mt-8 grid md:grid-cols-2 gap-10 items-start">
          {/* Preview */}
          <LargePreview grid={pattern.grid} colors={pattern.colors} />

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {pattern.name}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${getDifficultyColor(pattern.difficulty)}`}
              >
                {getDifficultyLabel(pattern.difficulty)}
              </span>
            </div>

            <p className="mt-4 text-black/70 dark:text-white/70 leading-relaxed">
              {pattern.description}
            </p>

            {/* Difficulty bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Difficulty</span>
                <span className="text-black/50 dark:text-white/50">
                  {pattern.difficulty}/10
                </span>
              </div>
              <DifficultyBar level={pattern.difficulty} />
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="border border-black/10 dark:border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{pattern.pieceCount}</div>
                <div className="text-xs text-black/50 dark:text-white/50 mt-1">
                  Pieces
                </div>
              </div>
              <div className="border border-black/10 dark:border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{pattern.colorCount}</div>
                <div className="text-xs text-black/50 dark:text-white/50 mt-1">
                  Colors
                </div>
              </div>
              <div className="border border-black/10 dark:border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {gridRows}&times;{gridCols}
                </div>
                <div className="text-xs text-black/50 dark:text-white/50 mt-1">
                  Grid
                </div>
              </div>
            </div>

            {/* Techniques */}
            <div className="mt-6">
              <h2 className="text-sm font-medium mb-3">Techniques</h2>
              <div className="flex flex-wrap gap-2">
                {pattern.techniques.map((t) => (
                  <span
                    key={t}
                    className="text-sm border border-black/10 dark:border-white/10 px-3 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Color palette */}
            <div className="mt-6">
              <h2 className="text-sm font-medium mb-3">Color Palette</h2>
              <div className="flex gap-2">
                {pattern.colors.map((color, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="w-10 h-10 rounded-lg border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-black/40 dark:text-white/40 mt-1 block font-[family-name:var(--font-geist-mono)]">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10 dark:border-white/10 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
