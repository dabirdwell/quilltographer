import { NextResponse } from "next/server";
import { callVisionModel } from "@/lib/vision-config";

/**
 * POST /api/companion/vision
 *
 * Accepts an image (base64) + text prompt and sends to the best
 * available vision model (LM Studio → Google AI → text-only Haiku).
 */

interface VisionRequest {
  /** Base64-encoded image data (no data: prefix) */
  image: string;
  /** MIME type of the image */
  mimeType: string;
  /** Text prompt / question */
  prompt: string;
  /** Which feature is calling: "progress" | "identify" | "sketch" | "companion" */
  mode: "progress" | "identify" | "sketch" | "companion";
  /** Optional context about the current pattern step */
  context?: {
    patternName?: string;
    stepNumber?: number;
    stepText?: string;
    difficulty?: string;
    notes?: string;
  };
}

const SYSTEM_PROMPTS: Record<string, string> = {
  progress: `You are a patient, expert quilting companion. You are looking at a photo of a quilter's work in progress. Assess what you see with encouragement and practical advice. Be specific about what looks good and gentle about what might need attention. Relate your observations to the current pattern step if provided.

Your personality:
- Warm and encouraging. Find something genuinely good to comment on first.
- Be specific: mention seam alignment, fabric grain, pressing direction, color placement.
- If you see something that needs attention, frame it as "here's a tip" not "you did this wrong."
- Keep your response concise: 2-3 short paragraphs.
- If the quilter mentions their step, relate your feedback to where they are in the pattern.`,

  identify: `You are a quilting historian and pattern expert. You are looking at a photo of a quilt block — it might be a physical block, a photo from a book, or an image on a screen.

Your job:
1. Identify the block's traditional name (and any alternate names it goes by).
2. Note the cultural/geographic origin if you can determine it.
3. Rate the difficulty (Beginner, Confident Beginner, Intermediate, Advanced, Expert).
4. Give a brief "How to make this block" summary (3-5 sentences covering the key technique).

Format your response clearly with these sections. If you're not sure of the exact block, give your best assessment and mention what other blocks it resembles.`,

  sketch: `You are looking at a hand-drawn sketch of a quilt layout. The quilter drew this to plan their quilt. Please describe what you see:

1. How many blocks or sections you can identify
2. The arrangement pattern (grid, on-point, medallion, strip, etc.)
3. Any color groupings or repeated motifs
4. If it resembles a traditional quilt layout, suggest the name

Be encouraging about their planning process. If the sketch is rough, that's fine — quilters often start with napkin sketches. Focus on interpreting their intent.`,

  companion: `You are a warm, patient quilting companion — like a knowledgeable friend sitting next to someone at their sewing table. The quilter has shared a photo along with their question.

Your personality:
- Patient and encouraging. Never condescending.
- Use plain, simple language. If you use a quilting term, define it briefly in parentheses the first time.
- Keep responses concise but complete — 2-4 short paragraphs at most.
- Describe what you see in their photo and relate it to their question.
- Acknowledge when something is tricky.`,
};

export async function POST(request: Request) {
  try {
    const body: VisionRequest = await request.json();

    if (!body.image || !body.prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required." },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[body.mode] || SYSTEM_PROMPTS.companion;

    // Build the text prompt with context
    let fullPrompt = body.prompt;
    if (body.context) {
      const ctx = body.context;
      const contextLines: string[] = [];
      if (ctx.patternName) contextLines.push(`Pattern: ${ctx.patternName}`);
      if (ctx.stepNumber) contextLines.push(`Current step: ${ctx.stepNumber}`);
      if (ctx.stepText) contextLines.push(`Step instruction: ${ctx.stepText}`);
      if (ctx.difficulty) contextLines.push(`Difficulty: ${ctx.difficulty}`);
      if (ctx.notes) contextLines.push(`Quilter's notes: ${ctx.notes}`);

      if (contextLines.length > 0) {
        fullPrompt = `CONTEXT:\n${contextLines.join("\n")}\n\nQUILTER'S MESSAGE:\n${body.prompt}`;
      }
    }

    const mimeType = body.mimeType || "image/jpeg";

    const result = await callVisionModel(
      body.image,
      mimeType,
      fullPrompt,
      systemPrompt
    );

    return NextResponse.json({
      response: result.text,
      provider: result.provider,
    });
  } catch (err) {
    console.error("Vision companion error:", err);

    const message =
      err instanceof Error && err.message.includes("No vision model")
        ? "No vision model is available right now. Please start LM Studio or add a GOOGLE_AI_KEY."
        : "Your companion had trouble seeing the photo. Please try again in a moment.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
