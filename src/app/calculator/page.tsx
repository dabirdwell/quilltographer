"use client";

import Link from "next/link";
import { useState } from "react";

const FABRIC_WIDTH = 42; // usable inches from 44" bolt
const INCHES_PER_YARD = 36;

function roundToEighth(yards: number): number {
  return Math.ceil(yards * 8) / 8;
}

function fractionDisplay(yards: number): string {
  const whole = Math.floor(yards);
  const frac = yards - whole;
  const eighths = Math.round(frac * 8);
  if (eighths === 0) return `${whole}`;
  if (eighths === 8) return `${whole + 1}`;
  // Simplify fraction
  if (eighths === 4) return whole > 0 ? `${whole} 1/2` : "1/2";
  if (eighths === 2) return whole > 0 ? `${whole} 1/4` : "1/4";
  if (eighths === 6) return whole > 0 ? `${whole} 3/4` : "3/4";
  return whole > 0 ? `${whole} ${eighths}/8` : `${eighths}/8`;
}

interface Results {
  cols: number;
  rows: number;
  totalBlocks: number;
  items: { label: string; yardage: number }[];
}

function calculate(
  width: number,
  height: number,
  blockSize: number,
  sashingWidth: number,
  borderWidth: number,
  seamAllowance: number
): Results | null {
  if (width <= 0 || height <= 0 || blockSize <= 0) return null;

  const innerWidth = width - 2 * borderWidth;
  const innerHeight = height - 2 * borderWidth;
  if (innerWidth <= 0 || innerHeight <= 0) return null;

  // Block count
  let cols: number, rows: number;
  if (sashingWidth > 0) {
    cols = Math.max(
      1,
      Math.floor((innerWidth + sashingWidth) / (blockSize + sashingWidth))
    );
    rows = Math.max(
      1,
      Math.floor((innerHeight + sashingWidth) / (blockSize + sashingWidth))
    );
  } else {
    cols = Math.max(1, Math.ceil(innerWidth / blockSize));
    rows = Math.max(1, Math.ceil(innerHeight / blockSize));
  }
  const totalBlocks = cols * rows;

  // --- Block fabric ---
  const blockCut = blockSize + 2 * seamAllowance;
  const blocksPerStrip = Math.max(1, Math.floor(FABRIC_WIDTH / blockCut));
  const blockStrips = Math.ceil(totalBlocks / blocksPerStrip);
  const blockYardage = roundToEighth((blockStrips * blockCut) / INCHES_PER_YARD);

  // --- Sashing fabric ---
  let sashingYardage = 0;
  if (sashingWidth > 0) {
    const sashCut = sashingWidth + 2 * seamAllowance;

    // Vertical sashing pieces (between columns within each row)
    const vertCount = (cols - 1) * rows;
    const vertPieceLen = blockCut;
    const vertPerStrip = Math.max(1, Math.floor(FABRIC_WIDTH / vertPieceLen));
    const vertWOFStrips = vertCount > 0 ? Math.ceil(vertCount / vertPerStrip) : 0;

    // Horizontal sashing pieces (full-width strips between rows)
    const horizCount = rows - 1;
    const rowWidth =
      cols * blockSize + (cols - 1) * sashingWidth + 2 * seamAllowance;
    let horizWOFStrips: number;
    if (horizCount <= 0) {
      horizWOFStrips = 0;
    } else if (rowWidth <= FABRIC_WIDTH) {
      const perStrip = Math.max(1, Math.floor(FABRIC_WIDTH / rowWidth));
      horizWOFStrips = Math.ceil(horizCount / perStrip);
    } else {
      horizWOFStrips = horizCount * Math.ceil(rowWidth / FABRIC_WIDTH);
    }

    const totalSashStrips = vertWOFStrips + horizWOFStrips;
    sashingYardage = roundToEighth(
      (totalSashStrips * sashCut) / INCHES_PER_YARD
    );
  }

  // --- Border fabric ---
  let borderYardage = 0;
  if (borderWidth > 0) {
    const borderCut = borderWidth + 2 * seamAllowance;
    const sideLen = innerHeight + 2 * seamAllowance;
    const topBottomLen = width + 2 * seamAllowance;

    const sideStrips = 2 * Math.ceil(sideLen / FABRIC_WIDTH);
    const tbStrips = 2 * Math.ceil(topBottomLen / FABRIC_WIDTH);
    borderYardage = roundToEighth(
      ((sideStrips + tbStrips) * borderCut) / INCHES_PER_YARD
    );
  }

  // --- Backing fabric ---
  // Standard 4" overhang on each side
  const backingW = width + 8;
  const backingH = height + 8;
  const panels = Math.ceil(backingW / FABRIC_WIDTH);
  const backingYardage = roundToEighth(
    (panels * backingH) / INCHES_PER_YARD
  );

  // --- Binding fabric ---
  // 2.5" strips, perimeter + 10" for joining
  const perimeter = 2 * (width + height) + 10;
  const bindingStrips = Math.ceil(perimeter / FABRIC_WIDTH);
  const bindingYardage = roundToEighth(
    (bindingStrips * 2.5) / INCHES_PER_YARD
  );

  const items: { label: string; yardage: number }[] = [
    { label: "Block fabric", yardage: blockYardage },
  ];
  if (sashingWidth > 0) {
    items.push({ label: "Sashing", yardage: sashingYardage });
  }
  if (borderWidth > 0) {
    items.push({ label: "Borders", yardage: borderYardage });
  }
  items.push({ label: "Backing", yardage: backingYardage });
  items.push({ label: "Binding", yardage: bindingYardage });

  return { cols, rows, totalBlocks, items };
}

