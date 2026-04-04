"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  CommunityPattern,
  DifficultyLevel,
  ALL_DIFFICULTIES,
  loadCommunityPatterns,
  saveUserPattern,
  getDifficultyBadgeColor,
} from "@/lib/community-patterns";

/* ------------------------------------------------------------------ */
/*  SVG preview — grid-based (seeded) or uploaded image               */
/* ------------------------------------------------------------------ */

function PatternThumbnail({ pattern }: { pattern: CommunityPattern }) {
  if (pattern.grid && pattern.colors) {
    const rows = pattern.grid.length;
    const cols = pattern.grid[0].length;
    const cellSize = 100 / Math.max(rows, cols);
    return (
      <svg
        viewBox={`0 0 ${cols * cellSize} ${rows * cellSize}`}
        className="w-full aspect-square rounded-lg"
        aria-hidden="true"
      >
        {pattern.grid.map((row, y) =>
          row.map((colorIdx, x) => (
            <rect
              key={`${y}-${x}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={pattern.colors![colorIdx] ?? "#ccc"}
              stroke="rgba(0,0,0,0.05)"
              strokeWidth={0.3}
            />
          ))
        )}
      </svg>
    );
  }

  if (pattern.imageDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pattern.imageDataUrl}
        alt={pattern.title}
        className="w-full aspect-square rounded-lg object-cover"
      />
    );
  }

  /* Fallback: colored placeholder */
  return (
    <div className="w-full aspect-square rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/20 dark:text-white/20 text-4xl">
      &#9638;
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pattern card                                                       */
/* ------------------------------------------------------------------ */

function PatternCard({ pattern }: { pattern: CommunityPattern }) {
  return (
    <div className="border border-black/10 dark:border-white/10 rounded-2xl p-5 hover:border-black/25 dark:hover:border-white/25 transition-colors">
      <PatternThumbnail pattern={pattern} />
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">{pattern.title}</h2>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${getDifficultyBadgeColor(pattern.difficulty)}`}
          >
            {pattern.difficulty}
          </span>
        </div>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          by {pattern.creator} &middot;{" "}
          {new Date(pattern.submittedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60 line-clamp-2">
          {pattern.description}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Submit form                                                        */
/* ------------------------------------------------------------------ */

function SubmitForm({ onSubmit }: { onSubmit: (p: CommunityPattern) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Beginner");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !creator.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    const pattern: CommunityPattern = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      creator: creator.trim(),
      description: description.trim(),
      difficulty,
      submittedAt: new Date().toISOString(),
      imageDataUrl: imageDataUrl ?? undefined,
    };
    saveUserPattern(pattern);
    onSubmit(pattern);
    // Reset
    setTitle("");
    setCreator("");
    setDescription("");
    setDifficulty("Beginner");
    setImageDataUrl(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Submit Your Pattern
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Submit a Pattern</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-black/50 dark:text-white/50 hover:underline underline-offset-4"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sunflower Star"
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder="e.g. Jane Doe"
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe your pattern, techniques used, and any tips..."
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        >
          {ALL_DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Pattern Image (optional)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-foreground/10 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-foreground/20"
        />
        {imageDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageDataUrl}
            alt="Preview"
            className="mt-2 w-20 h-20 rounded-lg object-cover border border-black/10 dark:border-white/10"
          />
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Submit Pattern
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

type SortOption = "newest" | "oldest";

export default function CommunityPage() {
  const [patterns, setPatterns] = useState<CommunityPattern[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<
    DifficultyLevel | "All"
  >("All");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    setPatterns(loadCommunityPatterns());
  }, []);

  function handleNewPattern(p: CommunityPattern) {
    setPatterns((prev) => [...prev, p]);
  }

  const filtered = patterns
    .filter(
      (p) => filterDifficulty === "All" || p.difficulty === filterDifficulty
    )
    .sort((a, b) => {
      const da = new Date(a.submittedAt).getTime();
      const db = new Date(b.submittedAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Quiltographer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/calculator"
            className="hover:underline underline-offset-4"
          >
            Calculator
          </Link>
          <Link href="/gallery" className="hover:underline underline-offset-4">
            Gallery
          </Link>
          <Link
            href="/community"
            className="hover:underline underline-offset-4 font-medium"
          >
            Community
          </Link>
          <a
            href="/api/auth/signin"
            className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </a>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
          Community Patterns
        </h1>
        <p className="mt-4 text-center text-black/60 dark:text-white/60 max-w-xl mx-auto">
          Discover patterns shared by fellow quilters, or submit your own
          creation for the community.
        </p>

        {/* Submit button / form */}
        <div className="mt-8 flex justify-center">
          <SubmitForm onSubmit={handleNewPattern} />
        </div>

        {/* Filters & Sort */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Difficulty filter */}
          <div className="flex flex-wrap gap-2">
            {(["All", ...ALL_DIFFICULTIES] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  filterDifficulty === d
                    ? "bg-foreground text-background border-foreground"
                    : "border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-black/40 dark:text-white/40">
            <p className="text-lg">No patterns match this filter.</p>
            <p className="text-sm mt-1">
              Try a different difficulty level, or submit the first one!
            </p>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-black/10 dark:border-white/10 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
