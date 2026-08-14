import { Portfolio, FinancialIntent, ConfidentialResult } from '@/types';
import { DevConfidentialProvider } from './dev-provider';
import { FlareConfidentialProvider } from './flare-provider';

export interface ConfidentialComputeProvider {
  name: string;
  mode: 'development' | 'flare-fcc';
  analyzePortfolio(portfolio: Portfolio, intent: FinancialIntent): Promise<ConfidentialResult>;
}

/**
 * Factory function to get the configured confidential compute provider.
 * Reads CONFIDENTIAL_MODE from environment variables.
 */
export function getConfidentialProvider(): ConfidentialComputeProvider {
  const mode = process.env.CONFIDENTIAL_MODE || 'development';

  switch (mode) {
    case 'flare-fcc':
      return new FlareConfidentialProvider();
    case 'development':
    default:
      return new DevConfidentialProvider();
  }
}
