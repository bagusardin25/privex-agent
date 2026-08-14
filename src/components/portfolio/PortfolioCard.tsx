'use client';

import React from 'react';
import { formatUSD, formatPercent } from '@/lib/utils';
import type { Portfolio } from '@/types';
import { PieChart, Shield, TrendingUp, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface PortfolioCardProps {
  portfolio: Portfolio | null;
  isLoading: boolean;
  mode: 'demo' | 'live';
}

const ASSET_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  XRP: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' },
  FXRP: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  C2FLR: { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500' },
  Cash: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
};

const RISK_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  LOW: { label: 'LOW RISK', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  MEDIUM: { label: 'MEDIUM RISK', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  HIGH: { label: 'HIGH RISK', bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60' },
};

export function PortfolioCard({ portfolio, isLoading, mode }: PortfolioCardProps) {
  if (isLoading || !portfolio) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
        <div className="h-10 w-32 bg-slate-800 rounded mb-6" />
        <div className="h-4 w-full bg-slate-800 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-12 bg-slate-800 rounded" />
          <div className="h-12 bg-slate-800 rounded" />
          <div className="h-12 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  const risk = RISK_BADGES[portfolio.riskProfile] || RISK_BADGES.MEDIUM;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800/80 text-amber-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Portfolio Overview</h2>
              <span className="text-[11px] text-slate-400">
                {mode === 'demo' ? 'Demo Sandbox Account' : 'Live On-Chain Balance'}
              </span>
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${risk.bg} ${risk.text} ${risk.border} flex items-center gap-1.5`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{risk.label}</span>
          </div>
        </div>

        {/* Total Value Metric */}
        <div className="mb-5 pb-5 border-b border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium block mb-1">Total Valuation</span>
          <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatUSD(portfolio.totalValue)}
          </div>
        </div>

        {/* Multi-Segment Allocation Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Asset Allocations</span>
            <span className="font-mono">100% Total</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            {portfolio.assets.map((asset) => {
              const color = ASSET_COLORS[asset.symbol] || { bar: 'bg-slate-500' };
              return (
                <div
                  key={asset.symbol}
                  style={{ width: `${asset.allocation * 100}%` }}
                  className={`${color.bar} h-full transition-all duration-500`}
                  title={`${asset.name}: ${(asset.allocation * 100).toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Asset Items Table */}
        <div className="space-y-2.5 mb-5">
          {portfolio.assets.map((asset) => {
            const color = ASSET_COLORS[asset.symbol] || {
              bg: 'bg-slate-800',
              text: 'text-slate-300',
              bar: 'bg-slate-500',
            };
            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center font-mono text-xs font-bold ${color.text}`}>
                    {asset.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{asset.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{asset.symbol}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">
                    {formatPercent(asset.allocation)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {formatUSD(asset.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-2.5 text-xs text-cyan-200">
        <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-cyan-300 font-semibold">Zero-Knowledge Storage:</strong> Your net worth, exact token balances, and strategy details are never written to public smart contract storage.
        </p>
      </div>
    </div>
  );
}
