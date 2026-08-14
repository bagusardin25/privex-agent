'use client';

import React from 'react';
import { ArrowUp, Bot, LoaderCircle, ShieldAlert, Sparkles, User } from 'lucide-react';
import { Badge, Panel, PanelHeader, RichText } from '@/components/ui/primitives';
import type { ChatMessage, FinancialIntent } from '@/types';

const QUICK_PROMPTS = [
  'Keep my XRP exposure under 40%',
  'I want a low-risk portfolio, reduce volatile assets',
  'Increase FXRP to 35% of my holdings',
  'Is my portfolio too concentrated right now?',
];

/**
 * The conversational surface of the agent.
 *
 * The model's only job is turning a sentence into a FinancialIntent — it never
 * proposes numbers that reach the chain. The parsed intent is surfaced inline
 * so the user can see exactly what was understood before anything proceeds.
 */
export function AgentConsole({
  onSubmit,
  isParsing,
  messages,
  currentIntent,
  error,
  disabled = false,
  disabledReason,
}: {
  onSubmit: (message: string) => void;
  isParsing: boolean;
  messages: ChatMessage[];
  currentPrompt?: string;
  currentIntent: FinancialIntent | null;
  error?: string | null;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [value, setValue] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isParsing && !disabled;

  // Follow the conversation as it grows.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isParsing || disabled) return;
    onSubmit(trimmed);
    setValue('');
    // Reset the auto-grown height once the field is cleared.
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter makes a new line — the convention users expect.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(value);
    }
  };

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
        title="AI strategy console"
        subtitle="Describe your rule in plain language"
        action={
          currentIntent ? (
            <Badge tone="emerald">Intent parsed</Badge>
          ) : isParsing ? (
            <Badge tone="cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" aria-hidden="true" />
              Reading
            </Badge>
          ) : null
        }
      />

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 min-h-[220px] max-h-[420px]"
        role="log"
        aria-live="polite"
        aria-label="Conversation with the agent"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-3">
              <Bot className="w-5 h-5 text-amber-400" />
            </span>
            <p className="text-sm font-semibold text-slate-200">
              Tell the agent how you want to be positioned
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              It turns your sentence into a structured rule, checks your portfolio against it
              privately, and proposes an action you can approve or discard.
            </p>

            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    onClick={() => send(prompt)}
                    disabled={disabled}
                    className="rounded-full border border-slate-500 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`flex gap-2.5 animate-fade-rise ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 border ${
                    message.role === 'user'
                      ? 'bg-white/5 border-white/10'
                      : message.isError
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-slate-300" />
                  ) : message.isError ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </span>

                <div
                  className={`min-w-0 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <span className="sr-only">
                    {message.role === 'user' ? 'You said: ' : 'Agent said: '}
                  </span>
                  <div
                    className={`inline-block rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed text-left ${
                      message.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium'
                        : message.isError
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
                          : 'bg-white/5 border border-white/10 text-slate-200'
                    }`}
                  >
                    {message.isPending ? (
                      <span className="inline-flex items-center gap-2 text-slate-300">
                        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                        {message.content}
                      </span>
                    ) : (
                      <RichText text={message.content} />
                    )}
                  </div>

                  {/* Show exactly what the model extracted, so the user can
                      catch a misreading before any action is proposed. */}
                  {message.intent && (
                    <dl className="mt-2 flex flex-wrap gap-1.5">
                      {[
                        ['Asset', message.intent.asset],
                        ['Max', `${Math.round(message.intent.maxExposure * 100)}%`],
                        ['Risk', message.intent.riskProfile],
                        ['Action', message.intent.action.replace(/_/g, ' ')],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="rounded-lg border border-white/10 bg-white/3 px-2 py-1"
                        >
                          <dt className="sr-only">{label}</dt>
                          <dd className="text-[10px] font-mono text-slate-300">
                            <span className="text-slate-400">{label}:</span> {val}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/8 p-4">
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300"
          >
            {error}
          </p>
        )}
        {disabled && disabledReason && (
          <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
            {disabledReason}
          </p>
        )}

        <div className="flex items-end gap-2 rounded-xl border border-slate-500 bg-white/5 p-2 focus-within:border-amber-500 transition-colors">
          <label htmlFor="agent-instruction" className="sr-only">
            Your instruction to the financial agent
          </label>
          <textarea
            id="agent-instruction"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={autoGrow}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="e.g. Keep my XRP exposure under 40%"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={() => send(value)}
            disabled={!canSend}
            aria-label="Send instruction"
            className="grid place-items-center w-9 h-9 rounded-lg bg-amber-500 text-slate-950 shrink-0 hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isParsing ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          The model only interprets your words. Every figure that reaches the chain comes from the
          deterministic risk engine, and you approve it first.
        </p>
      </div>
    </Panel>
  );
}
