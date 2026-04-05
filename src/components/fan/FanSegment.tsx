"use client";

import type { CategoryConfig } from "@/lib/pattern-categories";

interface FanSegmentProps {
  category: CategoryConfig;
  isSelected: boolean;
}

export function FanSegment({ category, isSelected }: FanSegmentProps) {
  return (
    <div
      className={`
        relative w-full h-full overflow-hidden select-none
        transition-all duration-200
      `}
      style={{
        background: category.color,
        clipPath: "polygon(0% 5%, 92% 22%, 100% 50%, 92% 78%, 0% 95%)",
      }}
    >
      {/* Washi paper fiber texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.07,
          backgroundImage: `
            repeating-linear-gradient(52deg, transparent, transparent 2px, rgba(255,255,255,0.6) 2px, rgba(255,255,255,0.6) 3px),
            repeating-linear-gradient(-35deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 6px)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full pl-3 pr-8 gap-2.5">
        <span
          className="text-lg font-bold text-white/85 leading-none shrink-0"
          style={{ fontFamily: "serif" }}
        >
          {category.kanji}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold text-white/90 tracking-wider uppercase leading-tight truncate">
            {category.label}
          </span>
        </div>
      </div>

      {/* Edge highlights — simulates fold crease */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/15 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/20 pointer-events-none" />

      {/* Selection glow */}
      {isSelected && (
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      )}
    </div>
  );
}
