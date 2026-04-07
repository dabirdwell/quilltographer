"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ================================================================
   JAPANESE FAN NAVIGATION — The Signature Interaction

   A radial fan menu that unfolds from the bottom-right corner.
   Four arcs: Patterns, Colors/Fabrics, Tools, Actions.
   Each arc reveals 3-5 items with staggered animation.
   Feels PHYSICAL — like unfolding a real paper fan.
   Touch-optimized with large hit targets.
   ================================================================ */

interface FanItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface FanArc {
  label: string;
  kanji: string;
  color: string;
  items: FanItem[];
}

/* Default arcs for the reader/guided context */
const defaultArcs: FanArc[] = [
  {
    label: "Patterns",
    kanji: "柄",
    color: "var(--accent)",
    items: [
      {
        label: "Gallery",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
        href: "/gallery",
      },
      {
        label: "Community",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        href: "/community",
      },
      {
        label: "Design",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        ),
        href: "/design",
      },
    ],
  },
  {
    label: "Fabrics",
    kanji: "布",
    color: "var(--success)",
    items: [
      {
        label: "My Stash",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        href: "/stash",
      },
      {
        label: "Calculator",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8" />
            <path d="M8 10h8" />
            <path d="M8 14h4" />
            <path d="M8 18h4" />
          </svg>
        ),
        href: "/calculator",
      },
    ],
  },
  {
    label: "Tools",
    kanji: "具",
    color: "var(--text-secondary)",
    items: [
      {
        label: "What Block?",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ),
        href: "/tools/identify",
      },
      {
        label: "Sketch Pad",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 19l7-7 3 3-7 7-3 0z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        ),
        href: "/tools/sketch",
      },
      {
        label: "Calculator",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <line x1="14" y1="16" x2="18" y2="16" />
            <circle cx="9" cy="16" r="0.5" fill="currentColor" />
          </svg>
        ),
        href: "/calculator",
      },
      {
        label: "Settings",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Actions",
    kanji: "動",
    color: "#7c3aed",
    items: [
      {
        label: "Share",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
        ),
      },
      {
        label: "Print",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7" />
            <rect x="6" y="14" width="12" height="8" />
            <rect x="2" y="9" width="20" height="8" rx="1" />
          </svg>
        ),
      },
      {
        label: "Save",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        ),
      },
    ],
  },
];

/* ================================================================
   FAN HUB BUTTON — The closed state (circle with motif)
   ================================================================ */

function FanHub({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`lantern-glow-breathe touch-target-lg z-40 flex h-16 w-16 items-center justify-center rounded-full shadow-quilt-lg transition-all duration-300 ${
        isOpen ? "scale-90 rotate-45" : "hover:scale-105 active:scale-95"
      }`}
      style={{
        background: isOpen ? "var(--surface-raised)" : "var(--accent)",
        border: isOpen ? "2px solid var(--border)" : "none",
        color: isOpen ? "var(--foreground)" : "white",
      }}
      aria-label={isOpen ? "Close navigation fan" : "Open navigation fan"}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ) : (
        /* Crossed needles motif */
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {/* Needle 1 — diagonal */}
          <line x1="7" y1="21" x2="21" y2="7" />
          <circle cx="21" cy="7" r="1.5" fill="currentColor" />
          {/* Needle 2 — opposite diagonal */}
          <line x1="7" y1="7" x2="21" y2="21" />
          <circle cx="21" cy="21" r="1.5" fill="currentColor" />
          {/* Thread wrap */}
          <path d="M12 14a2 2 0 1 0 4 0 2 2 0 0 0-4 0" strokeWidth="1.2" />
        </svg>
      )}
    </button>
  );
}

/* ================================================================
   FAN ARC — A group of items in the radial menu
   ================================================================ */

function FanArcSection({
  arc,
  arcIndex,
  totalArcs,
  isOpen,
  onClose,
}: {
  arc: FanArc;
  arcIndex: number;
  totalArcs: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  /* Position arcs in a quarter-circle from bottom-right:
     Arc 0 (Patterns): rightward      ~  0° from right
     Arc 1 (Fabrics):  bottom-right    ~ 30°
     Arc 2 (Tools):    upward-left     ~ 60°
     Arc 3 (Actions):  upward          ~ 90°
  */
  const angleStep = 90 / (totalArcs - 1);
  const baseAngle = arcIndex * angleStep; // degrees from right (clockwise from right = 0°)
  const arcRadius = 90; // distance from hub center to arc label
  const itemRadius = 150; // distance from hub center to items

  return (
    <div
      className={`fan-arc ${isOpen ? "fan-arc-open" : "fan-arc-close"}`}
      style={{
        animationDelay: `${arcIndex * 60}ms`,
        position: "absolute",
        bottom: "8px",
        right: "8px",
      }}
    >
      {/* Arc label with kanji */}
      <div
        className="absolute flex items-center gap-1.5"
        style={{
          bottom: `${Math.sin(baseAngle * (Math.PI / 180)) * arcRadius + 32}px`,
          right: `${Math.cos(baseAngle * (Math.PI / 180)) * arcRadius + 32}px`,
          transform: "translate(50%, 50%)",
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: arc.color, opacity: 0.7 }}
        >
          {arc.kanji}
        </span>
      </div>

      {/* Items */}
      {arc.items.map((item, itemIdx) => {
        const itemAngle = baseAngle + (itemIdx - (arc.items.length - 1) / 2) * 12;
        const x = Math.cos(itemAngle * (Math.PI / 180)) * itemRadius + 32;
        const y = Math.sin(itemAngle * (Math.PI / 180)) * itemRadius + 32;

        const inner = (
          <>
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full shadow-quilt transition-transform hover:scale-110"
              style={{
                background: "var(--surface-raised)",
                border: `2px solid var(--border)`,
                color: arc.color,
              }}
            >
              {item.icon}
            </span>
            <span
              className="mt-1 text-xs font-medium text-center"
              style={{ color: "var(--foreground)", maxWidth: "64px" }}
            >
              {item.label}
            </span>
          </>
        );

        const sharedClass = "fan-item-reveal absolute flex flex-col items-center";
        const sharedStyle: React.CSSProperties = {
          animationDelay: `${arcIndex * 60 + itemIdx * 50 + 100}ms`,
          bottom: `${y}px`,
          right: `${x}px`,
          transform: "translate(50%, 50%)",
        };

        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={sharedClass}
              style={sharedStyle}
              onClick={onClose}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            className={sharedClass}
            style={sharedStyle}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================
   MAIN FAN NAV COMPONENT
   ================================================================ */

export function FanNav({
  arcs = defaultArcs,
}: {
  arcs?: FanArc[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((o) => !o), []);
  const close = useCallback(() => setIsOpen(false), []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.2)" }}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Fan container */}
      <div className="fixed bottom-6 right-6 z-40" role="navigation" aria-label="Quick navigation fan">
        {/* Fan arcs */}
        {isOpen &&
          arcs.map((arc, i) => (
            <FanArcSection
              key={arc.label}
              arc={arc}
              arcIndex={i}
              totalArcs={arcs.length}
              isOpen={isOpen}
              onClose={close}
            />
          ))}

        {/* Hub button */}
        <FanHub onClick={toggle} isOpen={isOpen} />
      </div>
    </>
  );
}
