import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-muted": "var(--accent-muted)",
        success: "var(--success)",
        "success-muted": "var(--success-muted)",
        muted: "var(--text-muted)",
        secondary: "var(--text-secondary)",
        quilt: {
          cream: "#FDF6E3",
          parchment: "#F5EFE0",
          terracotta: "#C4573A",
          "terracotta-light": "#E8A090",
          sage: "#6B8F71",
          "sage-light": "#A8C5AD",
          indigo: "#4A5899",
          "indigo-light": "#8B9AD4",
          "brown-dark": "#3E2723",
          "brown-text": "#4E3B2A",
          "brown-light": "#8D6E63",
          "warm-white": "#FFFEF9",
        },
      },
      boxShadow: {
        quilt: "0 2px 12px var(--shadow)",
        "quilt-lg": "0 4px 24px var(--shadow)",
      },
    },
  },
  plugins: [],
} satisfies Config;
