"use client";

import { useState, useMemo, useCallback } from "react";
import type { PatternGuide } from "@/lib/guided-steps";
import { useStashStore, matchMaterialsToStash } from "@/lib/stores/stash-store";
import type { StashMatch } from "@/lib/stores/stash-store";

/* ================================================================
   SMART MATERIALS LIST

   Interactive checklist with cost estimates, stash cross-reference,
   and shopping list export.

   Usage:
     <MaterialsList guide={guide} />
   ================================================================ */

// --- Cost defaults by material type ---

type MaterialCategory = "fabric" | "batting" | "thread" | "notion" | "tool" | "paper" | "other";

const DEFAULT_PRICES: Record<MaterialCategory, number> = {
  fabric: 12,
  batting: 8,
  thread: 3,
  notion: 5,
  tool: 15,
  paper: 4,
  other: 10,
};

function categorizeMaterial(name: string): MaterialCategory {
  const n = name.toLowerCase();
  if (n.includes("thread") || n.includes("spool")) return "thread";
  if (n.includes("batting") || n.includes("interfacing")) return "batting";
  if (n.includes("needle") || n.includes("ruler") || n.includes("cutter") || n.includes("scissors") || n.includes("iron") || n.includes("pin") || n.includes("tweezers") || n.includes("mat")) return "tool";
  if (n.includes("paper") || n.includes("template") || n.includes("foundation")) return "paper";
  if (n.includes("fabric") || n.includes("muslin") || n.includes("yard") || n.includes("cotton") || n.includes("print") || n.includes("solid") || n.includes("light") || n.includes("dark") || n.includes("medium") || n.includes("background") || n.includes("sky") || n.includes("mountain") || n.includes("tree") || n.includes("foreground") || n.includes("center") || n.includes("goose") || n.includes("star") || n.includes("arc") || n.includes("melon") || n.includes("window") || n.includes("accent")) return "fabric";
  if (n.includes("zipper") || n.includes("button") || n.includes("elastic") || n.includes("binding")) return "notion";
  return "other";
}

function parseYardage(quantity: string): number | null {
  const cleaned = quantity.toLowerCase().replace(/yards?|yds?/g, "").trim();
  // "1/2"
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  // "1 1/2"
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  // plain number
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function yardsToMeters(yards: number): number {
  return yards * 0.9144;
}

function formatQuantity(quantity: string, useMetric: boolean): string {
  if (!useMetric) return quantity;
  const yards = parseYardage(quantity);
  if (yards === null) return quantity;
  const meters = yardsToMeters(yards);
  return `${meters.toFixed(2)}m`;
}

function estimateCost(
  name: string,
  quantity: string,
  pricePerYard: number
): number | null {
  const cat = categorizeMaterial(name);
  if (cat === "tool") return null; // tools aren't consumables
  const yards = parseYardage(quantity);
  if (yards !== null) {
    const price = cat === "fabric" ? pricePerYard :
      cat === "batting" ? DEFAULT_PRICES.batting :
      cat === "thread" ? DEFAULT_PRICES.thread :
      cat === "paper" ? DEFAULT_PRICES.paper :
      DEFAULT_PRICES[cat];
    return yards * price;
  }
  // For non-yardage items (e.g. "1 spool"), return a flat estimate
  if (cat === "thread") return DEFAULT_PRICES.thread;
  if (cat === "paper") return DEFAULT_PRICES.paper;
  return null;
}

// --- Status badge colors ---

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  have: { bg: "var(--success-muted)", text: "var(--success)", label: "Have it" },
  low: { bg: "var(--highlight)", text: "var(--accent)", label: "Running low" },
  need: { bg: "var(--accent-muted)", text: "var(--accent)", label: "Need to buy" },
};

// --- Component ---

interface MaterialsListProps {
  guide: PatternGuide;
  /** Include tools in the list (default true) */
  includeTools?: boolean;
}

