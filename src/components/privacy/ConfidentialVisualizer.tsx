'use client';

import React from 'react';
import { CheckCircle2, Cpu, Fingerprint, Lock, TriangleAlert } from 'lucide-react';
import { Badge, Panel, PanelHeader } from '@/components/ui/primitives';
import type { ConfidentialResult } from '@/types';

/**
 * Visualises the confidential analysis stage.
 *
 * This component is deliberately blunt about which provider ran: the
 * development provider is a local mock, and labelling it as real confidential
 * compute would be the single most misleading thing this product could do.
 */
export function ConfidentialVisualizer({
  confidentialAnalysis,
  isAnalyzing,
}: {
  confidentialAnalysis: ConfidentialResult | null;
  isAnalyzing: boolean;
}) {
  // Key off whether the analysis actually ran in an enclave, NOT off which
  // provider was selected. The Flare provider is still a stub that falls back
  // to local execution, so selecting it must not buy a green badge.
  const isSimulated = confidentialAnalysis?.isSimulated ?? true;
  const providerLabel =
    confidentialAnalysis?.provider === 'flare-fcc' ? 'Flare FCC' : 'Mock TEE';
  const analysis = confidentialAnalysis?.result;

  return (
    <Panel accent="cyan" glow={isAnalyzing}>
      <PanelHeader
        icon={<Cpu className="w-4 h-4 text-sky-400" />}
        title="Confidential enclave"
        subtitle="Risk evaluation runs over your balances without exposing them"
        action={
          isAnalyzing ? (
            <Badge tone="cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" aria-hidden="true" />
              Running
            </Badge>
          ) : confidentialAnalysis ? (
            <Badge tone={isSimulated ? 'amber' : 'emerald'}>
              {providerLabel}
              {isSimulated ? ' · simulated' : ''}
            </Badge>
          ) : (
            <Badge tone="neutral">Idle</Badge>
          )
        }
      />

      <div className="p-5">
        {isAnalyzing ? (
          <div className="relative overflow-hidden rounded-xl border border-sky-500/30 bg-sky-500/5 p-6" aria-live="polite">
            {/* Sweep line reads as "sealed region being scanned". Purely
                decorative — the text below carries the actual status. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sky-400/20 to-transparent animate-scanline"
            />
            <div className="relative flex items-center gap-3">
              <Lock className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Evaluating inside the enclave…</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Balances and thresholds are sealed. Only the verdict leaves.
                </p>
              </div>
            </div>
          </div>
        ) : !analysis ? (
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 text-center">
            <Lock className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200 mt-2">Enclave idle</p>
            <p className="text-xs text-slate-400 mt-1">
              Send an instruction and the risk evaluation will run here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-rise">
            {/* Verdict */}
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                analysis.isCompliant
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-rose-500/40 bg-rose-500/10'
              }`}
            >
              {analysis.isCompliant ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <TriangleAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold ${
                    analysis.isCompliant ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {analysis.isCompliant ? 'Within your limits' : 'Limit breach detected'}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {analysis.isCompliant
                    ? 'Current exposure satisfies the rule you stated.'
                    : analysis.violations
                        .map(
                          (v) =>
                            `${v.asset} sits at ${Math.round(v.currentExposure * 100)}% against a ${Math.round(v.maxAllowed * 100)}% cap (${v.severity.toLowerCase()}).`
                        )
                        .join(' ')}
                </p>
              </div>
            </div>

            {/* Exposure readout */}
            <dl className="grid grid-cols-3 gap-2">
              {[
                { label: 'Current', value: analysis.currentExposure, tone: 'text-white' },
                { label: 'Target', value: analysis.targetExposure, tone: 'text-amber-400' },
                {
                  label: 'Delta',
                  value: analysis.difference,
                  tone: analysis.difference < 0 ? 'text-rose-400' : 'text-emerald-400',
                  signed: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    {item.label}
                  </dt>
                  <dd className={`text-lg font-bold tabular-nums mt-0.5 ${item.tone}`}>
                    {item.signed && item.value > 0 ? '+' : ''}
                    {Math.round(item.value * 100)}%
                  </dd>
                </div>
              ))}
            </dl>

            {/* Attestation */}
            <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Analysis hash
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 mt-1.5 break-all">
                {confidentialAnalysis.analysisHash}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {confidentialAnalysis.attestation
                  ? 'Attested by the enclave.'
                  : 'No enclave attestation — this hash is a local identifier, not a proof.'}
              </p>
            </div>

            {isSimulated && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
                <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200 leading-relaxed">
                  <strong className="font-semibold">
                    This analysis ran locally, not inside a TEE.
                  </strong>{' '}
                  {confidentialAnalysis.provider === 'flare-fcc'
                    ? 'The Flare Confidential Compute adapter is still a stub and falls back to local execution, so no hardware attestation was produced.'
                    : 'The development provider is a local mock used for building and demoing the flow.'}{' '}
                  The privacy architecture is real; the enclave execution is not yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
