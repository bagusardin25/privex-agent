'use client';

import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { flareTestnet } from '@/lib/blockchain/config';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut, Check, Copy, ExternalLink, ChevronDown, AlertCircle } from 'lucide-react';

import { formatUnits } from 'viem';

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWrongNetwork = isConnected && chain?.id !== flareTestnet.id;

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            const connector = connectors[0];
            if (connector) {
              connect({ connector });
            }
          }}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow-amber-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      </div>
    );
  }

  const formattedBalance = balance ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(3) : null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm transition-all cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono">{formatAddress(address || '')}</span>
        {formattedBalance && balance && (
          <span className="hidden md:inline text-xs text-slate-400 font-mono">
            ({formattedBalance} {balance.symbol})
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {isWrongNetwork && (
            <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>Wrong Network</span>
              </div>
              <p className="text-[11px] text-red-400">
                Please switch to Flare Coston2 Testnet.
              </p>
              <button
                onClick={() => switchChain({ chainId: flareTestnet.id })}
                className="w-full py-1 px-2 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Switch to Coston2
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400 mb-2 pb-2 border-b border-slate-800/80 flex items-center justify-between">
            <span>Connected Account</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
              Coston2 (114)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-300 mb-3">
            <span>{formatAddress(address || '')}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Copy Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <a
              href={`${flareTestnet.blockExplorers.default.url}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>View on Coston2 Explorer</span>
              </span>
            </a>
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-red-950/30 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
