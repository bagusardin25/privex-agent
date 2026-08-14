'use client';

import React from 'react';
import { useFinancialAgent } from '@/hooks/useFinancialAgent';
import { Header } from '@/components/layout/Header';
import { TrustHero } from '@/components/layout/TrustHero';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { AgentConsole } from '@/components/agent/AgentConsole';
import { ConfidentialVisualizer } from '@/components/privacy/ConfidentialVisualizer';
import { RecommendationCard } from '@/components/recommendation/RecommendationCard';
import { ApprovalModal } from '@/components/execution/ApprovalModal';
import { ExecutionReceipt } from '@/components/execution/ExecutionReceipt';
import { AuditTimeline } from '@/components/timeline/AuditTimeline';
import { ShieldCheck, Cpu, Activity, ExternalLink, Terminal } from 'lucide-react';
import { flareTestnet } from '@/lib/blockchain/config';

export default function Home() {
  const {
    mode,
    setMode,
    activeAddress,
    portfolio,
    isPortfolioLoading,
    currentPrompt,
    currentIntent,
    isParsingIntent,
    confidentialAnalysis,
    isAnalyzing,
    recommendation,
    isGeneratingRecommendation,
    isApprovalModalOpen,
    setIsApprovalModalOpen,
    isExecuting,
    executionResult,
    executionError,
    timeline,
    activeTab,
    setActiveTab,
    submitInstruction,
    executeApprovedAction,
    resetWorkflow,
  } = useFinancialAgent();

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-between">
      {/* Top Sticky Header */}
      <Header mode={mode} setMode={setMode} onReset={resetWorkflow} />

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Value Prop & Trust Hero */}
        <TrustHero onQuickStart={submitInstruction} />

        {/* Navigation Tabs for Workspace Views */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Portfolio & AI Strategy
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Audit Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('enclave')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'enclave'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Confidential Enclave</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Target: Flare Coston2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Tab View 1: Main Interactive Workspace */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Financial State & AI Input */}
            <div className="space-y-8">
              {/* Portfolio Snapshot */}
              <PortfolioCard
                portfolio={portfolio}
                isLoading={isPortfolioLoading}
                mode={mode}
              />

              {/* AI Strategy Console */}
              <AgentConsole
                onSubmit={submitInstruction}
                isParsing={isParsingIntent}
                currentPrompt={currentPrompt}
                currentIntent={currentIntent}
                error={executionError}
              />
            </div>

            {/* Right Column: Confidential Engine & Recommendation / Execution */}
            <div className="space-y-8">
              {/* Confidential Analysis Visualizer */}
              <ConfidentialVisualizer
                confidentialAnalysis={confidentialAnalysis}
                isAnalyzing={isAnalyzing}
              />

              {/* Recommendation Card */}
              <RecommendationCard
                recommendation={recommendation}
                isGenerating={isGeneratingRecommendation}
                onApprove={() => setIsApprovalModalOpen(true)}
                onReject={resetWorkflow}
              />

              {/* Execution Receipt (shown after transaction confirmed) */}
              {executionResult && (
                <ExecutionReceipt
                  result={executionResult}
                  onReset={resetWorkflow}
                />
              )}

              {/* Compact Timeline below */}
              <AuditTimeline timeline={timeline} />
            </div>
          </div>
        )}

        {/* Tab View 2: Full Audit Timeline */}
        {activeTab === 'audit' && (
          <div className="max-w-3xl mx-auto">
            <AuditTimeline timeline={timeline} />
          </div>
        )}

        {/* Tab View 3: Confidential Enclave Deep Dive */}
        {activeTab === 'enclave' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <ConfidentialVisualizer
              confidentialAnalysis={confidentialAnalysis}
              isAnalyzing={isAnalyzing}
            />

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>How Flare Confidential Compute Protects Financial Data</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                In traditional DeFi and AI integrations, user strategies, exact token balances, and trade thresholds are sent across public APIs and recorded in cleartext. Flare Confidential Compute provides hardware-enforced Trusted Execution Environments (TEEs) that guarantee:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-cyan-400 block mb-1">Data In-Use Encryption</span>
                  <p className="text-slate-400 text-[11px]">
                    User risk criteria and total assets reside in memory encrypted by hardware keys inaccessible to host operators.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">Deterministic Verification</span>
                  <p className="text-slate-400 text-[11px]">
                    Mathematical risk evaluation runs independently of LLM hallucinations and produces a verifiable cryptographic hash.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">Non-Custodial Dispatch</span>
                  <p className="text-slate-400 text-[11px]">
                    Smart contracts on Flare verify user signatures without needing custody or access to private keys.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-rose-400 block mb-1">Zero On-Chain Leakage</span>
                  <p className="text-slate-400 text-[11px]">
                    Only high-level action identifiers and target BPS are stored on-chain, keeping net worth private.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation & Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        recommendation={recommendation}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={executeApprovedAction}
        isExecuting={isExecuting}
        walletAddress={activeAddress}
        mode={mode}
      />

      {/* Institutional Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#090D16] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Flare Private AI Agent</span>
            <span>•</span>
            <span>Flare Summer Signal Hackathon MVP</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://coston2-explorer.flare.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <span>Coston2 Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://docs.flare.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <span>Flare Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
