import React from 'react';
import { 
  FastForward, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function SOCDemoView({
  runningDemo,
  demoResult,
  onRunDemo,
  simulationMode
}) {
  const stepsDefinition = [
    { num: 1, name: '01 Clean Transaction', desc: 'Alice Authorized Signature', exp: 'SAFE', act: 'ACCEPT' },
    { num: 2, name: '02 Channel Tampering', desc: 'Quantum Depolarization & Noise', exp: 'ATTACK DETECTED', act: 'REJECT' },
    { num: 3, name: '03 Signature Forgery', desc: 'Quantum Perturbation (δθ = π/2)', exp: 'ATTACK DETECTED', act: 'REJECT' },
    { num: 4, name: '04 Cryptographic Replay', desc: 'Reused Nonce & Token Check', exp: 'ATTACK DETECTED', act: 'REJECT' },
    { num: 5, name: '05 Signer Impersonation', desc: 'Spoofed Mallory Certificate', exp: 'ATTACK DETECTED', act: 'REJECT' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#19202C]">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
            <FastForward className="w-4 h-4 text-sky-400" />
            <span>Full Security Operations Demo (Automated SOC Flow)</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Executes an end-to-end 5-scenario attack & defense validation against the live quantum engine
          </p>
        </div>

        <button
          onClick={onRunDemo}
          disabled={runningDemo}
          className="group px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-[#080A0D] font-bold text-xs font-mono rounded-lg transition-all shadow-md flex items-center gap-2 self-start md:self-auto active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${runningDemo ? 'animate-spin' : ''}`} />
          <span>{runningDemo ? "Executing 5-Step Flow..." : "RUN FULL SOC DEMO"}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 5-Step Stepper Timeline with Connecting Track */}
      <div className="relative">
        
        {/* Connecting Progress Track Line */}
        <div className="hidden sm:block absolute top-7 left-12 right-12 h-0.5 bg-[#171E2B] z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
          {stepsDefinition.map((step) => {
            const stepResult = demoResult?.steps?.find((s) => s.step === step.num);
            const isPassed = stepResult?.actual_verdict === stepResult?.expected_verdict;
            const isRunningThis = runningDemo && !stepResult;

            return (
              <div
                key={step.num}
                className={`p-4 rounded-xl border font-mono text-xs transition-all duration-200 ${
                  stepResult
                    ? isPassed
                      ? 'bg-[#0A1612] border-[#134E3A] text-slate-200 shadow-sm'
                      : 'bg-[#1A0A0E] border-[#591720] text-slate-200 shadow-sm'
                    : isRunningThis
                    ? 'bg-[#0E1522] border-sky-400/60 text-slate-200 ring-1 ring-sky-400/20'
                    : 'bg-[#0E1219] border-[#19202C] text-slate-400 hover:border-[#232D3F]'
                }`}
              >
                {/* Step Circle Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    stepResult
                      ? isPassed
                        ? 'bg-[#0E2E20] border-[#134E3A] text-emerald-400'
                        : 'bg-[#330E14] border-[#591720] text-rose-400'
                      : isRunningThis
                      ? 'bg-[#152336] border-sky-400 text-sky-400 animate-pulse'
                      : 'bg-[#141A24] border-[#222B3A] text-slate-500'
                  }`}>
                    {step.num}
                  </div>

                  {stepResult ? (
                    isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )
                  ) : isRunningThis ? (
                    <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  )}
                </div>

                <div className="font-semibold text-slate-200 text-xs mb-0.5">{step.name}</div>
                <div className="text-[10px] text-slate-500 font-sans leading-tight">{step.desc}</div>

                {stepResult ? (
                  <div className="mt-3 pt-2 border-t border-[#19202C] flex items-center justify-between text-[9px]">
                    <span className="font-bold uppercase text-slate-300">{stepResult.actual_verdict}</span>
                    <span className={stepResult.action === 'ACCEPT' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {stepResult.action}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2 border-t border-[#19202C] text-[9px] text-slate-500 flex justify-between">
                    <span>Exp: {step.exp === 'SAFE' ? 'SAFE' : 'ATTACK'}</span>
                    <span>{step.act}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Summary Card */}
      {demoResult && (
        <div className="p-5 bg-[#0E1219] rounded-xl border border-[#19202C] space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#19202C]">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-100 text-sm md:text-base">
                  Full Security Demo Sequence Completed
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  5 live verification runs executed across deterministic quantum & classical controls.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-[#062419] text-emerald-400 border border-[#134E3A] font-semibold text-[10px]">
                Safe: {demoResult.summary.safe_count}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#260A0E] text-rose-400 border border-[#591720] font-semibold text-[10px]">
                Attacks Blocked: {demoResult.summary.attacks_detected_count} / 4
              </span>
              <span className="px-2.5 py-1 rounded bg-[#121620] text-slate-300 border border-[#1E2533] font-semibold text-[10px]">
                Accuracy: {(demoResult.summary.detection_accuracy * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-[#090C12] text-slate-500 border-b border-[#161D28]">
                <tr>
                  <th className="py-2.5 px-3">Step</th>
                  <th className="py-2.5 px-3">Scenario</th>
                  <th className="py-2.5 px-3">Expected</th>
                  <th className="py-2.5 px-3">Actual Verdict</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">QBER</th>
                  <th className="py-2.5 px-3">p-value</th>
                  <th className="py-2.5 px-3">Diagnostic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141A24]">
                {demoResult.steps.map((s) => (
                  <tr key={s.step} className="hover:bg-[#141A25] transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-bold">#{s.step}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{s.scenario}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.expected_verdict}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        s.actual_verdict === 'SAFE'
                          ? 'bg-[#062419] text-emerald-400 border-[#134E3A]'
                          : 'bg-[#260A0E] text-rose-400 border-[#591720]'
                      }`}>
                        {s.actual_verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-300">{s.action}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">
                      {s.qber !== null && s.qber !== undefined ? `${(s.qber * 100).toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {s.p_value !== null && s.p_value !== undefined ? (s.p_value < 0.0001 ? '<0.0001' : s.p_value.toFixed(4)) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 truncate max-w-xs">{s.primary_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
