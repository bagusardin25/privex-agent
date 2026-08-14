import { Portfolio, FinancialIntent, RiskAnalysis, Recommendation, RiskViolation, RiskProfile } from '@/types';

export function evaluatePortfolio(portfolio: Portfolio, intent: FinancialIntent): RiskAnalysis {
  const asset = portfolio.assets.find(a => a.symbol === intent.asset);
  const currentExposure = asset ? asset.allocation : 0;
  const difference = intent.maxExposure - currentExposure;
  
  const violations: RiskViolation[] = [];
  if (currentExposure > intent.maxExposure) {
    violations.push({
      asset: intent.asset,
      currentExposure,
      maxAllowed: intent.maxExposure,
      severity: currentExposure - intent.maxExposure > 0.1 ? 'CRITICAL' : 'WARNING',
    });
  }

  return {
    currentExposure,
    targetExposure: intent.maxExposure,
    difference,
    isCompliant: violations.length === 0,
    riskLevel: portfolio.riskProfile,
    violations,
  };
}

export function generateRecommendation(portfolio: Portfolio, analysis: RiskAnalysis, intent: FinancialIntent): Recommendation {
  const issues = analysis.violations.map(v => 
    `Exposure to ${v.asset} is ${Math.round(v.currentExposure * 100)}%, exceeding the allowed ${Math.round(v.maxAllowed * 100)}%.`
  );

  let expectedRiskProfile: RiskProfile = portfolio.riskProfile;
  if (intent.action === 'REDUCE_EXPOSURE' && portfolio.riskProfile === 'HIGH') {
    expectedRiskProfile = 'MEDIUM'; // Simplistic recalculation
  }

  return {
    id: crypto.randomUUID(),
    portfolioRisk: portfolio.riskProfile,
    issues,
    recommendedAction: intent.action,
    asset: intent.asset,
    currentExposure: analysis.currentExposure,
    targetExposure: analysis.targetExposure,
    expectedResult: {
      newExposure: analysis.targetExposure,
      newRiskProfile: expectedRiskProfile,
    },
    timestamp: new Date().toISOString(),
  };
}
