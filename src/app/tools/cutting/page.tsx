"use client";

import Link from "next/link";
import { useState, useMemo, useId } from "react";

/* ================================================================
   SMART CUTTING CALCULATOR

   Optimizes fabric cutting layout to minimize waste.
   Visual SVG diagram shows piece placement on fabric bolt.
   ================================================================ */

// --- Types ---

interface PieceSpec {
  id: string;
  name: string;
  width: number;  // inches
  height: number; // inches
  quantity: number;
  color: string;
}

interface PlacedPiece {
  spec: PieceSpec;
  x: number;
  y: number;
  rotated: boolean; // true if piece was rotated 90° to fit better
}

interface CutLayout {
  pieces: PlacedPiece[];
  totalLength: number; // inches along the bolt
  fabricWidth: number;
  wastePercent: number;
  totalYardage: number;
  naiveYardage: number;
  moneySaved: number;
}

// --- Constants ---

const STANDARD_WIDTHS = [
  { label: '42″ (standard quilting cotton)', value: 42 },
  { label: '44″ (quilting cotton)', value: 44 },
  { label: '45″ (apparel cotton)', value: 45 },
  { label: '60″ (wide cotton/flannel)', value: 60 },
  { label: '108″ (wide backing)', value: 108 },
];

const PIECE_COLORS = [
  "#C4573A", "#4A5899", "#6B8F71", "#9B59B6", "#E67E22",
  "#1ABC9C", "#E74C3C", "#3498DB", "#2ECC71", "#F39C12",
  "#8E44AD", "#16A085", "#D35400", "#2980B9", "#27AE60",
];

const COST_PER_YARD = 12;
const INCHES_PER_YARD = 36;

// --- Strip-packing algorithm ---

function optimizeCutLayout(
  pieces: PieceSpec[],
  fabricWidth: number,
  pricePerYard: number
): CutLayout {
  // Expand quantities into individual pieces
  const expanded: { spec: PieceSpec; w: number; h: number }[] = [];
  for (const spec of pieces) {
    for (let i = 0; i < spec.quantity; i++) {
      expanded.push({ spec, w: spec.width, h: spec.height });
    }
  }

  // Sort by height descending (tallest first for shelf packing)
  expanded.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

  const placed: PlacedPiece[] = [];
  // Shelf-based first-fit decreasing
  const shelves: { y: number; height: number; xCursor: number }[] = [];

  for (const piece of expanded) {
    const pw = piece.w;
    const ph = piece.h;
    let rotated = false;

    // Try both orientations, prefer the one that fits better
    let bestShelf = -1;
    let bestOrientation = { w: pw, h: ph, rotated: false };

    for (let orientation = 0; orientation < 2; orientation++) {
      const tryW = orientation === 0 ? pw : ph;
      const tryH = orientation === 0 ? ph : pw;
      const tryRotated = orientation === 1;

      if (tryW > fabricWidth) continue; // doesn't fit this orientation

      // Try existing shelves
      for (let si = 0; si < shelves.length; si++) {
        const shelf = shelves[si];
        if (shelf.xCursor + tryW <= fabricWidth && tryH <= shelf.height) {
          if (bestShelf === -1 || tryH <= bestOrientation.h) {
            bestShelf = si;
            bestOrientation = { w: tryW, h: tryH, rotated: tryRotated };
          }
          break;
        }
      }
    }

    if (bestShelf >= 0) {
      // Place in existing shelf
      const shelf = shelves[bestShelf];
      placed.push({
        spec: piece.spec,
        x: shelf.xCursor,
        y: shelf.y,
        rotated: bestOrientation.rotated,
      });
      shelf.xCursor += bestOrientation.w;
    } else {
      // Try both orientations for new shelf
      let useW = pw;
      let useH = ph;
      rotated = false;

      if (pw > fabricWidth && ph <= fabricWidth) {
        useW = ph; useH = pw; rotated = true;
      } else if (ph > fabricWidth && pw <= fabricWidth) {
        // keep original
      } else if (pw <= fabricWidth && ph <= fabricWidth) {
        // Choose orientation that wastes less shelf height
        // Use the wider dimension along the fabric width if it fits
        if (ph > pw && ph <= fabricWidth) {
          useW = ph; useH = pw; rotated = true;
        }
      }

      if (useW > fabricWidth) {
        // Piece doesn't fit at all — skip with a warning
        continue;
      }

      const shelfY = shelves.length > 0
        ? shelves[shelves.length - 1].y + shelves[shelves.length - 1].height
        : 0;

      shelves.push({ y: shelfY, height: useH, xCursor: useW });
      placed.push({
        spec: piece.spec,
        x: 0,
        y: shelfY,
        rotated,
      });
    }
  }

  const totalLength = shelves.reduce((sum, s) => Math.max(sum, s.y + s.height), 0);
  const totalArea = fabricWidth * totalLength;
  const usedArea = expanded.reduce((sum, p) => sum + p.w * p.h, 0);
  const wastePercent = totalArea > 0 ? ((totalArea - usedArea) / totalArea) * 100 : 0;
  const totalYardage = Math.ceil((totalLength / INCHES_PER_YARD) * 8) / 8;

  // Naive calculation: each piece type gets its own strip
  let naiveLength = 0;
  for (const spec of pieces) {
    const piecesPerRow = Math.max(1, Math.floor(fabricWidth / spec.width));
    const rows = Math.ceil(spec.quantity / piecesPerRow);
    naiveLength += rows * spec.height;
  }
  const naiveYardage = Math.ceil((naiveLength / INCHES_PER_YARD) * 8) / 8;

  const moneySaved = Math.max(0, (naiveYardage - totalYardage) * pricePerYard);

  return {
    pieces: placed,
    totalLength,
    fabricWidth,
    wastePercent,
    totalYardage,
    naiveYardage,
    moneySaved,
  };
}

