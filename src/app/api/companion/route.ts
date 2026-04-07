import { NextResponse } from "next/server";

/**
 * POST /api/companion
 *
 * Sends the current step context to Claude Haiku and returns
 * a warm, patient explanation from the quilting companion.
 *
 * Cost: ~$0.01 per question at Haiku rates.
 */

interface CompanionRequest {
  patternName: string;
  stepNumber: number;
  stepText: string;
  surroundingContext: string;
  metadata: string;
  question: string;
}

export async function POST(request: Request) {
  try {
    const body: CompanionRequest = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "The quilting companion isn't set up yet. Please add ANTHROPIC_API_KEY to your environment variables.",
        },
        { status: 503 }
      );
    }

    const systemPrompt = `You are a warm, patient quilting companion — like a knowledgeable friend sitting next to someone at their sewing table. The quilter may be older, may have declining vision, and loves this craft deeply.

Your personality:
- Patient and encouraging. Never condescending.
- Use plain, simple language. If you use a quilting term, define it briefly in parentheses the first time.
- Keep responses concise but complete — 2-4 short paragraphs at most.
- If explaining a technique, describe what the quilter will physically DO with their hands and fabric.
- If the quilter asks about construction sequence, explain WHY the order matters (e.g., "pressing seams to the left first lets them nest with the next row's seams, which makes the intersection line up perfectly").
- Acknowledge when something is tricky. "This step takes a bit of practice" is more helpful than pretending it's easy.
- End with a brief encouraging note when appropriate.

You are NOT a generic chatbot. You are a quilting expert who genuinely cares about this person's success.`;

    const userPrompt = `The quilter is working on "${body.patternName}" and is currently on Step ${body.stepNumber}.

CURRENT STEP:
${body.stepText}

SURROUNDING STEPS FOR CONTEXT:
${body.surroundingContext}

${body.metadata ? `PATTERN INFO:\n${body.metadata}\n` : ""}
THE QUILTER ASKS: "${body.question}"

Please respond as their quilting companion. Be warm, clear, and helpful.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return NextResponse.json(
        { error: "Your companion had trouble thinking. Please try again in a moment." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data.content?.[0]?.type === "text"
        ? data.content[0].text
        : "I'm sorry, I wasn't able to form a response. Please try asking again.";

    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("Companion route error:", err);
    return NextResponse.json(
      { error: "Something unexpected happened. Please try again." },
      { status: 500 }
    );
  }
}
