import React from 'react';
import { ExternalLink } from 'lucide-react';

const LINKS = [
  { href: 'https://coston2-explorer.flare.network', label: 'Coston2 Explorer' },
  { href: 'https://faucet.flare.network/coston2', label: 'Testnet faucet' },
  { href: 'https://docs.flare.network', label: 'Flare Docs' },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="font-semibold text-slate-300">Private AI Financial Agent</span>
          <span aria-hidden="true">·</span>
          <span>Testnet demo — not financial advice</span>
        </div>

        <nav aria-label="External resources">
          <ul className="flex items-center gap-4">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-slate-100 transition-colors"
                >
                  <span>{label}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
