import { ConfidentialComputeProvider } from './confidential-provider';
import { Portfolio, FinancialIntent, ConfidentialResult } from '@/types';
import { evaluatePortfolio } from '@/lib/risk/risk-engine';

export class DevConfidentialProvider implements ConfidentialComputeProvider {
  name = 'Development Mock TEE';
  mode = 'development' as const;

  async analyzePortfolio(portfolio: Portfolio, intent: FinancialIntent): Promise<ConfidentialResult> {
    // Artificial delay to simulate compute
    await new Promise(resolve => setTimeout(resolve, 500));

    const analysis = evaluatePortfolio(portfolio, intent);
    
    // IMPORTANT: Never claims to be real confidential compute
    return {
      analysisHash: `mock-hash-${Date.now()}`,
      provider: this.mode,
      attestation: 'fake-attestation-for-dev-only',
      result: analysis,
    };
  }
}
