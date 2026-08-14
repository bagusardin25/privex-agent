'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Shield, ArrowDown, Activity } from 'lucide-react';
import type { ActivityStep } from '@/types';

interface AuditTimelineProps {
  timeline: ActivityStep[];
}

export function AuditTimeline({ timeline }: AuditTimelineProps) {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Execution Audit Trail</h3>
            <span className="text-[11px] text-slate-400">
              End-to-End Cryptographic & Activity Verification
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500">Flare Confidential Lifecycle</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {timeline.map((step) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isError = step.status === 'error';

          return (
            <div key={step.id} className="relative group">
              {/* Dot Icon Indicator */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-400'
                    : isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse'
                    : isError
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isError ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
              </div>

              {/* Step Content */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? 'text-white'
                        : isActive
                        ? 'text-cyan-300'
                        : isError
                        ? 'text-rose-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.timestamp && (
                    <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                  )}
                </div>

                <p
                  className={`text-[11px] mt-0.5 leading-relaxed ${
                    isCompleted
                      ? 'text-slate-300'
                      : isActive
                      ? 'text-cyan-200'
                      : isError
                      ? 'text-rose-400'
                      : 'text-slate-600'
                  }`}
                >
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
