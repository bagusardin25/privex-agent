'use client';

import React from 'react';
import { ArrowRight, ClipboardCheck, Sparkles } from 'lucide-react';
import { Badge, Button, Panel, PanelHeader, Skeleton } from '@/components/ui/primitives';
import type { ActionType, Recommendation } from '@/types';

const ACTION_LABEL: Record<ActionType, string> = {
  REBALANCE: 'Rebalance',
  REDUCE_EXPOSURE: 'Reduce exposure',
  INCREASE_EXPOSURE: 'Increase exposure',
  HOLD: 'Hold',
};

export function RecommendationCard({
  recommendation,
  isGenerating,
  onApprove,
  onReject,
  disabled = false,
  disabledReason,
}: {
  recommendation: Recommendation | null;
  isGenerating: boolean;
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <Panel accent={recommendation ? 'gold' : 'default'}>
      <PanelHeader
        icon={<ClipboardCheck className="w-4 h-4 text-amber-400" />}
        title="Recommended action"
        subtitle="Produced by the deterministic risk engine, not the language model"
        action={
          recommendation ? (
            <Badge tone="amber">{ACTION_LABEL[recommendation.recommendedAction]}</Badge>
          ) : null
        }
      />

      <div className="p-5">
        {isGenerating ? (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            <span className="sr-only">Generating recommendation…</span>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !recommendation ? (
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 text-center">
            <Sparkles className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200 mt-2">No recommendation yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Tell the agent what you want in the console and a proposal will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-rise">
            {/* The exposure move, stated as plainly as possible. */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 p-4">
              <div className="text-center flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Current
                </p>
                <p className="text-2xl font-bold text-white tabular-nums mt-0.5">
                  {Math.round(recommendation.currentExposure * 100)}%
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" aria-label="changes to" />
              <div className="text-center flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Target
                </p>
                <p className="text-2xl font-bold text-amber-400 tabular-nums mt-0.5">
                  {Math.round(recommendation.targetExposure * 100)}%
                </p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-white/10" aria-hidden="true" />
              <div className="hidden sm:block text-center flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Asset
                </p>
                <p className="text-2xl font-bold text-white mt-0.5 truncate">
                  {recommendation.asset}
                </p>
              </div>
            </div>

            {recommendation.issues.length > 0 && (
              <ul className="space-y-1.5">
                {recommendation.issues.map((issue, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-rose-400 shrink-0" aria-hidden="true">
                      •
                    </span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold shrink-0">
                Expected risk
              </span>
              <span className="text-xs font-semibold text-white">
                {recommendation.portfolioRisk} → {recommendation.expectedResult.newRiskProfile}
              </span>
            </div>

            {disabled && disabledReason && (
              <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                {disabledReason}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button onClick={onApprove} disabled={disabled} className="flex-1">
                Review &amp; approve
              </Button>
              <Button variant="secondary" onClick={onReject} className="sm:flex-none">
                Discard
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Approving opens a confirmation step. Nothing reaches the chain until you sign.
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
