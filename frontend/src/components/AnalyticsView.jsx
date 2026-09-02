import React from 'react';
import { 
  TrendingUp, 
  RefreshCw, 
  Trash2, 
  PieChart as PieIcon 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AnalyticsView({
  analyticsData,
  sweepData,
  runningSweep,
  onRunSweep,
  onResetAnalytics,
  analyticsFilterMode,
  setAnalyticsFilterMode,
  simulationMode
}) {
  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#19202C]">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Security Analytics & Empirical Sweeps</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Statistical classification metrics, confusion matrix & empirical parameter error curves
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Mode Filter */}
          <div className="flex bg-[#080A0D] p-0.5 rounded border border-[#1C2330]">
            {['all', 'ideal', 'realistic_noise'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAnalyticsFilterMode(m)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  analyticsFilterMode === m
                    ? 'bg-[#151C27] text-slate-200 font-semibold border border-[#212E42]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'all' ? 'All' : m === 'ideal' ? 'Ideal' : 'Noisy'}
              </button>
            ))}
          </div>

          <button
            onClick={onResetAnalytics}
            className="px-2 py-1 text-[10px] text-rose-400 hover:text-rose-300 bg-[#121620] hover:bg-[#1C0E12] rounded border border-[#1E2533] hover:border-[#4D151D] flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* SWEEP CHART & DISTRIBUTION BREAKDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT: Parameter Sweep */}
        <div className="lg:col-span-8 bg-[#0E1219] border border-[#19202C] rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                QBER vs Attack Strength Parameter Sweep
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Circuit error scaling across 0% to 100% disturbance ({sweepData?.simulation_mode || simulationMode} mode)
              </p>
            </div>

            <button
              onClick={onRunSweep}
              disabled={runningSweep}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#121620] hover:bg-[#181E2B] text-slate-200 font-semibold text-[11px] rounded border border-[#1E2533] transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 ${runningSweep ? 'animate-spin' : ''}`} />
              <span>{runningSweep ? "Sweeping..." : "Run Live Sweep"}</span>
            </button>
          </div>

          {sweepData && (
            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sweepData.chart_series}
                  margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#161D28" />
                  <XAxis dataKey="strength" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis stroke="#64748B" unit="%" tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 60]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1F293A', borderRadius: '4px', fontSize: '11px' }} 
                    formatter={(val, name) => [`${val}%`, name.replace(/_/g, ' ')]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(val) => val.replace(/_/g, ' ')} />
                  <Line 
                    type="monotone" 
                    dataKey="Baseline" 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    name="Baseline" 
                    dot={{ r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Channel_Manipulation_QBER" 
                    stroke="#38bdf8" 
                    strokeWidth={2}
                    name="Channel Tamper" 
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Signature_Forgery_QBER" 
                    stroke="#cbd5e1" 
                    strokeWidth={2}
                    name="Signature Forgery" 
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* RIGHT: Scenario Distribution & Mean QBER */}
        <div className="lg:col-span-4 bg-[#0E1219] border border-[#19202C] rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <PieIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Scenario Distribution</span>
          </h3>

          {analyticsData && (
            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase">Verifications by Type:</div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Channel Tamper:</span>
                    <strong className="text-slate-200">{analyticsData.attack_type_distribution.channel_manipulation}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Signature Forgery:</span>
                    <strong className="text-slate-200">{analyticsData.attack_type_distribution.signature_forgery}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Replay Attack:</span>
                    <strong className="text-slate-200">{analyticsData.attack_type_distribution.replay_attack}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Signer Impersonation:</span>
                    <strong className="text-slate-200">{analyticsData.attack_type_distribution.signer_impersonation}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Clean Transactions:</span>
                    <strong className="text-slate-200">{analyticsData.attack_type_distribution.none}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#19202C] space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Mean QBER by Attack:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-2 bg-[#090C12] rounded border border-[#161D28]">
                    <span className="text-[9px] text-slate-500 block">Channel Tamper</span>
                    <strong className="text-slate-200">
                      {analyticsData.average_qber_by_attack_type?.channel_manipulation !== undefined
                        ? `${(analyticsData.average_qber_by_attack_type.channel_manipulation * 100).toFixed(2)}%`
                        : 'N/A'}
                    </strong>
                  </div>
                  <div className="p-2 bg-[#090C12] rounded border border-[#161D28]">
                    <span className="text-[9px] text-slate-500 block">Signature Forgery</span>
                    <strong className="text-slate-200">
                      {analyticsData.average_qber_by_attack_type?.signature_forgery !== undefined
                        ? `${(analyticsData.average_qber_by_attack_type.signature_forgery * 100).toFixed(2)}%`
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
