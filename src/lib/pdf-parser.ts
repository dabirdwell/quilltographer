/**
 * Quilt Pattern PDF Parser
 *
 * Extracts structured data from quilt pattern PDFs using text extraction
 * and regex-based pattern matching. Designed for common free quilt patterns
 * from manufacturers like Riley Blake, Robert Kaufman, Moda, etc.
 */

export interface FabricRequirement {
  fabric: string;
  yardage: string;
  /** Parsed numeric yards, null if unparseable */
  yardsNumeric: number | null;
}

export interface CuttingInstruction {
  fabric: string;
  cuts: string[];
}

export interface ParsedQuiltPattern {
  /** Pattern name extracted from PDF */
  name: string | null;
  /** Source / designer */
  designer: string | null;
  /** Finished quilt dimensions, e.g. "66\" x 78\"" */
  finishedSize: string | null;
  /** Parsed width in inches */
  widthInches: number | null;
  /** Parsed height in inches */
  heightInches: number | null;
  /** Finished block size, e.g. "12\" x 12\"" */
  blockSize: string | null;
  /** Seam allowance mentioned */
  seamAllowance: string | null;
  /** Fabric requirements list */
  fabricRequirements: FabricRequirement[];
  /** Cutting instructions */
  cuttingInstructions: CuttingInstruction[];
  /** Assembly/piecing steps (raw text) */
  assemblySteps: string[];
  /** Techniques detected */
  techniques: string[];
  /** Raw page count */
  pageCount: number;
  /** Total extracted text length */
  textLength: number;
  /** Confidence score 0-1 */
  confidence: number;
  /** Warnings/issues encountered */
  warnings: string[];
}

// Known quilting techniques to detect
const KNOWN_TECHNIQUES = [
  "strip piecing",
  "chain piecing",
  "foundation paper piecing",
  "paper piecing",
  "half-square triangle",
  "quarter-square triangle",
  "flying geese",
  "log cabin",
  "inset seam",
  "y-seam",
  "appliqué",
  "applique",
  "free-motion quilting",
  "rotary cutting",
  "bias binding",
  "mitered corner",
  "mitered border",
  "sashing",
  "cornerstones",
  "border",
  "binding",
  "basting",
  "quilting",
  "pressing",
];

/**
 * Parse a fraction string like "2 3/4" or "1/2" into a number
 */
function parseFraction(str: string): number | null {
  str = str.trim();

  // Pure decimal
  const decMatch = str.match(/^(\d+(?:\.\d+)?)$/);
  if (decMatch) return parseFloat(decMatch[1]);

  // Mixed fraction: "2 3/4"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  // Simple fraction: "3/4"
  const fracMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    return parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
  }

  return null;
}

/**
 * Parse yardage string like "2 3/4 yards" or "1/2 yard"
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseYardage(str: string): number | null {
  // Match patterns like "2 3/4 yard" or "1/2 yard" or "2.5 yards"
  const match = str.match(/(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*yard/i);
  if (match) return parseFraction(match[1]);

  // Match bare fractions before fabric names
  const bare = str.match(/^(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s/);
  if (bare) return parseFraction(bare[1]);

  return null;
}

/**
 * Extract pattern name from text
 */
function extractName(pages: string[]): string | null {
  // Often the first page has just the name in large text
  const firstPage = pages[0]?.trim();
  if (firstPage && firstPage.split("\n").length <= 5) {
    // First page is likely a cover page with just the name
    const lines = firstPage.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 100) {
      return lines[0];
    }
  }

  // Look for pattern name in headers
  for (const page of pages) {
    const nameMatch = page.match(/(?:pattern\s*name|project\s*name)\s*:?\s*(.+)/i);
    if (nameMatch) return nameMatch[1].trim();
  }

  // Fall back to first meaningful line of text
  for (const page of pages) {
    const lines = page.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 3 && line.length < 80 && !/^©|^page\s+\d|^http/i.test(line)) {
        return line;
      }
    }
  }

  return null;
}

/**
 * Extract designer/source
 */
function extractDesigner(fullText: string): string | null {
  const patterns = [
    /designed\s+by\s+(.+?)(?:\n|$|for\s)/i,
    /design(?:er)?\s*:?\s*(.+?)(?:\n|$)/i,
    /©\s*\d{4}\s+(.+?)(?:\n|$|all\s+rights)/i,
  ];

  for (const pat of patterns) {
    const match = fullText.match(pat);
    if (match) return match[1].trim();
  }

  return null;
}

/**
 * Extract finished quilt size
 */
