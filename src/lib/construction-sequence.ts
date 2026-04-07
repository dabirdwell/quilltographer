/**
 * Construction Sequence Intelligence
 *
 * Detects steps where order is critically important and flags them
 * with a warning to help quilters avoid costly mistakes.
 */

const SEQUENCE_PATTERNS = [
  /\bbefore\s+(moving|proceeding|continuing|going|sewing|cutting)/i,
  /\bafter\s+(completing|finishing|sewing|pressing|cutting)/i,
  /\bmust\s+be\s+(completed|done|finished|sewn|pressed)\s+(before|prior|first)/i,
  /\bdo\s+not\s+(skip|proceed|move\s+on|continue)/i,
  /\bimportant\s*:/i,
  /\bcritical\s*:/i,
  /\bin\s+this\s+(exact\s+)?order/i,
  /\bpress\s+before/i,
  /\bmake\s+sure\b.*\bbefore/i,
  /\bfirst,?\s+(you\s+)?must/i,
  /\bsequence\s+matters/i,
  /\border\s+(is\s+)?(important|critical|essential)/i,
  /\bskipping\s+(ahead|this)\s+(may|will|could)\s+(cause|result)/i,
];

const CRITICAL_KEYWORDS = [
  "press seams",
  "nesting seams",
  "nest",
  "join rows",
  "square up",
  "attach border",
  "y-seam",
  "set-in",
  "inset",
  "mitered",
  "binding",
  "basting",
  "remove the paper",
  "partial seam",
];

export interface SequenceFlag {
  isCritical: boolean;
  warning: string;
}

const DEFAULT_WARNING =
  "Important: complete this step before moving to the next \u2014 skipping ahead may cause issues with your seams or alignment.";

/**
 * Analyze a step's text for sequence-critical language.
 * Also accepts a pre-flagged `isSequenceCritical` from the step data.
 */
export function analyzeStepSequence(
  stepText: string,
  preFlagged?: boolean
): SequenceFlag {
  if (preFlagged) {
    return { isCritical: true, warning: DEFAULT_WARNING };
  }

  for (const pattern of SEQUENCE_PATTERNS) {
    if (pattern.test(stepText)) {
      return { isCritical: true, warning: DEFAULT_WARNING };
    }
  }

  const lower = stepText.toLowerCase();
  for (const kw of CRITICAL_KEYWORDS) {
    if (lower.includes(kw)) {
      return { isCritical: true, warning: DEFAULT_WARNING };
    }
  }

  return { isCritical: false, warning: "" };
}
