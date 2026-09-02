import React from 'react';
import { 
  Search, 
  Download, 
  Zap, 
  Menu, 
  Cpu 
} from 'lucide-react';

export default function QSOCHeader({
  simulationMode,
  setSimulationMode,
  systemHealth,
  onExportReport,
  searchQuery,
  setSearchQuery,
  onToggleMobileSidebar,
  onOpenCommandMenu
}) {
  return (
    <header className="h-14 bg-[#0B0E13] border-b border-[#19202C] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      
      {/* Left: Mobile Toggle & Command Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#121620] rounded border border-[#1E2533] lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative flex-1 group cursor-pointer" onClick={onOpenCommandMenu}>
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-slate-400 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search commands, incidents, jump to... [⌘K]"
            className="w-full bg-[#080A0D] border border-[#1C2330] rounded-md pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-sans cursor-pointer focus:outline-none hover:border-[#2A3445] transition-colors"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.2 text-[9px] font-mono text-slate-500 bg-[#121620] border border-[#1E2533] rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Simulation Mode Toggle, Quick Export & System Health */}
      <div className="flex items-center gap-2.5 font-mono text-xs">
        
        {/* Simulation Mode Toggle */}
        <div className="flex bg-[#080A0D] p-0.5 rounded border border-[#1C2330]">
          <button
            type="button"
            onClick={() => setSimulationMode('ideal')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              simulationMode === 'ideal'
                ? 'bg-[#151C27] text-sky-400 font-semibold border border-[#212E42]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ideal
          </button>
          <button
            type="button"
            onClick={() => setSimulationMode('realistic_noise')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 ${
              simulationMode === 'realistic_noise'
                ? 'bg-[#151C27] text-slate-200 font-semibold border border-[#212E42]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-slate-400" /> Realistic Noise
          </button>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onExportReport('json')}
            className="px-2 py-1 bg-[#10141C] hover:bg-[#151B25] text-slate-300 border border-[#1E2532] rounded text-[10px] flex items-center gap-1 transition-colors"
            title="Export JSON Security Report"
          >
            <Download className="w-3 h-3 text-slate-400" /> JSON
          </button>
          <button
            onClick={() => onExportReport('csv')}
            className="px-2 py-1 bg-[#10141C] hover:bg-[#151B25] text-slate-300 border border-[#1E2532] rounded text-[10px] flex items-center gap-1 transition-colors"
            title="Export CSV Audit Log"
          >
            <Download className="w-3 h-3 text-slate-400" /> CSV
          </button>
        </div>

        {/* Live Subsystem Health Badges */}
        {systemHealth?.components && (
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[#19202C] text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Detector: <strong className="text-slate-200">ACTIVE</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${systemHealth.components.ai_analyst.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              AI: <strong className={systemHealth.components.ai_analyst.status === 'CONNECTED' ? 'text-slate-200' : 'text-amber-400'}>
                {systemHealth.components.ai_analyst.status === 'CONNECTED' ? 'GROQ' : 'FALLBACK'}
              </strong>
            </span>
          </div>
        )}

      </div>

    </header>
  );
}
