import React from 'react';
import { FileText, RefreshCw, Search, Trash2 } from 'lucide-react';
import { StatusBadge } from './ui.jsx';

function formatAttack(type) {
  return String(type || 'unknown').replace(/_/g, ' ');
}

export default function RecentThreatActivity({
  securityEvents,
  onInvestigate,
  onRefresh,
  onClear,
  filterVerdict,
  setFilterVerdict,
  filterAttackType,
  setFilterAttackType,
  filterMode,
  setFilterMode,
}) {
  return (
    <section className="surface overflow-hidden rounded-[1.6rem]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-kicker">Persistent Audit</div>
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-zinc-50">Security Events</h2>
          <p className="mt-1 text-sm text-zinc-500">SQLite-backed incident stream with forensic investigation.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={filterVerdict} onChange={(e) => setFilterVerdict(e.target.value)} className="field max-w-[150px]">
            <option value="all">All Verdicts</option>
            <option value="SAFE">SAFE</option>
            <option value="SUSPICIOUS">SUSPICIOUS</option>
            <option value="ATTACK DETECTED">ATTACK DETECTED</option>
          </select>
          <select value={filterAttackType} onChange={(e) => setFilterAttackType(e.target.value)} className="field max-w-[160px]">
            <option value="all">All Threats</option>
            <option value="none">Clean</option>
            <option value="channel_manipulation">Channel</option>
            <option value="signature_forgery">Forgery</option>
            <option value="replay_attack">Replay</option>
            <option value="signer_impersonation">Impersonation</option>
          </select>
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="field max-w-[140px]">
            <option value="all">All Modes</option>
            <option value="ideal">Ideal</option>
            <option value="realistic_noise">Noise</option>
          </select>
          <button onClick={onRefresh} className="btn-secondary" title="Refresh log">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button onClick={onClear} className="btn-danger" title="Clear log">
            <Trash2 className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {securityEvents?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Time</th>
                <th className="text-left">Threat</th>
                <th className="text-left">Signer</th>
                <th className="text-left">QBER</th>
                <th className="text-left">Verdict</th>
                <th className="text-left">Action</th>
                <th className="text-right">Investigate</th>
              </tr>
            </thead>
            <tbody>
              {securityEvents.map((evt) => (
                <tr key={evt.event_id}>
                  <td className="telemetry whitespace-nowrap text-zinc-500">
                    {evt.timestamp ? evt.timestamp.split('T')[1]?.replace('Z', '').slice(0, 8) : 'N/A'}
                  </td>
                  <td>
                    <div className="font-medium capitalize text-zinc-200">{formatAttack(evt.attack_type)}</div>
                    <div className="telemetry text-[11px] text-zinc-600">{evt.simulation_mode}</div>
                  </td>
                  <td className="telemetry max-w-[170px] truncate text-zinc-400">{evt.signer_id}</td>
                  <td className="telemetry font-semibold text-zinc-200">
                    {evt.qber !== null && evt.qber !== undefined ? `${(evt.qber * 100).toFixed(2)}%` : '-'}
                  </td>
                  <td><StatusBadge value={evt.verdict} /></td>
                  <td><StatusBadge value={evt.action} /></td>
                  <td className="text-right">
                    <button onClick={() => onInvestigate(evt)} className="btn-secondary min-h-8 px-3">
                      <Search className="h-3.5 w-3.5" />
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <FileText className="h-7 w-7 text-zinc-700" />
            <div className="mt-3 text-sm font-medium text-zinc-300">No security events recorded</div>
            <div className="mt-1 text-sm text-zinc-600">Run verification or the Full SOC Demo to populate the log.</div>
          </div>
        )}
      </div>
    </section>
  );
}
