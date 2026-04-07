"use client";

import { useState } from "react";

/* ================================================================
   QUICK REFERENCE CARDS

   Tappable reference cards with quilting knowledge:
   - 50+ abbreviations
   - Seam allowance ruler
   - Fabric grain direction
   - Pressing vs ironing
   - Common block sizes and their math

   Appears as a slide-up panel accessible from any page.
   ================================================================ */

// --- Data ---

const ABBREVIATIONS: { abbr: string; full: string; note?: string }[] = [
  { abbr: "RST", full: "Right Sides Together", note: "Place fabric pieces with printed/right sides facing each other" },
  { abbr: "WST", full: "Wrong Sides Together", note: "Place fabric pieces with wrong sides facing each other" },
  { abbr: "WOF", full: "Width of Fabric", note: "The full width of fabric from selvage to selvage (usually 42-44\")" },
  { abbr: "LOF", full: "Length of Fabric", note: "Along the lengthwise grain, parallel to the selvage" },
  { abbr: "HST", full: "Half Square Triangle", note: "A square made of two right triangles" },
  { abbr: "QST", full: "Quarter Square Triangle", note: "A square made of four triangles" },
  { abbr: "FPP", full: "Foundation Paper Piecing", note: "Sewing fabric to a paper template for precision" },
  { abbr: "EPP", full: "English Paper Piecing", note: "Hand-sewing fabric around paper templates" },
  { abbr: "SA", full: "Seam Allowance", note: "The fabric between the stitch line and the raw edge (usually 1/4\")" },
  { abbr: "FQ", full: "Fat Quarter", note: "An 18\" × 22\" cut of fabric (half yard cut in half again)" },
  { abbr: "FE", full: "Fat Eighth", note: "A 9\" × 22\" cut of fabric" },
  { abbr: "WIP", full: "Work in Progress", note: "An unfinished quilting project" },
  { abbr: "UFO", full: "Un-Finished Object", note: "A project set aside before completion" },
  { abbr: "PHD", full: "Projects Half Done", note: "Affectionate term for multiple unfinished quilts" },
  { abbr: "QAYG", full: "Quilt As You Go", note: "Quilting blocks individually before joining them" },
  { abbr: "BOM", full: "Block of the Month", note: "A pattern program releasing one block per month" },
  { abbr: "ROW", full: "Row of the Month", note: "A pattern program releasing one row per month" },
  { abbr: "QOV", full: "Quilts of Valor", note: "Charity making quilts for service members" },
  { abbr: "DSM", full: "Domestic Sewing Machine", note: "A standard home sewing machine" },
  { abbr: "LAQ", full: "Long Arm Quilter", note: "Professional quilting service or the machine used" },
  { abbr: "HQ", full: "Hand Quilted", note: "Quilted entirely by hand" },
  { abbr: "MQ", full: "Machine Quilted", note: "Quilted using a sewing machine" },
  { abbr: "FMQ", full: "Free Motion Quilting", note: "Moving fabric freely under the needle for custom designs" },
  { abbr: "SID", full: "Stitch in the Ditch", note: "Quilting right in the seam line" },
  { abbr: "EQ", full: "Electric Quilt (software)", note: "Popular quilt design software" },
  { abbr: "LQS", full: "Local Quilt Shop", note: "Your neighborhood fabric/quilting store" },
  { abbr: "FLQS", full: "Favorite Local Quilt Shop", note: "Everyone has one!" },
  { abbr: "OBW", full: "One Block Wonder", note: "Quilt made from kaleidoscope cuts of a single large print" },
  { abbr: "SAS", full: "Sew and Slash", note: "Technique of sewing then cutting to create designs" },
  { abbr: "JJ", full: "Jelly Roll Jam", note: "A quilt pattern made entirely from jelly roll strips" },
  { abbr: "WISP", full: "Work in Slow Progress", note: "A project being worked on very gradually" },
  { abbr: "BTQ", full: "Between the Quilts", note: "Time spent on non-quilting activities" },
  { abbr: "CN", full: "Charm Pack (5\" squares)", note: "Pre-cut 5\" × 5\" fabric squares" },
  { abbr: "JR", full: "Jelly Roll (2.5\" strips)", note: "Pre-cut 2.5\" × WOF fabric strips" },
  { abbr: "LC", full: "Layer Cake (10\" squares)", note: "Pre-cut 10\" × 10\" fabric squares" },
  { abbr: "TP", full: "Turnovers (6\" triangles)", note: "Pre-cut 6\" right triangles" },
  { abbr: "HP", full: "Honey Bun (1.5\" strips)", note: "Pre-cut 1.5\" × WOF fabric strips" },
  { abbr: "DS", full: "Dessert Roll (5\" strips)", note: "Pre-cut 5\" × WOF fabric strips" },
  { abbr: "PP", full: "Paper Piecing", note: "General term for sewing on a paper foundation" },
  { abbr: "RSR", full: "Rotary Straight Ruler", note: "Standard quilting ruler for cutting straight lines" },
  { abbr: "BC", full: "Background Color", note: "The background fabric of a quilt block" },
  { abbr: "MC", full: "Main Color", note: "The primary/feature fabric" },
  { abbr: "CC", full: "Coordinating Color", note: "A secondary fabric that complements the main" },
  { abbr: "AC", full: "Accent Color", note: "A pop of contrasting color" },
  { abbr: "SKD", full: "Stash Killin' Day", note: "Day dedicated to using fabric from your stash" },
  { abbr: "SEW", full: "Stash Enhancement Weekend", note: "Buying more fabric (definitely needed)" },
  { abbr: "LHS", full: "Left Hand Side", note: "Direction reference for block assembly" },
  { abbr: "RHS", full: "Right Hand Side", note: "Direction reference for block assembly" },
  { abbr: "SQ", full: "Square Up", note: "Trim a block to exact size with a ruler" },
  { abbr: "P2P", full: "Point to Point", note: "Quilting from one design point to the next" },
  { abbr: "Y-seam", full: "Set-in Seam", note: "Three seams meeting at a point (like a Y shape)" },
];