function fractionDisplay(yards: number): string {
  const whole = Math.floor(yards);
  const frac = yards - whole;
  const eighths = Math.round(frac * 8);
  if (eighths === 0) return `${whole}`;
  if (eighths === 8) return `${whole + 1}`;
  if (eighths === 4) return whole > 0 ? `${whole} 1/2` : "1/2";
  if (eighths === 2) return whole > 0 ? `${whole} 1/4` : "1/4";
  if (eighths === 6) return whole > 0 ? `${whole} 3/4` : "3/4";
  return whole > 0 ? `${whole} ${eighths}/8` : `${eighths}/8`;
}

// --- "What if" analysis ---

interface WhatIfResult {
  fittedPieces: PlacedPiece[];
  missingPieces: { name: string; count: number }[];
  usedLength: number;
}

function whatIfAnalysis(
  pieces: PieceSpec[],
  fabricWidth: number,
  availableYards: number
): WhatIfResult {
  const maxLength = availableYards * INCHES_PER_YARD;
  const layout = optimizeCutLayout(pieces, fabricWidth, COST_PER_YARD);

  if (layout.totalLength <= maxLength) {
    return { fittedPieces: layout.pieces, missingPieces: [], usedLength: layout.totalLength };
  }

  // Filter pieces that fit within available length
  const fitted = layout.pieces.filter((p) => {
    const pieceH = p.rotated ? p.spec.width : p.spec.height;
    return p.y + pieceH <= maxLength;
  });

  // Count what's missing
  const fittedCounts: Record<string, number> = {};
  for (const p of fitted) {
    fittedCounts[p.spec.name] = (fittedCounts[p.spec.name] || 0) + 1;
  }

  const missing: { name: string; count: number }[] = [];
  for (const spec of pieces) {
    const placed = fittedCounts[spec.name] || 0;
    if (placed < spec.quantity) {
      missing.push({ name: spec.name, count: spec.quantity - placed });
    }
  }

  return { fittedPieces: fitted, missingPieces: missing, usedLength: maxLength };
}

// --- SVG Layout Diagram ---

