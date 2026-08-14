'use client';

import React from 'react';
import { CheckCircle2, Copy, ExternalLink, LoaderCircle, TriangleAlert } from 'lucide-react';
import { Badge, Button, Panel, PanelHeader } from '@/components/ui/primitives';
import type { TransactionResult } from '@/types';

export function ExecutionReceipt({
  result,
  onReset,
  isConfirming = false,
}: {
  result: TransactionResult;
  onReset: () => void;
  isConfirming?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  // Demo runs never broadcast, so there is no explorer link to offer.
  const isSimulated = !result.explorerUrl;

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(result.transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the hash is selectable on screen anyway.
    }
  };

  return (
    <Panel accent={isSimulated ? 'default' : 'cyan'}>
      <PanelHeader
        icon={
          isConfirming ? (
            <LoaderCircle className="w-4 h-4 text-sky-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )
        }
        title={isConfirming ? 'Awaiting confirmation' : 'Action recorded'}
        subtitle={result.network}
        action={
          <Badge tone={isSimulated ? 'amber' : isConfirming ? 'cyan' : 'emerald'}>
            {isSimulated ? 'Simulated' : isConfirming ? 'Pending' : 'Confirmed'}
          </Badge>
        }
      />

      <div className="p-5 space-y-4">
        {isSimulated && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
            <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200 leading-relaxed">
              <strong className="font-semibold">Nothing was broadcast.</strong> This receipt is a
              demo-mode simulation and the hash below is not a real transaction.
            </p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Action
            </dt>
            <dd className="text-sm font-semibold text-white mt-0.5">
              {result.action.replace(/_/g, ' ')}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Asset
            </dt>
            <dd className="text-sm font-semibold text-white mt-0.5">{result.asset}</dd>
          </div>
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Exposure change
            </dt>
            <dd className="text-sm font-semibold text-white mt-0.5 tabular-nums">
              {Math.round(result.previousExposure * 100)}% →{' '}
              <span className="text-amber-400">{Math.round(result.newExposure * 100)}%</span>
            </dd>
          </div>
        </dl>

        <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Transaction hash
            </span>
            <button
              onClick={copyHash}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-300 mt-1.5 break-all">
            {result.transactionHash}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {!isSimulated && (
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              <span>View on Coston2 Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Button variant="secondary" onClick={onReset} className="sm:flex-none">
            Start a new instruction
          </Button>
        </div>
      </div>
    </Panel>
  );
}
