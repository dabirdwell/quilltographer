/**
 * Test runner: processes all PDFs in test/pdfs/ through the quilt pattern parser
 * and outputs structured results as JSON.
 *
 * Usage: node test/run-parser-test.mjs
 */

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDir = path.join(__dirname, "pdfs");

// We can't directly import .ts, so we inline-import the compiled logic.
// For testing, we dynamically import the parser source via tsx or replicate the core logic.
// Since we don't have tsx installed, we'll import the parser functions directly
// by transpiling at test time. For now, use a simplified inline approach.

// --- Inline the parser logic for the test script ---
// (In production this would import from the compiled src/lib/pdf-parser)

const KNOWN_TECHNIQUES = [
  "strip piecing", "chain piecing", "foundation paper piecing", "paper piecing",
  "half-square triangle", "quarter-square triangle", "flying geese", "log cabin",
  "inset seam", "y-seam", "appliqué", "applique", "free-motion quilting",
  "rotary cutting", "bias binding", "mitered corner", "mitered border",
  "sashing", "cornerstones", "border", "binding", "basting", "quilting", "pressing",
];

function parseFraction(str) {
  str = str.trim();
  const dec = str.match(/^(\d+(?:\.\d+)?)$/);
  if (dec) return parseFloat(dec[1]);
  const mixed = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const frac = str.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  return null;
}

function extractName(pages) {
  const firstPage = pages[0]?.trim();
  if (firstPage && firstPage.split("\n").length <= 5) {
    const lines = firstPage.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 100) return lines[0];
  }
  for (const page of pages) {
    const m = page.match(/(?:pattern\s*name|project\s*name)\s*:?\s*(.+)/i);
    if (m) return m[1].trim();
  }
  for (const page of pages) {
    const lines = page.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 3 && line.length < 80 && !/^©|^page\s+\d|^http/i.test(line)) return line;
    }
  }
  return null;
}

function extractDesigner(fullText) {
  const patterns = [
    /designed\s+by\s+(.+?)(?:\n|$|for\s)/i,
    /design(?:er)?\s*:?\s*(.+?)(?:\n|$)/i,
    /©\s*\d{4}\s+(.+?)(?:\n|$|all\s+rights)/i,
  ];
  for (const p of patterns) { const m = fullText.match(p); if (m) return m[1].trim(); }
  return null;
}