export default function CalculatorPage() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [blockSize, setBlockSize] = useState("");
  const [sashingWidth, setSashingWidth] = useState("");
  const [borderWidth, setBorderWidth] = useState("");
  const [seamAllowance, setSeamAllowance] = useState("0.25");
  const [addExtra, setAddExtra] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState("");

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults(null);

    const w = parseFloat(width);
    const h = parseFloat(height);
    const bs = parseFloat(blockSize);
    const sw = sashingWidth ? parseFloat(sashingWidth) : 0;
    const bw = borderWidth ? parseFloat(borderWidth) : 0;
    const sa = parseFloat(seamAllowance) || 0.25;

    if (isNaN(w) || isNaN(h) || isNaN(bs) || w <= 0 || h <= 0 || bs <= 0) {
      setError("Please enter valid quilt dimensions and block size.");
      return;
    }
    if (bs > w - 2 * bw || bs > h - 2 * bw) {
      setError("Block size is larger than the quilt interior. Adjust your dimensions.");
      return;
    }

    const res = calculate(w, h, bs, sw, bw, sa);
    if (!res) {
      setError("Could not calculate with the given dimensions. Check your inputs.");
      return;
    }
    setResults(res);
  }

  const inputClass =
    "w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground transition-colors";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity">
          Quiltographer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/calculator" className="underline underline-offset-4">
            Calculator
          </Link>
          <Link href="/gallery" className="hover:underline underline-offset-4">
            Gallery
          </Link>
          <Link href="/community" className="hover:underline underline-offset-4">
            Community
          </Link>
          <a
            href="/api/auth/signin"
            className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </a>
        </nav>
      </header>

      <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
          Fabric Yardage Calculator
        </h1>
        <p className="mt-4 text-center text-black/60 dark:text-white/60 max-w-xl mx-auto">
          Enter your quilt dimensions to calculate how much fabric you need for
          each section. Assumes standard 44&Prime; fabric width (42&Prime; usable).
        </p>

        {/* Form */}
        <form onSubmit={handleCalculate} className="mt-12 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="width" className={labelClass}>
                Finished quilt width (inches)
              </label>
              <input
                id="width"
                type="number"
                step="any"
                min="1"
                required
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={inputClass}
                placeholder="e.g. 60"
              />
            </div>
            <div>
              <label htmlFor="height" className={labelClass}>
                Finished quilt height (inches)
              </label>
              <input
                id="height"
                type="number"
                step="any"
                min="1"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClass}
                placeholder="e.g. 80"
              />
            </div>
          </div>

          <div>
            <label htmlFor="blockSize" className={labelClass}>
              Finished block size (inches)
            </label>
            <input
              id="blockSize"
              type="number"
              step="any"
              min="1"
              required
              value={blockSize}
              onChange={(e) => setBlockSize(e.target.value)}
              className={inputClass}
              placeholder="e.g. 10"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="sashing" className={labelClass}>
                Sashing width (inches)
                <span className="text-black/40 dark:text-white/40 ml-1 font-normal">
                  optional
                </span>
              </label>
              <input
                id="sashing"
                type="number"
                step="any"
                min="0"
                value={sashingWidth}
                onChange={(e) => setSashingWidth(e.target.value)}
                className={inputClass}
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label htmlFor="border" className={labelClass}>
                Border width (inches)
                <span className="text-black/40 dark:text-white/40 ml-1 font-normal">
                  optional
                </span>
              </label>
              <input
                id="border"
                type="number"
                step="any"
                min="0"
                value={borderWidth}
                onChange={(e) => setBorderWidth(e.target.value)}
                className={inputClass}
                placeholder="e.g. 4"
              />
            </div>
            <div>
              <label htmlFor="seam" className={labelClass}>
                Seam allowance (inches)
              </label>
              <input
                id="seam"
                type="number"
                step="any"
                min="0"
                value={seamAllowance}
                onChange={(e) => setSeamAllowance(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Extra toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={addExtra}
              onClick={() => setAddExtra(!addExtra)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors ${
                addExtra
                  ? "bg-foreground border-foreground"
                  : "bg-black/10 dark:bg-white/10 border-transparent"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                  addExtra ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm">Add 10% for mistakes</span>
          </label>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="rounded-full bg-foreground text-background px-8 py-3 text-base font-medium hover:opacity-90 transition-opacity"
          >
            Calculate yardage
          </button>
        </form>

        {/* Results */}
        {results && (
          <div className="mt-12">
            <div className="mb-8 text-center">
              <p className="text-sm text-black/60 dark:text-white/60">
                Layout: {results.cols} columns &times; {results.rows} rows
              </p>
              <p className="text-2xl font-bold mt-1">
                {results.totalBlocks} blocks
              </p>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="text-left px-6 py-3 font-semibold">
                      Section
                    </th>
                    <th className="text-right px-6 py-3 font-semibold">
                      Yardage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.items.map((item) => {
                    const yds = addExtra
                      ? roundToEighth(item.yardage * 1.1)
                      : item.yardage;
                    return (
                      <tr
                        key={item.label}
                        className="border-b border-black/5 dark:border-white/5 last:border-0"
                      >
                        <td className="px-6 py-3">{item.label}</td>
                        <td className="px-6 py-3 text-right font-[family-name:var(--font-geist-mono)]">
                          {fractionDisplay(yds)} yd{yds !== 1 ? "s" : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black/10 dark:border-white/10 font-semibold">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3 text-right font-[family-name:var(--font-geist-mono)]">
                      {fractionDisplay(
                        roundToEighth(
                          results.items.reduce((sum, i) => {
                            const y = addExtra
                              ? roundToEighth(i.yardage * 1.1)
                              : i.yardage;
                            return sum + y;
                          }, 0)
                        )
                      )}{" "}
                      yds
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {addExtra && (
              <p className="mt-4 text-xs text-black/40 dark:text-white/40 text-center">
                Amounts include an extra 10% for mistakes.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/10 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
