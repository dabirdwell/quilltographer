import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ================================================================
   FABRIC STASH STORE — Inventory management for fabrics

   Users can add fabric by photo/color, track yardage, and
   cross-reference against pattern material lists.
   ================================================================ */

export type FabricType = "cotton" | "batting" | "thread" | "backing" | "linen" | "silk" | "flannel" | "other";

export interface FabricSwatch {
  id: string;
  name: string;
  color: string; // hex color
  imageDataUrl?: string; // photo of fabric
  yardage: number; // in yards
  fabricType: FabricType;
  notes?: string;
  addedAt: number; // timestamp
}

export interface StashState {
  swatches: FabricSwatch[];
  addSwatch: (swatch: Omit<FabricSwatch, "id" | "addedAt">) => void;
  removeSwatch: (id: string) => void;
  updateSwatch: (id: string, updates: Partial<FabricSwatch>) => void;
  getSwatchesByType: (type: FabricType) => FabricSwatch[];
  getTotalYardage: (type?: FabricType) => number;
}

export const useStashStore = create<StashState>()(
  persist(
    (set, get) => ({
      swatches: [],

      addSwatch: (swatch) =>
        set((state) => ({
          swatches: [
            ...state.swatches,
            {
              ...swatch,
              id: `stash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              addedAt: Date.now(),
            },
          ],
        })),

      removeSwatch: (id) =>
        set((state) => ({
          swatches: state.swatches.filter((s) => s.id !== id),
        })),

      updateSwatch: (id, updates) =>
        set((state) => ({
          swatches: state.swatches.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      getSwatchesByType: (type) => get().swatches.filter((s) => s.fabricType === type),

      getTotalYardage: (type?) => {
        const swatches = type
          ? get().swatches.filter((s) => s.fabricType === type)
          : get().swatches;
        return swatches.reduce((sum, s) => sum + s.yardage, 0);
      },
    }),
    {
      name: "quiltographer-fabric-stash",
    }
  )
);

/* ================================================================
   STASH MATCHING — Cross-reference materials against stash
   ================================================================ */

export interface StashMatch {
  materialName: string;
  materialQuantity: string;
  status: "have" | "low" | "need";
  matchedSwatch?: FabricSwatch;
  neededYards?: number;
  availableYards?: number;
}

/** Parse a quantity string like "1/2 yard" or "2 yards" into a number */
function parseYardage(quantity: string): number | null {
  const cleaned = quantity.toLowerCase().replace(/yards?/, "").trim();
  // Handle fractions like "1/2"
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  }
  // Handle mixed like "1 1/2"
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }
  // Handle plain numbers
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function matchMaterialsToStash(
  materials: { name: string; quantity: string }[],
  swatches: FabricSwatch[]
): StashMatch[] {
  return materials.map((m) => {
    const neededYards = parseYardage(m.quantity);

    // Try to find a matching swatch by name similarity
    const normalized = m.name.toLowerCase();
    const matched = swatches.find((s) => {
      const swatchName = s.name.toLowerCase();
      return (
        swatchName.includes(normalized) ||
        normalized.includes(swatchName) ||
        normalized.includes(s.fabricType)
      );
    });

    if (!matched || neededYards === null) {
      return {
        materialName: m.name,
        materialQuantity: m.quantity,
        status: "need" as const,
        neededYards: neededYards ?? undefined,
      };
    }

    const availableYards = matched.yardage;
    let status: "have" | "low" | "need";
    if (availableYards >= neededYards) {
      status = "have";
    } else if (availableYards >= neededYards * 0.5) {
      status = "low";
    } else {
      status = "need";
    }

    return {
      materialName: m.name,
      materialQuantity: m.quantity,
      status,
      matchedSwatch: matched,
      neededYards,
      availableYards,
    };
  });
}