function CuttingDiagram({
  layout,
  fabricWidth,
  maxLengthLine,
}: {
  layout: CutLayout;
  fabricWidth: number;
  maxLengthLine?: number;
}) {
  const MARGIN = 40;
  const LABEL_W = 30;
  const maxDisplayWidth = 700;
  const scale = Math.min(1, (maxDisplayWidth - MARGIN * 2 - LABEL_W) / fabricWidth);
  const svgW = fabricWidth * scale + MARGIN * 2 + LABEL_W;
  const svgH = Math.max(200, layout.totalLength * scale + MARGIN * 2 + 20);

  return (
    <div className="overflow-x-auto print-diagram">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[700px] mx-auto"
        style={{ maxHeight: "600px" }}
        aria-label="Cutting layout diagram"
      >
        {/* Fabric bolt background */}
        <rect
          x={MARGIN + LABEL_W}
          y={MARGIN}
          width={fabricWidth * scale}
          height={layout.totalLength * scale}
          fill="var(--surface, #F5EFE0)"
          stroke="var(--border, #D4C5A9)"
          strokeWidth={1.5}
        />

        {/* Grid lines every 6 inches */}
        {Array.from({ length: Math.ceil(layout.totalLength / 6) }, (_, i) => {
          const y = MARGIN + i * 6 * scale;
          return (
            <g key={`grid-h-${i}`}>
              <line
                x1={MARGIN + LABEL_W}
                y1={y}
                x2={MARGIN + LABEL_W + fabricWidth * scale}
                y2={y}
                stroke="var(--border-light, #E8DCC8)"
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              {i > 0 && (
                <text
                  x={MARGIN + LABEL_W - 4}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={8}
                  fill="var(--text-muted, #8D6E63)"
                  fontFamily="var(--font-geist-mono)"
                >
                  {i * 6}″
                </text>
              )}
            </g>
          );
        })}

        {/* Width label */}
        <text
          x={MARGIN + LABEL_W + (fabricWidth * scale) / 2}
          y={MARGIN - 8}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="var(--foreground, #4E3B2A)"
          fontFamily="var(--font-geist-sans)"
        >
          {fabricWidth}″ fabric width
        </text>

        {/* Placed pieces */}
        {layout.pieces.map((p, i) => {
          const pw = p.rotated ? p.spec.height : p.spec.width;
          const ph = p.rotated ? p.spec.width : p.spec.height;
          const rx = MARGIN + LABEL_W + p.x * scale;
          const ry = MARGIN + p.y * scale;
          const rw = pw * scale;
          const rh = ph * scale;

          return (
            <g key={i}>
              <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                fill={p.spec.color}
                fillOpacity={0.3}
                stroke={p.spec.color}
                strokeWidth={1.2}
                rx={1}
              />
              {rw > 30 && rh > 12 && (
                <text
                  x={rx + rw / 2}
                  y={ry + rh / 2 + 3}
                  textAnchor="middle"
                  fontSize={Math.min(9, rw / 6)}
                  fill="var(--foreground, #4E3B2A)"
                  fontFamily="var(--font-geist-sans)"
                  fontWeight={500}
                >
                  {p.spec.name}
                </text>
              )}
              {rw > 40 && rh > 20 && (
                <text
                  x={rx + rw / 2}
                  y={ry + rh / 2 + 14}
                  textAnchor="middle"
                  fontSize={7}
                  fill="var(--text-muted, #8D6E63)"
                  fontFamily="var(--font-geist-mono)"
                >
                  {p.spec.width}×{p.spec.height}″
                  {p.rotated ? " ↻" : ""}
                </text>
              )}
            </g>
          );
        })}

        {/* "What if" limit line */}
        {maxLengthLine !== undefined && maxLengthLine < layout.totalLength && (
          <g>
            <line
              x1={MARGIN + LABEL_W - 8}
              y1={MARGIN + maxLengthLine * scale}
              x2={MARGIN + LABEL_W + fabricWidth * scale + 8}
              y2={MARGIN + maxLengthLine * scale}
              stroke="#E74C3C"
              strokeWidth={2}
              strokeDasharray="6,3"
            />
            <text
              x={MARGIN + LABEL_W + fabricWidth * scale + 12}
              y={MARGIN + maxLengthLine * scale + 4}
              fontSize={9}
              fill="#E74C3C"
              fontWeight={600}
              fontFamily="var(--font-geist-sans)"
            >
              Your fabric ends here
            </text>
          </g>
        )}

        {/* Total length label */}
        <text
          x={MARGIN + LABEL_W + (fabricWidth * scale) / 2}
          y={MARGIN + layout.totalLength * scale + 16}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="var(--foreground, #4E3B2A)"
          fontFamily="var(--font-geist-mono)"
        >
          Total: {fractionDisplay(layout.totalYardage)} yard{layout.totalYardage !== 1 ? "s" : ""} ({Math.round(layout.totalLength)}″)
        </text>
      </svg>
    </div>
  );
}

// --- Main Page ---

