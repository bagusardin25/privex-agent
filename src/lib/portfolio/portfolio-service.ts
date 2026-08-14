import { Portfolio, PortfolioAsset, RiskProfile, FinancialIntent } from '@/types';
import { DEMO_PORTFOLIO } from './demo-data';

/**
 * Get the portfolio for a given wallet address.
 * For the hackathon MVP, this returns demo portfolio data.
 * The architecture is ready to replace demo data with real on-chain data.
 */
export function getPortfolio(walletAddress: string): Portfolio {
  // In MVP mode, return demo data regardless of wallet
  // TODO: Replace with real on-chain portfolio indexing
  return { ...DEMO_PORTFOLIO, lastUpdated: new Date().toISOString() };
}

/**
 * Calculate risk profile based on asset allocations.
 * Simplistic model: higher volatile asset exposure = higher risk.
 */
export function calculateRiskProfile(assets: PortfolioAsset[]): RiskProfile {
  const volatileExposure = assets
    .filter(a => ['XRP', 'FXRP'].includes(a.symbol))
    .reduce((sum, a) => sum + a.allocation, 0);

  if (volatileExposure > 0.8) return 'HIGH';
  if (volatileExposure > 0.4) return 'MEDIUM';
  return 'LOW';
}

/**
 * Simulate a rebalance operation on the portfolio.
 * Returns the projected portfolio after applying the intent.
 */
export function simulateRebalance(portfolio: Portfolio, intent: FinancialIntent): Portfolio {
  const targetAsset = portfolio.assets.find(a => a.symbol === intent.asset);
  if (!targetAsset) return portfolio;

  const currentTargetAlloc = targetAsset.allocation;
  const newTargetAlloc = intent.maxExposure;
  const allocDiff = currentTargetAlloc - newTargetAlloc;

  // Redistribute the freed allocation proportionally to other assets
  const otherAssets = portfolio.assets.filter(a => a.symbol !== intent.asset);
  const otherTotalAlloc = otherAssets.reduce((sum, a) => sum + a.allocation, 0);

  const updatedAssets: PortfolioAsset[] = portfolio.assets.map(asset => {
    if (asset.symbol === intent.asset) {
      return {
        ...asset,
        allocation: newTargetAlloc,
        value: portfolio.totalValue * newTargetAlloc,
      };
    }

    // Proportionally redistribute
    const proportion = otherTotalAlloc > 0 ? asset.allocation / otherTotalAlloc : 1 / otherAssets.length;
    const newAlloc = asset.allocation + (allocDiff * proportion);
    return {
      ...asset,
      allocation: Math.max(0, Math.min(1, newAlloc)),
      value: portfolio.totalValue * Math.max(0, Math.min(1, newAlloc)),
    };
  });

  return {
    ...portfolio,
    assets: updatedAssets,
    riskProfile: calculateRiskProfile(updatedAssets),
    lastUpdated: new Date().toISOString(),
  };
}
