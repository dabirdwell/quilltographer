export interface QuiltPattern {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  techniques: string[];
  pieceCount: number;
  colorCount: number;
  /** 2D grid of color indices for block preview */
  grid: number[][];
  /** Hex colors mapped by index */
  colors: string[];
}

export const samplePatterns: QuiltPattern[] = [
  {
    id: "nine-patch",
    name: "Nine Patch",
    description:
      "The quintessential beginner block — a simple 3×3 grid of alternating squares. Perfect for learning seam allowances and pressing technique. Makes a bold statement with just two fabrics.",
    difficulty: 1,
    techniques: ["strip piecing", "rotary cutting", "chain piecing"],
    pieceCount: 9,
    colorCount: 2,
    grid: [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ],
    colors: ["#2563eb", "#ffffff"],
  },
  {
    id: "log-cabin",
    name: "Log Cabin",
    description:
      "Concentric strips surround a center square, traditionally red to represent the hearth. Builds outward in a spiral, alternating light and dark sides. A cornerstone of American quilting since the 1860s.",
    difficulty: 2,
    techniques: ["strip piecing", "foundation piecing", "rotary cutting"],
    pieceCount: 13,
    colorCount: 5,
    grid: [
      [4, 4, 4, 4, 4, 4],
      [2, 2, 2, 2, 2, 4],
      [2, 3, 3, 3, 1, 4],
      [2, 3, 0, 1, 1, 4],
      [2, 3, 1, 1, 1, 3],
      [2, 2, 2, 2, 3, 3],
    ],
    colors: ["#dc2626", "#fbbf24", "#92400e", "#1e3a5f", "#7c3aed"],
  },
  {
    id: "flying-geese",
    name: "Flying Geese",
    description:
      "Rectangular units made from one large triangle flanked by two smaller ones, resembling a flock in flight. Versatile building blocks used in borders, sashing, and as standalone rows. Teaches precise triangle math.",
    difficulty: 4,
    techniques: ["half-square triangles", "no-waste method", "chain piecing"],
    pieceCount: 24,
    colorCount: 3,
    grid: [
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
      [1, 2, 2, 2, 1, 1, 2, 2, 2, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
    ],
    colors: ["#059669", "#f5f5f4", "#9333ea"],
  },
  {
    id: "star-block",
    name: "Star Block",
    description:
      "An 8-pointed star formed by half-square triangles around a center square. One of the most recognizable quilt blocks in history. Requires careful pressing to keep points sharp.",
    difficulty: 5,
    techniques: [
      "half-square triangles",
      "quarter-square triangles",
      "point matching",
    ],
    pieceCount: 21,
    colorCount: 3,
    grid: [
      [2, 2, 0, 0, 0, 2, 2],
      [2, 0, 0, 0, 0, 0, 2],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 2],
      [2, 2, 0, 0, 0, 2, 2],
    ],
    colors: ["#dc2626", "#fbbf24", "#ffffff"],
  },
  {
    id: "tumbling-blocks",
    name: "Tumbling Blocks",
    description:
      "A mesmerizing 3D optical illusion created from 60° diamonds in three values — light, medium, and dark. Also called Baby Blocks. Requires Y-seam construction and careful value placement for the dimensional effect.",
    difficulty: 6,
    techniques: ["Y-seams", "diamond cutting", "value placement", "set-in seams"],
    pieceCount: 54,
    colorCount: 3,
    grid: [
      [2, 0, 2, 0, 2, 0],
      [2, 0, 2, 0, 2, 0],
      [1, 2, 1, 2, 1, 2],
      [1, 2, 1, 2, 1, 2],
      [2, 0, 2, 0, 2, 0],
      [2, 0, 2, 0, 2, 0],
      [1, 2, 1, 2, 1, 2],
      [1, 2, 1, 2, 1, 2],
    ],
    colors: ["#fef3c7", "#92400e", "#451a03"],
  },
  {
    id: "storm-at-sea",
    name: "Storm at Sea",
    description:
      "An intricate pattern of squares and diamond-in-a-square units that creates a powerful optical illusion of undulating waves. Despite its complex appearance, it uses only straight-line piecing. A masterclass in value contrast.",
    difficulty: 7,
    techniques: [
      "square-in-a-square",
      "diamond-in-a-square",
      "value gradation",
      "straight-line piecing",
    ],
    pieceCount: 64,
    colorCount: 4,
    grid: [
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [1, 1, 3, 1, 1, 3, 1, 1],
      [2, 2, 1, 0, 0, 1, 2, 2],
      [2, 2, 1, 0, 0, 1, 2, 2],
      [1, 1, 3, 1, 1, 3, 1, 1],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
    ],
    colors: ["#1e3a5f", "#3b82f6", "#93c5fd", "#ffffff"],
  },
  {
    id: "wedding-ring",
    name: "Double Wedding Ring",
    description:
      "Interlocking rings of curved piecing symbolizing eternal love. Traditionally a wedding gift. One of the most challenging classic patterns, requiring precise curved seam technique and careful template work.",
    difficulty: 7,
    techniques: [
      "curved piecing",
      "template cutting",
      "appliqué option",
      "hand piecing",
    ],
    pieceCount: 72,
    colorCount: 4,
    grid: [
      [3, 0, 0, 0, 3, 3, 0, 0, 0, 3],
      [0, 0, 1, 0, 0, 0, 0, 2, 0, 0],
      [0, 1, 3, 1, 0, 0, 2, 3, 2, 0],
      [0, 0, 1, 0, 0, 0, 0, 2, 0, 0],
      [3, 0, 0, 0, 3, 3, 0, 0, 0, 3],
      [3, 0, 0, 0, 3, 3, 0, 0, 0, 3],
      [0, 0, 2, 0, 0, 0, 0, 1, 0, 0],
      [0, 2, 3, 2, 0, 0, 1, 3, 1, 0],
      [0, 0, 2, 0, 0, 0, 0, 1, 0, 0],
      [3, 0, 0, 0, 3, 3, 0, 0, 0, 3],
    ],
    colors: ["#e11d48", "#7c3aed", "#ffffff", "#fef9c3"],
  },
  {
    id: "cathedral-window",
    name: "Cathedral Window",
    description:
      "A folded-fabric technique that creates the appearance of stained glass windows without traditional piecing. The base muslin is folded and stitched, then colorful fabric is inserted into the \"windows.\" No batting or quilting needed.",
    difficulty: 8,
    techniques: [
      "fabric folding",
      "hand stitching",
      "no-batting construction",
      "window insertion",
    ],
    pieceCount: 48,
    colorCount: 5,
    grid: [
      [0, 0, 1, 1, 0, 0, 2, 2],
      [0, 1, 1, 1, 0, 2, 2, 2],
      [1, 1, 0, 0, 2, 2, 0, 0],
      [1, 1, 0, 0, 2, 2, 0, 0],
      [0, 0, 3, 3, 0, 0, 4, 4],
      [0, 3, 3, 3, 0, 4, 4, 4],
      [3, 3, 0, 0, 4, 4, 0, 0],
      [3, 3, 0, 0, 4, 4, 0, 0],
    ],
    colors: ["#f5f5f4", "#dc2626", "#2563eb", "#059669", "#f59e0b"],
  },
  {
    id: "lone-star",
    name: "Lone Star",
    description:
      "A single massive 8-pointed star radiating from the center of the quilt, built from hundreds of precisely cut diamonds arranged in concentric color rings. Also called Star of Bethlehem. Demands exact 1/4\" seams throughout.",
    difficulty: 8,
    techniques: [
      "diamond piecing",
      "Y-seams",
      "strip-pieced diamonds",
      "precision pressing",
    ],
    pieceCount: 128,
    colorCount: 5,
    grid: [
      [4, 4, 4, 0, 1, 0, 4, 4, 4],
      [4, 4, 0, 1, 2, 1, 0, 4, 4],
      [4, 0, 1, 2, 3, 2, 1, 0, 4],
      [0, 1, 2, 3, 3, 3, 2, 1, 0],
      [1, 2, 3, 3, 3, 3, 3, 2, 1],
      [0, 1, 2, 3, 3, 3, 2, 1, 0],
      [4, 0, 1, 2, 3, 2, 1, 0, 4],
      [4, 4, 0, 1, 2, 1, 0, 4, 4],
      [4, 4, 4, 0, 1, 0, 4, 4, 4],
    ],
    colors: ["#fbbf24", "#f59e0b", "#dc2626", "#7f1d1d", "#ffffff"],
  },
  {
    id: "paper-pieced-landscape",
    name: "Paper Pieced Landscape",
    description:
      "A pictorial art quilt depicting a landscape scene through foundation paper piecing. Each section is individually pieced on paper templates for perfect accuracy. Combines sky gradients, mountain silhouettes, and foreground textures.",
    difficulty: 10,
    techniques: [
      "foundation paper piecing",
      "free-motion quilting",
      "thread painting",
      "value gradation",
      "raw-edge appliqué",
    ],
    pieceCount: 200,
    colorCount: 7,
    grid: [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 4, 4, 3, 5, 3, 4, 4, 3, 5],
      [4, 4, 4, 4, 5, 5, 4, 4, 4, 5],
      [4, 6, 4, 6, 5, 5, 4, 6, 4, 5],
      [6, 6, 6, 6, 5, 5, 6, 6, 6, 5],
    ],
    colors: [
      "#93c5fd",
      "#6366f1",
      "#4ade80",
      "#15803d",
      "#92400e",
      "#1a5276",
      "#65a30d",
    ],
  },
];

export function getPatternById(id: string): QuiltPattern | undefined {
  return samplePatterns.find((p) => p.id === id);
}

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "Beginner";
  if (difficulty <= 4) return "Intermediate";
  if (difficulty <= 6) return "Advanced";
  if (difficulty <= 8) return "Expert";
  return "Master";
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (difficulty <= 4) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (difficulty <= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (difficulty <= 8) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}
