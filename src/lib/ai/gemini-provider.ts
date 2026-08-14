import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './provider';
import { SYSTEM_PROMPT, validateFinancialIntent } from './schemas';
import { FinancialIntent } from '@/types';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async parseIntent(userMessage: string): Promise<FinancialIntent> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const content = response.text;
      if (!content) {
        throw new Error('No content returned from Gemini');
      }

      const parsed = JSON.parse(content);
      return validateFinancialIntent(parsed);
    } catch (error) {
      console.error('Gemini parsing error:', error);
      throw new Error('Failed to parse intent with Gemini');
    }
  }
}
