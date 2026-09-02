import React from 'react';
import { RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectionHeader } from './ui.jsx';

export default function AnalyticsView({
  analyticsData,
  sweepData,
  runningSweep,
  onRunSweep,
  onResetAnalytics,
  analyticsFilterMode,
  setAnalyticsFilterMode,
  simulationMode,
}) {
  const cm = analyticsData?.classification_metrics || {};
  const dist = analyticsData?.attack_type_distribution || {};

  return (
    <div className="space-y-6">
      <SectionHeader kicker="Analytics & Sweeps" title="Security analytics">
        <div className="flex rounded-full border border-white/[0.08] bg-white/[0.035] p-1">
          {['all', 'ideal', 'realistic_noise'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAnalyticsFilterMode(mode)}
              className={`rounded-full px-3 py-1 text-xs transition ${analyticsFilterMode === mode ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              {mode === 'all' ? 'All' : mode === 'ideal' ? 'Ideal' : 'Noise'}
            </button>
          ))}
        </div>
        <button onClick={onResetAnalytics} className="btn-danger">
          <Trash2 className="h-3.5 w-3.5" />
          Reset
        </button>
      </SectionHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="surface rounded-[1.6rem] p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="section-kicker">Parameter Sweep</div>
              <h3 className="mt-2 text-lg font-semibold text-zinc-50">QBER vs attack strength</h3>
              <p className="mt-1 text-sm text-zinc-500">Empirical error curves across channel manipulation and signature forgery.</p>
            </div>
            <button onClick={onRunSweep} disabled={runningSweep} className="btn-secondary">
              <RefreshCw className={`h-3.5 w-3.5 ${runningSweep ? 'animate-spin' : ''}`} />
              {runningSweep ? 'Sweeping' : 'Run Live Sweep'}
            </button>
          </div>

          <div className="h-[340px]">
            {sweepData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sweepData.chart_series} margin={{ top: 12, right: 20, left: -18, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="strength" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" domain={[0, 60]} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#e4e4e7', fontSize: 12 }}
                    formatter={(value, name) => [`${value}%`, String(name).replace(/_/g, ' ')]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} formatter={(value) => String(value).replace(/_/g, ' ')} />
                  <Line type="monotone" dataKey="Baseline" stroke="#a1a1aa" strokeDasharray="4 5" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Channel_Manipulation_QBER" stroke="#7dd3fc" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Signature_Forgery_QBER" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-sm text-zinc-600">
                Sweep data not loaded.
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5">
          <section className="surface rounded-[1.6rem] p-5">
            <div className="section-kicker">Confusion Matrix</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['True Positive', cm.true_positives || 0, 'text-emerald-300'],
                ['False Positive', cm.false_positives || 0, 'text-amber-300'],
                ['False Negative', cm.false_negatives || 0, 'text-rose-300'],
                ['True Negative', cm.true_negatives || 0, 'text-sky-200'],
              ].map(([label, value, color]) => (
                <div key={label} className="surface-soft rounded-2xl p-4">
                  <div className="text-xs text-zinc-500">{label}</div>
                  <div className={`telemetry mt-2 text-3xl font-semibold ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface rounded-[1.6rem] p-5">
            <div className="section-kicker">Scenario Distribution</div>
            <div className="mt-4 space-y-3">
              {[
                ['Clean Transactions', dist.none],
                ['Channel Manipulation', dist.channel_manipulation],
                ['Signature Forgery', dist.signature_forgery],
                ['Replay Attack', dist.replay_attack],
                ['Signer Impersonation', dist.signer_impersonation],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">{label}</span>
                  <span className="telemetry text-zinc-200">{value ?? 0}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface rounded-[1.6rem] p-5">
            <div className="section-kicker">Mean QBER by Attack</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="surface-soft rounded-2xl p-4">
                <div className="text-xs text-zinc-500">Channel</div>
                <div className="telemetry mt-2 text-xl text-zinc-100">
                  {analyticsData?.average_qber_by_attack_type?.channel_manipulation !== undefined
                    ? `${(analyticsData.average_qber_by_attack_type.channel_manipulation * 100).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
              <div className="surface-soft rounded-2xl p-4">
                <div className="text-xs text-zinc-500">Forgery</div>
                <div className="telemetry mt-2 text-xl text-zinc-100">
                  {analyticsData?.average_qber_by_attack_type?.signature_forgery !== undefined
                    ? `${(analyticsData.average_qber_by_attack_type.signature_forgery * 100).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="telemetry mt-4 text-xs text-zinc-600">Mode: {sweepData?.simulation_mode || simulationMode}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
