import type { NextApiRequest, NextApiResponse } from 'next';
import { SYSTEM_INSTRUCTION, PORTFOLIO_CONTEXT, GENERATION_CONFIG, GEMINI_MODEL, isGemmaModel } from '@/lib/portfolio-context';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GEMINI_API_KEY!;
  const { message, conversationHistory } = req.body;

  try {
    const systemContext = `${SYSTEM_INSTRUCTION}\n\n${PORTFOLIO_CONTEXT}`;
    const historyContents = conversationHistory.map((msg: { role: string; content: string }) => ({
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
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
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
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
