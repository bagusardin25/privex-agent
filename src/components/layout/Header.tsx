'use client';

import React from 'react';
import { ShieldCheck, Cpu, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { WalletButton } from '@/components/wallet/WalletButton';

interface HeaderProps {
  mode: 'demo' | 'live';
  setMode: (mode: 'demo' | 'live') => void;
  onReset: () => void;
}

export function Header({ mode, setMode, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 p-[1px] flex items-center justify-center shadow-md shadow-amber-500/10">
            <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                FLARE <span className="text-amber-400 font-extrabold">PRIVATE AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 border border-rose-800/50 text-rose-300">
                Coston2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Confidential Financial Risk Agent
            </p>
          </div>
        </div>

        {/* Center: TEE Enclave Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">Enclave Boundary:</span>
          <span className="text-cyan-300 font-mono text-[11px]">Flare FCC Protected</span>
        </div>

        {/* Right: Controls & Wallet */}
        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setMode('demo')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'demo'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Mode
            </button>
            <button
              onClick={() => setMode('live')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'live'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Wallet
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors cursor-pointer"
            title="Reset Workflow"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Wagmi Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
