# Ground Truth: PDF Parser vs 5 Real Quilt Patterns

Tested: 2026-04-04
Parser: `src/lib/pdf-parser.ts` (regex-based text extraction via pdfjs-dist)

## Summary

| # | Pattern | Source | Pages | Confidence | Verdict |
|---|---------|--------|-------|------------|---------|
| 1 | Pixelated Rose | Riley Blake Designs | 3 | 85% | **PARTIAL** |
| 2 | Around the Block | Riley Blake Designs | 4 | 85% | **PARTIAL** |
| 3 | Yellow Rose of Texas | Riley Blake Designs | 3 | 85% | **PARTIAL** |
| 4 | Morning Star | Robert Kaufman Fabrics | 4 | 70% | **PARTIAL** |
| 5 | Cobblestone Street | Robert Kaufman Fabrics | 1 | 10% | **FAIL** |

**Overall: 0/5 fully correct. 4/5 partially usable. 1/5 total failure.**

---

## Detailed Results Per Pattern

### 1. Pixelated Rose (Riley Blake Designs)

**Source PDF:** `test/pdfs/pixelated-rose.pdf` (3 pages, 438KB)

| Field | Expected (Human) | Parser Output | Status |
|-------|-------------------|---------------|--------|
| Name | Pixelated Rose | Pixelated Rose | PASS |
| Designer | Riley Blake Designs | "s" | FAIL |
| Finished Size | 66" x 78" | 66" x 78" | PASS |
| Block Size | 12" x 12" | 12" x 12" | PASS |
| Seam Allowance | 1/4" | 1/4" | PASS |
| Fabric Requirements | 8 fabrics + binding | 9 found (1 spurious) | PARTIAL |
| Cutting Instructions | 3 fabric groups, 10 cut lines | 3 groups, 9 cuts | PARTIAL |
| Assembly Steps | Narrative block/strip assembly | 0 found | FAIL |
| Techniques | border, binding, quilting, pressing | border, binding, quilting | PARTIAL |

**Fabric Requirements Detail:**

| Expected | Parsed | Status |
|----------|--------|--------|
| 3/4 yard C120 Petal Pink | 3/4 yards C120 Petal Pink | PASS |
| 1/2 yard C120 Peony | 1/2 yards C120 Peony | PASS |
| 3/8 yard C120 Rose | 3/8 yards C120 Rose | PASS |
| 3/8 yard C120 Raspberry | 3/8 yards C120 Raspberry | PASS |
| 2 3/4 yards C120 Riley White | 23/4 yards C120 Riley White | PARTIAL (superscript mangled) |
| 5/8 yard C120 Sweet Pea | 5/8 yards C120 Sweet Pea | PASS |
| 5/8 yard C120 Grass | 5/8 yards C120 Grass | PASS |
| 1/2 yard C120 Treetop | 1/2 yards C120 Treetop | PASS |
| 5/8 yard Binding | 5/8 yards CUTTING REQUIREMENTS | FAIL (grabbed next section header) |

**Failure Modes:**
- Designer: `©2016 Riley Blake Designs` on same line as copyright symbol, regex captures just "s" after greedily matching
- Binding yardage: "Binding 5/8 yard" has fabric name BEFORE yardage, breaking the `yardage + fabric` regex
- Superscript "2 3/4" renders as "23/4" in PDF text (no space between whole and fraction)
- Assembly: Riley Blake uses narrative paragraphs ("This quilt is assembled in blocks..."), not numbered "Step N" format

---

### 2. Around the Block (Riley Blake Designs)

**Source PDF:** `test/pdfs/around-the-block.pdf` (4 pages, 623KB)

