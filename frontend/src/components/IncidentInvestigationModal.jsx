import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Bot, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  Fingerprint,
  Radio,
  FileCode2,
  Lock
} from 'lucide-react';

export default function IncidentInvestigationModal({
  event,
  onClose,
  aiAnalysis,
  loadingAi,
  onReAnalyze
}) {
  if (!event) return null;

  const isSafe = event.verdict === 'SAFE';
  const isSusp = event.verdict === 'SUSPICIOUS';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080A0D]/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
      />

      {/* Slide-over Drawer from Right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl md:max-w-2xl bg-[#0E1219] border-l border-[#222B3B] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
          
          {/* Drawer Header */}
          <div className="h-16 px-6 border-b border-[#19202C] flex items-center justify-between bg-[#0B0E14] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${
                isSafe
                  ? 'bg-[#062419] border-[#134E3A] text-emerald-400'
                  : isSusp
                  ? 'bg-[#241804] border-[#593E0D] text-amber-400'
                  : 'bg-[#260A0E] border-[#591720] text-rose-400'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">
                    Incident Investigation Record
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-[#151C27] text-slate-400 border border-[#212E42]">
                    {event.event_id}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Timestamp: {event.timestamp} • Mode: {event.simulation_mode}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-[#151C27] transition-colors"
              aria-label="Close Investigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto text-xs font-mono">
            
            {/* 01. Authoritative Deterministic Verdict & Action Banner */}
            <div className={`p-4 rounded-xl border ${
              isSafe
                ? 'bg-[#062419]/40 border-[#134E3A]'
                : isSusp
                ? 'bg-[#241804]/40 border-[#593E0D]'
                : 'bg-[#260A0E]/40 border-[#591720]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                    01 • Authoritative Deterministic Security Verdict
                  </span>
                  <strong className="text-base font-bold text-slate-100">{event.verdict}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                    Mandatory Action
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    event.action === 'ACCEPT'
                      ? 'bg-[#0E2E20] text-emerald-400'
                      : event.action === 'FLAG_FOR_REVIEW'
                      ? 'bg-[#2E200A] text-amber-400'
                      : 'bg-[#330E14] text-rose-400'
                  }`}>
                    {event.action}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-[#19202C] font-sans">
                {event.reason}
              </p>
            </div>

            {/* 02. Quantum Telemetry & Exact Statistical Testing */}
            <div className="bg-[#090C12] p-4 rounded-xl border border-[#161D28] space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  02 • Quantum Telemetry & Exact Binomial Statistical Testing
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="p-2.5 bg-[#0E131C] rounded border border-[#1A2230]">
                  <span className="text-[9px] text-slate-500 block uppercase">Observed QBER</span>
                  <strong className="text-slate-100 text-xs mt-0.5 block">
                    {event.qber !== null && event.qber !== undefined ? `${(event.qber * 100).toFixed(2)}%` : 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 bg-[#0E131C] rounded border border-[#1A2230]">
                  <span className="text-[9px] text-slate-500 block uppercase">Baseline p_0</span>
                  <strong className="text-slate-300 text-xs mt-0.5 block">
                    {event.baseline_qber !== null && event.baseline_qber !== undefined ? `${(event.baseline_qber * 100).toFixed(3)}%` : 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 bg-[#0E131C] rounded border border-[#1A2230]">
                  <span className="text-[9px] text-slate-500 block uppercase">TVD Distance</span>
                  <strong className="text-slate-300 text-xs mt-0.5 block">
                    {event.tvd !== null && event.tvd !== undefined ? event.tvd.toFixed(4) : 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 bg-[#0E131C] rounded border border-[#1A2230]">
                  <span className="text-[9px] text-slate-500 block uppercase">Exact p-value</span>
                  <strong className="text-slate-300 text-xs mt-0.5 block">
                    {event.p_value !== null && event.p_value !== undefined ? (event.p_value < 0.0001 ? '<0.0001' : event.p_value.toFixed(4)) : 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 bg-[#0E131C] rounded border border-[#1A2230]">
                  <span className="text-[9px] text-slate-500 block uppercase">Z-Score</span>
                  <strong className="text-slate-300 text-xs mt-0.5 block">
                    {event.z_score !== null && event.z_score !== undefined ? event.z_score.toFixed(2) : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {/* 03 & 04. Classical Security Controls & Cryptographic Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#090C12] p-3.5 rounded-xl border border-[#161D28] space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    03 • Classical Controls
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signer Identity:</span>
                    <strong className="text-slate-200">{event.signer_id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Status:</span>
                    <span className={`font-bold ${event.attack_type === 'signer_impersonation' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {event.attack_type === 'signer_impersonation' ? 'IMPERSONATION' : 'VALID'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nonce Freshness:</span>
                    <span className={`font-bold ${event.attack_type === 'replay_attack' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {event.attack_type === 'replay_attack' ? 'REPLAYED' : 'UNIQUE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#090C12] p-3.5 rounded-xl border border-[#161D28] space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    04 • Cryptographic Identifiers
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="truncate"><span className="text-slate-500">Sig ID:</span> <span className="text-slate-200">{event.signature_id}</span></div>
                  <div className="truncate"><span className="text-slate-500">Nonce:</span> <span className="text-slate-300">{event.nonce}</span></div>
                  <div className="truncate"><span className="text-slate-500">Session ID:</span> <span className="text-slate-400">{event.session_id}</span></div>
                </div>
              </div>
            </div>

            {/* 05. AI Incident Diagnosis */}
            <div className="bg-[#090C12] border border-[#161D28] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                    05 • AI Security Analyst Incident Diagnosis
                  </span>
                </div>
                {aiAnalysis && (
                  <span className="text-[9px] text-slate-400 px-2 py-0.5 rounded bg-[#121620] border border-[#1E2533]">
                    {aiAnalysis.provider}
                  </span>
                )}
              </div>

              {loadingAi ? (
                <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Evaluating incident forensic telemetry...</span>
                </div>
              ) : aiAnalysis?.analysis ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#0E131C] rounded-lg border border-[#1A2230]">
                    <strong className="text-slate-200 block text-xs mb-1">{aiAnalysis.analysis.summary}</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                      {aiAnalysis.analysis.explanation}
                    </p>
                  </div>

                  <div className="p-3 bg-[#0E131C] rounded-lg border border-[#1A2230] space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase block font-semibold">Recommended SOC Response:</span>
                    <p className="text-slate-200 font-medium text-[11px] font-sans">
                      {aiAnalysis.analysis.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-2 text-[11px]">
                  AI analysis unavailable for this record.
                </div>
              )}
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="h-14 px-6 border-t border-[#19202C] bg-[#0B0E14] flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-slate-500 font-mono">
              Forensic Log Record ID: {event.event_id}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#141A24] hover:bg-[#1A2230] text-slate-200 text-xs font-semibold rounded border border-[#222B3B] transition-colors"
            >
              Close Investigation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
