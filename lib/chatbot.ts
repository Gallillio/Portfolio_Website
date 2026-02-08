// Helper functions for interacting with the Gemini API

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

import { SYSTEM_INSTRUCTION, PORTFOLIO_CONTEXT, GENERATION_CONFIG, GEMINI_MODEL, isGemmaModel } from './portfolio-context';

/**
 * Send a message to Google's Gemini API and get a response
 * @param message The user's message
 * @param API_KEY The Google Gemini API key
 * @param conversationHistory Previous messages in the conversation
 * @returns The model's response
 */
export async function sendMessageToGemini(
  message: string,
  API_KEY: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const systemContext = `${SYSTEM_INSTRUCTION}\n\n${PORTFOLIO_CONTEXT}`;
    const historyContents = conversationHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
    const userContent = { role: "user", parts: [{ text: message }] };

    const payload = isGemmaModel(GEMINI_MODEL)
      ? {
          contents: [
            { role: "user", parts: [{ text: systemContext }] },
            { role: "model", parts: [{ text: "Understood. I am Ahmed Galal Elzeky's portfolio assistant. How can I help you learn about Ahmed?" }] },
            ...historyContents,
            userContent,
          ],
          generationConfig: GENERATION_CONFIG,
        }
      : {
          systemInstruction: { parts: [{ text: systemContext }] },
          contents: [...historyContents, userContent],
          generationConfig: GENERATION_CONFIG,
        };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    const content = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';

    return content;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Sorry, there was an error communicating with me. Please try again.';
  }
}