| Field | Expected (Human) | Parser Output | Status |
|-------|-------------------|---------------|--------|
| Name | Around the Block | AROUND THE BLOCK | PASS |
| Designer | Riley Blake Designs | "s 1" | FAIL |
| Finished Size | 68" x 86" | 68" x 86" | PASS |
| Block Size | 16" x 16" | 16" x 16" | PASS |
| Seam Allowance | 1/4" | 1/4" | PASS |
| Fabric Requirements | 1 FQ bundle + 3 fabrics | 3 found (FQ bundle missed) | PARTIAL |
| Cutting Instructions | 4+ fabric groups | 3 groups, 9 cuts | PARTIAL |
| Assembly Steps | Block assembly + quilt assembly narrative | 0 found | FAIL |
| Techniques | sashing, cornerstones, border, binding | sashing, border, binding, quilting | PARTIAL |

**Fabric Requirements Detail:**

| Expected | Parsed | Status |
|----------|--------|--------|
| 1 FQ-635-30 Plaid Fat Quarter Bundle | Not detected | FAIL |
| 1 5/8 yards C635 Red Buffalo Check (Border) | 15/8 yards C635 Red Buffalo Check (Border) | PARTIAL (superscript) |
| 2 1/2 yards C637 Tan Houndstooth (Sashing) | 21/2 yards C637 Tan Houndstooth (Sashing) | PARTIAL (superscript) |
| 3/4 yard C639 Red Tweed (Binding) | 3/4 yards C639 Red Tweed (Binding) | PASS |

**Failure Modes:**
- Designer: Same `©` regex issue as Pixelated Rose
- Fat Quarter Bundle: "1 FQ-635-30 Plaid Fat Quarter Bundle" doesn't contain "yard" so regex misses it
- Superscript fractions: "15/8" should be "1 5/8", "21/2" should be "2 1/2"
- Assembly: Uses "QUILT ASSEMBLY" section with Unit-based narrative, not numbered steps
- Cornerstones technique: mentioned as "posts" in the pattern, not matched

---

### 3. Yellow Rose of Texas (Riley Blake Designs)

**Source PDF:** `test/pdfs/yellow-rose-of-texas.pdf` (3 pages, 442KB)

| Field | Expected (Human) | Parser Output | Status |
|-------|-------------------|---------------|--------|
| Name | Yellow Rose of Texas | yellow Rose of Texas | PASS (case issue from PDF) |
| Designer | Riley Blake Designs | "s" | FAIL |
| Finished Size | 66" x 78" | 66" x 78" | PASS |
| Block Size | 12" x 12" | 12" x 12" | PASS |
| Seam Allowance | 1/4" | 1/4" | PASS |
| Fabric Requirements | 8 fabrics + binding | 9 found (1 spurious) | PARTIAL |
| Cutting Instructions | 3 fabric groups | 3 groups, 9 cuts | PARTIAL |
| Assembly Steps | Narrative assembly | 0 found | FAIL |
| Techniques | border, binding, quilting, pressing | border, binding, quilting | PARTIAL |

**Same template as Pixelated Rose — identical failure modes.**

---

### 4. Morning Star (Robert Kaufman Fabrics)

**Source PDF:** `test/pdfs/morning-star.pdf` (4 pages, 302KB)

| Field | Expected (Human) | Parser Output | Status |
|-------|-------------------|---------------|--------|
| Name | Morning Star | "Featuring" | FAIL |
| Designer | Cortney Heimerl | Cortney Heimerl | PASS |
| Finished Size | 41" x 49-1/2" | NOT FOUND | FAIL |
| Block Size | N/A (single star) | NOT FOUND | N/A |
| Seam Allowance | 1/4" | NOT FOUND | FAIL |
| Fabric Requirements | 10 fabrics + backing + batting | 5 found (3 correct, 2 spurious) | PARTIAL |
| Cutting Instructions | Complex diamond/strip cutting | 4 groups (partially correct) | PARTIAL |
| Assembly Steps | 5 major steps with sub-steps | 9 found | PASS |
| Techniques | inset seam, Y-seam, diamond piecing, pressing | inset seam | PARTIAL |

**Fabric Requirements Detail:**

