'use client';

import React from 'react';
import { Activity, Check, CircleDashed, LoaderCircle, X } from 'lucide-react';
import { Panel, PanelHeader } from '@/components/ui/primitives';
import type { ActivityStep } from '@/types';

const STATUS_STYLES: Record<
  ActivityStep['status'],
  { ring: string; icon: React.ReactNode; label: string; text: string }
> = {
  pending: {
    ring: 'border-white/15 bg-white/3',
    icon: <CircleDashed className="w-3.5 h-3.5 text-slate-400" />,
    label: 'Pending',
    text: 'text-slate-400',
  },
  active: {
    ring: 'border-sky-500/50 bg-sky-500/10',
    icon: <LoaderCircle className="w-3.5 h-3.5 text-sky-400 animate-spin" />,
    label: 'In progress',
    text: 'text-white',
  },
  completed: {
    ring: 'border-emerald-500/50 bg-emerald-500/10',
    icon: <Check className="w-3.5 h-3.5 text-emerald-400" />,
    label: 'Done',
    text: 'text-white',
  },
  error: {
    ring: 'border-rose-500/50 bg-rose-500/10',
    icon: <X className="w-3.5 h-3.5 text-rose-400" />,
    label: 'Failed',
    text: 'text-white',
  },
};

function formatTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AuditTimeline({ timeline }: { timeline: ActivityStep[] }) {
  return (
    <Panel>
      <PanelHeader
        icon={<Activity className="w-4 h-4 text-emerald-400" />}
        title="Audit timeline"
        subtitle="Every stage of the decision, in order"
      />

      <div className="p-5">
        <ol className="relative space-y-1" aria-live="polite">
          {timeline.map((step, index) => {
            const style = STATUS_STYLES[step.status];
            const isLast = index === timeline.length - 1;

            return (
              <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Connector */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-7 bottom-0 w-px bg-white/10"
                  />
                )}

                <span
                  className={`relative z-10 grid place-items-center w-[27px] h-[27px] rounded-full border shrink-0 ${style.ring}`}
                >
                  {style.icon}
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p className={`text-sm font-semibold leading-tight ${style.text}`}>
                      {step.label}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {formatTime(step.timestamp) ?? '—'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed break-words">
                    {step.detail ?? style.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Panel>
  );
}