const BLOCK_SIZES: { finished: string; cut: string; note: string }[] = [
  { finished: '2"', cut: '2 1/2"', note: "Small accent squares" },
  { finished: '2 1/2"', cut: '3"', note: "Common HST base" },
  { finished: '3"', cut: '3 1/2"', note: "Nine patch squares" },
  { finished: '4"', cut: '4 1/2"', note: "Popular small block" },
  { finished: '4 1/2"', cut: '5"', note: "Charm square size" },
  { finished: '5"', cut: '5 1/2"', note: "Charm block" },
  { finished: '6"', cut: '6 1/2"', note: "Standard small block" },
  { finished: '6 1/2"', cut: '7"', note: "Common block size" },
  { finished: '8"', cut: '8 1/2"', note: "Medium block" },
  { finished: '9"', cut: '9 1/2"', note: "Nine patch (3\" units)" },
  { finished: '10"', cut: '10 1/2"', note: "Layer cake block" },
  { finished: '12"', cut: '12 1/2"', note: "Most popular block size" },
  { finished: '14"', cut: '14 1/2"', note: "Large block" },
  { finished: '16"', cut: '16 1/2"', note: "Extra large block" },
  { finished: '18"', cut: '18 1/2"', note: "Pillow-size block" },
];

type TabId = "abbreviations" | "seam" | "grain" | "pressing" | "blocks";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "abbreviations", label: "Abbreviations", icon: "Aa" },
  { id: "seam", label: "Seam Allowance", icon: "↕" },
  { id: "grain", label: "Grain", icon: "↗" },
  { id: "pressing", label: "Pressing", icon: "♨" },
  { id: "blocks", label: "Block Sizes", icon: "▢" },
];

// --- SVG Diagrams ---