| Expected | Parsed | Status |
|----------|--------|--------|
| 1 1/2 yards Kona Natural | 1 1/2 yards Kona Natural | PASS |
| 1/2 yard Kona Pool | 1/2 yards Kona Pool | PASS |
| 1/8 yard each: Evergreen, Jade Green, Tangerine, Blush Pink, Lilac, Petal, Banana, Pear | 1/8 yards Kona Evergreen, | PARTIAL (only first of comma-separated list) |
| 1 1/2 yards Backing | 1 1/2 yards Backing | PASS (but should be flagged as backing, not fabric) |
| Crib-sized Batting | Not detected | N/A |
| (spurious) | 1/8 yards cuts of Kona: | FAIL (false positive) |

**Failure Modes:**
- Name: Pattern name "Morning Star" appears at the BOTTOM of page 1, not the top. First meaningful line is "Featuring"
- Finished size: Uses curly/smart quotes ("41\u201D x 49-1/2\u201D") — regex only matches straight quotes `"`
- Seam allowance: Same curly quote issue — "1/4\u201D" not matching `["″'']`
- Comma-separated fabrics: "1/8 yard Kona Evergreen, Kona Jade Green, ..." — parser only gets the first one
- Backing/batting: Should be categorized separately from piecing fabrics
- Y-seam: Mentioned as "Y seam" but technique list has "y-seam" (hyphenated)
- 60-degree diamond cutting: Not in the technique list

---

### 5. Cobblestone Street (Robert Kaufman Fabrics)

**Source PDF:** `test/pdfs/cobblestone-street.pdf` (1 page, 1.4MB)

| Field | Expected (Human) | Parser Output | Status |
|-------|-------------------|---------------|--------|
| Name | Cobblestone Street | Cobblestone Street | PASS |
| Designer | Robert Kaufman Fabrics | Robert Kaufman Fabrics | PASS |
| Finished Size | 54" x 69" | NOT FOUND | FAIL |
| Block Size | N/A | NOT FOUND | N/A |
| Seam Allowance | N/A | NOT FOUND | N/A |
| Fabric Requirements | N/A (preview only) | 0 found | N/A |
| Cutting Instructions | N/A (preview only) | 0 found | N/A |
| Assembly Steps | N/A (preview only) | 0 found | N/A |

**This PDF is a PREVIEW PAGE, not a full pattern.** It says "FREE pattern available for download September 2026." Only 265 characters of extractable text. The 1.4MB file size is entirely images.

**Failure Mode:** This represents a real-world scenario where users will upload incomplete/preview PDFs. The parser correctly identifies it as low-confidence (10%) but fails to extract the dimensions that ARE present in the text. The "Dimensions: 54" x 69"" line uses a format the regex should handle, but likely has unicode quote characters preventing the match.

---

## Aggregate Scorecard

| Field | Patterns Tested | Correct | Partial | Failed | Accuracy |
|-------|----------------|---------|---------|--------|----------|
| Name | 5 | 3 | 1* | 1 | 60% |
| Designer | 5 | 2 | 0 | 3 | 40% |
| Finished Size | 5 | 3 | 0 | 2 | 60% |
| Block Size | 4** | 3 | 0 | 1 | 75% |
| Seam Allowance | 4** | 3 | 0 | 1 | 75% |
| Fabric Requirements | 4** | 0 | 4 | 0 | 0% exact |
| Cutting Instructions | 4** | 0 | 4 | 0 | 0% exact |
| Assembly Steps | 4** | 1 | 0 | 3 | 25% |

\* Yellow Rose has lowercase 'y' from PDF extraction
\** Cobblestone Street excluded (preview only, not a full pattern)

### Key Metrics
- **Fields fully correct across all 5 patterns:** 0/8 categories at 100%
- **Best performing:** Block size (75%), Seam allowance (75%)
- **Worst performing:** Fabric requirements (0% exact), Assembly steps (25%)
- **Average confidence score:** 67% (excluding Cobblestone)
