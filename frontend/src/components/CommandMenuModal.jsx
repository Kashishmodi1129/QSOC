import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Cpu, Download, FastForward, FileText, Play, Radio, Search, Sliders } from 'lucide-react';

export default function CommandMenuModal({
  isOpen,
  onClose,
  onOpen,
  onNavigate,
  onRunSimulation,
  onRunDemo,
  onExportReport,
}) {
  const [query, setQuery] = useState('');

  const commands = useMemo(() => [
    { id: 'nav-dashboard', label: 'Overview', hint: 'Go to SOC overview', category: 'Navigation', icon: Activity, action: () => onNavigate('dashboard') },
    { id: 'nav-threat-monitor', label: 'Threat Monitor', hint: 'Open primary verification path', category: 'Navigation', icon: Radio, action: () => onNavigate('threat_monitor') },
    { id: 'nav-security-events', label: 'Security Events', hint: 'Open persistent event table', category: 'Navigation', icon: FileText, action: () => onNavigate('security_events') },
    { id: 'nav-analytics', label: 'Analytics & Sweeps', hint: 'Open charts and confusion matrix', category: 'Navigation', icon: BarChart3, action: () => onNavigate('analytics') },
    { id: 'nav-experiment-lab', label: 'Experiment Lab', hint: 'Configure threat injection', category: 'Navigation', icon: Sliders, action: () => onNavigate('experiment_lab') },
    { id: 'nav-soc-demo', label: 'Full SOC Demo', hint: 'Run five-step validation', category: 'Navigation', icon: FastForward, action: () => onNavigate('soc_demo') },
    { id: 'nav-reports', label: 'Reports & Export', hint: 'Download JSON or CSV', category: 'Navigation', icon: Download, action: () => onNavigate('reports') },
    { id: 'nav-health', label: 'System Health', hint: 'Inspect subsystem status', category: 'System', icon: Cpu, action: () => onNavigate('system_health') },
    { id: 'run-verify', label: 'Execute Unified Verification', hint: 'Run selected lab scenario', category: 'Actions', icon: Play, action: onRunSimulation },
    { id: 'run-demo', label: 'Run Full SOC Demo', hint: 'Execute all five scenarios', category: 'Actions', icon: FastForward, action: onRunDemo },
    { id: 'export-json', label: 'Export JSON Report', hint: 'Download security report', category: 'Actions', icon: Download, action: () => onExportReport('json') },
    { id: 'export-csv', label: 'Export CSV Audit Log', hint: 'Download audit events', category: 'Actions', icon: Download, action: () => onExportReport('csv') },
  ], [onNavigate, onRunSimulation, onRunDemo, onExportReport]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpen();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = commands.filter((command) => {
    const q = query.toLowerCase();
    return command.label.toLowerCase().includes(q) || command.hint.toLowerCase().includes(q) || command.category.toLowerCase().includes(q);
  });

  const run = (command) => {
    command.action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm">
      <div className="fade-up w-full max-w-2xl overflow-hidden rounded-[1.4rem] border border-white/[0.12] bg-[#101113] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or destination"
            className="h-9 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <kbd className="rounded-full border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[11px] text-zinc-500">ESC</kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filtered.length ? filtered.map((command) => {
            const Icon = command.icon;
            return (
              <button
                key={command.id}
                type="button"
                onClick={() => run(command)}
                className="group grid w-full grid-cols-[32px_1fr_auto] items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.055]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-zinc-500 group-hover:text-sky-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">{command.label}</div>
                  <div className="text-xs text-zinc-600">{command.hint}</div>
                </div>
                <div className="text-xs text-zinc-600">{command.category}</div>
              </button>
            );
          }) : (
            <div className="px-4 py-10 text-center text-sm text-zinc-600">No matching commands.</div>
          )}
        </div>
      </div>
    </div>
  );
}
