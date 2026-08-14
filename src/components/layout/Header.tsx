'use client';

import React from 'react';
import Link from 'next/link';
import { useConnection, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { AlertTriangle, LogOut, RotateCcw, ShieldCheck, Wallet } from 'lucide-react';
import { flareTestnet } from '@/lib/blockchain/config';
import { AddressChip, Badge, Button } from '@/components/ui/primitives';
import type { AgentMode } from '@/hooks/useFinancialAgent';

/**
 * Sticky app header: brand, demo/live switch, wallet state, and reset.
 *
 * The mode switch is the most consequential control here — demo mode never
 * touches a wallet, live mode signs real Coston2 transactions — so it is
 * labelled as a radio group rather than two loose buttons.
 */
export function Header({
  mode,
  setMode,
  onReset,
}: {
  mode: AgentMode;
  setMode: (mode: AgentMode) => void;
  onReset: () => void;
}) {
  const connection = useConnection();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const injectedConnector = connectors[0];
  const isWrongNetwork =
    connection.isConnected && connection.chainId !== flareTestnet.id;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#06080f]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-amber-500 text-slate-950 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-white leading-tight truncate group-hover:text-amber-400 transition-colors">
                Private AI Financial Agent
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 leading-tight font-mono">
                Flare Coston2 · non-custodial
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo / Live mode */}
            <div
              role="radiogroup"
              aria-label="Execution mode"
              className="hidden sm:flex items-center gap-0.5 rounded-xl border border-slate-500 bg-white/5 p-0.5"
            >
              {(['demo', 'live'] as const).map((value) => (
                <button
                  key={value}
                  role="radio"
                  aria-checked={mode === value}
                  onClick={() => setMode(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    mode === value
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <button
              onClick={onReset}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-500 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Wallet */}
            {isWrongNetwork ? (
              <Button
                variant="danger"
                onClick={() => switchChain({ chainId: flareTestnet.id })}
                className="px-3 py-2 text-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch to Coston2</span>
                <span className="sm:hidden">Wrong network</span>
              </Button>
            ) : connection.isConnected ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-500 bg-white/5 pl-3 pr-1 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
                <AddressChip address={connection.address} />
                <button
                  onClick={() => disconnect()}
                  aria-label="Disconnect wallet"
                  className="grid place-items-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => injectedConnector && connect({ connector: injectedConnector })}
                disabled={isPending || !injectedConnector}
                className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Wallet className="w-4 h-4 shrink-0" />
                {/* The full label wraps to two lines on a 375px header, so the
                    narrowest breakpoint drops the noun. */}
                <span className="hidden sm:inline">
                  {isPending ? 'Connecting…' : 'Connect wallet'}
                </span>
                <span className="sm:hidden">{isPending ? 'Connecting…' : 'Connect'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mode switch collapses to its own row on narrow screens rather than
            being hidden, since it changes whether real transactions are sent. */}
        <div className="sm:hidden flex items-center gap-2 pb-3">
          <div
            role="radiogroup"
            aria-label="Execution mode"
            className="flex flex-1 items-center gap-0.5 rounded-xl border border-slate-500 bg-white/5 p-0.5"
          >
            {(['demo', 'live'] as const).map((value) => (
              <button
                key={value}
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  mode === value ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            onClick={onReset}
            aria-label="Reset session"
            className="grid place-items-center w-9 h-9 rounded-xl border border-slate-500 bg-white/5 text-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* A persistent, honest banner about what live mode actually does. */}
      {mode === 'live' && !connection.isConnected && (
        <div className="border-t border-amber-500/30 bg-amber-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[11px] sm:text-xs text-amber-300">
              Live mode writes to Flare Coston2. Connect a wallet funded with testnet C2FLR to
              continue, or switch back to demo.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

/** Small network indicator reused across pages. */
export function NetworkBadge() {
  return (
    <Badge tone="emerald">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      Flare Coston2
    </Badge>
  );
}
