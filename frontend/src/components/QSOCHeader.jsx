import React from 'react';
import { Download, Menu, Search, Zap } from 'lucide-react';
import { StatusBadge } from './ui.jsx';

export default function QSOCHeader({
  simulationMode,
  setSimulationMode,
  systemHealth,
  onExportReport,
  onToggleMobileSidebar,
  onOpenCommandMenu,
}) {
  const aiStatus = systemHealth?.components?.ai_analyst?.status === 'CONNECTED' ? 'Groq' : 'Fallback';

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#070809]/80 px-4 backdrop-blur-xl md:px-7 lg:ml-0">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-zinc-400 transition hover:text-zinc-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCommandMenu}
            className="group flex h-10 w-full max-w-xl items-center justify-between rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 text-left transition hover:border-white/[0.16] hover:bg-white/[0.055]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Search className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
              <span className="truncate text-sm text-zinc-500 group-hover:text-zinc-300">
                Search commands, incidents, or actions
              </span>
            </span>
            <kbd className="ml-3 hidden rounded-full border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[11px] text-zinc-500 sm:inline-flex">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex rounded-full border border-white/[0.08] bg-white/[0.035] p-1">
            <button
              type="button"
              onClick={() => setSimulationMode('ideal')}
              className={`rounded-full px-3 py-1 text-xs transition ${simulationMode === 'ideal' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Ideal
            </button>
            <button
              type="button"
              onClick={() => setSimulationMode('realistic_noise')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${simulationMode === 'realistic_noise' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              <Zap className="h-3 w-3" />
              Noise
            </button>
          </div>

          <button onClick={() => onExportReport('json')} className="btn-secondary">
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
          <button onClick={() => onExportReport('csv')} className="btn-secondary">
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>

          {systemHealth?.components && <StatusBadge value={`AI ${aiStatus}`} />}
        </div>
      </div>
    </header>
  );
}
