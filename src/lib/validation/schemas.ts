import { z } from 'zod';

// Must stay in sync with the allowlist in contracts/PortfolioActionAgent.sol —
// an asset accepted here but missing on-chain reverts with UnsupportedAsset.
export const SUPPORTED_ASSETS = ['XRP', 'FXRP', 'FLR', 'WFLR', 'C2FLR', 'USDC', 'USDT'] as const;
const RISK_PROFILES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const ACTION_TYPES = ['REBALANCE', 'REDUCE_EXPOSURE', 'INCREASE_EXPOSURE', 'HOLD'] as const;

export const financialIntentSchema = z.object({
  asset: z.enum(SUPPORTED_ASSETS, {
    error: 'Asset not supported or unknown',
  }),
  maxExposure: z.number().min(0).max(1),
  riskProfile: z.enum(RISK_PROFILES),
  action: z.enum(ACTION_TYPES),
});

export const parseIntentRequestSchema = z.object({
  message: z.string().min(1),
});

export const analyzeRequestSchema = z.object({
  walletAddress: z.string().min(1),
  intent: financialIntentSchema,
});

export const executeRequestSchema = z.object({
  recommendationId: z.string().min(1),
  walletAddress: z.string().min(1),
  action: z.enum(ACTION_TYPES),
  asset: z.enum(SUPPORTED_ASSETS),
  targetExposure: z.number().min(0).max(1),
});
