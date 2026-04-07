"use client";

import type { FabricSwatch, FabricType } from "@/lib/stores/stash-store";

/* ================================================================
   STASH CARD — A fabric swatch in the stash library.
   Shows photo/color, name, yardage, and type.
   ================================================================ */

const fabricTypeLabels: Record<FabricType, string> = {
  cotton: "Cotton",
  batting: "Batting",
  thread: "Thread",
  backing: "Backing",
  linen: "Linen",
  silk: "Silk",
  flannel: "Flannel",
  other: "Other",
};

export function StashCard({
  swatch,
  onRemove,
  onEdit,
}: {
  swatch: FabricSwatch;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  return (
    <div
      className="washi-card group rounded-xl border overflow-hidden transition-all hover:shadow-quilt"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-raised)",
      }}
    >
      {/* Swatch preview */}
      <div className="relative h-32 w-full overflow-hidden">
        {swatch.imageDataUrl ? (
          <img
            src={swatch.imageDataUrl}
            alt={swatch.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ backgroundColor: swatch.color }}
          />
        )}
        {/* Type badge */}
        <span
          className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--surface-raised)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-light)",
          }}
        >
          {fabricTypeLabels[swatch.fabricType]}
        </span>
      </div>

      {/* Info */}
      <div className="relative z-10 px-4 py-3">
        <h3 className="quilt-text-sm font-semibold truncate">{swatch.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="quilt-text-sm" style={{ color: "var(--text-muted)" }}>
            {swatch.yardage} {swatch.yardage === 1 ? "yard" : "yards"}
          </span>
          <div
            className="h-4 w-4 rounded-full border"
            style={{
              backgroundColor: swatch.color,
              borderColor: "var(--border)",
            }}
            title={swatch.color}
          />
        </div>
        {swatch.notes && (
          <p
            className="mt-1 text-xs truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {swatch.notes}
          </p>
        )}

        {/* Actions */}
        <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(swatch.id)}
              className="text-xs underline"
              style={{ color: "var(--accent)" }}
            >
              Edit
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(swatch.id)}
              className="text-xs underline"
              style={{ color: "var(--text-muted)" }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MATERIAL MATCH INDICATOR — Green/Yellow/Red status
   ================================================================ */

export function MaterialMatchBadge({
  status,
}: {
  status: "have" | "low" | "need";
}) {
  const config = {
    have: { bg: "var(--success-muted)", color: "var(--success)", label: "In stash" },
    low: { bg: "#fef3c7", color: "#92400e", label: "Running low" },
    need: { bg: "var(--accent-muted)", color: "var(--accent)", label: "Need to buy" },
  };

  const c = config[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      {status === "have" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {status === "low" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M12 9v4M12 17h.01" />
        </svg>
      )}
      {status === "need" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      )}
      {c.label}
    </span>
  );
}
