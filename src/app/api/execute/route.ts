import { NextRequest, NextResponse } from 'next/server';
import { executeRequestSchema } from '@/lib/validation/schemas';
import type { ApiResponse } from '@/types';
import { createPublicClient, http, keccak256, toHex, encodeFunctionData } from 'viem';
import { flareTestnet } from '@/lib/blockchain/config';
import { PORTFOLIO_ACTION_AGENT_ABI } from '@/lib/blockchain/contracts';

/**
 * POST /api/execute
 *
 * Prepares a transaction for executing an approved portfolio action
 * on Flare Testnet.
 *
 * This endpoint does NOT sign or send the transaction. It prepares
 * the transaction data that the user's wallet will sign and send.
 * The user must explicitly confirm in their wallet.
 *
 * Flow:
 * 1. Validate the request
 * 2. Prepare contract call data
 * 3. Return unsigned transaction data for wallet signing
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const body = await request.json();
    const parsed = executeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { recommendationId, walletAddress, action, asset, targetExposure } = parsed.data;

    // Get contract address from environment
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Smart contract not deployed. Set NEXT_PUBLIC_CONTRACT_ADDRESS in environment.',
        timestamp,
      };
      return NextResponse.json(response, { status: 503 });
    }

    // Map action type to contract enum
    const actionTypeMap: Record<string, number> = {
      'REBALANCE': 0,
      'REDUCE_EXPOSURE': 1,
      'INCREASE_EXPOSURE': 2,
      'HOLD': 3,
    };

    const actionTypeValue = actionTypeMap[action];
    if (actionTypeValue === undefined) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Unknown action type: ${action}`,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Convert exposure to basis points (0.40 -> 4000)
    const targetExposureBps = BigInt(Math.round(targetExposure * 10000));

    // Hash the recommendation ID for on-chain reference
    const recommendationHash = keccak256(toHex(recommendationId));

    // Encode the function call
    const callData = encodeFunctionData({
      abi: PORTFOLIO_ACTION_AGENT_ABI,
      functionName: 'recordAction',
      args: [actionTypeValue, asset, targetExposureBps, recommendationHash],
    });

    // Create a public client to estimate gas
    const publicClient = createPublicClient({
      chain: flareTestnet,
      transport: http(),
    });

    // Estimate gas (optional, wallets usually do this)
    let gasEstimate: bigint | undefined;
    try {
      gasEstimate = await publicClient.estimateGas({
        account: walletAddress as `0x${string}`,
        to: contractAddress as `0x${string}`,
        data: callData,
      });
    } catch {
      // Gas estimation may fail if contract isn't deployed yet
      gasEstimate = undefined;
    }

    // Return transaction data for wallet signing
    const response: ApiResponse<{
      transaction: {
        to: string;
        data: string;
        chainId: number;
        gasEstimate?: string;
      };
      action: string;
      asset: string;
      targetExposure: number;
      targetExposureBps: string;
      recommendationHash: string;
      network: string;
      explorerUrl: string;
    }> = {
      success: true,
      data: {
        transaction: {
          to: contractAddress,
          data: callData,
          chainId: flareTestnet.id,
          ...(gasEstimate ? { gasEstimate: gasEstimate.toString() } : {}),
        },
        action,
        asset,
        targetExposure,
        targetExposureBps: targetExposureBps.toString(),
        recommendationHash,
        network: 'Flare Testnet (Coston2)',
        explorerUrl: flareTestnet.blockExplorers.default.url,
      },
      timestamp,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[execute] Error:', error instanceof Error ? error.message : error);

    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prepare transaction',
      timestamp,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