function SeamAllowanceRuler() {
  const width = 320;
  const height = 120;
  const rulerTop = 30;
  const rulerH = 50;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[320px] mx-auto" aria-label="Seam allowance ruler showing 1/4 inch">
      {/* Ruler body */}
      <rect x={10} y={rulerTop} width={width - 20} height={rulerH} fill="var(--surface-raised, #FFFEF9)" stroke="var(--foreground, #4E3B2A)" strokeWidth={1.5} rx={3} />

      {/* Inch marks */}
      {Array.from({ length: 4 }, (_, i) => {
        const x = 30 + i * 72;
        return (
          <g key={i}>
            <line x1={x} y1={rulerTop} x2={x} y2={rulerTop + rulerH} stroke="var(--foreground)" strokeWidth={1} />
            <text x={x} y={rulerTop + rulerH + 14} textAnchor="middle" fontSize={10} fill="var(--foreground)" fontFamily="var(--font-geist-mono)">{i}″</text>
            {/* Quarter marks */}
            {[1, 2, 3].map((q) => {
              const qx = x + q * 18;
              const qh = q === 2 ? rulerH * 0.6 : rulerH * 0.35;
              return (
                <line key={q} x1={qx} y1={rulerTop} x2={qx} y2={rulerTop + qh} stroke="var(--foreground)" strokeWidth={0.7} />
              );
            })}
          </g>
        );
      })}

      {/* Highlight 1/4" */}
      <rect x={30} y={rulerTop} width={18} height={rulerH} fill="var(--accent)" fillOpacity={0.25} />
      <line x1={30} y1={rulerTop - 5} x2={48} y2={rulerTop - 5} stroke="var(--accent)" strokeWidth={2} />
      <text x={39} y={rulerTop - 10} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--accent)" fontFamily="var(--font-geist-mono)">1/4″</text>

      {/* Label */}
      <text x={width / 2} y={height - 2} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-geist-sans)">Standard quilting seam allowance = 1/4 inch from raw edge to stitch line</text>
    </svg>
  );
}

function GrainDiagram() {
  const w = 260;
  const h = 200;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[260px] mx-auto" aria-label="Fabric grain direction diagram">
      {/* Fabric rectangle */}
      <rect x={30} y={20} width={200} height={150} fill="var(--surface-raised, #FFFEF9)" stroke="var(--foreground, #4E3B2A)" strokeWidth={1.5} rx={2} />

      {/* Selvage indicators */}
      <rect x={30} y={20} width={6} height={150} fill="var(--accent)" fillOpacity={0.3} />
      <rect x={224} y={20} width={6} height={150} fill="var(--accent)" fillOpacity={0.3} />
      <text x={20} y={95} textAnchor="middle" fontSize={8} fill="var(--accent)" fontFamily="var(--font-geist-sans)" transform="rotate(-90, 20, 95)">SELVAGE</text>
      <text x={242} y={95} textAnchor="middle" fontSize={8} fill="var(--accent)" fontFamily="var(--font-geist-sans)" transform="rotate(90, 242, 95)">SELVAGE</text>

      {/* Lengthwise grain (vertical arrow) */}
      <line x1={80} y1={40} x2={80} y2={150} stroke="var(--success, #6B8F71)" strokeWidth={2} />
      <polygon points="76,42 80,30 84,42" fill="var(--success)" />
      <polygon points="76,148 80,160 84,148" fill="var(--success)" />
      <text x={80} y={175} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--success)" fontFamily="var(--font-geist-sans)">Lengthwise</text>
      <text x={80} y={185} textAnchor="middle" fontSize={7} fill="var(--success)" fontFamily="var(--font-geist-sans)">(least stretch)</text>

      {/* Crosswise grain (horizontal arrow) */}
      <line x1={100} y1={70} x2={200} y2={70} stroke="#4A5899" strokeWidth={2} />
      <polygon points="102,66 90,70 102,74" fill="#4A5899" />
      <polygon points="198,66 210,70 198,74" fill="#4A5899" />
      <text x={150} y={62} textAnchor="middle" fontSize={9} fontWeight={600} fill="#4A5899" fontFamily="var(--font-geist-sans)">Crosswise</text>
      <text x={150} y={52} textAnchor="middle" fontSize={7} fill="#4A5899" fontFamily="var(--font-geist-sans)">(slight stretch)</text>

      {/* Bias (diagonal arrow) */}
      <line x1={120} y1={130} x2={190} y2={90} stroke="var(--accent, #C4573A)" strokeWidth={2} strokeDasharray="4,3" />
      <polygon points="187,95 198,85 182,90" fill="var(--accent)" />
      <text x={168} y={138} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--accent)" fontFamily="var(--font-geist-sans)">Bias (45°)</text>
      <text x={168} y={148} textAnchor="middle" fontSize={7} fill="var(--accent)" fontFamily="var(--font-geist-sans)">(maximum stretch!)</text>
    </svg>
  );
}

