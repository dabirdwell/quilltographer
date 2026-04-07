"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useStashStore, type FabricType } from "@/lib/stores/stash-store";
import { StashCard } from "@/components/StashCard";
import { AccessibilityControls } from "@/components/AccessibilityControls";

/* ================================================================
   FABRIC STASH LIBRARY — Your personal fabric inventory.

   Add fabric by photo or color, track yardage, organize by type.
   Cross-referenced against pattern material lists elsewhere.
   ================================================================ */

const FABRIC_TYPES: { value: FabricType; label: string }[] = [
  { value: "cotton", label: "Cotton" },
  { value: "batting", label: "Batting" },
  { value: "thread", label: "Thread" },
  { value: "backing", label: "Backing" },
  { value: "linen", label: "Linen" },
  { value: "silk", label: "Silk" },
  { value: "flannel", label: "Flannel" },
  { value: "other", label: "Other" },
];

function AddFabricForm({ onClose }: { onClose: () => void }) {
  const addSwatch = useStashStore((s) => s.addSwatch);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6B8F71");
  const [yardage, setYardage] = useState("1");
  const [fabricType, setFabricType] = useState<FabricType>("cotton");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSwatch({
      name: name.trim(),
      color,
      yardage: parseFloat(yardage) || 0,
      fabricType,
      notes: notes.trim() || undefined,
      imageDataUrl,
    });
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="washi-card rounded-2xl border p-6 sumi-reveal"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-raised)",
      }}
    >
      <h2 className="quilt-text-lg font-semibold mb-4">Add Fabric</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="quilt-text-sm font-medium block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Blue cotton from Joann's"
            className="quilt-text-sm w-full rounded-xl border px-4 py-3 outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            required
          />
        </div>

        {/* Photo upload */}
        <div>
          <label className="quilt-text-sm font-medium block mb-1">
            Photo (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="touch-target rounded-xl border px-4 py-2 text-sm transition-colors hover:border-accent"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {imageDataUrl ? "Change photo" : "Upload or take photo"}
            </button>
            {imageDataUrl && (
              <div className="h-12 w-12 rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <img src={imageDataUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Color + Yardage row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="quilt-text-sm font-medium block mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 rounded-lg border cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="quilt-text-sm flex-1 rounded-xl border px-3 py-2 outline-none"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>
          <div>
            <label className="quilt-text-sm font-medium block mb-1">
              Yardage
            </label>
            <input
              type="number"
              value={yardage}
              onChange={(e) => setYardage(e.target.value)}
              step="0.25"
              min="0"
              className="quilt-text-sm w-full rounded-xl border px-4 py-3 outline-none"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
        </div>

        {/* Fabric type */}
        <div>
          <label className="quilt-text-sm font-medium block mb-1">Type</label>
          <div className="flex flex-wrap gap-2">
            {FABRIC_TYPES.map((ft) => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setFabricType(ft.value)}
                className="rounded-full border px-3 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: fabricType === ft.value ? "var(--accent)" : "var(--border)",
                  background: fabricType === ft.value ? "var(--accent-muted)" : "transparent",
                  color: fabricType === ft.value ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="quilt-text-sm font-medium block mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., from the spring sale, pre-washed"
            className="quilt-text-sm w-full rounded-xl border px-4 py-3 outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="touch-target flex-1 rounded-xl px-6 py-3 font-semibold text-white transition-colors"
          style={{ background: "var(--accent)" }}
        >
          Add to Stash
        </button>
        <button
          type="button"
          onClick={onClose}
          className="touch-target rounded-xl border px-6 py-3 font-medium transition-colors"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function StashPage() {
  const { swatches, removeSwatch } = useStashStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<FabricType | "all">("all");

  const filtered =
    filterType === "all"
      ? swatches
      : swatches.filter((s) => s.fabricType === filterType);

  const totalYardage = swatches.reduce((sum, s) => sum + s.yardage, 0);

  return (
    <div
      className="min-h-screen washi-surface washi-base"
      style={{ color: "var(--foreground)" }}
    >
      <AccessibilityControls />

      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="quilt-text-sm flex items-center gap-1"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Home
            </Link>
            <h1 className="quilt-text-lg font-semibold">My Fabric Stash</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="touch-target flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: "var(--accent)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Fabric
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Stats */}
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6"
        >
          <div
            className="washi-card rounded-xl border px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>
              Total Fabrics
            </p>
            <p className="relative z-10 quilt-text-lg font-bold">{swatches.length}</p>
          </div>
          <div
            className="washi-card rounded-xl border px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>
              Total Yardage
            </p>
            <p className="relative z-10 quilt-text-lg font-bold">{totalYardage.toFixed(1)} yards</p>
          </div>
          <div
            className="washi-card rounded-xl border px-4 py-3 hidden sm:block"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>
              Types
            </p>
            <p className="relative z-10 quilt-text-lg font-bold">
              {new Set(swatches.map((s) => s.fabricType)).size}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className="rounded-full border px-3 py-1.5 text-sm transition-colors"
            style={{
              borderColor: filterType === "all" ? "var(--accent)" : "var(--border)",
              background: filterType === "all" ? "var(--accent-muted)" : "transparent",
              color: filterType === "all" ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            All ({swatches.length})
          </button>
          {FABRIC_TYPES.map((ft) => {
            const count = swatches.filter((s) => s.fabricType === ft.value).length;
            if (count === 0) return null;
            return (
              <button
                key={ft.value}
                onClick={() => setFilterType(ft.value)}
                className="rounded-full border px-3 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: filterType === ft.value ? "var(--accent)" : "var(--border)",
                  background: filterType === ft.value ? "var(--accent-muted)" : "transparent",
                  color: filterType === ft.value ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {ft.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="mb-6">
            <AddFabricForm onClose={() => setShowAdd(false)} />
          </div>
        )}

        {/* Empty state */}
        {swatches.length === 0 && !showAdd && (
          <div
            className="washi-card rounded-2xl border-2 border-dashed px-8 py-16 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="relative z-10">
              <div className="text-4xl mb-4" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="quilt-text-lg font-semibold mb-2">
                Your fabric stash is empty
              </h2>
              <p className="quilt-text" style={{ color: "var(--text-muted)" }}>
                Add fabrics to your stash by photo or color. When you view a
                pattern&rsquo;s materials list, we&rsquo;ll cross-reference
                against what you have.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="touch-target mt-6 rounded-xl px-6 py-3 font-semibold text-white transition-colors"
                style={{ background: "var(--accent)" }}
              >
                Add your first fabric
              </button>
            </div>
          </div>
        )}

        {/* Swatch grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((swatch) => (
              <StashCard
                key={swatch.id}
                swatch={swatch}
                onRemove={removeSwatch}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
