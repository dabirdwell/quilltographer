import { samplePatterns, type QuiltPattern } from "./sample-patterns";

export type PatternCategory =
  | "Traditional"
  | "Modern"
  | "Art"
  | "Paper Pieced"
  | "Foundation"
  | "Custom";

export interface CategoryConfig {
  id: PatternCategory;
  label: string;
  kanji: string;
  description: string;
  color: string;
}

const categoryPatternMap: Record<PatternCategory, string[]> = {
  Traditional: [
    "nine-patch",
    "log-cabin",
    "star-block",
    "flying-geese",
    "wedding-ring",
    "lone-star",
  ],
  Modern: ["tumbling-blocks", "storm-at-sea"],
  Art: ["cathedral-window", "paper-pieced-landscape"],
  "Paper Pieced": ["paper-pieced-landscape"],
  Foundation: ["log-cabin", "paper-pieced-landscape"],
  Custom: [],
};

export const categories: CategoryConfig[] = [
  {
    id: "Traditional",
    label: "Traditional",
    kanji: "\u4F1D\u7D71",
    description: "Classic blocks passed through generations",
    color: "#003171",
  },
  {
    id: "Modern",
    label: "Modern",
    kanji: "\u73FE\u4EE3",
    description: "Contemporary designs with bold geometry",
    color: "#BA2636",
  },
  {
    id: "Art",
    label: "Art",
    kanji: "\u82B8\u8853",
    description: "Artistic expression through fabric",
    color: "#884898",
  },
  {
    id: "Paper Pieced",
    label: "Paper Pieced",
    kanji: "\u7D19\u7D99",
    description: "Foundation paper piecing technique",
    color: "#4A6741",
  },
  {
    id: "Foundation",
    label: "Foundation",
    kanji: "\u57FA\u790E",
    description: "Foundation-based construction",
    color: "#9A7B4F",
  },
  {
    id: "Custom",
    label: "Custom",
    kanji: "\u81EA\u4F5C",
    description: "Your own creations",
    color: "#3D3D3D",
  },
];

export function getPatternsForCategory(
  categoryId: PatternCategory
): QuiltPattern[] {
  const ids = categoryPatternMap[categoryId] ?? [];
  return ids
    .map((id) => samplePatterns.find((p) => p.id === id))
    .filter((p): p is QuiltPattern => p !== undefined);
}