function extractFinishedSize(fullText) {
  const patterns = [
    /finished\s+(?:quilt\s+)?size\s*(?:of\s+quilt)?\s*:?\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i,
    /dimensions?\s*:?\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i,
    /(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i,
  ];
  for (const pat of patterns) {
    const m = fullText.match(pat);
    if (m) {
      const w = parseFraction(m[1].replace("-", " "));
      const h = parseFraction(m[2].replace("-", " "));
      if (w && h) return { raw: `${m[1]}" x ${m[2]}"`, width: w, height: h };
    }
  }
  return null;
}

function extractBlockSize(fullText) {
  const m = fullText.match(/finished\s+block\s+size\s*:?\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']\s*[x×X]\s*(\d+(?:[- ]\d+\/\d+)?)\s*["″'']/i);
  return m ? `${m[1]}" x ${m[2]}"` : null;
}

function extractSeamAllowance(fullText) {
  const m = fullText.match(/(?:seam\s+allowance|seam\s+allowances)\s+(?:are\s+)?(\d+\/\d+|\d+(?:\.\d+)?)\s*["″'']/i);
  if (m) return `${m[1]}"`;
  if (/1\/4["″'']\s*seam/i.test(fullText) || /¼["″'']\s*seam/i.test(fullText)) return '1/4"';
  if (/include\s+¼["″'']?\s*seam/i.test(fullText) || /include\s+1\/4["″'']?\s*seam/i.test(fullText)) return '1/4"';
  return null;
}

function extractFabricRequirements(fullText) {
  const results = [];
  const pat = /(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*yard(?:s)?\s*(?:\([^)]*\)\s*)?(.+?)(?:\n|$)/gi;
  let m;
  while ((m = pat.exec(fullText)) !== null) {
    const yardStr = m[1].trim();
    let fabric = m[2].trim().replace(/\s*(?:cut\s+|from\s+|,\s*then\s*).*/i, "").trim();
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

function extractCuttingInstructions(fullText) {
  const results = [];
  const section = fullText.match(/cutting\s+(?:instructions|requirements)([\s\S]*?)(?:(?:piecing|assembly|sewing)\s+(?:instructions|steps)|$)/i);
  if (!section) return results;
  const lines = section[1].split("\n");
  let currentFabric = "Unknown";
  for (const line of lines) {
    const fabricMatch = line.match(/(?:from\s+)?(?:kona\s+|C\d+\s+)?([A-Z][a-zA-Z\s]+?)(?:\s*:|\s*$)/);
    if (fabricMatch && !/cut|strip|square/i.test(fabricMatch[1])) {
      currentFabric = fabricMatch[1].trim();
    }
    const cuts = [];
    let cutMatch;
    const lp = /cut\s+(\d+)\s+(strip|square|rectangle|triangle|piece|diamond)s?\s+([^.]+)/gi;
    while ((cutMatch = lp.exec(line)) !== null) {
      cuts.push(`Cut ${cutMatch[1]} ${cutMatch[2]}(s) ${cutMatch[3].trim()}`);
    }
    if (cuts.length > 0) {
      let entry = results.find(r => r.fabric === currentFabric);
      if (!entry) { entry = { fabric: currentFabric, cuts: [] }; results.push(entry); }
      entry.cuts.push(...cuts);
    }
  }
  return results;
}

function extractAssemblySteps(fullText) {
  const steps = [];
  const sp = /step\s+(\d+)\s*:?\s*(.+?)(?=step\s+\d+|$)/gis;
  let m;
  while ((m = sp.exec(fullText)) !== null) {
    const t = m[2].trim().substring(0, 200);
    if (t.length > 10) steps.push(`Step ${m[1]}: ${t}`);
  }
  if (steps.length === 0) {
    const is = fullText.match(/(?:piecing|assembly|sewing)\s+(?:instructions|steps)([\s\S]*?)(?:$)/i);
    if (is) {
      const bullets = is[1].match(/[-•]\s*(.+)/g);
      if (bullets) steps.push(...bullets.slice(0, 10).map(b => b.trim()));
    }
  }
  return steps;
}

function detectTechniques(fullText) {
  const lower = fullText.toLowerCase();
  return KNOWN_TECHNIQUES.filter(t => lower.includes(t.toLowerCase()));
}

function calculateConfidence(result) {
  let score = 0;
  if (result.name) score += 0.1;
  if (result.finishedSize) score += 0.15;
  if (result.blockSize) score += 0.1;
  if (result.seamAllowance) score += 0.05;
  if (result.fabricRequirements.length > 0) score += 0.25 * Math.min(1, result.fabricRequirements.length / 3);
  if (result.cuttingInstructions.length > 0) score += 0.2 * Math.min(1, result.cuttingInstructions.length / 2);
  if (result.assemblySteps.length > 0) score += 0.15 * Math.min(1, result.assemblySteps.length / 3);
  return Math.round(score * 100) / 100;
}

// --- PDF text extraction ---

async function extractPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const doc = await getDocument({ data: new Uint8Array(buf) }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Reconstruct line breaks using Y-position tracking
    let lastY = null;
    let text = "";
    for (const item of content.items) {
      if (item.str === "") continue;
      const y = Math.round(item.transform[5]);
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        text += "\n";
      }
      text += item.str + " ";
      lastY = y;
    }
    pages.push(text.trim());
  }
  return { pages, numPages: doc.numPages };
}

// --- Main ---

const PDF_METADATA = {
  "pixelated-rose.pdf": { source: "Riley Blake Designs", url: "rileyblakedesigns.com" },
  "around-the-block.pdf": { source: "Riley Blake Designs", url: "rileyblakedesigns.com" },
  "yellow-rose-of-texas.pdf": { source: "Riley Blake Designs", url: "rileyblakedesigns.com" },
  "morning-star.pdf": { source: "Robert Kaufman Fabrics", url: "robertkaufman.com" },
  "cobblestone-street.pdf": { source: "Robert Kaufman Fabrics", url: "robertkaufman.com" },
};

async function main() {
  const files = fs.readdirSync(pdfDir).filter(f => f.endsWith(".pdf")).sort();
  const results = [];

  for (const file of files) {
    const filePath = path.join(pdfDir, file);
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Processing: ${file}`);
    console.log("=".repeat(60));

    try {
      const { pages, numPages } = await extractPdfText(filePath);
      const fullText = pages.join("\n\n");

      const parsed = {
        name: extractName(pages),
        designer: extractDesigner(fullText),
        finishedSize: null,
        widthInches: null,
        heightInches: null,
        blockSize: extractBlockSize(fullText),
        seamAllowance: extractSeamAllowance(fullText),
        fabricRequirements: extractFabricRequirements(fullText),
        cuttingInstructions: extractCuttingInstructions(fullText),
        assemblySteps: extractAssemblySteps(fullText),
        techniques: detectTechniques(fullText),
        pageCount: numPages,
        textLength: fullText.length,
        confidence: 0,
        warnings: [],
      };

      const sizeData = extractFinishedSize(fullText);
      if (sizeData) {
        parsed.finishedSize = sizeData.raw;
        parsed.widthInches = sizeData.width;
        parsed.heightInches = sizeData.height;
      }

      // Warnings
      if (fullText.trim().length < 50) parsed.warnings.push("Very little text extracted — PDF may be image-based");
      if (!sizeData) parsed.warnings.push("Could not extract finished quilt size");
      if (parsed.fabricRequirements.length === 0) parsed.warnings.push("No fabric requirements found");
      if (parsed.cuttingInstructions.length === 0) parsed.warnings.push("No cutting instructions parsed");
      if (parsed.assemblySteps.length === 0) parsed.warnings.push("No assembly steps found");
      if (pages.some(p => p.trim().length < 10)) parsed.warnings.push("One or more pages had very little text (likely images/diagrams)");

      parsed.confidence = calculateConfidence(parsed);

      const meta = PDF_METADATA[file] || { source: "Unknown", url: "" };
      results.push({ file, ...meta, parsed });

      // Console output
      console.log(`  Name:            ${parsed.name || "NOT FOUND"}`);
      console.log(`  Designer:        ${parsed.designer || "NOT FOUND"}`);
      console.log(`  Finished Size:   ${parsed.finishedSize || "NOT FOUND"}`);
      console.log(`  Block Size:      ${parsed.blockSize || "NOT FOUND"}`);
      console.log(`  Seam Allowance:  ${parsed.seamAllowance || "NOT FOUND"}`);
      console.log(`  Fabric Reqs:     ${parsed.fabricRequirements.length} found`);
      parsed.fabricRequirements.forEach(f =>
        console.log(`    - ${f.yardage} ${f.fabric}`)
      );
      console.log(`  Cutting Instrs:  ${parsed.cuttingInstructions.length} fabric groups`);
      parsed.cuttingInstructions.forEach(c =>
        console.log(`    - ${c.fabric}: ${c.cuts.length} cuts`)
      );
      console.log(`  Assembly Steps:  ${parsed.assemblySteps.length} found`);
      console.log(`  Techniques:      ${parsed.techniques.join(", ") || "none detected"}`);
      console.log(`  Pages:           ${parsed.pageCount}`);
      console.log(`  Text Length:     ${parsed.textLength} chars`);
      console.log(`  Confidence:      ${(parsed.confidence * 100).toFixed(0)}%`);
      if (parsed.warnings.length > 0) {
        console.log(`  Warnings:`);
        parsed.warnings.forEach(w => console.log(`    ⚠ ${w}`));
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      results.push({
        file,
        ...(PDF_METADATA[file] || { source: "Unknown", url: "" }),
        parsed: null,
        error: err.message,
      });
    }
  }

  // Write JSON results
  const outputPath = path.join(__dirname, "parser-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${outputPath}`);

  return results;
}

main().catch(console.error);
