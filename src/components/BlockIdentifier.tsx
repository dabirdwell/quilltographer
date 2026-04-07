"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface BlockInfo {
  response: string;
  provider: string;
}

interface CulturalMatch {
  pattern_name: string;
  display_name: string;
  origin: string;
  period: string;
  cultural_context: string;
  learn_more_url: string;
}

export function BlockIdentifier() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlockInfo | null>(null);
  const [culturalMatch, setCulturalMatch] = useState<CulturalMatch | null>(null);
  const [error, setError] = useState("");
  const [culturalPatterns, setCulturalPatterns] = useState<CulturalMatch[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cultural patterns for cross-referencing
  useEffect(() => {
    fetch("/api/companion/vision")
      .catch(() => {}); // warm up
    import("@/data/cultural_patterns.json").then((mod) => {
      setCulturalPatterns(mod.default as CulturalMatch[]);
    });
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setImageData(reader.result as string);
        setResult(null);
        setCulturalMatch(null);
        setError("");
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const identify = useCallback(async () => {
    if (!imageData) return;
    setLoading(true);
    setError("");
    setResult(null);
    setCulturalMatch(null);

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
          prompt: "Please identify this quilt block. What is its traditional name, origin, difficulty, and how would you make it?",
          mode: "identify",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Identification failed.");
      }

      const data = await res.json();
      setResult(data);

      // Cross-reference with cultural patterns
      if (data.response && culturalPatterns.length > 0) {
        const responseLower = data.response.toLowerCase();
        const match = culturalPatterns.find((cp) => {
          const name = cp.display_name.toLowerCase();
          return responseLower.includes(name);
        });
        if (match) setCulturalMatch(match);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [imageData, culturalPatterns]);

  const reset = useCallback(() => {
    setImageData(null);
    setResult(null);
    setCulturalMatch(null);
    setError("");
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h2 className="quilt-text-xl font-semibold mb-2">What Block Is This?</h2>
      <p className="quilt-text mb-6" style={{ color: "var(--text-muted)" }}>
        Photograph a quilt block — from a book, a finished quilt, or your own work — and
        your companion will identify it.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      {!imageData && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="touch-target-lg flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-12 transition-all hover:border-solid"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          {/* Magnifying glass icon */}
          <svg
            width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="quilt-text" style={{ color: "var(--text-muted)" }}>
            Tap to photograph a quilt block
          </span>
        </button>
      )}

      {/* Image preview + identify button */}
      {imageData && !result && (
        <div
          className="washi-card overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative z-10">
            <img
              src={imageData}
              alt="Quilt block to identify"
              className="w-full"
              style={{ maxHeight: "50vh", objectFit: "cover" }}
            />
            <div className="flex gap-3 p-4">
              <button
                onClick={reset}
                disabled={loading}
                className="touch-target flex-1 rounded-xl border px-4 py-3 font-medium transition-colors disabled:opacity-40"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Choose another
              </button>
              <button
                onClick={identify}
                disabled={loading}
                className="touch-target flex-1 rounded-xl px-4 py-3 font-medium text-white transition-colors disabled:opacity-60"
                style={{ background: "var(--accent)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-gentle-pulse">&#x1F9F5;</span>
                    Identifying&hellip;
                  </span>
                ) : (
                  "Identify Block"
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
        </div>
      )}

      {/* Results card */}
      {result && (
        <div
          className="washi-card overflow-hidden rounded-xl border sumi-reveal"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative z-10">
            {/* Photo header */}
            {imageData && (
              <img
                src={imageData}
                alt="Identified quilt block"
                className="w-full"
                style={{ maxHeight: "30vh", objectFit: "cover" }}
              />
            )}

            {/* Identification details */}
            <div className="lantern-glow lantern-active p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">&#x1F50D;</span>
                <h3 className="quilt-text-lg font-semibold">Block Identified</h3>
              </div>

              <div className="quilt-text whitespace-pre-wrap">{result.response}</div>

              {/* Cultural context card */}
              {culturalMatch && (
                <div
                  className="mt-4 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: "var(--accent)",
                    background: "var(--accent-muted)",
                  }}
                >
                  <p className="quilt-text-sm font-semibold mb-1">
                    Cultural Heritage: {culturalMatch.display_name}
                  </p>
                  <p className="quilt-text-sm" style={{ color: "var(--text-muted)" }}>
                    Origin: {culturalMatch.origin} &middot; {culturalMatch.period}
                  </p>
                  <p className="quilt-text-sm mt-2">{culturalMatch.cultural_context}</p>
                  {culturalMatch.learn_more_url && (
                    <a
                      href={culturalMatch.learn_more_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quilt-text-sm mt-2 inline-block underline"
                      style={{ color: "var(--accent)" }}
                    >
                      Learn more about this pattern&rsquo;s history
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={reset}
                className="quilt-text-sm underline"
                style={{ color: "var(--accent)" }}
              >
                Identify another block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
