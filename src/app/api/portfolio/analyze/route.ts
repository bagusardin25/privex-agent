import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequestSchema } from '@/lib/validation/schemas';
import { getConfidentialProvider } from '@/lib/privacy/confidential-provider';
import { getPortfolio } from '@/lib/portfolio/portfolio-service';
import type { ApiResponse, ConfidentialResult } from '@/types';

/**
 * POST /api/portfolio/analyze
 *
 * Runs a private portfolio analysis against the user's financial rules.
 *
 * The analysis is performed inside the configured confidential execution
 * environment. In development mode, this is a local mock. When integrated
 * with Flare Confidential Compute, this would run inside a TEE.
 *
 * Sensitive portfolio data is NOT returned in the response — only the
 * analysis result (compliant/non-compliant, violations, risk level).
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // Parse and validate
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

    // Get portfolio (demo data for MVP)
    const portfolio = getPortfolio(walletAddress);

    // Get confidential compute provider
    const provider = getConfidentialProvider();

    // Run private analysis
    const result: ConfidentialResult = await provider.analyzePortfolio(portfolio, intent);

    const response: ApiResponse<ConfidentialResult & { providerMode: string }> = {
      success: true,
      data: {
        ...result,
        providerMode: provider.mode,
      },
      timestamp,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[analyze] Error:', error instanceof Error ? error.message : error);

    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze portfolio',
      timestamp,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
