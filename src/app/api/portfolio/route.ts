import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/portfolio/portfolio-service';
import type { ApiResponse, Portfolio } from '@/types';

/**
 * GET /api/portfolio?wallet=0x...
 *
 * Returns the portfolio for a given wallet address.
 * For the hackathon MVP, this returns demo portfolio data.
 * The architecture is ready to replace with real on-chain data.
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required query parameter: wallet',
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid wallet address format',
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const portfolio = getPortfolio(walletAddress);

    const response: ApiResponse<Portfolio & { mode: string }> = {
      success: true,
      data: {
        ...portfolio,
        mode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'demo' : 'live',
      },
      timestamp,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[portfolio] Error:', error instanceof Error ? error.message : error);

    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio',
      timestamp,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
