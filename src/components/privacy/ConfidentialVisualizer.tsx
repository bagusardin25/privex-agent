'use client';

import React from 'react';
import { Cpu, ShieldCheck, Lock, CheckCircle2, AlertTriangle, Hash, Server, Layers } from 'lucide-react';
import type { ConfidentialResult } from '@/types';

interface ConfidentialVisualizerProps {
  confidentialAnalysis: ConfidentialResult | null;
  isAnalyzing: boolean;
}

export function ConfidentialVisualizer({
  confidentialAnalysis,
  isAnalyzing,
}: ConfidentialVisualizerProps) {
  if (isAnalyzing) {
    return (
      <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/40 p-6 shadow-xl animate-enclave-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Flare Confidential Compute (TEE) Active</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950/70 border border-cyan-700/60 text-cyan-300">
                In-Enclave
              </span>
            </h3>
            <p className="text-xs text-cyan-200/80">
              Evaluating financial rules against private portfolio data in secure enclave...
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full w-2/3 animate-pulse" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-cyan-300">
            <span>Memory Isolation Verified</span>
            <span>Zero Data Leakage Guaranteed</span>
          </div>
        </div>
      </div>
    );
  }

  if (!confidentialAnalysis) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Confidential Execution Boundary</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Submit an AI strategy instruction to trigger private portfolio analysis inside Flare Confidential Compute.
        </p>
      </div>
    );
  }

  const analysis = confidentialAnalysis.result;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-cyan-900/60 p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Flare Confidential Analysis</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono">
                {confidentialAnalysis.provider === 'flare-fcc' ? 'Flare FCC TEE' : 'Dev Enclave Mock'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated privately without leaking sensitive financial metrics
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-slate-500 uppercase block font-medium">Compliance State</span>
          <span
            className={`text-xs font-bold font-mono ${
              analysis.isCompliant ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {analysis.isCompliant ? 'COMPLIANT' : 'REBALANCE NEEDED'}
          </span>
        </div>
      </div>

      {/* Analysis Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Current Allocation</span>
          <span className="text-base font-bold text-white font-mono">
            {(analysis.currentExposure * 100).toFixed(1)}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Target Max Rule</span>
          <span className="text-base font-bold text-cyan-400 font-mono">
            {(analysis.targetExposure * 100).toFixed(1)}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Exposure Delta</span>
          <span
            className={`text-base font-bold font-mono ${
              analysis.difference > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {analysis.difference > 0 ? `+${(analysis.difference * 100).toFixed(1)}%` : '0%'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Risk Assessment</span>
          <span
            className={`text-base font-bold font-mono ${
              analysis.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {analysis.riskLevel}
          </span>
        </div>
      </div>

      {/* Cryptographic Hash Badge */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px]">Attested Analysis Hash:</span>
        </div>
        <span className="text-cyan-300 font-semibold text-[11px] truncate max-w-[200px] sm:max-w-none">
          {confidentialAnalysis.analysisHash}
        </span>
      </div>
    </div>
  );
}