function extractFinishedSize(fullText: string): { raw: string; width: number; height: number } | null {
  // Match patterns like: FINISHED QUILT SIZE 66" X 78"
  // or: Finished size of quilt: 41" x 49-1/2"
  // or: Dimensions: 54" x 69"
  const patterns = [
    /finished\s+(?:quilt\s+)?size\s*(?:of\s+quilt)?\s*:?\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i,
    /dimensions?\s*:?\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i,
    /(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i,
  ];

  for (const pat of patterns) {
    const match = fullText.match(pat);
    if (match) {
      const wStr = match[1].replace("-", " ");
      const hStr = match[2].replace("-", " ");
      const w = parseFraction(wStr);
      const h = parseFraction(hStr);
      if (w && h) {
        return {
          raw: `${match[1]}" x ${match[2]}"`,
          width: w,
          height: h,
        };
      }
    }
  }

  return null;
}

/**
 * Extract finished block size
 */
function extractBlockSize(fullText: string): string | null {
  const match = fullText.match(
    /finished\s+block\s+size\s*:?\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i
  );
  if (match) return `${match[1]}" x ${match[2]}"`;
  return null;
}

/**
 * Extract seam allowance
 */
function extractSeamAllowance(fullText: string): string | null {
  const match = fullText.match(
    /(?:seam\s+allowance|seam\s+allowances)\s+(?:are\s+)?(\d+\/\d+|\d+(?:\.\d+)?)\s*["″'']/i
  );
  if (match) return `${match[1]}"`;

  // Check for common mention
  if (/1\/4["″'']\s*seam/i.test(fullText) || /¼["″'']\s*seam/i.test(fullText)) {
    return '1/4"';
  }
  if (/include\s+¼["″'']?\s*seam/i.test(fullText) || /include\s+1\/4["″'']?\s*seam/i.test(fullText)) {
    return '1/4"';
  }

  return null;
}

/**
 * Extract fabric requirements
 */
function extractFabricRequirements(fullText: string): FabricRequirement[] {
  const results: FabricRequirement[] = [];

  // Pattern 1: "3/4 yard (70 cm) C120 Petal Pink"
  // Pattern 2: "1 1/2 yards Kona Natural"
  // Pattern 3: "1/8 yard Kona Evergreen"
  const yardagePattern =
    /(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*yard(?:s)?\s*(?:\([^)]*\)\s*)?(.+?)(?:\n|$)/gi;

  let match;
  while ((match = yardagePattern.exec(fullText)) !== null) {
    const yardStr = match[1].trim();
    let fabric = match[2].trim();

    // Clean up fabric name - remove trailing instructions
    fabric = fabric.replace(/\s*(?:cut\s+|from\s+|,\s*then\s*).*/i, "").trim();

    if (fabric.length > 0 && fabric.length < 100) {
      results.push({
        fabric,
        yardage: `${yardStr} yard${yardStr === "1" ? "" : "s"}`,
        yardsNumeric: parseFraction(yardStr),
      });
    }
  }

  return results;
}

/**
 * Extract cutting instructions
 */
function extractCuttingInstructions(fullText: string): CuttingInstruction[] {
  const results: CuttingInstruction[] = [];

  // Find the cutting section
  const cuttingSection = fullText.match(
    /cutting\s+(?:instructions|requirements)([\s\S]*?)(?:(?:piecing|assembly|sewing)\s+(?:instructions|steps)|$)/i
  );

  if (!cuttingSection) return results;

  const section = cuttingSection[1];

  // Parse "Cut X strips Y" x WOF" patterns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cutPattern =
    /cut\s+(\d+)\s+(strip|square|rectangle|triangle|piece|diamond)s?\s+(\d+(?:[- ]\d+\/\d+|\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+|\/\d+)?|WOF)\s*["″'']?/gi;

  let currentFabric = "Unknown";
  const lines = section.split("\n");

  for (const line of lines) {
    // Check if this line names a fabric
    const fabricMatch = line.match(
      /(?:from\s+)?(?:kona\s+|C\d+\s+)?([A-Z][a-zA-Z\s]+?)(?:\s*:|\s*$)/
    );
    if (fabricMatch && !/cut|strip|square/i.test(fabricMatch[1])) {
      currentFabric = fabricMatch[1].trim();
    }

    // Check for cut instructions
    const cuts: string[] = [];
    let cutMatch;
    const linePattern =
      /cut\s+(\d+)\s+(strip|square|rectangle|triangle|piece|diamond)s?\s+([^.]+)/gi;
    while ((cutMatch = linePattern.exec(line)) !== null) {
      cuts.push(`Cut ${cutMatch[1]} ${cutMatch[2]}(s) ${cutMatch[3].trim()}`);
    }

    if (cuts.length > 0) {
      // Find or create entry for this fabric
      let entry = results.find((r) => r.fabric === currentFabric);
      if (!entry) {
        entry = { fabric: currentFabric, cuts: [] };
        results.push(entry);
      }
      entry.cuts.push(...cuts);
    }
  }

  return results;
}

/**
 * Extract assembly steps
 */
function extractAssemblySteps(fullText: string): string[] {
  const steps: string[] = [];

  // Look for numbered steps: "Step 1:", "Step 2:", etc.
  const stepPattern = /step\s+(\d+)\s*:?\s*(.+?)(?=step\s+\d+|$)/gi;
  let match;
  while ((match = stepPattern.exec(fullText)) !== null) {
    const stepText = match[2].trim().substring(0, 200);
    if (stepText.length > 10) {
      steps.push(`Step ${match[1]}: ${stepText}`);
    }
  }

  // If no numbered steps, look for bullet-pointed instructions
  if (steps.length === 0) {
    const instrSection = fullText.match(
      /(?:piecing|assembly|sewing)\s+(?:instructions|steps)([\s\S]*?)(?:$)/i
    );
    if (instrSection) {
      const bullets = instrSection[1].match(/[-•]\s*(.+)/g);
      if (bullets) {
        steps.push(...bullets.slice(0, 10).map((b) => b.trim()));
      }
    }
  }

  return steps;
}

/**
 * Detect quilting techniques mentioned in the text
 */
function detectTechniques(fullText: string): string[] {
  const lower = fullText.toLowerCase();
  return KNOWN_TECHNIQUES.filter((tech) => lower.includes(tech.toLowerCase()));
}

/**
 * Calculate confidence score based on how much data was extracted
 */
function calculateConfidence(result: ParsedQuiltPattern): number {
  let score = 0;
  const weights = {
    name: 0.1,
    finishedSize: 0.15,
    blockSize: 0.1,
    fabricRequirements: 0.25,
    cuttingInstructions: 0.2,
    assemblySteps: 0.15,
    seamAllowance: 0.05,
  };

  if (result.name) score += weights.name;
  if (result.finishedSize) score += weights.finishedSize;
  if (result.blockSize) score += weights.blockSize;
  if (result.seamAllowance) score += weights.seamAllowance;
  if (result.fabricRequirements.length > 0) {
    score += weights.fabricRequirements * Math.min(1, result.fabricRequirements.length / 3);
  }
  if (result.cuttingInstructions.length > 0) {
    score += weights.cuttingInstructions * Math.min(1, result.cuttingInstructions.length / 2);
  }
  if (result.assemblySteps.length > 0) {
    score += weights.assemblySteps * Math.min(1, result.assemblySteps.length / 3);
  }

  return Math.round(score * 100) / 100;
}

/**
 * Main parser: takes extracted page texts and returns structured data
 */
export function parseQuiltPattern(pages: string[]): ParsedQuiltPattern {
  const warnings: string[] = [];
  const fullText = pages.join("\n\n");

  if (fullText.trim().length < 50) {
    warnings.push("Very little text extracted — PDF may be image-based");
  }

  const name = extractName(pages);
  const designer = extractDesigner(fullText);
  const sizeData = extractFinishedSize(fullText);
  const blockSize = extractBlockSize(fullText);
  const seamAllowance = extractSeamAllowance(fullText);
  const fabricRequirements = extractFabricRequirements(fullText);
  const cuttingInstructions = extractCuttingInstructions(fullText);
  const assemblySteps = extractAssemblySteps(fullText);
  const techniques = detectTechniques(fullText);

  // Validation warnings
  if (!sizeData) warnings.push("Could not extract finished quilt size");
  if (fabricRequirements.length === 0) warnings.push("No fabric requirements found");
  if (cuttingInstructions.length === 0) warnings.push("No cutting instructions parsed");
  if (assemblySteps.length === 0) warnings.push("No assembly steps found");
  if (pages.some((p) => p.trim().length < 10)) {
    warnings.push("One or more pages had very little text (may contain images/diagrams only)");
  }

  const result: ParsedQuiltPattern = {
    name,
    designer,
    finishedSize: sizeData?.raw ?? null,
    widthInches: sizeData?.width ?? null,
    heightInches: sizeData?.height ?? null,
    blockSize,
    seamAllowance,
    fabricRequirements,
    cuttingInstructions,
    assemblySteps,
    techniques,
    pageCount: pages.length,
    textLength: fullText.length,
    confidence: 0,
    warnings,
  };

  result.confidence = calculateConfidence(result);

  return result;
}