export default function CuttingCalculatorPage() {
  const formId = useId();
  const [fabricWidthOption, setFabricWidthOption] = useState("42");
  const [customWidth, setCustomWidth] = useState("");
  const [pricePerYard, setPricePerYard] = useState("12");
  const [pieces, setPieces] = useState<PieceSpec[]>([
    { id: "p1", name: "Block", width: 5, height: 5, quantity: 20, color: PIECE_COLORS[0] },
  ]);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfYards, setWhatIfYards] = useState("");
  const [showLayout, setShowLayout] = useState(false);

  const fabricWidth = fabricWidthOption === "custom"
    ? parseFloat(customWidth) || 42
    : parseInt(fabricWidthOption);

  const price = parseFloat(pricePerYard) || COST_PER_YARD;

  const layout = useMemo(() => {
    if (!showLayout || pieces.length === 0) return null;
    const valid = pieces.filter((p) => p.width > 0 && p.height > 0 && p.quantity > 0);
    if (valid.length === 0) return null;
    return optimizeCutLayout(valid, fabricWidth, price);
  }, [pieces, fabricWidth, price, showLayout]);

  const whatIfResult = useMemo(() => {
    if (!whatIfMode || !whatIfYards || !layout) return null;
    const yds = parseFloat(whatIfYards);
    if (isNaN(yds) || yds <= 0) return null;
    return whatIfAnalysis(
      pieces.filter((p) => p.width > 0 && p.height > 0 && p.quantity > 0),
      fabricWidth,
      yds
    );
  }, [whatIfMode, whatIfYards, pieces, fabricWidth, layout]);

  function addPiece() {
    const nextColor = PIECE_COLORS[pieces.length % PIECE_COLORS.length];
    setPieces([
      ...pieces,
      {
        id: `p${Date.now()}`,
        name: `Piece ${pieces.length + 1}`,
        width: 5,
        height: 5,
        quantity: 1,
        color: nextColor,
      },
    ]);
  }

  function removePiece(id: string) {
    setPieces(pieces.filter((p) => p.id !== id));
  }

  function updatePiece(id: string, updates: Partial<PieceSpec>) {
    setPieces(pieces.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--foreground)] transition-colors";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav — matches existing pages */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity">
          Quiltographer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/calculator" className="hover:underline underline-offset-4">Calculator</Link>
          <Link href="/tools/cutting" className="underline underline-offset-4">Cutting</Link>
          <Link href="/tools/compare" className="hover:underline underline-offset-4">Compare</Link>
          <Link href="/gallery" className="hover:underline underline-offset-4">Gallery</Link>
          <Link href="/stash" className="hover:underline underline-offset-4">Stash</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
          Smart Cutting Calculator
        </h1>
        <p className="mt-4 text-center text-[var(--text-muted)] max-w-xl mx-auto">
          Arrange your pieces on fabric to minimize waste. See exactly where every cut goes
          with a printable layout diagram.
        </p>

        {/* Fabric Width */}
        <section className="mt-10 space-y-6">
          <div>
            <label htmlFor={`${formId}-fw`} className={labelClass}>Fabric width</label>
            <select
              id={`${formId}-fw`}
              value={fabricWidthOption}
              onChange={(e) => setFabricWidthOption(e.target.value)}
              className={inputClass}
            >
              {STANDARD_WIDTHS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
              <option value="custom">Custom width…</option>
            </select>
            {fabricWidthOption === "custom" && (
              <input
                type="number"
                min="1"
                step="any"
                placeholder="Enter width in inches"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-price`} className={labelClass}>
              Price per yard ($)
              <span className="text-[var(--text-muted)] ml-1 font-normal">for savings calculation</span>
            </label>
            <input
              id={`${formId}-price`}
              type="number"
              min="0"
              step="0.01"
              value={pricePerYard}
              onChange={(e) => setPricePerYard(e.target.value)}
              className={inputClass}
            />
          </div>
        </section>

        {/* Piece List */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Pattern Pieces</h2>
          <div className="space-y-3">
            {pieces.map((piece) => (
              <div
                key={piece.id}
                className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div
                  className="w-4 h-4 rounded-sm shrink-0 mt-6"
                  style={{ backgroundColor: piece.color }}
                />
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-[var(--text-muted)]">Name</label>
                  <input
                    type="text"
                    value={piece.name}
                    onChange={(e) => updatePiece(piece.id, { name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="w-20">
                  <label className="text-xs text-[var(--text-muted)]">Width (″)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.25"
                    value={piece.width}
                    onChange={(e) => updatePiece(piece.id, { width: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div className="w-20">
                  <label className="text-xs text-[var(--text-muted)]">Height (″)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.25"
                    value={piece.height}
                    onChange={(e) => updatePiece(piece.id, { height: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div className="w-16">
                  <label className="text-xs text-[var(--text-muted)]">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={piece.quantity}
                    onChange={(e) => updatePiece(piece.id, { quantity: parseInt(e.target.value) || 1 })}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePiece(piece.id)}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-2 py-2 text-sm"
                  aria-label={`Remove ${piece.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={addPiece}
              className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--surface)] transition-colors"
            >
              + Add piece
            </button>
            <button
              type="button"
              onClick={() => setShowLayout(true)}
              className="rounded-full bg-[var(--foreground)] text-[var(--background)] px-8 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Calculate layout
            </button>
          </div>
        </section>

        {/* Results */}
        {layout && showLayout && (
          <section className="mt-12 space-y-8">
            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[var(--border)] p-4 text-center bg-[var(--surface)]">
                <div className="text-2xl font-bold font-[family-name:var(--font-geist-mono)]">
                  {fractionDisplay(layout.totalYardage)}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">yards needed</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 text-center bg-[var(--surface)]">
                <div className="text-2xl font-bold font-[family-name:var(--font-geist-mono)]">
                  {layout.wastePercent.toFixed(1)}%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">waste</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 text-center bg-[var(--surface)]">
                <div className="text-2xl font-bold font-[family-name:var(--font-geist-mono)]">
                  {fractionDisplay(layout.naiveYardage)}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">naive estimate</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 text-center" style={{ backgroundColor: layout.moneySaved > 0 ? "var(--success-muted)" : "var(--surface)" }}>
                <div className="text-2xl font-bold font-[family-name:var(--font-geist-mono)]" style={{ color: layout.moneySaved > 0 ? "var(--success)" : "var(--foreground)" }}>
                  ${layout.moneySaved.toFixed(2)}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">saved vs naive</div>
              </div>
            </div>

            {/* Visual Layout */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Cutting Layout</h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-medium hover:bg-[var(--surface)] transition-colors print:hidden"
                >
                  🖨 Print layout
                </button>
              </div>
              <CuttingDiagram
                layout={layout}
                fabricWidth={fabricWidth}
                maxLengthLine={whatIfMode && whatIfYards ? parseFloat(whatIfYards) * INCHES_PER_YARD : undefined}
              />
            </div>

            {/* Piece Legend */}
            <div className="flex flex-wrap gap-3">
              {pieces
                .filter((p) => p.width > 0 && p.height > 0 && p.quantity > 0)
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-3 h-3 rounded-sm inline-block"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>
                      {p.name} ({p.width}×{p.height}″ × {p.quantity})
                    </span>
                  </div>
                ))}
            </div>

            {/* What If Mode */}
            <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--surface)]">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  role="switch"
                  aria-checked={whatIfMode}
                  onClick={() => setWhatIfMode(!whatIfMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors ${
                    whatIfMode
                      ? "bg-[var(--accent)] border-[var(--accent)]"
                      : "bg-[var(--border)] border-transparent"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-[var(--background)] shadow-sm transition-transform ${
                      whatIfMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">
                  &ldquo;What if I only have X yards?&rdquo;
                </span>
              </label>

              {whatIfMode && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs text-[var(--text-muted)]">Available yardage</label>
                    <input
                      type="number"
                      min="0.125"
                      step="0.125"
                      placeholder="e.g. 1.5"
                      value={whatIfYards}
                      onChange={(e) => setWhatIfYards(e.target.value)}
                      className={`${inputClass} max-w-[200px]`}
                    />
                  </div>

                  {whatIfResult && (
                    <div>
                      {whatIfResult.missingPieces.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--success)" }}>
                          <span className="text-lg">✓</span>
                          You have enough fabric for all pieces!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                            You can cut {whatIfResult.fittedPieces.length} of {layout.pieces.length} pieces.
                            Missing:
                          </p>
                          <ul className="text-sm space-y-1 ml-4">
                            {whatIfResult.missingPieces.map((m) => (
                              <li key={m.name} className="text-[var(--text-muted)]">
                                • {m.name} — need {m.count} more
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-[var(--text-muted)] mt-2">
                            You need {fractionDisplay(layout.totalYardage)} yards total —
                            that&apos;s {fractionDisplay(Math.max(0, layout.totalYardage - parseFloat(whatIfYards || "0")))} more
                            than you have.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-sm text-[var(--text-muted)] print:hidden">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header, footer, nav, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          body { background: white !important; color: black !important; }
          .print-diagram svg { max-height: none !important; width: 100% !important; }
          @page {
            margin: 0.5in;
            @top-center { content: "Cutting Layout — Prepared by Quiltographer"; }
          }
        }
      `}</style>
    </div>
  );
}
