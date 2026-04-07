"use client";

import { useState, useRef, useCallback } from "react";
import type { GuidedStep } from "@/lib/guided-steps";

interface ShowProgressProps {
  patternName: string;
  currentStepIndex: number;
  currentStep: GuidedStep;
  metadata?: string;
}

type CaptureState = "idle" | "preview" | "sending" | "result";

export function ShowProgress({
  patternName,
  currentStepIndex,
  currentStep,
  metadata,
}: ShowProgressProps) {
  const [state, setState] = useState<CaptureState>("idle");
  const [imageData, setImageData] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setImageData(reader.result as string);
        setState("preview");
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    if (!imageData) return;
    setState("sending");
    setError("");

    // Strip the data:image/...;base64, prefix
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    try {
      const res = await fetch("/api/companion/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType,
          prompt: `Here is a photo of my progress on this quilting step. How am I doing?`,
          mode: "progress",
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
        throw new Error(data.error || "Something went wrong.");
      }

      const data = await res.json();
      setResponse(data.response);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("preview");
    }
  }, [imageData, patternName, currentStepIndex, currentStep, metadata]);

  const handleRetake = useCallback(() => {
    setImageData(null);
    setResponse("");
    setError("");
    setState("idle");
  }, []);

  if (state === "idle") {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="lantern-glow touch-target-lg flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-4 transition-all hover:border-solid"
          style={{
            borderColor: "var(--accent)",
            color: "var(--accent)",
            background: "var(--accent-muted)",
          }}
        >
          {/* Camera icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="quilt-text font-medium">Show My Progress</span>
        </button>
      </>
    );
  }

  return (
    <div
      className="washi-card rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="relative z-10">
        {/* Preview */}
        {(state === "preview" || state === "sending") && imageData && (
          <div>
            <img
              src={imageData}
              alt="Your quilting progress"
              className="w-full rounded-t-xl"
              style={{ maxHeight: "40vh", objectFit: "cover" }}
            />
            <div className="flex gap-3 p-4">
              <button
                onClick={handleRetake}
                disabled={state === "sending"}
                className="touch-target flex-1 rounded-xl border px-4 py-3 font-medium transition-colors disabled:opacity-40"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                disabled={state === "sending"}
                className="touch-target flex-1 rounded-xl px-4 py-3 font-medium text-white transition-colors disabled:opacity-60"
                style={{ background: "var(--accent)" }}
              >
                {state === "sending" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-gentle-pulse">&#x1F9F5;</span>
                    Looking&hellip;
                  </span>
                ) : (
                  "Ask Companion"
                )}
              </button>
            </div>
            {error && (
              <div
                className="mx-4 mb-4 rounded-xl px-4 py-3"
                style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
              >
                <p className="quilt-text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Vision response */}
        {state === "result" && (
          <div>
            {imageData && (
              <img
                src={imageData}
                alt="Your quilting progress"
                className="w-full rounded-t-xl"
                style={{ maxHeight: "30vh", objectFit: "cover" }}
              />
            )}
            <div className="lantern-glow lantern-active p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">&#x1F9F5;</span>
                <h4 className="quilt-text font-semibold">Your Companion Says</h4>
              </div>
              <div className="quilt-text whitespace-pre-wrap">{response}</div>
              <button
                onClick={handleRetake}
                className="mt-4 quilt-text-sm underline"
                style={{ color: "var(--accent)" }}
              >
                Take another photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
