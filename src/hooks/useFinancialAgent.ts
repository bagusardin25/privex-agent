'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useConnection, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { flareTestnet } from '@/lib/blockchain/config';
import type {
  ActivityStep,
  ApiResponse,
  ChatMessage,
  ConfidentialResult,
  FinancialIntent,
  Portfolio,
  Recommendation,
  TransactionResult,
} from '@/types';

export type AgentMode = 'demo' | 'live';
export type WorkspaceTab = 'overview' | 'audit' | 'enclave';

/** Stand-in wallet used in demo mode so the flow is explorable without a wallet. */
export const DEMO_ADDRESS = '0x1111111111111111111111111111111111111111';

type PreparedTransaction = {
  to: string;
  data: string;
  chainId: number;
  gasEstimate?: string;
};

/** The four stages of the agent journey, in the order the timeline shows them. */
const STEP_IDS = ['parse', 'analyze', 'recommend', 'execute'] as const;

const STEP_LABELS: Record<(typeof STEP_IDS)[number], string> = {
  parse: 'Interpret instruction',
  analyze: 'Confidential risk analysis',
  recommend: 'Generate recommendation',
  execute: 'Record action on Flare',
};

function initialTimeline(): ActivityStep[] {
  return STEP_IDS.map((id) => ({ id, label: STEP_LABELS[id], status: 'pending' }));
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function describeIntent(intent: FinancialIntent): string {
  const pct = Math.round(intent.maxExposure * 100);
  const verb = intent.action.replace(/_/g, ' ').toLowerCase();
  return `Understood. I read that as **${verb}** on **${intent.asset}**, capping exposure at **${pct}%** under a **${intent.riskProfile}** risk profile. Running the analysis inside the confidential enclave now — your balances never leave it.`;
}

/**
 * Orchestrates the full agent journey:
 *   instruction -> intent -> confidential analysis -> recommendation -> on-chain record
 *
 * The LLM only ever produces the intent. Every number that reaches the chain
 * comes from the deterministic risk engine on the server.
 */
export function useFinancialAgent() {
  const connection = useConnection();
  const walletAddress = connection.address;
  const isWalletConnected = connection.isConnected;
  const connectedChainId = connection.chainId;

  const [mode, setMode] = useState<AgentMode>('demo');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  // ── Agent workflow ─────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentIntent, setCurrentIntent] = useState<FinancialIntent | null>(null);
  const [isParsingIntent, setIsParsingIntent] = useState(false);

  const [confidentialAnalysis, setConfidentialAnalysis] = useState<ConfidentialResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);

  // ── Execution ──────────────────────────────────────────────────────────
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<TransactionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [preparedTx, setPreparedTx] = useState<PreparedTransaction | null>(null);

  const [timeline, setTimeline] = useState<ActivityStep[]>(initialTimeline);

  const { sendTransactionAsync } = useSendTransaction();
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>(undefined);
  const receipt = useWaitForTransactionReceipt({ hash: pendingHash });

  // In demo mode the flow runs against a fixed address so it is explorable
  // without a wallet; in live mode it follows the connected account.
  const activeAddress = mode === 'demo' ? DEMO_ADDRESS : walletAddress;
  const isOnWrongNetwork =
    mode === 'live' && isWalletConnected && connectedChainId !== flareTestnet.id;

  const updateStep = useCallback((id: string, patch: Partial<ActivityStep>) => {
    setTimeline((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, ...patch, timestamp: new Date().toISOString() } : step
      )
    );
  }, []);

  const pushMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const full: ChatMessage = { ...message, id: newId(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, full]);
    return full.id;
  }, []);

  const replaceMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  // ── Portfolio ──────────────────────────────────────────────────────────
  // Fetching lives in TanStack Query rather than an effect: it keys off the
  // active address, so switching demo/live or wallet refetches on its own, and
  // there is no state to clear when the address goes away.
  const portfolioQuery = useQuery({
    queryKey: ['portfolio', activeAddress],
    enabled: Boolean(activeAddress),
    queryFn: async ({ signal }): Promise<Portfolio> => {
      const res = await fetch(`/api/portfolio?wallet=${activeAddress}`, { signal });
      const json: ApiResponse<Portfolio> = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Failed to load portfolio');
      return json.data;
    },
  });

  const portfolio = activeAddress ? (portfolioQuery.data ?? null) : null;
  const isPortfolioLoading = portfolioQuery.isPending && Boolean(activeAddress);
  const portfolioError = portfolioQuery.error
    ? portfolioQuery.error.message || 'Failed to load portfolio'
    : null;

  // ── The main journey ───────────────────────────────────────────────────
  const submitInstruction = useCallback(
    async (message: string) => {
      const instruction = message.trim();
      if (!instruction) return;
      if (!activeAddress) {
        setExecutionError('Connect a wallet or switch to demo mode before sending an instruction.');
        return;
      }

      // A fresh instruction supersedes any earlier result.
      setCurrentPrompt(instruction);
      setCurrentIntent(null);
      setConfidentialAnalysis(null);
      setRecommendation(null);
      setExecutionResult(null);
      setExecutionError(null);
      setPreparedTx(null);
      setTimeline(initialTimeline());

      pushMessage({ role: 'user', content: instruction });
      const agentMessageId = pushMessage({
        role: 'agent',
        content: 'Interpreting your instruction…',
        isPending: true,
      });

      // Step 1 — the LLM turns language into a structured intent, nothing more.
      setIsParsingIntent(true);
      updateStep('parse', { status: 'active' });

      let intent: FinancialIntent;
      try {
        const res = await fetch('/api/ai/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: instruction }),
        });
        const json: ApiResponse<FinancialIntent> = await res.json();
        if (!json.success || !json.data) throw new Error(json.error || 'Could not parse intent');
        intent = json.data;
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'Could not parse that instruction';
        updateStep('parse', { status: 'error', detail });
        replaceMessage(agentMessageId, {
          content: `I couldn't turn that into a financial intent. ${detail}`,
          isPending: false,
          isError: true,
        });
        setExecutionError(detail);
        setIsParsingIntent(false);
        return;
      }

      setCurrentIntent(intent);
      setIsParsingIntent(false);
      updateStep('parse', {
        status: 'completed',
        detail: `${intent.action} · ${intent.asset} · max ${Math.round(intent.maxExposure * 100)}%`,
      });
      replaceMessage(agentMessageId, {
        content: describeIntent(intent),
        intent,
        isPending: false,
      });

      // Step 2 — analysis runs inside the confidential provider.
      setIsAnalyzing(true);
      updateStep('analyze', { status: 'active' });

      let analysis: ConfidentialResult;
      try {
        const res = await fetch('/api/portfolio/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: activeAddress, intent }),
        });
        const json: ApiResponse<ConfidentialResult> = await res.json();
        if (!json.success || !json.data) throw new Error(json.error || 'Analysis failed');
        analysis = json.data;
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'Confidential analysis failed';
        updateStep('analyze', { status: 'error', detail });
        setExecutionError(detail);
        setIsAnalyzing(false);
        pushMessage({ role: 'agent', content: detail, isError: true });
        return;
      }

      setConfidentialAnalysis(analysis);
      setIsAnalyzing(false);
      updateStep('analyze', {
        status: 'completed',
        detail: analysis.result.isCompliant
          ? 'Portfolio is within your stated limits'
          : `${analysis.result.violations.length} limit breach detected`,
      });

      // Step 3 — the deterministic risk engine produces the recommendation.
      setIsGeneratingRecommendation(true);
      updateStep('recommend', { status: 'active' });

      try {
        const res = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: activeAddress, intent }),
        });
        const json: ApiResponse<{ recommendation: Recommendation }> = await res.json();
        if (!json.success || !json.data) throw new Error(json.error || 'Recommendation failed');

        const rec = json.data.recommendation;
        setRecommendation(rec);
        updateStep('recommend', {
          status: 'completed',
          detail: `${rec.recommendedAction} ${rec.asset} → ${Math.round(rec.targetExposure * 100)}%`,
        });

        const summary = rec.issues.length
          ? `${rec.issues.join(' ')} I recommend a **${rec.recommendedAction.replace(/_/g, ' ').toLowerCase()}** on ${rec.asset}, moving exposure from ${Math.round(rec.currentExposure * 100)}% to ${Math.round(rec.targetExposure * 100)}%. Review it on the right and approve if you agree — nothing goes on-chain until you sign.`
          : `Your ${rec.asset} exposure of ${Math.round(rec.currentExposure * 100)}% is already within your ${Math.round(rec.targetExposure * 100)}% limit. No rebalancing is needed, but you can still record this check on-chain.`;

        pushMessage({ role: 'agent', content: summary });
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'Recommendation failed';
        updateStep('recommend', { status: 'error', detail });
        setExecutionError(detail);
        pushMessage({ role: 'agent', content: detail, isError: true });
      } finally {
        setIsGeneratingRecommendation(false);
      }
    },
    [activeAddress, pushMessage, replaceMessage, updateStep]
  );

  /**
   * Asks the server to prepare the calldata for the approved action.
   * The server owns the action→enum and exposure→bps mapping, so the client
   * never fabricates what gets written on chain.
   */
  const prepareTransaction = useCallback(async (): Promise<PreparedTransaction | null> => {
    if (!recommendation || !activeAddress) return null;
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          walletAddress: activeAddress,
          action: recommendation.recommendedAction,
          asset: recommendation.asset,
          targetExposure: recommendation.targetExposure,
        }),
      });
      const json: ApiResponse<{ transaction: PreparedTransaction }> = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Could not prepare transaction');
      setPreparedTx(json.data.transaction);
      return json.data.transaction;
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : 'Could not prepare transaction');
      return null;
    }
  }, [recommendation, activeAddress]);

  /**
   * Opens the approval modal and prepares the calldata in the same gesture, so
   * the modal can show exactly what will be written before the user commits.
   * Preparing here (an event) rather than in an effect avoids a cascading
   * render and keeps the request tied to the user's actual intent.
   */
  const openApproval = useCallback(() => {
    setIsApprovalModalOpen(true);
    if (recommendation && !preparedTx) void prepareTransaction();
  }, [recommendation, preparedTx, prepareTransaction]);

  const executeApprovedAction = useCallback(async () => {
    if (!recommendation || !activeAddress) return;

    setIsExecuting(true);
    setExecutionError(null);
    updateStep('execute', { status: 'active' });

    try {
      if (mode === 'demo') {
        // Demo mode never touches a wallet. The hash is clearly synthetic and
        // the receipt labels it as simulated so nobody mistakes it for real.
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const simulatedHash = `0xdem0${newId().replace(/-/g, '').slice(0, 59)}`;
        setExecutionResult({
          success: true,
          transactionHash: simulatedHash,
          network: 'Flare Testnet (Coston2) — simulated',
          explorerUrl: '',
          action: recommendation.recommendedAction,
          asset: recommendation.asset,
          previousExposure: recommendation.currentExposure,
          newExposure: recommendation.targetExposure,
          timestamp: new Date().toISOString(),
        });
        updateStep('execute', { status: 'completed', detail: 'Simulated — no chain write' });
        setIsApprovalModalOpen(false);
        pushMessage({
          role: 'agent',
          content:
            'Recorded in demo mode. No transaction was broadcast and no funds moved. Switch to live mode with a funded Coston2 wallet to write this to Flare for real.',
        });
        return;
      }

      // Live mode — the user's own wallet signs and broadcasts.
      if (!isWalletConnected) throw new Error('Connect your wallet to record this action.');
      if (isOnWrongNetwork) throw new Error('Switch your wallet to Flare Coston2 (chain 114).');

      const tx = preparedTx ?? (await prepareTransaction());
      if (!tx) throw new Error('Transaction could not be prepared.');

      const hash = await sendTransactionAsync({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        chainId: flareTestnet.id,
      });

      setPendingHash(hash);
      setExecutionResult({
        success: true,
        transactionHash: hash,
        network: 'Flare Testnet (Coston2)',
        explorerUrl: `${flareTestnet.blockExplorers.default.url}/tx/${hash}`,
        action: recommendation.recommendedAction,
        asset: recommendation.asset,
        previousExposure: recommendation.currentExposure,
        newExposure: recommendation.targetExposure,
        timestamp: new Date().toISOString(),
      });
      updateStep('execute', { status: 'active', detail: 'Broadcast — waiting for confirmation' });
      setIsApprovalModalOpen(false);
      pushMessage({
        role: 'agent',
        content: `Transaction broadcast to Flare Coston2. Waiting for confirmation — you can follow it on the explorer from the receipt below.`,
      });
    } catch (err) {
      // Wallet rejections are a normal outcome, not a system failure.
      const raw = err instanceof Error ? err.message : 'Transaction failed';
      const detail = /user rejected|denied|rejected the request/i.test(raw)
        ? 'You rejected the transaction in your wallet. Nothing was recorded.'
        : raw;
      setExecutionError(detail);
      updateStep('execute', { status: 'error', detail });
      pushMessage({ role: 'agent', content: detail, isError: true });
    } finally {
      setIsExecuting(false);
    }
  }, [
    recommendation,
    activeAddress,
    mode,
    isWalletConnected,
    isOnWrongNetwork,
    preparedTx,
    prepareTransaction,
    sendTransactionAsync,
    updateStep,
    pushMessage,
  ]);

  // The receipt is external state owned by wagmi, so the confirmed outcome is
  // derived from it at render time rather than copied back into our own state.
  const receiptData = receipt.data;
  const isReverted = Boolean(pendingHash && receiptData && receiptData.status !== 'success');

  const effectiveTimeline = useMemo(() => {
    if (!pendingHash || !receiptData) return timeline;
    const success = receiptData.status === 'success';
    return timeline.map((step) =>
      step.id === 'execute'
        ? {
            ...step,
            status: success ? ('completed' as const) : ('error' as const),
            detail: success
              ? `Confirmed in block ${receiptData.blockNumber}`
              : 'Transaction reverted on-chain',
          }
        : step
    );
  }, [timeline, pendingHash, receiptData]);

  const effectiveError =
    executionError ?? (isReverted ? 'The transaction reverted on-chain.' : null);

  const resetWorkflow = useCallback(() => {
    setCurrentPrompt('');
    setCurrentIntent(null);
    setConfidentialAnalysis(null);
    setRecommendation(null);
    setExecutionResult(null);
    setExecutionError(null);
    setPreparedTx(null);
    setPendingHash(undefined);
    setIsApprovalModalOpen(false);
    setMessages([]);
    setTimeline(initialTimeline());
  }, []);

  const isBusy =
    isParsingIntent || isAnalyzing || isGeneratingRecommendation || isExecuting;

  return useMemo(
    () => ({
      // mode + identity
      mode,
      setMode,
      activeAddress,
      walletAddress,
      isWalletConnected,
      isOnWrongNetwork,

      // portfolio
      portfolio,
      isPortfolioLoading,
      portfolioError,
      reloadPortfolio: () => void portfolioQuery.refetch(),

      // chat + intent
      messages,
      currentPrompt,
      currentIntent,
      isParsingIntent,

      // analysis + recommendation
      confidentialAnalysis,
      isAnalyzing,
      recommendation,
      isGeneratingRecommendation,

      // execution
      isApprovalModalOpen,
      setIsApprovalModalOpen,
      openApproval,
      isExecuting,
      executionResult,
      executionError: effectiveError,
      preparedTx,
      isConfirming: Boolean(pendingHash) && receipt.isLoading,

      // shell
      timeline: effectiveTimeline,
      activeTab,
      setActiveTab,
      isBusy,

      // actions
      submitInstruction,
      executeApprovedAction,
      resetWorkflow,
    }),
    [
      mode,
      activeAddress,
      walletAddress,
      isWalletConnected,
      isOnWrongNetwork,
      portfolio,
      isPortfolioLoading,
      portfolioError,
      portfolioQuery,
      messages,
      currentPrompt,
      currentIntent,
      isParsingIntent,
      confidentialAnalysis,
      isAnalyzing,
      recommendation,
      isGeneratingRecommendation,
      isApprovalModalOpen,
      openApproval,
      isExecuting,
      executionResult,
      effectiveError,
      preparedTx,
      pendingHash,
      receipt.isLoading,
      effectiveTimeline,
      activeTab,
      isBusy,
      submitInstruction,
      executeApprovedAction,
      resetWorkflow,
    ]
  );
}
