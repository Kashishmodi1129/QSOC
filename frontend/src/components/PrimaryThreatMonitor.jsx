import React, { useRef } from 'react';
import { Activity, ArrowDown, KeyRound, Radio, ShieldCheck } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge } from './ui.jsx';

function TelemetryCell({ label, value, note, danger }) {
  return (
    <div className="surface-soft rounded-2xl p-3">
      <div className="text-[11px] font-medium text-zinc-500">{label}</div>
      <div className={`telemetry mt-2 text-xl font-semibold ${danger ? 'text-rose-300' : 'text-zinc-100'}`}>{value}</div>
      <div className="mt-1 text-[11px] text-zinc-600">{note}</div>
    </div>
  );
}

export default function PrimaryThreatMonitor({ simulationResult, baseline, simulationMode }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const verdict = simulationResult?.verdict || 'SAFE';
  const isCompromised = verdict === 'ATTACK DETECTED';
  const isSuspicious = verdict === 'SUSPICIOUS';
  const observedQber = simulationResult?.detection?.observed_qber ?? baseline?.baseline_error_mean ?? 0;
  const baselineQber = baseline?.baseline_error_mean ?? 0.002;
  const tvd = simulationResult?.detection?.total_variation_distance ?? 0;
  const pValue = simulationResult?.detection?.p_value ?? 1;
  const zScore = simulationResult?.detection?.z_score ?? 0;
  const action = simulationResult ? (verdict === 'SAFE' ? 'ACCEPT' : isSuspicious ? 'FLAG_FOR_REVIEW' : 'REJECT') : 'ACCEPT';

  const chartData = [
    {
      name: 'Match',
      Baseline: Number(((1 - baselineQber) * 100).toFixed(2)),
      Observed: Number(((1 - observedQber) * 100).toFixed(2)),
    },
    {
      name: 'Error',
      Baseline: Number((baselineQber * 100).toFixed(2)),
      Observed: Number((observedQber * 100).toFixed(2)),
    },
  ];

  const status = isCompromised ? 'COMPROMISED' : isSuspicious ? 'DEGRADED' : 'SECURE';

  return (
    <section
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card surface rounded-[2rem] p-5 md:p-6 ${isCompromised ? 'border-rose-400/25' : isSuspicious ? 'border-amber-400/25' : ''}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="section-kicker">Primary Threat Monitor</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-zinc-50 md:text-3xl">QDS verification path</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Deterministic quantum telemetry and classical controls evaluate every signature before the AI analyst layer is consulted.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={status} />
          <StatusBadge value={action} />
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.6rem] border border-white/[0.07] bg-black/20 p-4 md:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Transmission Instrument</div>
              <div className="telemetry mt-1 text-[11px] text-zinc-600">{simulationMode || 'ideal'} / AerSimulator circuit</div>
            </div>
            <Radio className={isCompromised ? 'h-4 w-4 text-rose-300' : 'h-4 w-4 text-sky-200'} />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1.3fr_1fr] md:items-stretch">
            <div className="surface-soft rounded-2xl p-4">
              <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-300">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="section-kicker">Alice / Signer</div>
              <div className="mt-2 text-sm font-semibold text-zinc-100">Authorized source</div>
              <div className="telemetry mt-2 text-[11px] text-zinc-600">QDS signature state</div>
            </div>

            <div className={`relative overflow-hidden rounded-2xl border p-4 ${isCompromised ? 'border-rose-400/20 bg-rose-950/10' : 'border-white/[0.07] bg-white/[0.025]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-kicker">Quantum Channel</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-100">EPR Bell pair transport</div>
                </div>
                <span className={`telemetry text-[11px] font-semibold ${isCompromised ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {isCompromised ? 'DISTURBED' : 'COHERENT'}
                </span>
              </div>

              <div className="my-8 flex items-center gap-3">
                <div className="hidden text-zinc-700 md:block">↓</div>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-white/[0.07] bg-black/30">
                  {isCompromised ? (
                    <div className="h-full w-full bg-rose-400/45" />
                  ) : (
                    <div className="animate-quantum-flow rounded-full bg-sky-200/75" />
                  )}
                </div>
                <div className="hidden text-zinc-700 md:block">↓</div>
              </div>

              <div className="telemetry flex justify-between text-[11px] text-zinc-600">
                <span>|psi_sig&gt;</span>
                <span>{isCompromised ? 'perturbed channel' : 'nominal channel'}</span>
              </div>
            </div>

            <div className="surface-soft rounded-2xl p-4">
              <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="section-kicker">QDS Engine</div>
              <div className="mt-2 text-sm font-semibold text-zinc-100">Bob / Arbiter</div>
              <div className="telemetry mt-2 text-[11px] text-zinc-600">Exact binomial verifier</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center text-zinc-700 md:hidden">
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-2">
            <TelemetryCell label="Observed QBER" value={`${(observedQber * 100).toFixed(2)}%`} note={simulationResult?.measurement ? `${simulationResult.measurement.verif_1_count}/${simulationResult.measurement.total_shots} errors` : 'live baseline'} danger={isCompromised} />
            <TelemetryCell label="Baseline QBER" value={`${(baselineQber * 100).toFixed(3)}%`} note="calibrated p0" />
            <TelemetryCell label="TVD" value={tvd.toFixed(4)} note="distribution drift" />
            <TelemetryCell label="p-value" value={pValue < 0.0001 ? '<0.0001' : pValue.toFixed(4)} note="exact binomial" danger={isCompromised && pValue < 0.05} />
            <TelemetryCell label="Z-score" value={zScore.toFixed(2)} note="sigma calibrated" />
          </div>

          <div className="surface-soft rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-100">State Verification</div>
              <div className="telemetry text-[11px] text-zinc-600">baseline vs measured</div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.035)' }}
                    contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e4e4e7', fontSize: 12 }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                  <Bar dataKey="Baseline" fill="#52525b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Observed" fill={isCompromised ? '#fb7185' : '#7dd3fc'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
