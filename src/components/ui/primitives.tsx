'use client';

import React from 'react';

/**
 * Shared surface primitives, built on the glass-panel system in globals.css.
 *
 * Colour choices are contrast-checked against the app's two backgrounds
 * (#06080f page, #0b0f19 card):
 *  - text-slate-400 is the dimmest text allowed (7.8:1 / 7.5:1)
 *  - text-slate-500 is never used for text (4.2:1 / 4.0:1 — below 4.5:1)
 *  - border-slate-500 is used wherever a border is a control's only boundary
 *  - the glass panel's white/7% edge measures 1.16:1, so it is decorative only
 */

type PanelAccent = 'default' | 'gold' | 'cyan';

const PANEL_CLASS: Record<PanelAccent, string> = {
  default: 'glass-panel',
  gold: 'glass-panel-gold',
  cyan: 'glass-panel-cyan',
};

export function Panel({
  children,
  className = '',
  accent = 'default',
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: PanelAccent;
  glow?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl ${PANEL_CLASS[accent]} ${
        glow ? 'animate-enclave-glow' : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/8">
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type Tone = 'neutral' | 'amber' | 'cyan' | 'emerald' | 'rose';

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'bg-white/5 text-slate-300 border-white/10',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
  cyan: 'bg-sky-500/10 text-sky-400 border-sky-500/40',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/40',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-600 border border-amber-500',
  // border-slate-500 (not the decorative white/7%) so the control's own
  // boundary clears 3:1 against both the page and card backgrounds.
  secondary:
    'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white border border-slate-500',
  ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 border border-transparent',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 border border-rose-600',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Skeleton block for loading states. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/8 ${className}`} />;
}

/** Renders **bold** spans in agent copy without pulling in a markdown parser. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/** Truncated address with the full value available to assistive tech. */
export function AddressChip({ address, className = '' }: { address?: string; className?: string }) {
  if (!address) return null;
  return (
    <span className={`font-mono text-xs text-slate-300 ${className}`} title={address}>
      <span className="sr-only">{address}</span>
      <span aria-hidden="true">
        {address.slice(0, 6)}…{address.slice(-4)}
      </span>
    </span>
  );
}
