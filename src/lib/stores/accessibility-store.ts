import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontScale = 100 | 150 | 200 | 250 | 300;
export type Theme = "light" | "dark" | "warm" | "high-contrast";
export type LineSpacing = "normal" | "relaxed" | "spacious";

interface AccessibilityState {
  fontScale: FontScale;
  theme: Theme;
  lineSpacing: LineSpacing;
  readingGuide: boolean;
  soundEnabled: boolean;
  hasCompletedSetup: boolean;

  setFontScale: (scale: FontScale) => void;
  setTheme: (theme: Theme) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setReadingGuide: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  completeSetup: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontScale: 150,
      theme: "warm",
      lineSpacing: "relaxed",
      readingGuide: false,
      soundEnabled: true,
      hasCompletedSetup: false,

      setFontScale: (fontScale) => set({ fontScale }),
      setTheme: (theme) => set({ theme }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),
      setReadingGuide: (readingGuide) => set({ readingGuide }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      completeSetup: () => set({ hasCompletedSetup: true }),
    }),
    { name: "quiltographer-accessibility" }
  )
);

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  100: "Standard (100%)",
  150: "Large (150%)",
  200: "Extra Large (200%)",
  250: "Very Large (250%)",
  300: "Maximum (300%)",
};

export const THEME_LABELS: Record<Theme, { label: string; description: string }> = {
  warm: { label: "Warm", description: "Cream & brown — gentle on the eyes" },
  light: { label: "Light", description: "Clean white background" },
  dark: { label: "Dark", description: "Easy on the eyes in dim light" },
  "high-contrast": { label: "High Contrast", description: "Maximum readability" },
};

export const LINE_SPACING_LABELS: Record<LineSpacing, string> = {
  normal: "Normal",
  relaxed: "Relaxed",
  spacious: "Spacious",
};
