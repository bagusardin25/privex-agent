'use client';

import React from 'react';
import { Eye, EyeOff, PieChart, Radio, RefreshCw, WalletMinimal } from 'lucide-react';
import { Badge, Panel, PanelHeader, Skeleton } from '@/components/ui/primitives';
import type { Portfolio, RiskProfile } from '@/types';
import type { AgentMode } from '@/hooks/useFinancialAgent';
import { flareTestnet } from '@/lib/blockchain/config';

const EXPLORER_URL = flareTestnet.blockExplorers.default.url;

const RISK_TONE: Record<RiskProfile, 'emerald' | 'amber' | 'rose'> = {
  LOW: 'emerald',
  MEDIUM: 'amber',
  HIGH: 'rose',
};

/** Bar colour per asset, so the allocation bar and legend stay in sync. */
const ASSET_BAR: Record<string, string> = {
  XRP: 'bg-sky-400',
  FXRP: 'bg-amber-400',
  FLR: 'bg-rose-400',
  WFLR: 'bg-fuchsia-400',
  C2FLR: 'bg-emerald-400',
  USDC: 'bg-blue-400',
  USDT: 'bg-teal-400',
};

const FALLBACK_BAR = 'bg-slate-400';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const quantity = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Sub-cent assets like FLR need more precision than a currency formatter gives. */
const unitPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export function PortfolioCard({
  portfolio,
  isLoading,
  mode,
  error,
  onReload,
}: {
  portfolio: Portfolio | null;
  isLoading: boolean;
  mode: AgentMode;
  error?: string | null;
  onReload?: () => void;
}) {
  // Balances are the most sensitive thing on screen. Let the user hide them
  // before they screen-share or demo — the agent works either way.
  const [valuesHidden, setValuesHidden] = React.useState(false);

  return (
    <Panel>
      <PanelHeader
        icon={<PieChart className="w-4 h-4 text-amber-400" />}
        title="Portfolio snapshot"
        subtitle={
          mode === 'demo'
            ? 'Demo holdings — no real balances are read'
            : 'Holdings used for this analysis'
        }
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setValuesHidden((v) => !v)}
              aria-pressed={valuesHidden}
              className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={valuesHidden ? 'Show values' : 'Hide values'}
            >
              {valuesHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="sr-only">{valuesHidden ? 'Show values' : 'Hide values'}</span>
            </button>
            {onReload && (
              <button
                onClick={onReload}
                disabled={isLoading}
                className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                title="Reload portfolio"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Reload portfolio</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Loading portfolio…</span>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-2.5 w-full" />
            <div className="space-y-2.5">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4">
            <p className="text-sm font-semibold text-rose-400">Could not load portfolio</p>
            <p className="text-xs text-slate-300 mt-1">{error}</p>
            {onReload && (
              <button
                onClick={onReload}
                className="mt-3 text-xs font-semibold text-rose-300 underline underline-offset-2 hover:text-rose-200 cursor-pointer"
              >
                Try again
              </button>
            )}
          </div>
        ) : !portfolio ? (
          <div className="flex flex-col items-center text-center py-8">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 mb-3">
              <WalletMinimal className="w-5 h-5 text-slate-400" />
            </span>
            <p className="text-sm font-semibold text-slate-200">No portfolio loaded</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Connect a wallet, or switch to demo mode to explore the agent with sample holdings.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Total value
                </p>
                <p className="text-3xl font-bold text-white tabular-nums mt-1">
                  {valuesHidden ? '••••••' : currency.format(portfolio.totalValue)}
                </p>
              </div>
              <Badge tone={RISK_TONE[portfolio.riskProfile]}>
                {portfolio.riskProfile} risk
              </Badge>
            </div>

            {/* Allocation bar: one continuous read of the whole portfolio. */}
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-white/5"
              role="img"
              aria-label={`Allocation: ${portfolio.assets
                .map((a) => `${a.symbol} ${Math.round(a.allocation * 100)}%`)
                .join(', ')}`}
            >
              {portfolio.assets.map((asset) => (
                <span
                  key={asset.symbol}
                  className={ASSET_BAR[asset.symbol] || FALLBACK_BAR}
                  style={{ width: `${Math.max(asset.allocation * 100, 1)}%` }}
                />
              ))}
            </div>

            <ul className="mt-4 space-y-1">
              {portfolio.assets.map((asset) => (
                <li
                  key={asset.symbol}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        ASSET_BAR[asset.symbol] || FALLBACK_BAR
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {asset.symbol}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight truncate">
                        {/* Quantity is the holding; the price beside it is the
                            oracle quote that turns it into an allocation. */}
                        {valuesHidden
                          ? asset.name
                          : `${quantity.format(asset.quantity)} × ${unitPrice.format(asset.unitPrice)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white tabular-nums leading-tight">
                      {(asset.allocation * 100).toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-slate-400 tabular-nums leading-tight">
                      {valuesHidden ? '••••' : currency.format(asset.value)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pricing provenance. Allocations decide every risk verdict, so
                where the prices came from is shown, not assumed. */}
            <div className="mt-4 pt-4 border-t border-white/8">
              {portfolio.pricing.source === 'ftsov2' ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <p className="text-[11px] font-semibold text-sky-300">
                      Priced live by Flare FTSOv2
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                    {portfolio.pricing.feeds.map((f) => f.name).join(' · ')}
                  </p>
                  {portfolio.pricing.ftsoAddress && (
                    <a
                      href={`${EXPLORER_URL}/address/${portfolio.pricing.ftsoAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block font-mono text-[10px] text-slate-400 underline underline-offset-2 hover:text-sky-300 transition-colors"
                    >
                      {portfolio.pricing.ftsoAddress.slice(0, 10)}…
                      {portfolio.pricing.ftsoAddress.slice(-6)}
                      {portfolio.pricing.feedTimestamp
                        ? ` · round ${new Date(
                            portfolio.pricing.feedTimestamp * 1000
                          ).toUTCString().slice(17, 25)} UTC`
                        : ''}
                    </a>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-amber-300">
                    FTSO unreachable — using fallback prices
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    These figures are not oracle-derived. Reload to try the feed again.
                  </p>
                </div>
              )}

              <p className="mt-3 text-[11px] text-slate-400">
                Quantities stay on your side of the enclave. Only the action type, asset, and
                target percentage are ever written on-chain.
              </p>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