export default function MaterialsList({ guide, includeTools = true }: MaterialsListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [pricePerYard, setPricePerYard] = useState(12);
  const [useMetric, setUseMetric] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const swatches = useStashStore((s) => s.swatches);
  const hasStash = swatches.length > 0;

  // Build full items list (materials + tools)
  const allItems = useMemo(() => {
    const items: { name: string; quantity: string; isToolItem: boolean }[] = [];
    for (const m of guide.materials) {
      items.push({ name: m.name, quantity: m.quantity, isToolItem: false });
    }
    if (includeTools) {
      for (const t of guide.tools) {
        items.push({ name: t, quantity: "1", isToolItem: true });
      }
    }
    return items;
  }, [guide, includeTools]);

  // Stash matching
  const stashMatches = useMemo((): StashMatch[] => {
    if (!hasStash) return [];
    return matchMaterialsToStash(guide.materials, swatches);
  }, [guide.materials, swatches, hasStash]);

  // Cost calculation
  const costs = useMemo(() => {
    return allItems.map((item) => ({
      ...item,
      cost: item.isToolItem ? null : estimateCost(item.name, item.quantity, pricePerYard),
      category: categorizeMaterial(item.name),
    }));
  }, [allItems, pricePerYard]);

  const totalCost = costs.reduce((sum, c) => sum + (c.cost ?? 0), 0);
  const uncheckedCost = costs.reduce(
    (sum, c, i) => (checked.has(i) ? sum : sum + (c.cost ?? 0)),
    0
  );

  function toggleCheck(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Shopping list export
  const generateShoppingList = useCallback(() => {
    const unchecked = allItems
      .map((item, i) => ({ ...item, i }))
      .filter(({ i }) => !checked.has(i));

    // Group by category
    const groups: Record<string, typeof unchecked> = {};
    for (const item of unchecked) {
      const cat = categorizeMaterial(item.name);
      const groupLabel = cat === "fabric" ? "Fabrics" :
        cat === "batting" ? "Batting & Interfacing" :
        cat === "thread" ? "Thread" :
        cat === "tool" ? "Tools" :
        cat === "paper" ? "Paper & Templates" :
        cat === "notion" ? "Notions" : "Other";
      if (!groups[groupLabel]) groups[groupLabel] = [];
      groups[groupLabel].push(item);
    }

    let text = `🧵 Shopping List — ${guide.patternId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}\n`;
    text += `${new Date().toLocaleDateString()}\n\n`;

    for (const [group, items] of Object.entries(groups)) {
      text += `▸ ${group}\n`;
      for (const item of items) {
        const qty = useMetric ? formatQuantity(item.quantity, true) : item.quantity;
        text += `  □ ${item.name} — ${qty}\n`;
      }
      text += "\n";
    }

    text += `Prepared by Quiltographer`;
    return text;
  }, [allItems, checked, guide.patternId, useMetric]);

  async function handleCopyList() {
    const text = generateShoppingList();
    try {
      await navigator.clipboard.writeText(text);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 2000);
    } catch {
      // Fallback: select text in a textarea
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 2000);
    }
  }

  async function handleShare() {
    const text = generateShoppingList();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shopping List", text });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyList();
    }
  }

  const inputClass =
    "rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--foreground)] transition-colors";

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">$/yard</label>
          <input
            type="number"
            min="1"
            step="0.5"
            value={pricePerYard}
            onChange={(e) => setPricePerYard(parseFloat(e.target.value) || 12)}
            className={`${inputClass} w-20`}
          />
        </div>

        <button
          type="button"
          onClick={() => setUseMetric(!useMetric)}
          className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
        >
          {useMetric ? "Showing meters" : "Showing yards"} — tap to switch
        </button>
      </div>

      {/* Materials */}
      <div className="space-y-1">
        {costs.map((item, i) => {
          const isChecked = checked.has(i);
          const stashMatch = !item.isToolItem ? stashMatches[i] : undefined;
          const statusStyle = stashMatch ? STATUS_STYLES[stashMatch.status] : undefined;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all cursor-pointer ${
                isChecked
                  ? "opacity-50 bg-[var(--surface)]"
                  : "hover:bg-[var(--surface)]"
              }`}
              onClick={() => toggleCheck(i)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleCheck(i); } }}
            >
              {/* Checkbox */}
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-colors ${
                  isChecked
                    ? "bg-[var(--success)] border-[var(--success)] text-white"
                    : "border-[var(--border)]"
                }`}
              >
                {isChecked && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isChecked ? "line-through" : ""}`}>
                  {item.isToolItem && (
                    <span className="text-[var(--text-muted)] text-xs mr-1">🔧</span>
                  )}
                  {item.name}
                </div>
              </div>

              {/* Quantity */}
              <div className="text-sm font-[family-name:var(--font-geist-mono)] text-[var(--text-muted)] shrink-0">
                {formatQuantity(item.quantity, useMetric)}
              </div>

              {/* Cost */}
              {item.cost !== null && (
                <div className="text-sm font-[family-name:var(--font-geist-mono)] w-16 text-right shrink-0">
                  ${item.cost.toFixed(2)}
                </div>
              )}

              {/* Stash status */}
              {statusStyle && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {statusStyle.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-[var(--border)] pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Total estimated cost</span>
          <span className="font-bold font-[family-name:var(--font-geist-mono)]">
            ${totalCost.toFixed(2)}
          </span>
        </div>
        {checked.size > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">
              Still need to buy ({allItems.length - checked.size} items)
            </span>
            <span className="font-semibold font-[family-name:var(--font-geist-mono)]" style={{ color: "var(--accent)" }}>
              ${uncheckedCost.toFixed(2)}
            </span>
          </div>
        )}
        {hasStash && (
          <p className="text-xs text-[var(--text-muted)]">
            Stash checked: {stashMatches.filter((m) => m.status === "have").length} items
            you already have, {stashMatches.filter((m) => m.status === "low").length} running low
          </p>
        )}
      </div>

      {/* Shopping List Export */}
      <div className="flex gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={handleCopyList}
            className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            📋 Copy shopping list
          </button>
          {showShareMenu && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] text-xs px-3 py-1 rounded-full whitespace-nowrap">
              Copied!
            </div>
          )}
        </div>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            📤 Share list
          </button>
        )}
      </div>
    </div>
  );
}
