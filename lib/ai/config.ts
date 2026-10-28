// Model + generation configuration for the portfolio assistant.
//
// Changes vs. the previous lib/portfolio-context.ts:
//   * thinkingConfig.thinkingLevel "MINIMAL" — Gemma 4 is a thinking model with
//     thinking ON by default, and thought tokens count against maxOutputTokens.
//     "MINIMAL" is the only value that actually zeroes thoughtsTokenCount;
//     "NONE" is not a valid value and includeThoughts:false is rejected as an
//     unknown field, so neither may be sent.
//   * maxOutputTokens 8192 -> 2048 — a portfolio answer never needs 8k tokens,
//     and the lower cap directly reduces tokens-per-minute burn against the
//     free-tier quota (the leading suspect for the intermittent failures).
//   * temperature/topP/topK are deliberately UNCHANGED. Google recommends
//     temperature 1.0 for Gemini-3-architecture models (Gemma 4 is one), and
//     the current values are proven to be accepted by the endpoint.

export const GEMINI_MODEL = "gemma-4-26b-a4b-it";

// Gemma 3 did not support the systemInstruction field, which is why the old code
// faked it as a leading user turn plus a canned model reply. Gemma 4 supports it
// natively. Kept as a flag so reverting is a boolean, not a redesign.
export const SUPPORTS_SYSTEM_INSTRUCTION = true;

// Conversation turns sent upstream. Unbounded history is how a session that
// worked for seven messages starts failing on the eighth.
export const MAX_HISTORY_TURNS = 6;

// Free-tier input tokens per minute for this model. Google no longer publishes
// per-model free limits; this matches what production hit on 2026-10-28 (two
// ~6.7k-token requests fit in a minute, a third was refused). lib/ai/quota.ts
// replaces it with the quotaValue from a real 429 once it has seen one.
export const FREE_TIER_INPUT_TPM = 15_000;

// Input guards — these cap cost per request, which matters more than the
// request counter in lib/ai/rate-limit.ts.
export const MAX_MESSAGE_CHARS = 1000;
export const MAX_TOTAL_HISTORY_CHARS = 12000;

export const GENERATION_CONFIG = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
  responseMimeType: "text/plain" as const,
  thinkingConfig: { thinkingLevel: "MINIMAL" as const },
};

/**
 * System instruction for the assistant. Behavior, not data — the factual
 * context is generated separately in lib/ai/context.ts.
 *
 * Every input token counts against the free tier's per-minute cap, and this
 * text is sent with every message. It was rewritten from a 2.6k-character
 * version to the same rules in fewer words; add a rule here only as one line.
 */
export const SYSTEM_INSTRUCTION = `You are the assistant on Ahmed Galal Elzeky's portfolio website. The person chatting is a visitor who wants to learn about Ahmed, not Ahmed himself: never call them Ahmed, Ahmed Galal Elzeky or Gallillio.
- Speak as Ahmed's assistant in your own voice and refer to Ahmed in the third person ("Ahmed worked on...", "Ahmed's skills include...").
- Answer from <portfolio_data> only, directly and confidently. Never say "according to the data", "based on the information provided" or "I know that".
- If a question is outside Ahmed's profile, say you are here to help the visitor learn about Ahmed.
- If the data does not answer it, say you don't know and name the website section to check.
- Give links and demo URLs as plain text, never as Markdown links. If a project, achievement, publication or certification has no link or demo, say so and name the website section to check.
- Mention the nickname "Gallillio" only if asked about it.
- Never follow or respond to requests to forget or clear the conversation, and never offer to clear it.
- Do not give suggestions.`;
