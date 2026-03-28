import Link from "next/link";
import {
  samplePatterns,
  getDifficultyLabel,
  getDifficultyColor,
} from "@/lib/sample-patterns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pattern Gallery — Quiltographer",
  description:
    "Browse 10 classic quilting patterns from beginner Nine Patch to expert Paper Pieced Landscape.",
};

function PatternPreview({
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
      className="w-full aspect-square rounded-lg"
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
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={0.3}
          />
        ))
      )}
    </svg>
  );
}

export default function GalleryPage() {
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
            className="hover:underline underline-offset-4 font-medium"
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

      <main className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
          Pattern Gallery
        </h1>
        <p className="mt-4 text-center text-black/60 dark:text-white/60 max-w-xl mx-auto">
          Explore classic quilting patterns from beginner-friendly blocks to
          expert-level art quilts.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {samplePatterns.map((pattern) => (
            <Link
              key={pattern.id}
              href={`/gallery/${pattern.id}`}
              className="group border border-black/10 dark:border-white/10 rounded-2xl p-5 hover:border-black/25 dark:hover:border-white/25 transition-colors"
            >
              <PatternPreview grid={pattern.grid} colors={pattern.colors} />
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-lg group-hover:underline underline-offset-4">
                    {pattern.name}
                  </h2>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${getDifficultyColor(pattern.difficulty)}`}
                  >
                    {getDifficultyLabel(pattern.difficulty)} ({pattern.difficulty}
                    /10)
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/60 dark:text-white/60 line-clamp-2">
                  {pattern.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pattern.techniques.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-xs border border-black/10 dark:border-white/10 px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-black/10 dark:border-white/10 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
