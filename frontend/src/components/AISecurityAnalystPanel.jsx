import React from 'react';
import { Bot, Info, RefreshCw } from 'lucide-react';
import { StatusBadge } from './ui.jsx';

export default function AISecurityAnalystPanel({ aiAnalysis, loadingAi, onReAnalyze }) {
  return (
    <section className="surface rounded-[1.6rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker">Supporting Intelligence</div>
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-zinc-50">AI Security Analyst</h2>
          <p className="mt-1 text-sm text-zinc-500">Explanation and recommendation layer below the deterministic engine.</p>
        </div>
        <button onClick={onReAnalyze} disabled={loadingAi} className="btn-secondary">
          <RefreshCw className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
          {loadingAi ? 'Analyzing' : 'Re-analyze'}
        </button>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/[0.06] bg-black/20 p-3 text-xs leading-5 text-zinc-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
        <span>AI is an analyst-assistance layer. The deterministic security engine remains authoritative for threat classification.</span>
      </div>

      {loadingAi ? (
        <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-zinc-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <div className="mt-3 text-sm">Evaluating quantum telemetry and classical controls</div>
        </div>
      ) : aiAnalysis?.analysis ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-100">{aiAnalysis.analysis.summary}</span>
              </div>
              <StatusBadge value={aiAnalysis.analysis.severity} />
            </div>
            <p className="text-sm leading-6 text-zinc-400">{aiAnalysis.analysis.explanation}</p>
          </div>

          {aiAnalysis.analysis.evidence?.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <div className="section-kicker mb-3">Evidence</div>
              <div className="space-y-2">
                {aiAnalysis.analysis.evidence.map((item, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-zinc-400">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-sky-200/10 bg-sky-200/[0.035] p-4">
            <div className="section-kicker">Recommended SOC Action</div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{aiAnalysis.analysis.recommendation}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-center text-sm text-zinc-600">
          Execute a verification to request analyst intelligence.
        </div>
      )}
    </section>
  );
}
