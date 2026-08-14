import OpenAI from 'openai';
import { AIProvider } from './provider';
import { SYSTEM_PROMPT, validateFinancialIntent } from './schemas';
import { FinancialIntent } from '@/types';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing');
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async parseIntent(userMessage: string): Promise<FinancialIntent> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const parsed = JSON.parse(content);
      return validateFinancialIntent(parsed);
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw new Error('Failed to parse intent with OpenAI');
    }
  }
}
