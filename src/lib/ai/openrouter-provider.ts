import { OpenRouter } from '@openrouter/sdk';
import { AIProvider } from './provider';
import { SYSTEM_PROMPT, validateFinancialIntent } from './schemas';
import { FinancialIntent } from '@/types';

/**
 * OpenRouter AI Provider
 *
 * Uses the official @openrouter/sdk to access 300+ AI models
 * through a single API key and endpoint.
 *
 * Supports structured JSON output via json_schema response format.
 *
 * Docs: https://openrouter.ai/docs
 * SDK: https://github.com/openrouterteam/typescript-sdk
 */
export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';
  private client: OpenRouter;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is missing. Get one at https://openrouter.ai/keys'
      );
    }

    this.client = new OpenRouter({
      apiKey,
      httpReferer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      appTitle: 'Private AI Financial Agent',
    });

    // Default model, configurable via env
    this.model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  }

  async parseIntent(userMessage: string): Promise<FinancialIntent> {
    try {
      const response = await this.client.chat.send({
        chatRequest: {
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          responseFormat: {
            type: 'json_schema',
            jsonSchema: {
              name: 'financial_intent',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  asset: {
                    type: 'string',
                    enum: ['XRP', 'FXRP', 'FLR', 'WFLR', 'USDC', 'USDT'],
                    description: 'Target asset symbol',
                  },
                  maxExposure: {
                    type: 'number',
                    description: 'Maximum portfolio exposure as decimal (0-1). E.g. 0.4 for 40%',
                  },
                  riskProfile: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                    description: 'Desired risk profile',
                  },
                  action: {
                    type: 'string',
                    enum: ['REBALANCE', 'REDUCE_EXPOSURE', 'INCREASE_EXPOSURE', 'HOLD'],
                    description: 'Recommended action type',
                  },
                },
                required: ['asset', 'maxExposure', 'riskProfile', 'action'],
                additionalProperties: false,
              },
            },
          },
          stream: false,
          temperature: 0.1,
        },
      });

      // Response is ChatResult when stream: false
      const result = response as { choices: Array<{ message: { content: string | null } }> };
      const content = result.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content returned from OpenRouter');
      }

      const parsed = JSON.parse(content);
      return validateFinancialIntent(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('OpenRouter returned invalid JSON. Try a different model.');
      }
      console.error('[OpenRouter] Parsing error:', error instanceof Error ? error.message : error);
      throw error instanceof Error ? error : new Error('Failed to parse intent with OpenRouter');
    }
  }
}
