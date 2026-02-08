import type { NextApiRequest, NextApiResponse } from 'next';
import { SYSTEM_INSTRUCTION, PORTFOLIO_CONTEXT, GENERATION_CONFIG, GEMINI_MODEL } from '@/lib/portfolio-context';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GEMINI_API_KEY!;
  const { message, conversationHistory } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${SYSTEM_INSTRUCTION}\n\n${PORTFOLIO_CONTEXT}`
              }
            ]
          },
          contents: [
            ...conversationHistory.map((msg: { role: string; content: string }) => ({
              role: msg.role,
              parts: [{ text: msg.content }]
            })),
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: GENERATION_CONFIG,
        }),
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
