// Portfolio types
export interface PortfolioAsset {
  symbol: string;
  name: string;
  allocation: number; // 0-1 (percentage as decimal)
  value: number; // USD value
}

export interface Portfolio {
  totalValue: number;
  assets: PortfolioAsset[];
  riskProfile: RiskProfile;
  lastUpdated: string;
}

export type RiskProfile = 'LOW' | 'MEDIUM' | 'HIGH';

export type ActionType = 'REBALANCE' | 'REDUCE_EXPOSURE' | 'INCREASE_EXPOSURE' | 'HOLD';

// Financial Intent - output from AI
export interface FinancialIntent {
  asset: string;
  maxExposure: number; // 0-1
  riskProfile: RiskProfile;
  action: ActionType;
}

// Risk Analysis
export interface RiskAnalysis {
  currentExposure: number;
  targetExposure: number;
  difference: number;
  isCompliant: boolean;
  riskLevel: RiskProfile;
  violations: RiskViolation[];
}

export interface RiskViolation {
  asset: string;
  currentExposure: number;
  maxAllowed: number;
  severity: 'WARNING' | 'CRITICAL';
}

// Recommendation
export interface Recommendation {
  id: string;
  portfolioRisk: RiskProfile;
  issues: string[];
  recommendedAction: ActionType;
  asset: string;
  currentExposure: number;
  targetExposure: number;
  expectedResult: {
    newExposure: number;
    newRiskProfile: RiskProfile;
  };
  timestamp: string;
}

// Transaction
export interface TransactionRequest {
  recommendationId: string;
  walletAddress: string;
  action: ActionType;
  asset: string;
  targetExposure: number;
}

export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  network: string;
  explorerUrl: string;
  action: ActionType;
  asset: string;
  previousExposure: number;
  newExposure: number;
  timestamp: string;
}

// Chat AI console
export type ChatRole = 'user' | 'agent';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Rendered body of the message. */
  content: string;
  timestamp: string;
  /** Set on agent messages that resolved to a structured intent. */
  intent?: FinancialIntent;
  /** Marks an agent message as a failure so it can be styled as such. */
  isError?: boolean;
  /** True while the agent is still working on this message. */
  isPending?: boolean;
}

// Activity timeline
export interface ActivityStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: string;
  detail?: string;
}

// Confidential Compute
export interface ConfidentialResult {
  analysisHash: string;
  provider: 'development' | 'flare-fcc';
  attestation?: string;
  /**
   * True when the analysis ran locally rather than inside an attested TEE.
   * Both current providers set this: the development provider is a mock, and
   * the Flare provider is still a stub that falls back to local execution.
   * The UI must surface this so a simulated run is never shown as a real one.
   */
  isSimulated: boolean;
  result: RiskAnalysis;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
