'use client';

import React from 'react';
import { useFinancialAgent } from '@/hooks/useFinancialAgent';
import { Header } from '@/components/layout/Header';
import { TrustHero } from '@/components/layout/TrustHero';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { AgentConsole } from '@/components/agent/AgentConsole';
import { ConfidentialVisualizer } from '@/components/privacy/ConfidentialVisualizer';
import { RecommendationCard } from '@/components/recommendation/RecommendationCard';
import { ApprovalModal } from '@/components/execution/ApprovalModal';
import { ExecutionReceipt } from '@/components/execution/ExecutionReceipt';
import { AuditTimeline } from '@/components/timeline/AuditTimeline';
import { Activity, Cpu, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Portfolio & AI strategy', icon: null },
  { id: 'audit', label: 'Audit timeline', icon: Activity },
  { id: 'enclave', label: 'Confidential enclave', icon: Cpu },
] as const;

export default function DashboardPage() {
  const {
    mode,
    setMode,
    activeAddress,
    isWalletConnected,
    isOnWrongNetwork,
    portfolio,
    isPortfolioLoading,
    portfolioError,
    reloadPortfolio,
    messages,
    currentPrompt,
    currentIntent,
    isParsingIntent,
    confidentialAnalysis,
    isAnalyzing,
    recommendation,
    isGeneratingRecommendation,
    isApprovalModalOpen,
    setIsApprovalModalOpen,
    openApproval,
    isExecuting,
    executionResult,
    executionError,
    preparedTx,
    isConfirming,
    timeline,
    activeTab,
    setActiveTab,
    submitInstruction,
    executeApprovedAction,
    resetWorkflow,
  } = useFinancialAgent();

  // In live mode the whole journey needs a connected wallet on the right chain.
  const liveBlocked = mode === 'live' && (!isWalletConnected || isOnWrongNetwork);
  const liveBlockedReason = !isWalletConnected
    ? 'Connect a wallet to use live mode, or switch to demo.'
    : 'Switch your wallet to Flare Coston2 to continue.';

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode={mode} setMode={setMode} onReset={resetWorkflow} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <TrustHero />

        {/* Workspace tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3 mb-6">
          <div
            role="tablist"
            aria-label="Workspace views"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
            <span>Flare Coston2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <PortfolioCard
                portfolio={portfolio}
                isLoading={isPortfolioLoading}
                mode={mode}
                error={portfolioError}
                onReload={reloadPortfolio}
              />
              <AgentConsole
                onSubmit={submitInstruction}
                isParsing={isParsingIntent}
                messages={messages}
                currentPrompt={currentPrompt}
                currentIntent={currentIntent}
                error={executionError}
                disabled={liveBlocked}
                disabledReason={liveBlocked ? liveBlockedReason : undefined}
              />
            </div>

            <div className="space-y-6">
              <ConfidentialVisualizer
                confidentialAnalysis={confidentialAnalysis}
                isAnalyzing={isAnalyzing}
              />
              <RecommendationCard
                recommendation={recommendation}
                isGenerating={isGeneratingRecommendation}
                onApprove={openApproval}
                onReject={resetWorkflow}
                disabled={liveBlocked}
                disabledReason={liveBlocked ? liveBlockedReason : undefined}
              />
              {executionResult && (
                <ExecutionReceipt
                  result={executionResult}
                  onReset={resetWorkflow}
                  isConfirming={isConfirming}
                />
              )}
              <AuditTimeline timeline={timeline} />
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <AuditTimeline timeline={timeline} />
            {executionResult && (
              <ExecutionReceipt
                result={executionResult}
                onReset={resetWorkflow}
                isConfirming={isConfirming}
              />
            )}
          </div>
        )}

        {activeTab === 'enclave' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <ConfidentialVisualizer
              confidentialAnalysis={confidentialAnalysis}
              isAnalyzing={isAnalyzing}
            />

            <div className="rounded-2xl glass-panel p-6">
              <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>How confidential compute protects financial data</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                In a typical AI-plus-DeFi integration, your strategy, exact balances, and trade
                thresholds are sent across public APIs in cleartext. Flare Confidential Compute
                uses hardware-enforced Trusted Execution Environments so that:
              </p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    term: 'Data stays encrypted in use',
                    color: 'text-sky-400',
                    def: 'Risk criteria and balances sit in memory encrypted by hardware keys the host operator cannot read.',
                  },
                  {
                    term: 'Verification is deterministic',
                    color: 'text-amber-400',
                    def: 'The risk maths runs independently of the language model, so a hallucination cannot change a number.',
                  },
                  {
                    term: 'Dispatch is non-custodial',
                    color: 'text-emerald-400',
                    def: 'Contracts verify your signature. Nothing in the system ever holds your keys or your assets.',
                  },
                  {
                    term: 'On-chain leakage is minimal',
                    color: 'text-rose-400',
                    def: 'Only the action type, asset, target basis points, and a recommendation hash are stored.',
                  },
                ].map(({ term, color, def }) => (
                  <div key={term} className="rounded-xl border border-white/10 bg-white/3 p-3">
                    <dt className={`text-xs font-bold mb-1 ${color}`}>{term}</dt>
                    <dd className="text-[11px] text-slate-400 leading-relaxed">{def}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </main>

      <ApprovalModal
        isOpen={isApprovalModalOpen}
        recommendation={recommendation}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={executeApprovedAction}
        isExecuting={isExecuting}
        walletAddress={activeAddress}
        mode={mode}
        preparedTx={preparedTx}
        isWalletConnected={isWalletConnected}
        isOnWrongNetwork={isOnWrongNetwork}
        error={executionError}
      />

      <SiteFooter />
    </div>
  );
}
