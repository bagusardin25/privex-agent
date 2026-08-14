import { Portfolio, PortfolioAsset, RiskProfile, FinancialIntent } from '@/types';
import { DEMO_HOLDINGS } from './demo-data';
import { getFtsoPrices } from '@/lib/flare/ftso';

/**
 * Get the portfolio for a given wallet address.
 *
 * The *holdings* are still demo data — real on-chain indexing is not built yet.
 * The *valuation* is not: quantities are priced against live FTSOv2 feeds, so
 * allocations (and every risk verdict derived from them) come from Flare's
 * oracle rather than from hardcoded USD figures.
 */
export async function getPortfolio(walletAddress: string): Promise<Portfolio> {
  // TODO: Replace demo holdings with real on-chain portfolio indexing.
  const pricing = await getFtsoPrices();

  const priced = DEMO_HOLDINGS.map(holding => {
    const unitPrice = pricing.bySymbol[holding.symbol] ?? 0;
    return { ...holding, unitPrice, value: holding.quantity * unitPrice };
  });

  const totalValue = priced.reduce((sum, a) => sum + a.value, 0);

  const assets: PortfolioAsset[] = priced.map(a => ({
    symbol: a.symbol,
    name: a.name,
    quantity: a.quantity,
    unitPrice: a.unitPrice,
    value: a.value,
    allocation: totalValue > 0 ? a.value / totalValue : 0,
  }));

  return {
    totalValue,
    assets,
    riskProfile: calculateRiskProfile(assets),
    lastUpdated: new Date().toISOString(),
    pricing: {
      source: pricing.source,
      ftsoAddress: pricing.ftsoAddress,
      feedTimestamp: pricing.feedTimestamp,
      feeds: pricing.feeds,
    },
  };
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

  // Quantities are re-derived from the projected value at the same oracle
  // price, so the projection stays internally consistent with its pricing.
  const reprice = (asset: PortfolioAsset, allocation: number): PortfolioAsset => {
    const value = portfolio.totalValue * allocation;
    return {
      ...asset,
      allocation,
      value,
      quantity: asset.unitPrice > 0 ? value / asset.unitPrice : asset.quantity,
    };
  };

  const updatedAssets: PortfolioAsset[] = portfolio.assets.map(asset => {
    if (asset.symbol === intent.asset) {
      return reprice(asset, newTargetAlloc);
    }

    // Proportionally redistribute
    const proportion = otherTotalAlloc > 0 ? asset.allocation / otherTotalAlloc : 1 / otherAssets.length;
    const newAlloc = asset.allocation + (allocDiff * proportion);
    return reprice(asset, Math.max(0, Math.min(1, newAlloc)));
  });

  return {
    ...portfolio,
    assets: updatedAssets,
    riskProfile: calculateRiskProfile(updatedAssets),
    lastUpdated: new Date().toISOString(),
  };
}
