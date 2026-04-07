"use client";

import { useState } from "react";
import {
  useAccessibilityStore,
  FONT_SCALE_LABELS,
  THEME_LABELS,
  LINE_SPACING_LABELS,
  type FontScale,
  type Theme,
  type LineSpacing,
} from "@/lib/stores/accessibility-store";

/* ------------------------------------------------------------------ */
/*  Quick Setup — shown on first visit                                 */
/* ------------------------------------------------------------------ */

export function QuickSetup({ onComplete }: { onComplete: () => void }) {
  const {
    fontScale,
    theme,
    setFontScale,
    setTheme,
    setLineSpacing,
    completeSetup,
  } = useAccessibilityStore();

  const [step, setStep] = useState(0);

  const finish = () => {
    completeSetup();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="animate-fade-in mx-4 w-full max-w-lg rounded-2xl p-8"
        style={{ background: "var(--surface-raised)", color: "var(--foreground)" }}
      >
        {step === 0 && (
          <div className="space-y-6 text-center">
            <div className="text-5xl">&#x1F9F5;</div>
            <h2 className="quilt-text-xl font-semibold">
              Welcome to your Quilting Companion
            </h2>
            <p className="quilt-text" style={{ color: "var(--text-muted)" }}>
              Let&rsquo;s adjust the display for your comfort. You can always
              change these settings later.
            </p>
            <button
              onClick={() => setStep(1)}
              className="touch-target-lg w-full rounded-xl px-6 py-4 text-lg font-medium text-white transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Let&rsquo;s get started
            </button>
            <button
              onClick={finish}
              className="block w-full py-2 text-sm underline"
              style={{ color: "var(--text-muted)" }}
            >
              Skip — use defaults
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="quilt-text-xl font-semibold">
              How large would you like the text?
            </h2>
            <div className="space-y-3">
              {(Object.entries(FONT_SCALE_LABELS) as [string, string][]).map(
                ([scale, label]) => {
                  const s = Number(scale) as FontScale;
                  const active = fontScale === s;
                  return (
                    <button
                      key={scale}
                      onClick={() => setFontScale(s)}
                      className="touch-target flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        background: active ? "var(--accent-muted)" : "transparent",
                      }}
                    >
                      <span
                        style={{ fontSize: `${s / 100}rem` }}
                        className="font-medium"
                      >
                        Aa
                      </span>
                      <span className="quilt-text">{label}</span>
                    </button>
                  );
                }
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              className="touch-target-lg mt-4 w-full rounded-xl px-6 py-4 text-lg font-medium text-white transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="quilt-text-xl font-semibold">
              Choose a display theme
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(
                Object.entries(THEME_LABELS) as [
                  string,
                  { label: string; description: string },
                ][]
              ).map(([t, info]) => {
                const active = theme === t;
                const previewBg =
                  t === "warm"
                    ? "#FDF6E3"
                    : t === "light"
                      ? "#FFFFFF"
                      : t === "dark"
                        ? "#1A1412"
                        : "#000000";
                const previewFg =
                  t === "warm"
                    ? "#4E3B2A"
                    : t === "light"
                      ? "#171717"
                      : t === "dark"
                        ? "#EDEDED"
                        : "#FFFFFF";
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t as Theme)}
                    className="touch-target flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      background: active ? "var(--accent-muted)" : "transparent",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                      style={{ background: previewBg, color: previewFg }}
                    >
                      Aa
                    </div>
                    <span className="font-medium">{info.label}</span>
                    <span
                      className="text-center text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {info.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setLineSpacing("relaxed");
                finish();
              }}
              className="touch-target-lg mt-4 w-full rounded-xl px-6 py-4 text-lg font-medium text-white transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Done — let&rsquo;s quilt!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Panel (gear icon toggle)                                  */
/* ------------------------------------------------------------------ */

export function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const store = useAccessibilityStore();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="touch-target fixed right-4 top-4 z-30 flex items-center justify-center rounded-full border shadow-quilt transition-transform hover:scale-105"
        style={{
          width: 48,
          height: 48,
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
        aria-label="Display settings"
        title="Display settings"
      >
        {/* Eye icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Settings panel */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div
            className="animate-fade-in absolute right-4 top-16 w-80 max-h-[80vh] overflow-y-auto rounded-2xl border p-5 shadow-quilt-lg"
            style={{
              background: "var(--surface-raised)",
              borderColor: "var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold">Display Settings</h3>

            {/* Font Size */}
            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Text Size
              </legend>
              <div className="space-y-1">
                {(Object.entries(FONT_SCALE_LABELS) as [string, string][]).map(
                  ([s, label]) => {
                    const scale = Number(s) as FontScale;
                    const active = store.fontScale === scale;
                    return (
                      <button
                        key={s}
                        onClick={() => store.setFontScale(scale)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                        style={{
                          background: active ? "var(--accent-muted)" : "transparent",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <span style={{ fontSize: `${scale / 100}rem`, lineHeight: 1 }}>A</span>
                        <span>{label}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Theme */}
            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Theme
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(THEME_LABELS) as [string, { label: string; description: string }][]).map(
                  ([t, info]) => {
                    const active = store.theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => store.setTheme(t as Theme)}
                        className="rounded-lg border px-3 py-2 text-sm transition-colors"
                        style={{
                          borderColor: active ? "var(--accent)" : "var(--border)",
                          background: active ? "var(--accent-muted)" : "transparent",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {info.label}
                      </button>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Line Spacing */}
            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Line Spacing
              </legend>
              <div className="flex gap-2">
                {(Object.entries(LINE_SPACING_LABELS) as [string, string][]).map(
                  ([sp, label]) => {
                    const active = store.lineSpacing === sp;
                    return (
                      <button
                        key={sp}
                        onClick={() => store.setLineSpacing(sp as LineSpacing)}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors"
                        style={{
                          borderColor: active ? "var(--accent)" : "var(--border)",
                          background: active ? "var(--accent-muted)" : "transparent",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Reading Guide */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm">Reading Guide</span>
              <button
                role="switch"
                aria-checked={store.readingGuide}
                onClick={() => store.setReadingGuide(!store.readingGuide)}
                className="relative h-7 w-12 rounded-full transition-colors"
                style={{
                  background: store.readingGuide ? "var(--success)" : "var(--border)",
                }}
              >
                <span
                  className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
                  style={{
                    transform: store.readingGuide ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Completion Sound</span>
              <button
                role="switch"
                aria-checked={store.soundEnabled}
                onClick={() => store.setSoundEnabled(!store.soundEnabled)}
                className="relative h-7 w-12 rounded-full transition-colors"
                style={{
                  background: store.soundEnabled ? "var(--success)" : "var(--border)",
                }}
              >
                <span
                  className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
                  style={{
                    transform: store.soundEnabled ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </button>
            </div>

            {/* Textile Sound Design */}
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Textile Sounds
              </legend>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                Fabric-inspired audio for step transitions and completions
              </p>
              <div className="flex gap-2">
                {(["off", "subtle", "full"] as const).map((level) => {
                  const active = store.soundLevel === level;
                  const labels = { off: "Off", subtle: "Subtle", full: "Full" };
                  return (
                    <button
                      key={level}
                      onClick={() => store.setSoundLevel(level)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        background: active ? "var(--accent-muted)" : "transparent",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {labels[level]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </>
  );
}
