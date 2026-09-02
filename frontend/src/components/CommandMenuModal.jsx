import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Activity, 
  Radio, 
  FileText, 
  TrendingUp, 
  Sliders, 
  FastForward, 
  Download, 
  Cpu, 
  Play, 
  ShieldAlert, 
  ShieldCheck 
} from 'lucide-react';

export default function CommandMenuModal({
  isOpen,
  onClose,
  onNavigate,
  onRunSimulation,
  onRunDemo,
  onExportReport
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate(null, true); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  const commands = [
    { id: 'nav-dashboard', label: 'Navigate: SOC Dashboard', category: 'Navigation', icon: Activity, action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'nav-threat-monitor', label: 'Navigate: Primary Threat Monitor', category: 'Navigation', icon: Radio, action: () => { onNavigate('threat_monitor'); onClose(); } },
    { id: 'nav-security-events', label: 'Navigate: Security Events Audit Log', category: 'Navigation', icon: FileText, action: () => { onNavigate('security_events'); onClose(); } },
    { id: 'nav-analytics', label: 'Navigate: Analytics & Parameter Sweeps', category: 'Navigation', icon: TrendingUp, action: () => { onNavigate('analytics'); onClose(); } },
    { id: 'nav-experiment-lab', label: 'Navigate: Experiment Lab & Threat Console', category: 'Navigation', icon: Sliders, action: () => { onNavigate('experiment_lab'); onClose(); } },
    { id: 'nav-soc-demo', label: 'Navigate: Full SOC Security Demo', category: 'Navigation', icon: FastForward, action: () => { onNavigate('soc_demo'); onClose(); } },
    { id: 'nav-system-health', label: 'Navigate: Subsystem Health Telemetry', category: 'Navigation', icon: Cpu, action: () => { onNavigate('system_health'); onClose(); } },
    { id: 'act-run-verify', label: 'Action: Execute Unified Verification', category: 'Actions', icon: Play, action: () => { onRunSimulation(); onClose(); } },
    { id: 'act-run-demo', label: 'Action: Run 5-Step Full SOC Demo', category: 'Actions', icon: FastForward, action: () => { onRunDemo(); onClose(); } },
    { id: 'act-export-json', label: 'Action: Export Security Report (JSON)', category: 'Actions', icon: Download, action: () => { onExportReport('json'); onClose(); } },
    { id: 'act-export-csv', label: 'Action: Export Security Audit Log (CSV)', category: 'Actions', icon: Download, action: () => { onExportReport('csv'); onClose(); } },
  ];

  const filtered = commands.filter((c) => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#080A0D]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0E1219] border border-[#222B3B] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search Input */}
        <div className="p-3 border-b border-[#19202C] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to section..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-[#121620] border border-[#1E2533] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full p-2 rounded-lg text-left text-xs font-mono text-slate-300 hover:bg-[#151C27] hover:text-slate-100 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans uppercase tracking-wider">{item.category}</span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No matching commands or destinations found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 px-3 border-t border-[#19202C] bg-[#0A0D13] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Navigate with arrows or click</span>
          <span>QSOC Command Console</span>
        </div>

      </div>
    </div>
  );
}
