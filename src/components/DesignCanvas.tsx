"use client";

import type { QuiltPattern } from "@/lib/sample-patterns";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/sample-patterns";

interface DesignCanvasProps {
  pattern: QuiltPattern | null;
}

function PatternGrid({ pattern }: { pattern: QuiltPattern }) {
  const rows = pattern.grid.length;
  const cols = pattern.grid[0].length;
  const maxDim = Math.max(rows, cols);
  const cellSize = Math.min(Math.floor(480 / maxDim), 64);
  const gridW = cols * cellSize;
  const gridH = rows * cellSize;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Pattern info header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {pattern.name}
        </h2>
        <p className="text-sm text-black/50 dark:text-white/50 mt-2 max-w-md">
          {pattern.description}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyColor(pattern.difficulty)}`}
          >
            {getDifficultyLabel(pattern.difficulty)}
          </span>
          <span className="text-xs text-black/40 dark:text-white/40">
            {pattern.pieceCount} pieces
          </span>
          <span className="text-xs text-black/40 dark:text-white/40">
            {pattern.colorCount} colors
          </span>
        </div>
      </div>

      {/* SVG grid */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid rgba(128,128,128,0.15)",
        }}
      >
        <svg
          width={gridW}
          height={gridH}
          viewBox={`0 0 ${gridW} ${gridH}`}
          className="block"
        >
          {pattern.grid.map((row, ri) =>
            row.map((colorIdx, ci) => (
              <g key={`${ri}-${ci}`}>
                <rect
                  x={ci * cellSize}
                  y={ri * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={pattern.colors[colorIdx] ?? "#ccc"}
                  className="transition-opacity duration-150 hover:opacity-80 cursor-crosshair"
                />
                <rect
                  x={ci * cellSize}
                  y={ri * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="none"
                  stroke="rgba(128,128,128,0.2)"
                  strokeWidth={0.5}
                />
              </g>
            ))
          )}
        </svg>
      </div>

      {/* Color palette */}
      <div className="flex items-center gap-1.5">
        {pattern.colors.map((color, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-md ring-1 ring-black/10 dark:ring-white/10"
            style={{ background: color }}
            title={color}
          />
        ))}
      </div>

      {/* Techniques */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
        {pattern.techniques.map((tech) => (
          <span
            key={tech}
            className="text-[10px] px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DesignCanvas({ pattern }: DesignCanvasProps) {
  if (!pattern) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div
            className="text-6xl mb-6 opacity-20"
            style={{ fontFamily: "serif" }}
          >
            {"\u6247"}
          </div>
          <h2 className="text-lg font-medium text-black/40 dark:text-white/40">
            Open the fan to explore patterns
          </h2>
          <p className="text-sm text-black/25 dark:text-white/25 mt-2">
            Click the handle on the right edge, then select a category to browse
            quilt patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
      <PatternGrid pattern={pattern} />
    </div>
  );
}
