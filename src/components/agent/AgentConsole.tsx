'use client';

import React, { useState } from 'react';
import { Send, Bot, Sparkles, CheckCircle2, AlertCircle, Code2, ArrowRight } from 'lucide-react';
import type { FinancialIntent } from '@/types';

interface AgentConsoleProps {
  onSubmit: (prompt: string) => void;
  isParsing: boolean;
  currentPrompt: string;
  currentIntent: FinancialIntent | null;
  error: string | null;
}

const PRESET_PROMPTS = [
  'Keep my XRP exposure below 40% and maintain a low-risk portfolio.',
  'Cap XRP allocation at 35% and rebalance assets.',
  'Rebalance FXRP exposure to 45% with a low-risk profile.',
];

export function AgentConsole({
  onSubmit,
  isParsing,
  currentPrompt,
  currentIntent,
  error,
}: AgentConsoleProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isParsing) return;
    onSubmit(input);
  };

  const handleSelectPreset = (preset: string) => {
    setInput(preset);
    onSubmit(preset);
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Strategy Interpreter</h2>
              <p className="text-[11px] text-slate-400">
                Natural Language Intent Parser (Strict Zod Schema)
              </p>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
            OpenRouter / Gemini API
          </div>
        </div>

        {/* Quick Demo Chips */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Strategy Presets (1-Click Demo)
          </span>
          <div className="flex flex-col gap-1.5">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isParsing}
                className="text-left text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-950 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
              >
                <span className="truncate pr-2">"{preset}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Custom Financial Rule Prompt
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Keep my XRP exposure below 40% and maintain a low-risk portfolio."
              disabled={isParsing}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isParsing}
              className="absolute right-2.5 bottom-3 p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Parse Intent"
            >
              {isParsing ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>

        {/* Error Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{error}</p>
          </div>
        )}

        {/* Structured Intent Inspector */}
        {currentIntent && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validated Structured Intent</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Zod Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Target Asset</span>
                <span className="font-bold text-amber-400">{currentIntent.asset}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Max Exposure</span>
                <span className="font-bold text-cyan-400">
                  {(currentIntent.maxExposure * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Risk Level</span>
                <span className="font-bold text-slate-200">{currentIntent.riskProfile}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Action Intent</span>
                <span className="font-bold text-emerald-400">{currentIntent.action}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Principle Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>LLM is purely an interpreter. It cannot generate raw calldata or access funds.</span>
      </div>
    </div>
  );
}
