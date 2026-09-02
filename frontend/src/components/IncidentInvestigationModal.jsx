import React from 'react';
import { Bot, Fingerprint, Radio, RefreshCw, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { StatusBadge } from './ui.jsx';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.055] py-2.5 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className="telemetry max-w-[60%] truncate text-right text-zinc-200">{value ?? 'N/A'}</span>
    </div>
  );
}

function Section({ num, title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-500" />
        <div className="section-kicker">{num} {title}</div>
      </div>
      {children}
    </section>
  );
}

export default function IncidentInvestigationModal({ event, onClose, aiAnalysis, loadingAi, onReAnalyze }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        aria-label="Close investigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />

      <aside className="drawer-in fixed inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-white/[0.1] bg-[#0b0c0e] shadow-2xl">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.08] px-5 md:px-6">
          <div className="min-w-0">
            <div className="section-kicker">Incident Investigation</div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-zinc-50">{event.event_id}</h2>
              <StatusBadge value={event.verdict} />
            </div>
            <div className="telemetry mt-1 truncate text-xs text-zinc-600">{event.timestamp} / {event.simulation_mode}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm md:p-6">
          <Section num="01" title="Authoritative Verdict" icon={ShieldAlert}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold tracking-normal text-zinc-50">{event.verdict}</div>
                <p className="mt-2 leading-6 text-zinc-400">{event.reason}</p>
              </div>
              <StatusBadge value={event.action} />
            </div>
          </Section>

          <Section num="02" title="Quantum Telemetry" icon={Radio}>
            <div className="grid grid-cols-2 gap-x-5 text-xs md:grid-cols-5">
              <Row label="QBER" value={event.qber !== null && event.qber !== undefined ? `${(event.qber * 100).toFixed(2)}%` : 'N/A'} />
              <Row label="Baseline" value={event.baseline_qber !== null && event.baseline_qber !== undefined ? `${(event.baseline_qber * 100).toFixed(3)}%` : 'N/A'} />
              <Row label="TVD" value={event.tvd !== null && event.tvd !== undefined ? event.tvd.toFixed(4) : 'N/A'} />
              <Row label="p-value" value={event.p_value !== null && event.p_value !== undefined ? (event.p_value < 0.0001 ? '<0.0001' : event.p_value.toFixed(4)) : 'N/A'} />
              <Row label="Z-score" value={event.z_score !== null && event.z_score !== undefined ? event.z_score.toFixed(2) : 'N/A'} />
            </div>
          </Section>

          <div className="grid gap-4 md:grid-cols-2">
            <Section num="03" title="Classical Controls" icon={ShieldCheck}>
              <div className="text-xs">
                <Row label="Signer" value={event.signer_id} />
                <Row label="Certificate" value={event.attack_type === 'signer_impersonation' ? 'IMPERSONATION' : 'VALID'} />
                <Row label="Nonce" value={event.attack_type === 'replay_attack' ? 'REPLAYED' : 'UNIQUE'} />
              </div>
            </Section>

            <Section num="04" title="Cryptographic Identifiers" icon={Fingerprint}>
              <div className="text-xs">
                <Row label="Signature ID" value={event.signature_id} />
                <Row label="Nonce" value={event.nonce} />
                <Row label="Session ID" value={event.session_id} />
              </div>
            </Section>
          </div>

          <Section num="05" title="AI Incident Diagnosis" icon={Bot}>
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-3 text-xs text-zinc-500">
              <span>AI supports the deterministic verdict. It is not the authority of record.</span>
              {aiAnalysis && <span className="pill">{aiAnalysis.provider}</span>}
            </div>

            {loadingAi ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Evaluating incident telemetry...
              </div>
            ) : aiAnalysis?.analysis ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{aiAnalysis.analysis.summary}</div>
                  <p className="mt-2 leading-6 text-zinc-400">{aiAnalysis.analysis.explanation}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <div className="section-kicker">Recommended SOC Response</div>
                  <p className="mt-2 leading-6 text-zinc-300">{aiAnalysis.analysis.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center text-sm text-zinc-600">AI analysis unavailable for this record.</div>
            )}
          </Section>
        </div>

        <footer className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 md:px-6">
          <span className="telemetry truncate text-xs text-zinc-600">Record {event.event_id}</span>
          <div className="flex gap-2">
            <button onClick={onReAnalyze} className="btn-secondary">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
