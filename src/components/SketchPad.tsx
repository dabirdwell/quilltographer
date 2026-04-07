"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const PRESET_COLORS = [
  "#1a1a1a", // Black
  "#C4573A", // Terracotta (quilt-terracotta)
  "#4A5899", // Indigo (quilt-indigo)
  "#6B8F71", // Sage (quilt-sage)
  "#8D6E63", // Brown (quilt-brown-light)
];

export function SketchPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [tool, setTool] = useState<"draw" | "erase">("draw");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      if ("touches" in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getPos(e);
      lastPosRef.current = pos;
      setIsDrawing(true);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, tool === "erase" ? 12 : 2, 0, Math.PI * 2);
      ctx.fillStyle = tool === "erase" ? "#FFFFFF" : color;
      ctx.fill();
    },
    [getPos, color, tool]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !lastPosRef.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === "erase" ? "#FFFFFF" : color;
      ctx.lineWidth = tool === "erase" ? 24 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPosRef.current = pos;
    },
    [isDrawing, getPos, color, tool]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width * (window.devicePixelRatio || 1), rect.height * (window.devicePixelRatio || 1));
    setResult("");
    setError("");
  }, []);

  const interpret = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError("");
    setResult("");

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");

    try {
      const res = await fetch("/api/companion/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: "image/png",
          prompt:
            "This is a hand-drawn sketch of a quilt layout. Please describe what you see: how many blocks, the arrangement pattern, any color groupings. Suggest a name for this layout if it resembles a traditional pattern.",
          mode: "sketch",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Interpretation failed.");
      }

      const data = await res.json();
      setResult(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h2 className="quilt-text-xl font-semibold mb-2">Sketch Pad</h2>
      <p className="quilt-text mb-4" style={{ color: "var(--text-muted)" }}>
        Draw a rough quilt layout and your companion will interpret it.
      </p>

      {/* Canvas */}
      <div
        className="washi-card overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="relative z-10">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none"
            style={{
              height: "320px",
              background: "#FFFFFF",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Toolbar */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {/* Color picker */}
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool("draw");
                  }}
                  className="h-8 w-8 rounded-full border-2 transition-transform"
                  style={{
                    background: c,
                    borderColor: color === c && tool === "draw" ? "var(--accent)" : "var(--border)",
                    transform: color === c && tool === "draw" ? "scale(1.2)" : "scale(1)",
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>

            {/* Tools */}
            <div className="flex items-center gap-2">
              {/* Eraser */}
              <button
                onClick={() => setTool(tool === "erase" ? "draw" : "erase")}
                className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                style={{
                  borderColor: tool === "erase" ? "var(--accent)" : "var(--border)",
                  background: tool === "erase" ? "var(--accent-muted)" : "transparent",
                  color: "var(--foreground)",
                }}
                aria-label="Eraser"
                title="Eraser"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 20H7L3 16a1 1 0 0 1 0-1.41l9.59-9.59a2 2 0 0 1 2.82 0L20 9.59a2 2 0 0 1 0 2.82L12 20" />
                  <path d="M6 13l4 4" />
                </svg>
              </button>

              {/* Clear */}
              <button
                onClick={clearCanvas}
                className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
                aria-label="Clear canvas"
                title="Clear"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interpret button */}
      <button
        onClick={interpret}
        disabled={loading}
        className="touch-target-lg mt-4 flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-medium text-white transition-colors disabled:opacity-60"
        style={{ background: "var(--accent)" }}
      >
        {loading ? (
          <>
            <span className="animate-gentle-pulse">&#x1F9F5;</span>
            <span>Interpreting your sketch&hellip;</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Interpret</span>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div
          className="mt-4 rounded-xl px-4 py-3"
          style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
        >
          <p className="quilt-text-sm">{error}</p>
        </div>
      )}

      {/* Interpretation result */}
      {result && (
        <div
          className="lantern-glow lantern-active mt-4 washi-card rounded-xl border p-5 sumi-reveal"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">&#x1F9F5;</span>
              <h4 className="quilt-text font-semibold">Your Companion Sees</h4>
            </div>
            <div className="quilt-text whitespace-pre-wrap">{result}</div>
          </div>
        </div>
      )}
    </div>
  );
}
