import React from 'react';
import { 
  FileText, 
  RefreshCw, 
  Trash2, 
  Search 
} from 'lucide-react';

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
  setFilterMode
}) {
  return (
    <div className="rounded-xl bg-[#0E1219] border border-[#19202C] p-4 shadow-md space-y-3">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-[#19202C]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#141A24] border border-[#222B3B] rounded-lg text-slate-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-100">
              Recent Threat Activity & Audit Log
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Persistent SQLite security telemetry
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="bg-[#080A0D] border border-[#1C2330] rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-[#323E54]"
          >
            <option value="all">All Verdicts</option>
            <option value="SAFE">SAFE</option>
            <option value="SUSPICIOUS">SUSPICIOUS</option>
            <option value="ATTACK DETECTED">ATTACK DETECTED</option>
          </select>

          <select
            value={filterAttackType}
            onChange={(e) => setFilterAttackType(e.target.value)}
            className="bg-[#080A0D] border border-[#1C2330] rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-[#323E54]"
          >
            <option value="all">All Attacks</option>
            <option value="none">Clean</option>
            <option value="channel_manipulation">Channel Tamper</option>
            <option value="signature_forgery">Signature Forgery</option>
            <option value="replay_attack">Replay Attack</option>
            <option value="signer_impersonation">Impersonation</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-1 bg-[#121620] hover:bg-[#181E2B] text-slate-300 rounded border border-[#1E2533] transition-colors"
            title="Refresh Log"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClear}
            className="px-2 py-1 text-[10px] text-rose-400 hover:text-rose-300 bg-[#121620] hover:bg-[#1C0E12] rounded border border-[#1E2533] hover:border-[#4D151D] flex items-center gap-1 transition-colors"
            title="Clear Log"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        {securityEvents?.length > 0 ? (
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-[#090C12] text-slate-500 border-b border-[#161D28]">
              <tr>
                <th className="py-2 px-2.5">TIME (UTC)</th>
                <th className="py-2 px-2.5">INCIDENT</th>
                <th className="py-2 px-2.5">SIGNER</th>
                <th className="py-2 px-2.5">QBER</th>
                <th className="py-2 px-2.5">VERDICT</th>
                <th className="py-2 px-2.5">ACTION</th>
                <th className="py-2 px-2.5 text-right">FORENSIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141A24]">
              {securityEvents.map((evt) => {
                const isSafe = evt.verdict === 'SAFE';
                const isSusp = evt.verdict === 'SUSPICIOUS';

                return (
                  <tr key={evt.event_id} className="hover:bg-[#141A25] transition-colors">
                    <td className="py-2 px-2.5 text-slate-400">
                      {evt.timestamp ? evt.timestamp.split('T')[1]?.replace('Z', '').slice(0, 8) : 'N/A'}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="font-semibold text-slate-200 uppercase">{evt.attack_type}</span>
                      <span className="text-[9px] text-slate-500 block font-normal">{evt.simulation_mode}</span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-300 truncate max-w-[110px]">
                      {evt.signer_id}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-200">
                      {evt.qber !== null && evt.qber !== undefined ? `${(evt.qber * 100).toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        isSafe
                          ? 'bg-[#062419] text-emerald-400 border-[#134E3A]'
                          : isSusp
                          ? 'bg-[#241804] text-amber-400 border-[#593E0D]'
                          : 'bg-[#260A0E] text-rose-400 border-[#591720]'
                      }`}>
                        {evt.verdict}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        evt.action === 'ACCEPT'
                          ? 'text-emerald-400'
                          : evt.action === 'FLAG_FOR_REVIEW'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {evt.action}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <button
                        onClick={() => onInvestigate(evt)}
                        className="px-2 py-0.5 text-[10px] bg-[#121620] hover:bg-[#181E2B] text-slate-300 border border-[#1E2533] rounded flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Search className="w-3 h-3" /> Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-slate-500 space-y-1.5 font-mono">
            <FileText className="w-6 h-6 mx-auto text-slate-600" />
            <p className="text-xs text-slate-400">No Security Events Recorded</p>
            <p className="text-[10px] text-slate-500">Run a verification transaction or Full SOC Demo to populate the log.</p>
          </div>
        )}
      </div>

    </div>
  );
}
