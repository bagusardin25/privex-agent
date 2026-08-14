import { NextRequest, NextResponse } from 'next/server';
import { parseIntentRequestSchema } from '@/lib/validation/schemas';
import { getAIProvider } from '@/lib/ai/provider';
import type { ApiResponse, FinancialIntent } from '@/types';

/**
 * POST /api/ai/parse-intent
 *
 * Accepts a natural-language financial instruction and returns
 * a validated, structured FinancialIntent.
 *
 * The LLM is used ONLY as an interpreter — it never controls funds,
 * generates contract addresses, or produces transaction calldata.
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // Parse and validate request body
    const body = await request.json();
    const parsed = parseIntentRequestSchema.safeParse(body);

    if (!parsed.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { message } = parsed.data;

    // Get the configured AI provider
    const provider = getAIProvider();

    // Parse intent using AI (output is validated with Zod)
    const intent: FinancialIntent = await provider.parseIntent(message);

    const response: ApiResponse<FinancialIntent> = {
      success: true,
      data: intent,
      timestamp,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[parse-intent] Error:', error instanceof Error ? error.message : error);

    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse financial intent',
      timestamp,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
