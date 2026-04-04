# Parser Recommendations

Based on ground truth testing against 5 real quilt pattern PDFs.
Fixes ranked by impact (how many patterns they'd improve).

---

## Critical Fixes (Impact: 4-5 patterns)

### 1. Handle Unicode/Smart Quotes in Dimension Matching

**Impact:** 4 patterns (Morning Star dimensions + seam allowance; Cobblestone Street dimensions)
**Effort:** Low (regex update)

The PDF text extraction produces curly/smart quotes (`\u201C` `\u201D` `\u2018` `\u2019`) instead of straight quotes. The dimension regex `["″'']` needs to also match these characters.

```typescript
// Current (broken on smart quotes)
/(\d+)\s*["″'']\s*[x×X]/

// Fix: add \u201C\u201D\u2018\u2019 to character class
/(\d+)\s*["″''\u201C\u201D\u2018\u2019]\s*[x×X]/
```

This single fix would unlock:
- Morning Star finished size (41" x 49-1/2")
- Morning Star seam allowance (1/4")
- Cobblestone Street dimensions (54" x 69")

### 2. Fix Superscript Fraction Rendering (e.g., "23/4" → "2 3/4")

**Impact:** 4 patterns (all Riley Blake + Around the Block yardage)
**Effort:** Medium (heuristic text preprocessing)

PDF superscript formatting causes "2 3/4" to render as "23/4" in extracted text. This makes the yardage numerically wrong (23/4 = 5.75 instead of 2.75).

**Approach:** Add a preprocessing step that detects likely mangled fractions:
```typescript
// Heuristic: a digit immediately before a fraction where the
// combined value would be unreasonably large for yardage
text = text.replace(/(\d)((\d)\/(\d))/g, (match, whole, frac, num, den) => {
  const combined = parseInt(whole + num) / parseInt(den);
  const separated = parseInt(whole) + parseInt(num) / parseInt(den);
  // If combined > 10 yards (unreasonable), assume it's a separated fraction
  if (combined > 10 && separated < 10) return `${whole} ${frac}`;
  return match;
});
```

### 3. Fix Designer Extraction for "© YEAR Publisher" Lines

**Impact:** 3 patterns (all Riley Blake patterns)
**Effort:** Low (regex update)

The `©` regex captures garbage because it grabs everything after "Riley Blake Designs" on the same line. The regex `(.+?)(?:\n|$)` is too greedy when the copyright and boilerplate are on the same line.

```typescript
// Current (captures trailing text)
/©\s*\d{4}\s+(.+?)(?:\n|$|all\s+rights)/i

// Fix: stop at common delimiters and limit capture length
/©\s*\d{4}\s+(.{3,50}?)(?:\s{2,}|\n|$|all\s+rights|FINISHED|Measurements)/i
```

---

## High-Impact Fixes (Impact: 3 patterns)

### 4. Support Narrative Assembly Instructions (Not Just Numbered Steps)

**Impact:** 3 patterns (Pixelated Rose, Around the Block, Yellow Rose of Texas)
**Effort:** Medium

Riley Blake patterns use a "QUILT ASSEMBLY" section with paragraph-style instructions, not "Step 1:" format. The parser finds 0 assembly steps for these.

**Approach:**
1. Detect "QUILT ASSEMBLY" or "ASSEMBLY INSTRUCTIONS" section headers
2. Split into paragraphs
3. Identify instruction paragraphs (start with "Sew", "Cut", "Press", "Arrange", etc.)
4. Return as ordered steps

```typescript
const assemblySection = fullText.match(
  /(?:QUILT\s+ASSEMBLY|ASSEMBLY\s+INSTRUCTIONS)([\s\S]*?)(?:BORDER|FINISHING|$)/i
);
if (assemblySection) {
  const paragraphs = assemblySection[1].split(/\n\s*\n/);
  for (const p of paragraphs) {
    if (/^(?:sew|cut|press|arrange|lay|pin|trim|repeat)/i.test(p.trim())) {
      steps.push(p.trim().substring(0, 200));
    }
  }
}
```

### 5. Handle "Binding X yard" Format (Fabric Name Before Yardage)

**Impact:** 3 patterns (all Riley Blake patterns)
**Effort:** Low (additional regex)

Riley Blake lists binding as "Binding 5/8 yard" — fabric name FIRST, then yardage. Current regex only matches `yardage + fabric`.

```typescript
// Additional pattern: "FabricName X yard(s)"
const reversePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*yard/gim;
```

### 6. Handle Pattern Name at End of Page

**Impact:** 1 pattern (Morning Star), but improves robustness for all
**Effort:** Medium

Morning Star's name appears at the bottom of page 1, not the top. The current strategy only checks the first lines of each page.

**Approach:** Also check:
- Last line of page 1 (common for cover pages)
- Text in larger font sizes (compare transform matrix scale)
- Repeated text across pages (pattern name often appears as a header/footer)

---

## Medium-Impact Fixes (Impact: 1-2 patterns)

### 7. Parse Comma-Separated Fabric Lists

**Impact:** 1 pattern (Morning Star), but common in industry
**Effort:** Medium

Morning Star lists "1/8 yard Kona Evergreen, Kona Jade Green, Kona Tangerine, ..." — a single yardage shared across multiple comma-separated fabrics. Parser only captures the first.

**Approach:** After matching a yardage line, check if subsequent lines are indented/comma-separated fabric names and associate them with the same yardage.

### 8. Categorize Backing/Batting Separately from Piecing Fabrics

**Impact:** 1 pattern (Morning Star), but important for calculator accuracy
**Effort:** Low

"1 1/2 yards Backing" is currently treated as a piecing fabric. Should be flagged separately.

```typescript
const backingKeywords = ["backing", "batting", "lining"];
// After extracting, categorize:
result.backing = result.fabricRequirements.filter(f =>
  backingKeywords.some(k => f.fabric.toLowerCase().includes(k))
);
```

### 9. Detect Fat Quarter Bundle Requirements

**Impact:** 1 pattern (Around the Block)
**Effort:** Medium

"1 FQ-635-30 Plaid Fat Quarter Bundle" doesn't contain "yard" and is missed entirely. Need a separate regex for pre-cut fabric packs.

```typescript
const precutPattern = /(\d+)\s+(FQ|fat\s+quarter|charm\s+pack|jelly\s+roll|layer\s+cake|ten\s+square)\s+(.+)/gi;
```

### 10. Expand Technique Detection

**Impact:** 2 patterns (Morning Star missing Y-seam, diamond piecing; patterns missing pressing)
**Effort:** Low

Add variants and new techniques:
```typescript
// Add to KNOWN_TECHNIQUES:
"y seam",          // variant without hyphen
"diamond piecing",
"60-degree diamond",
"strip piecing diamonds",
"pressing seams open",
```

---

## Architectural Recommendation

### Consider Hybrid Regex + LLM Approach

The regex parser handles well-structured text reliably but fails on:
- Narrative instructions without consistent formatting
- Unusual layouts (name at bottom of page)
- Ambiguous fabric groupings
- Preview/incomplete PDFs

**Recommendation:** Use the regex parser as a first pass to extract structured fields (dimensions, yardage, cuts), then use an LLM (via the existing OpenAI dependency) to:
1. Validate/correct regex extractions
2. Parse narrative assembly instructions into ordered steps
3. Identify the pattern name from context when regex fails
4. Detect if a PDF is a preview vs. complete pattern

This hybrid approach would likely achieve 90%+ accuracy while keeping API costs low (only call the LLM for fields the regex parser flags as low-confidence).

---

## Priority Implementation Order

| Priority | Fix | Effort | Impact | Patterns Fixed |
|----------|-----|--------|--------|----------------|
| P0 | Unicode quotes in regexes | 30 min | High | Morning Star, Cobblestone |
| P0 | Superscript fraction preprocessing | 1 hr | High | All Riley Blake |
| P0 | Designer extraction fix | 30 min | High | All Riley Blake |
| P1 | Narrative assembly support | 2 hr | High | 3 Riley Blake |
| P1 | Reverse yardage format (binding) | 30 min | Medium | 3 Riley Blake |
| P2 | Name at end-of-page | 1 hr | Medium | Morning Star |
| P2 | Comma-separated fabric lists | 1 hr | Medium | Morning Star |
| P2 | Backing/batting categorization | 30 min | Low | Morning Star |
| P2 | Fat quarter bundle detection | 1 hr | Low | Around the Block |
| P3 | Technique list expansion | 15 min | Low | 2 patterns |
| P3 | Hybrid LLM approach | 4+ hr | Very High | All patterns |

**Estimated time to reach 80% accuracy on these 5 patterns:** ~6 hours (P0 + P1 fixes)
**Estimated time to reach 90%+ accuracy broadly:** Requires hybrid LLM approach
