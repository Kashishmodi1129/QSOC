import React, { useRef } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Activity,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function PrimaryThreatMonitor({ 
  simulationResult, 
  baseline, 
  simulationMode 
}) {
  const cardRef = useRef(null);

  // CSS variables mouse tracking without React state re-renders
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const verdict = simulationResult?.verdict || 'SAFE';
  const isCompromised = verdict === 'ATTACK DETECTED';
  const isSuspicious = verdict === 'SUSPICIOUS';
  const isSafe = verdict === 'SAFE';

  const observedQber = simulationResult?.detection?.observed_qber ?? (baseline ? baseline.baseline_error_mean : 0.0);
  const baselineQber = baseline ? baseline.baseline_error_mean : 0.002;
  const tvd = simulationResult?.detection?.total_variation_distance ?? 0.0;
  const pVal = simulationResult?.detection?.p_value ?? 1.0;
  const zScore = simulationResult?.detection?.z_score ?? 0.0;

  const chartData = [
    {
      name: 'State |0> (Match)',
      Baseline: baseline ? Number(((1 - baseline.baseline_error_mean) * 100).toFixed(2)) : 99.8,
      Observed: simulationResult?.measurement ? Number(((1 - observedQber) * 100).toFixed(2)) : Number(((1 - baselineQber) * 100).toFixed(2)),
    },
    {
      name: 'State |1> (Error)',
      Baseline: baseline ? Number((baseline.baseline_error_mean * 100).toFixed(2)) : 0.2,
      Observed: simulationResult?.measurement ? Number((observedQber * 100).toFixed(2)) : Number((baselineQber * 100).toFixed(2)),
    },
  ];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card rounded-xl bg-[#0E1219] border p-5 shadow-lg transition-all ${
        isCompromised
          ? 'threat-compromised-border border-rose-500/60'
          : isSuspicious
          ? 'border-amber-500/50'
          : 'border-[#19202C]'
      }`}
    >
      {/* Top Monitor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#19202C]">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            isCompromised
              ? 'bg-[#240A0E] border-[#4D151D] text-rose-400'
              : isSuspicious
              ? 'bg-[#241804] border-[#4D3308] text-amber-400'
              : 'bg-[#121824] border-[#1F293A] text-sky-400'
          }`}>
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-slate-100">
                Primary Threat Monitor
              </h2>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                isCompromised
                  ? 'bg-[#260A0E] text-rose-400 border-[#591720]'
                  : isSuspicious
                  ? 'bg-[#241804] text-amber-400 border-[#593E0D]'
                  : 'bg-[#062419] text-emerald-400 border-[#134E3A]'
              }`}>
                STATUS: {isCompromised ? 'COMPROMISED' : isSuspicious ? 'DEGRADED' : 'SECURE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Continuous Telemetry • AerSimulator Circuit ({simulationMode || 'ideal'})
            </p>
          </div>
        </div>

        {/* Mandatory Action Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="text-slate-500 text-[11px]">Action:</span>
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${
            isSafe
              ? 'bg-[#062419] text-emerald-400 border-[#134E3A]'
              : isSuspicious
              ? 'bg-[#241804] text-amber-400 border-[#593E0D]'
              : 'bg-[#260A0E] text-rose-400 border-[#591720]'
          }`}>
            {simulationResult ? (isSafe ? 'ACCEPT' : isSuspicious ? 'FLAG_FOR_REVIEW' : 'REJECT') : 'ACCEPT'}
          </span>
        </div>
      </div>

      {/* QUANTUM TRANSMISSION PIPELINE */}
      <div className="my-5 p-3.5 rounded-lg bg-[#090C12] border border-[#161D28] font-mono">
        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2.5">
          Quantum Digital Signature Transmission Path
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center">
          
          {/* Node 1: Alice */}
          <div className="p-2.5 rounded bg-[#0E131C] border border-[#1A2230] flex items-center gap-2">
            <div className="p-1 bg-[#141A24] rounded border border-[#20293A] text-slate-300">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-[9px] text-slate-500 block uppercase">Signer</span>
              <strong className="text-xs text-slate-200 truncate block">Alice</strong>
            </div>
          </div>

          {/* Node 2: Quantum Channel with Traveling Signal */}
          <div className={`col-span-1 md:col-span-2 p-2.5 rounded border relative overflow-hidden transition-all ${
            isCompromised
              ? 'bg-[#18090C] border-[#3D141A] text-rose-300'
              : 'bg-[#0E131C] border-[#1A2230] text-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[9px] text-slate-400">
                Quantum Channel (EPR Bell Pair)
              </span>
              <span className={`text-[9px] font-bold ${isCompromised ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isCompromised ? '⚡ DISTURBANCE' : '✓ COHERENT'}
              </span>
            </div>

            {/* Signal Flow Track */}
            <div className="relative h-1.5 bg-[#06080C] rounded-full overflow-hidden border border-[#141A24]">
              {isCompromised ? (
                <div className="w-full h-full bg-rose-500/70"></div>
              ) : (
                <div className="animate-quantum-flow bg-sky-400/80 rounded-full"></div>
              )}
            </div>

            <div className="mt-1 flex justify-between text-[9px] text-slate-500">
              <span>|ψ_sig⟩ = α|0⟩ + β|1⟩</span>
              <span>{isCompromised ? 'Perturbed' : 'Nominal'}</span>
            </div>
          </div>

          {/* Node 3: QDS Engine & Bob */}
          <div className="p-2.5 rounded bg-[#0E131C] border border-[#1A2230] flex items-center gap-2">
            <div className={`p-1 rounded border ${
              isCompromised
                ? 'bg-[#240A0E] border-[#4D151D] text-rose-400'
                : 'bg-[#0E1A14] border-[#173D2C] text-emerald-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-[9px] text-slate-500 block uppercase">Arbiter</span>
              <strong className="text-xs text-slate-200 truncate block">Bob (Exact Binomial)</strong>
            </div>
          </div>

        </div>
      </div>

      {/* TELEMETRY METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
        
        <div className="p-2.5 rounded bg-[#090C12] border border-[#161D28]">
          <span className="text-[9px] text-slate-500 block uppercase">Live Observed QBER</span>
          <div className="text-lg font-bold text-slate-100 mt-0.5">
            {(observedQber * 100).toFixed(2)}%
          </div>
          <span className="text-[9px] text-slate-500 block">
            {simulationResult?.measurement ? `${simulationResult.measurement.verif_1_count}/${simulationResult.measurement.total_shots} err` : 'Active'}
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#090C12] border border-[#161D28]">
          <span className="text-[9px] text-slate-500 block uppercase">Baseline (p_0)</span>
          <div className="text-lg font-bold text-slate-300 mt-0.5">
            {(baselineQber * 100).toFixed(3)}%
          </div>
          <span className="text-[9px] text-slate-500 block">
            Calibrated Ref
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#090C12] border border-[#161D28]">
          <span className="text-[9px] text-slate-500 block uppercase">TVD Distance</span>
          <div className="text-lg font-bold text-slate-300 mt-0.5">
            {tvd.toFixed(4)}
          </div>
          <span className="text-[9px] text-slate-500 block">
            0.0 – 1.0
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#090C12] border border-[#161D28]">
          <span className="text-[9px] text-slate-500 block uppercase">Exact p-value</span>
          <div className="text-lg font-bold text-slate-300 mt-0.5">
            {pVal < 0.0001 ? '<0.0001' : pVal.toFixed(4)}
          </div>
          <span className="text-[9px] text-slate-500 block">
            Hypothesis Test
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#090C12] border border-[#161D28]">
          <span className="text-[9px] text-slate-500 block uppercase">Standardized Z</span>
          <div className="text-lg font-bold text-slate-300 mt-0.5">
            {zScore.toFixed(2)}
          </div>
          <span className="text-[9px] text-slate-500 block">
            Sigma Calibrated
          </span>
        </div>

      </div>

      {/* SINGLE RUN DISTRIBUTION CHART */}
      <div className="mt-4 pt-3 border-t border-[#19202C]">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-slate-400" />
            <span>Single-Run Quantum State Verification (%)</span>
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            Baseline vs Measured
          </span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#161D28" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis stroke="#64748B" unit="%" tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1F293A', borderRadius: '4px', fontSize: '11px' }} 
                formatter={(val) => [`${val}%`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="Baseline" fill="#475569" name="Baseline" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Observed" fill={isCompromised ? '#EF4444' : '#38BDF8'} name="Measured" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
