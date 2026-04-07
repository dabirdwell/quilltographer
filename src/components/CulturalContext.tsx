"use client";

import { useState, useEffect } from "react";

/* ================================================================
   CULTURAL CONTEXT — Brief, respectful cultural attribution
   for traditional quilt patterns.

   Shows a single sentence about cultural origins + "Learn more" link.
   Not a lecture — a friend sharing something interesting.
   ================================================================ */

interface CulturalPatternData {
  pattern_name: string;
  display_name: string;
  origin: string;
  period: string;
  cultural_context: string;
  learn_more_url: string;
}

// Lazy-load the cultural data
let culturalDataCache: CulturalPatternData[] | null = null;

async function loadCulturalData(): Promise<CulturalPatternData[]> {
  if (culturalDataCache) return culturalDataCache;
  try {
    const data = await import("@/data/cultural_patterns.json");
    culturalDataCache = data.default || data;
    return culturalDataCache!;
  } catch {
    return [];
  }
}

function findCulturalContext(
  data: CulturalPatternData[],
  patternId: string,
  patternName?: string
): CulturalPatternData | undefined {
  // Try direct ID match
  const byId = data.find((d) => d.pattern_name === patternId);
  if (byId) return byId;

  // Try fuzzy name match
  if (patternName) {
    const normalized = patternName.toLowerCase().replace(/[^a-z]/g, "");
    return data.find((d) => {
      const dNorm = d.display_name.toLowerCase().replace(/[^a-z]/g, "");
      return dNorm === normalized || dNorm.includes(normalized) || normalized.includes(dNorm);
    });
  }

  return undefined;
}

export function CulturalContext({
  patternId,
  patternName,
}: {
  patternId: string;
  patternName?: string;
}) {
  const [context, setContext] = useState<CulturalPatternData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadCulturalData().then((data) => {
      const found = findCulturalContext(data, patternId, patternName);
      if (found) setContext(found);
    });
  }, [patternId, patternName]);

  if (!context) return null;

  return (
    <div
      className="washi-card rounded-xl border px-5 py-4"
      style={{
        borderColor: "var(--border-light)",
        background: "var(--surface)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          {/* Origin icon */}
          <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="quilt-text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Cultural Heritage
            </p>
            <p className="quilt-text-sm" style={{ color: "var(--foreground)" }}>
              {context.cultural_context}
            </p>

            {expanded && (
              <div className="mt-2 space-y-1 sumi-reveal">
                <p className="quilt-text-sm" style={{ color: "var(--text-muted)" }}>
                  <strong>Origin:</strong> {context.origin}
                </p>
                <p className="quilt-text-sm" style={{ color: "var(--text-muted)" }}>
                  <strong>Period:</strong> {context.period}
                </p>
              </div>
            )}

            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="quilt-text-sm underline"
                style={{ color: "var(--accent)" }}
              >
                {expanded ? "Show less" : "Learn more"}
              </button>
              {expanded && context.learn_more_url && (
                <a
                  href={context.learn_more_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quilt-text-sm underline flex items-center gap-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Read history
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
