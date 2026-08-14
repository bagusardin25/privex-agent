'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle, ShieldAlert, Sparkles, Scale } from 'lucide-react';
import type { Recommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: Recommendation | null;
  isGenerating: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function RecommendationCard({
  recommendation,
  isGenerating,
  onApprove,
  onReject,
}: RecommendationCardProps) {
  if (isGenerating) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4" />
        <div className="h-16 w-full bg-slate-800 rounded mb-4" />
        <div className="h-10 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  if (!recommendation) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/40 p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Risk Recommendation</h3>
            <span className="text-[11px] text-slate-400">
              Deterministic Output from Risk Calculation Engine
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/70 border border-rose-800/60 text-rose-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Violation Detected</span>
        </span>
      </div>

      {/* Issues list */}
      <div className="mb-4 space-y-2">
        {recommendation.issues.map((issue, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2.5"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{issue}</p>
          </div>
        ))}
      </div>

      {/* Recommended Action Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Recommended Action
        </span>
        <div className="text-sm font-bold text-amber-300 mb-3">
          {recommendation.recommendedAction.replace(/_/g, ' ')} ({recommendation.asset})
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Current Exposure</span>
            <div className="text-base font-bold font-mono text-slate-300">
              {(recommendation.currentExposure * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-rose-400">Exceeds limit</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Projected Target</span>
            <div className="text-base font-bold font-mono text-emerald-400">
              {(recommendation.targetExposure * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-emerald-400">
              New Risk: {recommendation.expectedResult.newRiskProfile}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onApprove}
          className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approve Action</span>
        </button>

        <button
          onClick={onReject}
          className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <XCircle className="w-4 h-4" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
