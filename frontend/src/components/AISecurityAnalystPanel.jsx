import React from 'react';
import { Bot, RefreshCw, Info } from 'lucide-react';

export default function AISecurityAnalystPanel({ 
  aiAnalysis, 
  loadingAi, 
  onReAnalyze 
}) {
  return (
    <div className="rounded-xl bg-[#0E1219] border border-[#19202C] p-4 shadow-md space-y-3.5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#19202C]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#141A24] border border-[#222B3B] rounded-lg text-slate-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs md:text-sm font-bold text-slate-100">
                AI Security Analyst
              </h3>
              {aiAnalysis && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#151C27] text-slate-300 border border-[#212E42]">
                  {aiAnalysis.provider}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Analyst assistance & incident explanation
            </p>
          </div>
        </div>

        <button
          onClick={onReAnalyze}
          disabled={loadingAi}
          className="px-2.5 py-1 bg-[#121620] hover:bg-[#181E2B] disabled:opacity-50 text-slate-300 text-[11px] font-mono rounded border border-[#1E2533] flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loadingAi ? 'animate-spin' : ''}`} />
          <span>{loadingAi ? "Analyzing..." : "Re-Analyze"}</span>
        </button>
      </div>

      {/* Authoritative Disclaimer Banner */}
      <div className="p-2 rounded-md bg-[#0A0D13] border border-[#171D28] text-slate-400 text-[10px] font-mono flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span>
          AI is an analyst-assistance layer. The deterministic security engine remains authoritative for threat classification.
        </span>
      </div>

      {/* AI Analysis Findings */}
      {loadingAi ? (
        <div className="p-5 rounded bg-[#090C12] border border-[#161D28] text-center space-y-1.5 font-mono">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
          <p className="text-xs text-slate-300">Querying AI Analyst model...</p>
          <span className="text-[10px] text-slate-500">Evaluating quantum telemetry and classical tokens</span>
        </div>
      ) : aiAnalysis?.analysis ? (
        <div className="space-y-2.5 font-mono text-xs">
          
          {/* Executive Summary & Severity */}
          <div className="p-2.5 bg-[#090C12] rounded border border-[#161D28] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Executive Summary</span>
              <strong className="text-slate-200 text-xs">{aiAnalysis.analysis.summary}</strong>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border self-start sm:self-auto ${
              aiAnalysis.analysis.severity === 'CRITICAL' ? 'bg-[#260A0E] text-rose-400 border-[#591720]' :
              aiAnalysis.analysis.severity === 'HIGH' ? 'bg-[#241804] text-amber-400 border-[#593E0D]' :
              aiAnalysis.analysis.severity === 'ELEVATED' ? 'bg-[#241804] text-amber-300 border-[#593E0D]' :
              'bg-[#062419] text-emerald-400 border-[#134E3A]'
            }`}>
              SEVERITY: {aiAnalysis.analysis.severity}
            </span>
          </div>

          {/* Diagnostic Explanation */}
          <div className="p-2.5 bg-[#090C12] rounded border border-[#161D28] space-y-0.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Diagnostic Analysis</span>
            <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
              {aiAnalysis.analysis.explanation}
            </p>
          </div>

          {/* Forensic Evidence Points */}
          {aiAnalysis.analysis.evidence?.length > 0 && (
            <div className="p-2.5 bg-[#090C12] rounded border border-[#161D28] space-y-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Structured Evidence</span>
              <ul className="space-y-0.5">
                {aiAnalysis.analysis.evidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended SOC Response */}
          <div className="p-2.5 bg-[#0B1017] rounded border border-[#192433] space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">Recommended SOC Action</span>
            <p className="text-slate-200 text-[11px] font-sans">
              {aiAnalysis.analysis.recommendation}
            </p>
          </div>

        </div>
      ) : (
        <div className="p-3 rounded bg-[#090C12] border border-[#161D28] text-center text-[11px] text-slate-500 font-mono">
          Execute a transaction simulation to generate an AI incident explanation.
        </div>
      )}

    </div>
  );
}