// --- Tab Content ---

function AbbreviationsTab() {
  const [search, setSearch] = useState("");
  const filtered = ABBREVIATIONS.filter((a) =>
    a.abbr.toLowerCase().includes(search.toLowerCase()) ||
    a.full.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search abbreviations…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--foreground)] transition-colors mb-3"
      />
      <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
        {filtered.map((a) => (
          <div key={a.abbr} className="flex gap-3 py-2 px-2 rounded-lg hover:bg-[var(--surface)] transition-colors">
            <span className="shrink-0 w-14 text-right font-bold font-[family-name:var(--font-geist-mono)] text-sm" style={{ color: "var(--accent)" }}>
              {a.abbr}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{a.full}</div>
              {a.note && <div className="text-xs text-[var(--text-muted)] mt-0.5">{a.note}</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">
            No matches found
          </p>
        )}
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
        {ABBREVIATIONS.length} quilting abbreviations
      </p>
    </div>
  );
}

function SeamAllowanceTab() {
  return (
    <div className="space-y-4">
      <SeamAllowanceRuler />
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">Standard: 1/4 inch (6.35mm)</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            The universal quilting seam allowance. When a pattern says &ldquo;use standard seam allowance,&rdquo; this is what they mean.
            Many sewing machines have a special 1/4&Prime; presser foot to make this easy.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">Scant 1/4 inch</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            A thread width less than 1/4&Prime;. Accounts for the tiny fold of fabric that occurs when you press a seam.
            If your blocks are consistently coming out a bit small, try a scant quarter inch.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">Testing your seam allowance</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Sew two 3&Prime; squares together. Press seam to one side. The unit should measure exactly 3&Prime; &times; 5 1/2&Prime;.
            If it&apos;s smaller, your seam is too wide. If larger, too narrow.
          </p>
        </div>
      </div>
    </div>
  );
}

function GrainTab() {
  return (
    <div className="space-y-4">
      <GrainDiagram />
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1" style={{ color: "var(--success)" }}>Lengthwise Grain (warp)</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Runs parallel to the selvage. Has the <strong>least stretch</strong>. Best for borders and binding.
            The fabric is strongest in this direction.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1" style={{ color: "#4A5899" }}>Crosswise Grain (weft)</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Runs perpendicular to the selvage, from selvage to selvage. Has <strong>slight stretch</strong>.
            Most quilting strips are cut on the crosswise grain (WOF = Width of Fabric).
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1" style={{ color: "var(--accent)" }}>Bias (45° diagonal)</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Runs at 45° to the selvage. Has <strong>maximum stretch</strong>. Handle with care!
            Bias-cut edges can distort easily. Use for binding curves (the stretch is an advantage there).
            When cutting triangles, be aware that at least one edge will be on the bias.
          </p>
        </div>
      </div>
    </div>
  );
}

