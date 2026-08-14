'use client';

import React from 'react';
import { Cpu, KeyRound, ScrollText } from 'lucide-react';

const PILLARS = [
  {
    icon: Cpu,
    color: 'text-sky-400',
    ring: 'border-sky-500/30 bg-sky-500/10',
    title: 'Analysed privately',
    body: 'Balances and thresholds are evaluated inside a confidential enclave, not in a prompt.',
  },
  {
    icon: KeyRound,
    color: 'text-emerald-400',
    ring: 'border-emerald-500/30 bg-emerald-500/10',
    title: 'Never custodial',
    body: 'The agent cannot move funds. Every action needs a signature from your own wallet.',
  },
  {
    icon: ScrollText,
    color: 'text-amber-400',
    ring: 'border-amber-500/30 bg-amber-500/10',
    title: 'Provable afterwards',
    body: 'Approved actions are recorded on Flare as a minimal, verifiable audit trail.',
  },
];

/** Compact trust strip shown above the workspace. */
export function TrustHero() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Your strategy stays private. The proof doesn&apos;t.
      </h1>
      <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
        State a rule in plain language. The agent checks your portfolio against it without exposing
        your holdings, then proposes an action you approve yourself.
      </p>

      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PILLARS.map(({ icon: Icon, color, ring, title, body }) => (
          <li key={title} className="rounded-xl glass-panel p-4">
            <span className={`grid place-items-center w-8 h-8 rounded-lg border ${ring}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </span>
            <p className="text-xs font-bold text-white mt-2.5">{title}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
