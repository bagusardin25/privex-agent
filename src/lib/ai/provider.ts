import { FinancialIntent } from '@/types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenRouterProvider } from './openrouter-provider';

export interface AIProvider {
  name: string;
  parseIntent(userMessage: string): Promise<FinancialIntent>;
}

/**
 * Factory function to get the configured AI provider.
 * Reads AI_PROVIDER from environment variables.
 *
 * Supported providers:
 * - "openrouter" (default) — Access 100+ models via OpenRouter
 * - "openai"               — Direct OpenAI API
 * - "gemini"               — Direct Google Gemini API
 */
export function getAIProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER || 'openrouter';

  switch (providerName.toLowerCase()) {
    case 'openrouter':
      return new OpenRouterProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(
        `Unknown AI provider: "${providerName}". Supported: openrouter, openai, gemini`
      );
  }
}
