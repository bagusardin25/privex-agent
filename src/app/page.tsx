import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Cpu,
  EyeOff,
  FileSignature,
  KeyRound,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const metadata = {
  title: 'Private AI Financial Agent | Confidential portfolio risk on Flare',
  description:
    'State a portfolio rule in plain language. The agent checks your holdings inside a confidential enclave and records only the approved action on Flare.',
};

const STEPS = [
  {
    icon: MessageSquareText,
    accent: 'text-amber-400',
    ring: 'border-amber-500/30 bg-amber-500/10',
    step: '01',
    title: 'Say what you want',
    body: '“Keep my XRP exposure under 40%.” The model turns that sentence into a structured rule — and does nothing else.',
  },
  {
    icon: Cpu,
    accent: 'text-sky-400',
    ring: 'border-sky-500/30 bg-sky-500/10',
    step: '02',
    title: 'Checked in the enclave',
    body: 'Your balances are evaluated against the rule inside confidential compute. They are never placed in a prompt.',
  },
  {
    icon: FileSignature,
    accent: 'text-emerald-400',
    ring: 'border-emerald-500/30 bg-emerald-500/10',
    step: '03',
    title: 'You approve, then it records',
    body: 'A deterministic engine proposes the action. You sign it yourself, and only the minimum lands on Flare.',
  },
];

const GUARANTEES = [
  {
    icon: EyeOff,
    title: 'Your net worth is not an input to an LLM',
    body: 'The language model sees your instruction, never your balances. Risk maths runs separately and deterministically, so a hallucination cannot change a number.',
  },
  {
    icon: KeyRound,
    title: 'The agent cannot move your money',
    body: 'The contract is an audit log with no transfer path. It cannot hold, spend, or approve assets — every write needs a signature from your own wallet.',
  },
  {
    icon: ScrollText,
    title: 'What lands on-chain is deliberately thin',
    body: 'Action type, asset symbol, target basis points, and a hash of the recommendation. No amounts, no totals, no strategy.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal landing header — the app header lives on the dashboard. */}
      <header className="w-full border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-amber-500 text-slate-950 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold text-white truncate">
              Private AI Financial Agent
            </span>
          </span>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-500 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>Open app</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold text-sky-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" aria-hidden="true" />
              Running on Flare Coston2 testnet
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08]">
              An AI that reads your portfolio
              <span className="block text-amber-400">without ever seeing it.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Describe how you want to be positioned in plain language. Your holdings are evaluated
              inside a confidential enclave, a deterministic engine proposes the move, and nothing
              touches the chain until you sign it yourself.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                <span>Try it in demo mode</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://faucet.flare.network/coston2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>Get testnet C2FLR</span>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Demo mode needs no wallet and broadcasts nothing.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-white/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three steps, one signature
            </h2>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
              The boundary between what the model does and what the chain records is the whole
              design. Here is exactly where each part sits.
            </p>

            <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEPS.map(({ icon: Icon, accent, ring, step, title, body }) => (
                <li key={step} className="rounded-2xl glass-panel p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`grid place-items-center w-10 h-10 rounded-xl border ${ring}`}>
                      <Icon className={`w-5 h-5 ${accent}`} />
                    </span>
                    <span className="font-mono text-xs text-slate-400">{step}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Guarantees */}
        <section className="border-t border-white/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              What this actually guarantees
            </h2>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Stated narrowly, so you can check each claim against the code rather than taking it
              on faith.
            </p>

            <ul className="mt-10 space-y-3">
              {GUARANTEES.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-2xl glass-panel p-5 sm:p-6 flex flex-col sm:flex-row gap-4"
                >
                  <span className="grid place-items-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 shrink-0">
                    <Icon className="w-5 h-5 text-slate-300" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Honest limits — a trust product that overclaims defeats itself. */}
        <section className="border-t border-white/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-amber-300">What this is not, yet</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-300 leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="text-amber-400 shrink-0" aria-hidden="true">→</span>
                  <span>
                    This runs on <strong className="font-semibold text-white">Coston2 testnet</strong>{' '}
                    with demo portfolio data. It is a working prototype, not a production advisor.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-amber-400 shrink-0" aria-hidden="true">→</span>
                  <span>
                    In development mode the enclave is a{' '}
                    <strong className="font-semibold text-white">local mock</strong>, and the app
                    says so on screen. Real hardware attestation requires Flare Confidential
                    Compute.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-amber-400 shrink-0" aria-hidden="true">→</span>
                  <span>
                    Recording an action is an audit entry.{' '}
                    <strong className="font-semibold text-white">
                      It does not execute a trade
                    </strong>{' '}
                    or rebalance anything on your behalf.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-amber-400 shrink-0" aria-hidden="true">→</span>
                  <span>Nothing here is financial advice.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-white/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto">
              <Bot className="w-6 h-6 text-amber-400" />
            </span>
            <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              See it work end to end
            </h2>
            <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Demo mode walks the full journey — instruction, private analysis, recommendation, and
              approval — without a wallet and without broadcasting anything.
            </p>
            <Link
              href="/dashboard"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              <span>Open the dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
