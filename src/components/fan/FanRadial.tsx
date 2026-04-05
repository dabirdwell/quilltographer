"use client";

import { useState, useCallback } from "react";
import {
  categories,
  getPatternsForCategory,
  type PatternCategory,
} from "@/lib/pattern-categories";
import { type QuiltPattern } from "@/lib/sample-patterns";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/sample-patterns";
import { FanSegment } from "./FanSegment";

interface FanRadialProps {
  onSelectPattern: (pattern: QuiltPattern) => void;
  selectedPatternId?: string;
}

const ARC_SPAN = 120;
const SEGMENT_W = 190;
const SEGMENT_H = 46;
const HANDLE_W = 36;
const PIVOT_OFFSET = 18; // half handle width — pivot is at handle center

function PatternCard({
  pattern,
  isActive,
  onSelect,
}: {
  pattern: QuiltPattern;
  isActive: boolean;
  onSelect: () => void;
}) {
  const rows = pattern.grid.length;
  const cols = pattern.grid[0].length;
  const cellSize = Math.min(32 / Math.max(rows, cols), 5);

  return (
    <button
      onClick={onSelect}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
        transition-colors duration-150
        ${
          isActive
            ? "bg-white/15 ring-1 ring-white/30"
            : "hover:bg-white/8 active:bg-white/12"
        }
      `}
    >
      {/* Mini grid preview */}
      <svg
        width={cols * cellSize + 2}
        height={rows * cellSize + 2}
        className="shrink-0 rounded-sm"
        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
      >
        {pattern.grid.map((row, ri) =>
          row.map((colorIdx, ci) => (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cellSize + 1}
              y={ri * cellSize + 1}
              width={cellSize}
              height={cellSize}
              fill={pattern.colors[colorIdx] ?? "#888"}
            />
          ))
        )}
      </svg>

      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-white/90 truncate">
          {pattern.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${getDifficultyColor(pattern.difficulty)}`}
          >
            {getDifficultyLabel(pattern.difficulty)}
          </span>
          <span className="text-[9px] text-white/40">
            {pattern.pieceCount} pcs
          </span>
        </div>
      </div>
    </button>
  );
}

export function FanRadial({ onSelectPattern, selectedPatternId }: FanRadialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PatternCategory | null>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) setSelectedCategory(null);
      return !prev;
    });
  }, []);

  const handleSegmentClick = useCallback((catId: PatternCategory) => {
    setSelectedCategory((prev) => (prev === catId ? null : catId));
  }, []);

  const handlePatternSelect = useCallback(
    (pattern: QuiltPattern) => {
      onSelectPattern(pattern);
      setIsOpen(false);
      setSelectedCategory(null);
    },
    [onSelectPattern]
  );

  const segmentCount = categories.length;
  const step = ARC_SPAN / (segmentCount - 1);

  const selectedPatterns = selectedCategory
    ? getPatternsForCategory(selectedCategory)
    : [];
  const selectedCatConfig = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <div
      className="fixed right-0 top-1/2 z-50"
      style={{ transform: "translateY(-50%)" }}
    >
      {/* ---- Pattern panel (appears left of fan) ---- */}
      <div
        className="absolute top-1/2 transition-all duration-300 ease-out"
        style={{
          right: HANDLE_W + SEGMENT_W + 24,
          transform: `translateY(-50%) translateX(${selectedCategory && isOpen ? 0 : 40}px)`,
          opacity: selectedCategory && isOpen ? 1 : 0,
          pointerEvents: selectedCategory && isOpen ? "auto" : "none",
        }}
      >
        {selectedCatConfig && (
          <div
            className="w-[260px] max-h-[420px] rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(20, 20, 24, 0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {/* Panel header */}
            <div
              className="px-4 py-3 border-b border-white/10"
              style={{ background: selectedCatConfig.color + "30" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base text-white/80" style={{ fontFamily: "serif" }}>
                  {selectedCatConfig.kanji}
                </span>
                <span className="text-sm font-semibold text-white/90">
                  {selectedCatConfig.label}
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-0.5">
                {selectedCatConfig.description}
              </p>
            </div>

            {/* Pattern list */}
            <div className="p-2 overflow-y-auto max-h-[340px] space-y-1">
              {selectedPatterns.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <span className="text-white/30 text-xs">
                    No patterns yet
                  </span>
                </div>
              ) : (
                selectedPatterns.map((pattern) => (
                  <PatternCard
                    key={pattern.id}
                    pattern={pattern}
                    isActive={selectedPatternId === pattern.id}
                    onSelect={() => handlePatternSelect(pattern)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- Fan segments ---- */}
      {categories.map((cat, i) => {
        const targetAngle = -ARC_SPAN / 2 + i * step;
        const angle = isOpen ? targetAngle : 0;
        const openDelay = i * 55;
        const closeDelay = (segmentCount - 1 - i) * 35;
        const delay = isOpen ? openDelay : closeDelay;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => handleSegmentClick(cat.id)}
            className="absolute focus:outline-none focus-visible:outline-none"
            aria-label={`${cat.label} patterns`}
            style={{
              width: SEGMENT_W,
              height: SEGMENT_H,
              right: HANDLE_W,
              top: "50%",
              marginTop: -SEGMENT_H / 2,
              transformOrigin: `calc(100% + ${PIVOT_OFFSET}px) 50%`,
              transform: `rotate(${angle}deg)${isSelected ? " translateX(-8px)" : ""}`,
              transition: `
                transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms,
                opacity 0.3s ease ${isOpen ? delay : 0}ms
              `,
              zIndex: isSelected ? 20 : i + 1,
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              filter: `drop-shadow(${isSelected ? "-2px 2px 6px rgba(0,0,0,0.4)" : "-1px 1px 3px rgba(0,0,0,0.25)"})`,
            }}
          >
            <FanSegment category={cat} isSelected={isSelected} />
          </button>
        );
      })}

      {/* ---- Handle (bamboo) ---- */}
      <button
        onClick={toggle}
        className="relative z-30 flex flex-col items-center justify-center group"
        aria-label={isOpen ? "Close pattern fan" : "Open pattern fan"}
        style={{
          width: HANDLE_W,
          height: isOpen ? 140 : 120,
          background: `linear-gradient(180deg,
            #8B7355 0%, #A0845E 12%, #7A6548 28%,
            #9A8060 50%, #7A6548 72%, #A0845E 88%, #6B5240 100%
          )`,
          borderRadius: "3px 6px 6px 3px",
          boxShadow:
            "-3px 0 12px rgba(0,0,0,0.3), inset 1px 0 1px rgba(255,255,255,0.1)",
          transition: "height 0.3s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Bamboo joint lines */}
        <div className="absolute left-1 right-1 top-[28%] h-px bg-black/20" />
        <div className="absolute left-1 right-1 top-[50%] h-px bg-black/15" />
        <div className="absolute left-1 right-1 top-[72%] h-px bg-black/20" />

        {/* Wood grain texture */}
        <div
          className="absolute inset-0 rounded-[3px_6px_6px_3px] pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(0,0,0,0.5) 3px, rgba(0,0,0,0.5) 4px)",
          }}
        />

        {/* Fan kanji */}
        <span
          className="text-white/70 text-sm leading-none transition-transform duration-300 group-hover:text-white/90"
          style={{
            fontFamily: "serif",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          {"\u6247"}
        </span>

        {/* Hover pull-out hint */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/0 group-hover:bg-white/20 transition-colors duration-200"
        />
      </button>
    </div>
  );
}
