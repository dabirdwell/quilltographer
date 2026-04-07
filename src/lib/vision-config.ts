/**
 * Vision model configuration for Gemma 4 multimodal capabilities.
 *
 * Priority: LM Studio (local) → Google AI Studio (cloud) → text-only Haiku (fallback)
 */

export const VISION_CONFIG = {
  /** LM Studio OpenAI-compatible endpoint */
  LM_STUDIO_URL: process.env.LM_STUDIO_URL || "http://localhost:1234",

  /** Google AI Studio API key (env var) */
  GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY || "",

  /** Model name for LM Studio */
  LM_STUDIO_MODEL: "gemma-4-26b-a4b-it",

  /** Model name for Google AI Studio */
  GOOGLE_AI_MODEL: "gemma-4-e4b",

  /** Mid-range token budget for images — balances detail vs speed */
  IMAGE_TOKEN_BUDGET: 560,
} as const;

export type VisionProvider = "lm-studio" | "google-ai" | "text-only";

interface VisionAvailability {
  provider: VisionProvider;
  url: string;
  model: string;
}

/**
 * Checks LM Studio availability with a quick health check,
 * then falls back to Google AI Studio, then text-only Haiku.
 */
export async function getAvailableVisionProvider(): Promise<VisionAvailability> {
  // Try LM Studio first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${VISION_CONFIG.LM_STUDIO_URL}/v1/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      return {
        provider: "lm-studio",
        url: `${VISION_CONFIG.LM_STUDIO_URL}/v1/chat/completions`,
        model: VISION_CONFIG.LM_STUDIO_MODEL,
      };
    }
  } catch {
    // LM Studio not available
  }

  // Try Google AI Studio
  if (VISION_CONFIG.GOOGLE_AI_KEY) {
    return {
      provider: "google-ai",
      url: `https://generativelanguage.googleapis.com/v1beta/models/${VISION_CONFIG.GOOGLE_AI_MODEL}:generateContent?key=${VISION_CONFIG.GOOGLE_AI_KEY}`,
      model: VISION_CONFIG.GOOGLE_AI_MODEL,
    };
  }

  // Fall back to text-only
  return {
    provider: "text-only",
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-haiku-20241022",
  };
}

/**
 * Send an image + text prompt to the best available vision model.
 * Returns the model's text response.
 */
export async function callVisionModel(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  systemPrompt: string,
): Promise<{ text: string; provider: VisionProvider }> {
  const availability = await getAvailableVisionProvider();

  if (availability.provider === "lm-studio") {
    return callLmStudio(availability, imageBase64, mimeType, prompt, systemPrompt);
  }

  if (availability.provider === "google-ai") {
    return callGoogleAI(availability, imageBase64, mimeType, prompt, systemPrompt);
  }

  // Text-only fallback — no image
  return callTextOnly(prompt, systemPrompt);
}

async function callLmStudio(
  availability: VisionAvailability,
  imageBase64: string,
  mimeType: string,
  prompt: string,
  systemPrompt: string,
): Promise<{ text: string; provider: VisionProvider }> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const res = await fetch(availability.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: availability.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: VISION_CONFIG.IMAGE_TOKEN_BUDGET * 3,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`LM Studio error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "I couldn't form a response.";
  return { text, provider: "lm-studio" };
}

async function callGoogleAI(
  availability: VisionAvailability,
  imageBase64: string,
  mimeType: string,
  prompt: string,
  systemPrompt: string,
): Promise<{ text: string; provider: VisionProvider }> {
  const res = await fetch(availability.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: VISION_CONFIG.IMAGE_TOKEN_BUDGET * 3,
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Google AI error: ${res.status}`);
  }

  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I couldn't form a response.";
  return { text, provider: "google-ai" };
}

async function callTextOnly(
  prompt: string,
  systemPrompt: string,
): Promise<{ text: string; provider: VisionProvider }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("No vision model or text model available.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: systemPrompt + "\n\nNote: The quilter wanted to share a photo but vision is not available right now. Answer based on their text description only, and let them know gently that you couldn't see their photo this time.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  const text =
    data.content?.[0]?.type === "text"
      ? data.content[0].text
      : "I couldn't form a response.";
  return { text, provider: "text-only" };
}
