'use client';

import React from 'react';
import {
  EyeOff,
  FileSignature,
  LoaderCircle,
  Lock,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui/primitives';
import { flareTestnet } from '@/lib/blockchain/config';
import type { Recommendation } from '@/types';
import type { AgentMode } from '@/hooks/useFinancialAgent';

type PreparedTransaction = {
  to: string;
  data: string;
  chainId: number;
  gasEstimate?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * The consent gate before anything is written to Flare.
 *
 * Its job is disclosure, not persuasion: the user must be able to see the exact
 * contract, the exact calldata, and — just as importantly — what is NOT being
 * sent, before they sign.
 */
export function ApprovalModal({
  isOpen,
  recommendation,
  onClose,
  onConfirm,
  isExecuting,
  walletAddress,
  mode,
  preparedTx,
  isWalletConnected = false,
  isOnWrongNetwork = false,
  error,
}: {
  isOpen: boolean;
  recommendation: Recommendation | null;
  onClose: () => void;
  onConfirm: () => void;
  isExecuting: boolean;
  walletAddress?: string;
  mode: AgentMode;
  preparedTx?: PreparedTransaction | null;
  isWalletConnected?: boolean;
  isOnWrongNetwork?: boolean;
  error?: string | null;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const [showCalldata, setShowCalldata] = React.useState(false);

  // Lock the page behind the dialog and restore focus where it came from.
  React.useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog so keyboard users start inside it.
    const timer = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialogRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Escape closes; Tab cycles within the dialog.
  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExecuting) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isExecuting, onClose]);

  if (!isOpen || !recommendation) return null;

  const targetBps = Math.round(recommendation.targetExposure * 10000);
  const isLive = mode === 'live';
  const blocker = isLive
    ? !isWalletConnected
      ? 'Connect your wallet to sign this transaction.'
      : isOnWrongNetwork
        ? 'Your wallet is on the wrong network. Switch to Flare Coston2 (chain 114).'
        : null
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
    >
      {/* Backdrop — clicking it closes, unless a signature is in flight. */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isExecuting && onClose()}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
        aria-describedby="approval-description"
        tabIndex={-1}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl glass-panel-gold animate-modal-in"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/8 bg-[#0b0f19]/95 backdrop-blur px-5 py-4">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 shrink-0">
              <FileSignature className="w-4 h-4 text-amber-400" />
            </span>
            <div className="min-w-0">
              <h2 id="approval-title" className="text-sm font-bold text-white leading-tight">
                Approve on-chain record
              </h2>
              <p id="approval-description" className="text-xs text-slate-400 mt-0.5">
                {isLive
                  ? 'Review exactly what will be written to Flare Coston2.'
                  : 'Demo mode — this will be simulated, not broadcast.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            aria-label="Close without approving"
            className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* The action, in human terms */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              You are recording
            </p>
            <p className="text-base font-bold text-white mt-1.5 leading-snug">
              {recommendation.recommendedAction.replace(/_/g, ' ')} — {recommendation.asset} to{' '}
              <span className="text-amber-400">
                {Math.round(recommendation.targetExposure * 100)}%
              </span>
            </p>
            <p className="text-xs text-slate-300 mt-1">
              From {Math.round(recommendation.currentExposure * 100)}% current exposure.
            </p>
          </div>

          {/* Exactly what lands on chain */}
          <div>
            <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Written on-chain
            </h3>
            <dl className="rounded-xl border border-white/10 bg-white/3 divide-y divide-white/8">
              {[
                ['Contract', preparedTx?.to ?? 'Not deployed', true],
                ['Function', 'recordAction(uint8,string,uint256,bytes32)', true],
                ['Asset', recommendation.asset, false],
                ['Target exposure', `${targetBps} bps (${Math.round(recommendation.targetExposure * 100)}%)`, false],
                ['Network', `Flare Coston2 · chain ${flareTestnet.id}`, false],
                ['Signer', walletAddress ?? 'Not connected', true],
              ].map(([label, value, mono]) => (
                <div key={label as string} className="flex justify-between gap-3 px-3 py-2.5">
                  <dt className="text-[11px] text-slate-400 shrink-0">{label}</dt>
                  <dd
                    className={`text-[11px] text-slate-200 text-right break-all min-w-0 ${
                      mono ? 'font-mono' : 'font-semibold'
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {preparedTx?.data && (
              <div className="mt-2">
                <button
                  onClick={() => setShowCalldata((v) => !v)}
                  aria-expanded={showCalldata}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  {showCalldata ? 'Hide raw calldata' : 'Show raw calldata'}
                </button>
                {showCalldata && (
                  <p className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[10px] text-slate-300 break-all max-h-32 overflow-y-auto">
                    {preparedTx.data}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* What stays private — the product's whole promise */}
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/8 p-3">
            <EyeOff className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-sky-300">Never leaves your side</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Your balances, total net worth, and the reasoning behind this action are not part
                of the transaction. Only the action type, asset symbol, target basis points, and a
                hash of the recommendation are stored.
              </p>
            </div>
          </div>

          {/* Non-custodial reassurance */}
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="font-semibold text-emerald-300">No funds move.</strong> This
              contract is an audit log — it cannot hold, transfer, or spend your assets.
            </p>
          </div>

          {blocker && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] text-amber-200"
            >
              <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-px" />
              {blocker}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] text-rose-300"
            >
              {error}
            </p>
          )}

          {!isLive && (
            <div className="flex items-center justify-center">
              <Badge tone="amber">Demo mode — nothing will be broadcast</Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 border-t border-white/8 bg-[#0b0f19]/95 backdrop-blur px-5 py-4">
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isExecuting}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isExecuting || Boolean(blocker)}
              className="sm:flex-1"
            >
              {isExecuting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  {isLive ? 'Confirm in wallet…' : 'Simulating…'}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  {isLive ? 'Sign & record' : 'Simulate record'}
                </>
              )}
            </Button>
          </div>
          {isLive && !blocker && (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Your wallet will ask you to confirm. You can still reject it there.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
