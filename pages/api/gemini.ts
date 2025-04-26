import { NextApiRequest, NextApiResponse } from 'next';
import { sendMessageToGemini } from '../../lib/chatbot';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await sendMessageToGemini(
      message,
      API_KEY,
      conversationHistory
    );

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error in Gemini API handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 