function PressingTab() {
  return (
    <div className="space-y-4">
      {/* Visual comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border-2 border-[var(--success)] p-4 text-center">
          <div className="text-3xl mb-2">⬇</div>
          <h4 className="font-bold text-sm" style={{ color: "var(--success)" }}>PRESSING</h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">Lift → Place → Lift</p>
          <p className="text-xs mt-2 text-[var(--text-secondary)]">
            Set the iron straight down, hold briefly, lift straight up, move to next section.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[var(--accent)] p-4 text-center">
          <div className="text-3xl mb-2">↔</div>
          <h4 className="font-bold text-sm" style={{ color: "var(--accent)" }}>IRONING</h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">Slide back and forth</p>
          <p className="text-xs mt-2 text-[var(--text-secondary)]">
            Moving the iron across fabric. This can stretch and distort quilting pieces!
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">Why it matters in quilting</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Quilters <strong>press</strong>, they don&apos;t <strong>iron</strong>.
            Sliding the iron across fabric distorts bias edges, stretches seams,
            and can shift pieces out of alignment. Pressing keeps everything flat and true.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">Pressing direction</h4>
          <ul className="text-[var(--text-secondary)] leading-relaxed space-y-1 list-inside">
            <li>• <strong>Toward the darker fabric</strong> — prevents shadow-through</li>
            <li>• <strong>Alternate directions</strong> in adjacent rows — seams &ldquo;nest&rdquo; together</li>
            <li>• <strong>Open seams</strong> — when bulk must be reduced (Y-seams, complex intersections)</li>
          </ul>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">Steam or no steam?</h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Start with <strong>dry heat</strong> for cutting and piecing — steam can distort fabric.
            Use <strong>light steam</strong> when pressing finished blocks to set seams flat.
            Some quilters spray starch for extra crispness and stability.
          </p>
        </div>
      </div>
    </div>
  );
}

function BlockSizesTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[var(--surface)] p-4 text-sm">
        <h4 className="font-semibold mb-1">The Golden Rule</h4>
        <p className="text-[var(--text-secondary)]">
          <strong>Cut size = Finished size + 1/2 inch</strong> (adds 1/4&Prime; seam allowance on each side).
          When a pattern says &ldquo;3 inch finished block,&rdquo; your cut size is 3 1/2&Prime;.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="text-left px-4 py-2 font-semibold">Finished</th>
              <th className="text-left px-4 py-2 font-semibold">Cut Size</th>
              <th className="text-left px-4 py-2 font-semibold text-[var(--text-muted)]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {BLOCK_SIZES.map((b, i) => (
              <tr key={i} className="border-b border-[var(--border-light)] last:border-0">
                <td className="px-4 py-2 font-[family-name:var(--font-geist-mono)] font-medium">{b.finished}</td>
                <td className="px-4 py-2 font-[family-name:var(--font-geist-mono)]" style={{ color: "var(--accent)" }}>{b.cut}</td>
                <td className="px-4 py-2 text-xs text-[var(--text-muted)]">{b.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">HST (Half Square Triangle) math</h4>
          <p className="text-[var(--text-secondary)]">
            <strong>Cut size = Finished size + 7/8 inch</strong>. For a 3&Prime; finished HST, cut 3 7/8&Prime; squares.
            Using the no-waste (4-at-a-time) method? <strong>Cut size = Finished size + 1 1/4 inch</strong>.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <h4 className="font-semibold mb-1">QST (Quarter Square Triangle) math</h4>
          <p className="text-[var(--text-secondary)]">
            <strong>Cut size = Finished size + 1 1/4 inch</strong>. For a 4&Prime; finished QST, cut 5 1/4&Prime; squares.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main Panel Component ---

interface QuickRefProps {
  /** Control visibility externally */
  isOpen?: boolean;
  onClose?: () => void;
  /** If true, renders as inline content instead of a slide-up panel */
  inline?: boolean;
}

export default function QuickRef({ isOpen: controlledOpen, onClose, inline = false }: QuickRefProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("abbreviations");

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  function handleClose() {
    if (onClose) onClose();
    else setInternalOpen(false);
  }

  function handleOpen() {
    setInternalOpen(true);
  }

  const content = (
    <div className={inline ? "" : "max-h-[70vh] overflow-y-auto"}>
      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-4 pb-1 border-b border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--surface)] text-[var(--foreground)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "abbreviations" && <AbbreviationsTab />}
      {activeTab === "seam" && <SeamAllowanceTab />}
      {activeTab === "grain" && <GrainTab />}
      {activeTab === "pressing" && <PressingTab />}
      {activeTab === "blocks" && <BlockSizesTab />}
    </div>
  );

  // Inline mode — render directly
  if (inline) return content;

  // Slide-up panel mode
  return (
    <>
      {/* Trigger button */}
      {controlledOpen === undefined && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-lg flex items-center justify-center text-lg font-bold hover:scale-105 transition-transform print:hidden"
          aria-label="Open quick reference"
          title="Quick reference cards"
        >
          ?
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity print:hidden"
          onClick={handleClose}
          aria-hidden
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] border-t border-[var(--border)] rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out print:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-label="Quick reference cards"
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Quick Reference</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4">
          {content}
        </div>
      </div>
    </>
  );
}
