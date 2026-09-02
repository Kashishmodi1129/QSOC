import React from 'react';
import { CheckCircle2, FastForward, RefreshCw, XCircle } from 'lucide-react';
import { SectionHeader, StatusBadge } from './ui.jsx';

export default function SOCDemoView({ runningDemo, demoResult, onRunDemo, simulationMode }) {
  const steps = [
    { num: 1, name: 'Clean Transaction', desc: 'Alice authorized signature', exp: 'SAFE', act: 'ACCEPT' },
    { num: 2, name: 'Quantum Channel Manipulation', desc: 'Depolarization and noise', exp: 'ATTACK DETECTED', act: 'REJECT' },
    { num: 3, name: 'Quantum Signature Forgery', desc: 'Perturbation delta theta equals pi over two', exp: 'ATTACK DETECTED', act: 'REJECT' },
    { num: 4, name: 'Cryptographic Replay', desc: 'Reused nonce and token check', exp: 'ATTACK DETECTED', act: 'REJECT' },
    { num: 5, name: 'Signer Impersonation', desc: 'Spoofed Mallory certificate', exp: 'ATTACK DETECTED', act: 'REJECT' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader kicker="Full SOC Demo" title="Five-step security validation">
        <button onClick={onRunDemo} disabled={runningDemo} className="btn-primary min-h-11">
          <RefreshCw className={`h-4 w-4 ${runningDemo ? 'animate-spin' : ''}`} />
          {runningDemo ? 'Executing Demo' : 'Run Full SOC Demo'}
        </button>
      </SectionHeader>

      <section className="surface rounded-[1.6rem] p-5">
        <div className="relative">
          <div className="absolute left-5 top-8 hidden h-[calc(100%-4rem)] w-px bg-white/[0.08] md:block" />
          <div className="space-y-3">
            {steps.map((step) => {
              const result = demoResult?.steps?.find((s) => s.step === step.num);
              const passed = result?.actual_verdict === result?.expected_verdict;
              return (
                <div key={step.num} className="relative grid gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 md:grid-cols-[48px_1fr_auto] md:items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${result ? (passed ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300' : 'border-rose-400/25 bg-rose-400/[0.08] text-rose-300') : 'border-white/[0.09] bg-[#101113] text-zinc-500'}`}>
                    {result ? (passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />) : <span className="telemetry text-sm">{String(step.num).padStart(2, '0')}</span>}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{String(step.num).padStart(2, '0')} {step.name}</div>
                    <div className="mt-1 text-sm text-zinc-500">{step.desc}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <StatusBadge value={result?.actual_verdict || step.exp} />
                    <StatusBadge value={result?.action || step.act} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {demoResult && (
        <section className="surface overflow-hidden rounded-[1.6rem]">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="section-kicker">Run Summary</div>
              <h3 className="mt-1 text-lg font-semibold text-zinc-50">Demo sequence completed</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={`Safe ${demoResult.summary.safe_count}`} />
              <StatusBadge value={`Blocked ${demoResult.summary.attacks_detected_count}/4`} />
              <StatusBadge value={`Accuracy ${(demoResult.summary.detection_accuracy * 100).toFixed(0)}%`} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">Step</th>
                  <th className="text-left">Scenario</th>
                  <th className="text-left">Expected</th>
                  <th className="text-left">Actual</th>
                  <th className="text-left">Action</th>
                  <th className="text-left">QBER</th>
                  <th className="text-left">p-value</th>
                  <th className="text-left">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {demoResult.steps.map((s) => (
                  <tr key={s.step}>
                    <td className="telemetry text-zinc-500">#{s.step}</td>
                    <td className="text-zinc-200">{s.scenario}</td>
                    <td className="text-zinc-500">{s.expected_verdict}</td>
                    <td><StatusBadge value={s.actual_verdict} /></td>
                    <td><StatusBadge value={s.action} /></td>
                    <td className="telemetry text-zinc-200">{s.qber !== null && s.qber !== undefined ? `${(s.qber * 100).toFixed(2)}%` : '-'}</td>
                    <td className="telemetry text-zinc-500">{s.p_value !== null && s.p_value !== undefined ? (s.p_value < 0.0001 ? '<0.0001' : s.p_value.toFixed(4)) : '-'}</td>
                    <td className="max-w-sm truncate text-zinc-400">{s.primary_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
