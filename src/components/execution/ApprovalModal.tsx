'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, X, ArrowRight, Layers, FileCode, Cpu } from 'lucide-react';
import type { Recommendation } from '@/types';
import { formatBasisPoints } from '@/lib/utils';

interface ApprovalModalProps {
  isOpen: boolean;
  recommendation: Recommendation | null;
  onClose: () => void;
  onConfirm: () => void;
  isExecuting: boolean;
  walletAddress: string;
  mode: 'demo' | 'live';
}

export function ApprovalModal({
  isOpen,
  recommendation,
  onClose,
  onConfirm,
  isExecuting,
  walletAddress,
  mode,
}: ApprovalModalProps) {
  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExecuting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Authorize Financial Action</h3>
            <p className="text-xs text-slate-400">
              Flare Testnet Coston2 • Non-Custodial Verification
            </p>
          </div>
        </div>

        {/* Action Summary Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800/80">
            <span>Action Summary</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-semibold">
              {recommendation.recommendedAction}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Asset:</span>
              <span className="font-bold text-white font-mono">{recommendation.asset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Exposure:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {(recommendation.targetExposure * 100).toFixed(1)}% ({formatBasisPoints(recommendation.targetExposure)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Network:</span>
              <span className="font-bold text-rose-300 font-mono">Flare Coston2 (Chain ID 114)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contract Function:</span>
              <span className="font-mono text-cyan-300">PortfolioActionAgent.recordAction()</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Execution Mode:</span>
              <span className="font-medium text-slate-200 font-mono">
                {mode === 'live' ? 'Live EVM Wallet Signature' : 'Demo Testnet Simulator'}
              </span>
            </div>
          </div>
        </div>

        {/* Security / Privacy Warning */}
        <div className="mb-6 p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            By confirming, you authorize recording this portfolio rebalance action on Flare Coston2 testnet. No sensitive net worth data is exposed.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="w-1/3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isExecuting}
            className="w-2/3 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Executing on Flare...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Execute</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
