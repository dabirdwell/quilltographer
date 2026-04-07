"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccessibilityStore } from "@/lib/stores/accessibility-store";

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fontScale, theme, lineSpacing, readingGuide } =
    useAccessibilityStore();
  const [mounted, setMounted] = useState(false);
  const [guideY, setGuideY] = useState(-200);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply data attributes to <html> so CSS variables respond
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.setAttribute("data-font-scale", String(fontScale));
    html.setAttribute("data-line-spacing", lineSpacing);
  }, [mounted, theme, fontScale, lineSpacing]);

  // Reading guide tracks cursor / touch
  const handleMouse = useCallback(
    (e: MouseEvent) => setGuideY(e.clientY),
    []
  );
  const handleTouch = useCallback(
    (e: TouchEvent) => setGuideY(e.touches[0].clientY),
    []
  );

  useEffect(() => {
    if (!mounted || !readingGuide) return;
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, [mounted, readingGuide, handleMouse, handleTouch]);

  return (
    <>
      {children}
      {mounted && readingGuide && (
        <div
          className="reading-guide-bar"
          aria-hidden="true"
          style={{ top: guideY - 20 }}
        />
      )}
    </>
  );
}
