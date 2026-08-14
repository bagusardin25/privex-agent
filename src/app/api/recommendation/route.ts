import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequestSchema } from '@/lib/validation/schemas';
import { getPortfolio } from '@/lib/portfolio/portfolio-service';
import { generateRecommendation } from '@/lib/risk/risk-engine';
import { getConfidentialProvider } from '@/lib/privacy/confidential-provider';
import type { ApiResponse, Recommendation } from '@/types';

/**
 * POST /api/recommendation
 *
 * Generates a recommendation based on the portfolio analysis.
 * This endpoint:
 * 1. Retrieves the portfolio
 * 2. Runs confidential analysis
 * 3. Generates a deterministic recommendation via the risk engine
 *
 * The LLM is NOT involved in generating the recommendation.
 * The risk engine is fully deterministic and testable.
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const body = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { walletAddress, intent } = parsed.data;

    // Get portfolio
    const portfolio = await getPortfolio(walletAddress);

    // Run confidential analysis
    const provider = getConfidentialProvider();
    const confidentialResult = await provider.analyzePortfolio(portfolio, intent);

    // Generate deterministic recommendation
    const analysis = confidentialResult.result;
    const recommendation = generateRecommendation(portfolio, analysis, intent);

    const response: ApiResponse<{
      recommendation: Recommendation;
      confidentialMode: string;
      analysisHash: string;
    }> = {
      success: true,
      data: {
        recommendation,
        confidentialMode: provider.mode,
        analysisHash: confidentialResult.analysisHash,
      },
      timestamp,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[recommendation] Error:', error instanceof Error ? error.message : error);

    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendation',
      timestamp,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
