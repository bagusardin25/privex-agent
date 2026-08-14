'use client';

import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Copy, Check, ArrowRight, ShieldCheck, RefreshCw, Hash } from 'lucide-react';
import type { TransactionResult } from '@/types';
import { formatAddress, formatPercent } from '@/lib/utils';

interface ExecutionReceiptProps {
  result: TransactionResult | null;
  onReset: () => void;
}

export function ExecutionReceipt({ result, onReset }: ExecutionReceiptProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/40 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Action Executed & Confirmed</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                On-Chain Recorded
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Transaction successfully settled on Flare Testnet Coston2
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Strategy</span>
        </button>
      </div>

      {/* Transaction Details Table */}
      <div className="space-y-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transaction Hash:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300 text-xs">
                {formatAddress(result.transactionHash)}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy Transaction Hash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
            <span className="text-slate-400">Network:</span>
            <span className="font-mono text-white text-xs">{result.network}</span>
          </div>
        </div>

        {/* Before vs After Exposure Transformation */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Portfolio Allocation Rebalance
          </span>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 uppercase block">Before Action</span>
              <span className="text-sm font-bold text-rose-400 font-mono">
                {result.asset} {formatPercent(result.previousExposure)}
              </span>
              <span className="text-[10px] text-slate-500 block">High Risk Violation</span>
            </div>

            <div className="p-2 rounded-full bg-slate-800 text-slate-400">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase block">After Rebalance</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {result.asset} {formatPercent(result.newExposure)}
              </span>
              <span className="text-[10px] text-emerald-400 block font-medium">Within Target & Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Deep Link */}
      <a
        href={result.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-cyan-300 border border-cyan-800/40 hover:border-cyan-700 transition-all flex items-center justify-center gap-2 group"
      >
        <span>View On-Chain Receipt on Coston2 Explorer</span>
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}
