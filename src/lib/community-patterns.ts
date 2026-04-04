import { samplePatterns, getDifficultyLabel } from "./sample-patterns";

export type DifficultyLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | "Master";

export interface CommunityPattern {
  id: string;
  title: string;
  creator: string;
  description: string;
  difficulty: DifficultyLevel;
  submittedAt: string; // ISO date
  /** Grid-based SVG preview (seeded patterns) */
  grid?: number[][];
  colors?: string[];
  /** Uploaded image preview (user submissions) */
  imageDataUrl?: string;
}

const STORAGE_KEY = "quiltographer-community-patterns";

/** Seed patterns derived from the existing block library */
export function getSeedPatterns(): CommunityPattern[] {
  const picks = [
    { id: "nine-patch", creator: "Sarah M.", date: "2025-11-15" },
    { id: "log-cabin", creator: "James T.", date: "2025-12-02" },
    { id: "flying-geese", creator: "Aiko N.", date: "2026-01-10" },
    { id: "star-block", creator: "Priya K.", date: "2026-02-18" },
    { id: "storm-at-sea", creator: "Elena V.", date: "2026-03-05" },
  ];

  return picks.map(({ id, creator, date }) => {
    const p = samplePatterns.find((s) => s.id === id)!;
    return {
      id: `community-${p.id}`,
      title: p.name,
      creator,
      description: p.description,
      difficulty: getDifficultyLabel(p.difficulty) as DifficultyLevel,
      submittedAt: date,
      grid: p.grid,
      colors: p.colors,
    };
  });
}

export function loadCommunityPatterns(): CommunityPattern[] {
  if (typeof window === "undefined") return getSeedPatterns();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getSeedPatterns();
  try {
    const userPatterns: CommunityPattern[] = JSON.parse(stored);
    return [...getSeedPatterns(), ...userPatterns];
  } catch {
    return getSeedPatterns();
  }
}

export function saveUserPattern(pattern: CommunityPattern): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const existing: CommunityPattern[] = stored ? JSON.parse(stored) : [];
  existing.push(pattern);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getDifficultyBadgeColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Intermediate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Advanced":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Expert":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Master":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}

export const ALL_DIFFICULTIES: DifficultyLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Master",
];
