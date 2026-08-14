'use client';

import React from 'react';
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, Zap, Cpu } from 'lucide-react';

interface TrustHeroProps {
  onQuickStart?: (prompt: string) => void;
}

export function TrustHero({ onQuickStart }: TrustHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/70 border border-slate-800 p-6 sm:p-8 mb-8 shadow-2xl">
      {/* Background subtle radial glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Flare Confidential Compute × Deterministic Execution</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
          Manage your portfolio with AI.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400">
            Keep your financial strategy private.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
          Describe your risk strategy in plain English. Your sensitive allocation rules are parsed by AI, verified deterministically inside Flare Confidential Compute TEE, and dispatched to Flare smart contracts only with your explicit cryptographic approval.
        </p>

        {/* 5-Step Trust Flow Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[11px] font-bold text-amber-400">01. Prompt</span>
            <span className="text-xs text-slate-200 font-medium">State Goal</span>
            <span className="text-[10px] text-slate-400">Natural language input</span>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[11px] font-bold text-cyan-400">02. Enclave</span>
            <span className="text-xs text-slate-200 font-medium">TEE Analysis</span>
            <span className="text-[10px] text-slate-400">Private risk evaluation</span>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[11px] font-bold text-slate-300">03. Engine</span>
            <span className="text-xs text-slate-200 font-medium">Deterministic</span>
            <span className="text-[10px] text-slate-400">Math-proven delta</span>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[11px] font-bold text-emerald-400">04. Approve</span>
            <span className="text-xs text-slate-200 font-medium">User Sign-off</span>
            <span className="text-[10px] text-slate-400">Explicit verification</span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[11px] font-bold text-rose-400">05. Flare</span>
            <span className="text-xs text-slate-200 font-medium">On-Chain Tx</span>
            <span className="text-[10px] text-slate-400">Coston2 recorded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
