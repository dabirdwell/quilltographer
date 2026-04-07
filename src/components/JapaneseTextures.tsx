"use client";

import { useEffect, useState, useCallback } from "react";

/* ================================================================
   SUMI INK WASH — Transition overlay
   Shows a brief ink-diffusing-through-water effect, then fades out.
   Usage: <SumiWash active={transitioning} />
   ================================================================ */

export function SumiWash({
  active,
  originX,
  originY,
}: {
  active: boolean;
  originX?: number;
  originY?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 620);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!visible) return null;

  const style: React.CSSProperties = {};
  if (originX !== undefined && originY !== undefined) {
    style.left = originX;
    style.top = originY;
    style.transform = "translate(-50%, -50%)";
  }

  return (
    <div className="sumi-wash" aria-hidden="true">
      <div className="sumi-wash-circle" style={style} />
    </div>
  );
}

/* ================================================================
   THREAD & NEEDLE — Completion micro-animation
   A tiny SVG that plays a stitch being pulled through fabric.
   Usage: <ThreadNeedle playing={justCompleted} />
   ================================================================ */

export function ThreadNeedle({ playing }: { playing: boolean }) {
  if (!playing) return null;

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className="inline-block"
      aria-hidden="true"
    >
      {/* Thread line */}
      <path
        d="M4 28 L16 16 L28 4"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="thread-stitch-line"
      />
      {/* Needle */}
      <rect
        x="24"
        y="2"
        width="2"
        height="8"
        rx="1"
        fill="var(--text-muted)"
        className="needle-pull"
      />
    </svg>
  );
}

/* ================================================================
   FABRIC SCRAP CONFETTI — Celebration effect
   Small colored rectangles falling like fabric scraps.
   Usage: <FabricConfetti active={allStepsComplete} colors={patternColors} />
   ================================================================ */

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  rotation: number;
}

export function FabricConfetti({
  active,
  colors,
}: {
  active: boolean;
  colors: string[];
}) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 40; i++) {
      newPieces.push({
        id: i,
        color: colors[i % colors.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        width: 8 + Math.random() * 10,
        height: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
      });
    }
    setPieces(newPieces);

    const t = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(t);
  }, [active, colors]);

  if (pieces.length === 0) return null;

  return (
    <div aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-scrap"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   SEASONAL DETECTOR — Returns the current season
   ================================================================ */

export type Season = "spring" | "summer" | "autumn" | "winter";

export function getSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function getSeasonClass(): string {
  return `season-${getSeason()}`;
}

/* ================================================================
   SEASONAL TINT — Apply seasonal color overlay to page
   ================================================================ */

export function SeasonalTint() {
  const [seasonClass, setSeasonClass] = useState("");

  useEffect(() => {
    setSeasonClass(getSeasonClass());
  }, []);

  if (!seasonClass) return null;

  return <div className={`seasonal-tint ${seasonClass}`} aria-hidden="true" />;
}

/* ================================================================
   GENERATIVE PATTERN PREVIEW — Tiny colored rectangles
   arranged in the block pattern, personal to each pattern.
   ================================================================ */

export function GenerativePreview({
  grid,
  colors,
  size = 120,
}: {
  grid: number[][];
  colors: string[];
  size?: number;
}) {
  const rows = grid.length;
  const cols = grid[0]?.length || 1;
  const cellW = size / cols;
  const cellH = size / rows;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="sumi-reveal"
      aria-hidden="true"
    >
      {grid.map((row, r) =>
        row.map((colorIdx, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * cellW + 0.5}
            y={r * cellH + 0.5}
            width={cellW - 1}
            height={cellH - 1}
            rx={1}
            fill={colors[colorIdx] || "#ccc"}
            opacity={0.85}
          />
        ))
      )}
      {/* Subtle washi overlay pattern */}
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        fill="url(#washi-overlay)"
        opacity="0.03"
      />
      <defs>
        <pattern
          id="washi-overlay"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 4c2-0.5 4 0.5 8 0"
            fill="none"
            stroke="#795548"
            strokeWidth="0.3"
          />
        </pattern>
      </defs>
    </svg>
  );
}

/* ================================================================
   QUILT PROGRESS BAR — Progress with quilt block pattern
   ================================================================ */

export function QuiltProgressBar({
  progress,
  className = "",
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div
      className={`h-3 flex-1 overflow-hidden rounded-full ${className}`}
      style={{ background: "var(--progress-bg)" }}
    >
      <div
        className="h-full rounded-full progress-animate progress-quilt-pattern transition-all duration-500"
        style={{
          width: `${Math.min(progress * 100, 100)}%`,
          background: "var(--progress-fill)",
        }}
      />
    </div>
  );
}

/* ================================================================
   TIP OF THE DAY — Rotating quilting tip on home screen
   ================================================================ */

export function useTipOfTheDay(tips: { id: number; tip: string; category: string }[]) {
  const [tip, setTip] = useState<{ id: number; tip: string; category: string } | null>(null);

  useEffect(() => {
    if (tips.length === 0) return;
    // Use day-of-year to rotate through tips
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % tips.length;
    setTip(tips[index]);
  }, [tips]);

  return tip;
}

/* ================================================================
   COMPLETION CELEBRATION — Full screen "You made this!" overlay
   ================================================================ */

export function CompletionCelebration({
  active,
  patternName,
  colors,
  onDismiss,
}: {
  active: boolean;
  patternName: string;
  colors: string[];
  onDismiss: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [active]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <FabricConfetti active={true} colors={colors} />
      <div
        className="washi-card rounded-2xl border-2 px-10 py-12 text-center shadow-quilt-lg sumi-reveal mx-4 max-w-md"
        style={{
          borderColor: "var(--accent-muted)",
          background: "var(--surface-raised)",
        }}
      >
        <div className="mb-4 text-5xl" aria-hidden="true">
          &#x2728;
        </div>
        <h2 className="quilt-text-2xl font-bold mb-3">You made this.</h2>
        <p
          className="quilt-text mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Your <strong>{patternName}</strong> is complete.
        </p>
        <p
          className="quilt-text-sm mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          Every stitch tells a story. This one is yours.
        </p>
        <button
          onClick={onDismiss}
          className="touch-target rounded-xl px-8 py-3 font-semibold text-white transition-colors"
          style={{ background: "var(--accent)" }}
        >
          Admire your work
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   LANTERN PULSE HOOK — Trigger glow when companion responds
   ================================================================ */

export function useLanternPulse() {
  const [pulsing, setPulsing] = useState(false);

  const pulse = useCallback(() => {
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 500);
    return () => clearTimeout(t);
  }, []);

  return { pulsing, pulse, className: pulsing ? "lantern-active" : "" };
}
