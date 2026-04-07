"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { GuidedStep } from "@/lib/guided-steps";

interface AskCompanionProps {
  patternName: string;
  currentStepIndex: number;
  currentStep: GuidedStep;
  allSteps: GuidedStep[];
  /** Additional metadata like difficulty, techniques */
  metadata?: string;
}

const QUICK_QUESTIONS = [
  "What does this abbreviation mean?",
  "Can you explain this step differently?",
  "What if I make a mistake here?",
  "Why does this step come before the next one?",
];

export function AskCompanion({
  patternName,
  currentStepIndex,
  currentStep,
  allSteps,
  metadata,
}: AskCompanionProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setAttachedPhoto(reader.result as string);
      reader.readAsDataURL(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    []
  );

  const removePhoto = useCallback(() => setAttachedPhoto(null), []);

  // Scroll to response when it changes
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [response]);

  const askQuestion = async (q: string) => {
    setQuestion(q);
    setLoading(true);
    setError("");
    setResponse("");

    // Gather surrounding context (2 steps before and after)
    const start = Math.max(0, currentStepIndex - 2);
    const end = Math.min(allSteps.length, currentStepIndex + 3);
    const surroundingSteps = allSteps
      .slice(start, end)
      .map((s, i) => {
        const idx = start + i;
        const marker = idx === currentStepIndex ? " [CURRENT STEP]" : "";
        return `Step ${idx + 1}${marker}: ${s.text}`;
      })
      .join("\n\n");

    try {
      // Route to vision endpoint if a photo is attached
      if (attachedPhoto) {
        const base64 = attachedPhoto.replace(/^data:image\/\w+;base64,/, "");
        const mimeMatch = attachedPhoto.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

        const res = await fetch("/api/companion/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            mimeType,
            prompt: q,
            mode: "companion" as const,
            context: {
              patternName,
              stepNumber: currentStepIndex + 1,
              stepText: currentStep.text,
              difficulty: metadata,
            },
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong. Please try again.");
        }

        const data = await res.json();
        setResponse(data.response);
        setAttachedPhoto(null);
      } else {
        // Text-only: use existing companion endpoint
        const res = await fetch("/api/companion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patternName,
            stepNumber: currentStepIndex + 1,
            stepText: currentStep.text,
            surroundingContext: surroundingSteps,
            metadata: metadata || "",
            question: q,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong. Please try again.");
        }

        const data = await res.json();
        setResponse(data.response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      askQuestion(question.trim());
    }
  };

  return (
    <>
      {/* Floating help button — with lantern glow */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="lantern-glow-breathe touch-target-lg fixed bottom-24 right-20 z-20 flex items-center gap-2 rounded-full px-5 py-3 shadow-quilt-lg transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "var(--accent)",
            color: "white",
          }}
          aria-label="Ask your quilting companion for help"
        >
          {/* Thread/needle icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5L12 21l-2-11.5A4 4 0 0 1 12 2z" />
            <path d="M12 10v2" />
          </svg>
          <span className="text-sm font-medium">I need help</span>
        </button>
      )}

      {/* Companion panel — with lantern glow */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-30 animate-slide-up">
          <div
            className={`lantern-glow mx-auto max-w-2xl rounded-t-2xl border border-b-0 shadow-quilt-lg ${response ? "lantern-active" : ""}`}
            style={{
              background: "var(--surface-raised)",
              borderColor: "var(--border)",
              maxHeight: "65vh",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between rounded-t-2xl px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">&#x1F9F5;</span>
                <div>
                  <h3 className="text-sm font-semibold">Your Quilting Companion</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Step {currentStepIndex + 1} &middot; {patternName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setResponse("");
                  setError("");
                }}
                className="touch-target flex items-center justify-center rounded-full p-2 transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close companion"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(65vh - 130px)" }}>
              {/* Quick questions */}
              {!response && !loading && (
                <div className="mb-4 space-y-2">
                  <p className="quilt-text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                    Quick questions:
                  </p>
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => askQuestion(q)}
                      className="quilt-text-sm touch-target block w-full rounded-xl border px-4 py-3 text-left transition-colors hover:border-accent"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center gap-3 py-6" style={{ color: "var(--text-muted)" }}>
                  <div className="animate-gentle-pulse text-2xl">&#x1F9F5;</div>
                  <p className="quilt-text">
                    Your companion is thinking&hellip;
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  className="mb-4 rounded-xl px-4 py-3"
                  style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  <p className="quilt-text-sm">{error}</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <div ref={responseRef} className="mb-4 space-y-3">
                  <div
                    className="rounded-xl px-5 py-4"
                    style={{ background: "var(--surface)" }}
                  >
                    <p
                      className="quilt-text-sm mb-2 font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      You asked: &ldquo;{question}&rdquo;
                    </p>
                    <div className="quilt-text whitespace-pre-wrap">{response}</div>
                  </div>
                  <button
                    onClick={() => {
                      setResponse("");
                      setQuestion("");
                    }}
                    className="quilt-text-sm underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Ask another question
                  </button>
                </div>
              )}
            </div>

            {/* Attached photo preview */}
            {attachedPhoto && (
              <div className="mx-5 mb-2 flex items-center gap-2">
                <img
                  src={attachedPhoto}
                  alt="Attached photo"
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <span className="quilt-text-sm flex-1" style={{ color: "var(--text-muted)" }}>
                  Photo attached
                </span>
                <button
                  onClick={removePhoto}
                  className="rounded-full p-1"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Remove photo"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Hidden photo input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Custom question input */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 px-5 py-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {/* Attach photo button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="touch-target flex items-center justify-center rounded-xl px-3 transition-colors"
                style={{
                  color: attachedPhoto ? "var(--accent)" : "var(--text-muted)",
                  background: attachedPhoto ? "var(--accent-muted)" : "transparent",
                  border: `1px solid ${attachedPhoto ? "var(--accent)" : "var(--border)"}`,
                }}
                aria-label="Attach a photo"
                title="Attach a photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={attachedPhoto ? "Ask about this photo\u2026" : "Ask anything about this step\u2026"}
                className="quilt-text-sm min-h-[48px] flex-1 rounded-xl border px-4 py-2 outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="touch-target flex items-center justify-center rounded-xl px-4 font-medium text-white transition-colors disabled:opacity-40"
                style={{ background: "var(--accent)" }}
                aria-label="Send question"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
