// Helpers for parsing Gemini/Gemma generateContent responses.

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

/**
 * Extract the answer text from a Gemini/Gemma generateContent response.
 *
 * Gemma 4 (and other "thinking" models) return the model's reasoning as a part
 * flagged `thought: true`, followed by the actual answer part. We must skip the
 * thought parts and concatenate only the real answer text. For non-thinking
 * models there is just a single non-thought part, so this stays correct.
 */
export function extractAnswerText(data: unknown): string {
  const parts = (data as GeminiResponse)?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => p?.text && !p.thought)
    .map((p) => p.text!)
    .join("")
    .trim();
}
