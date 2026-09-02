import React from 'react';
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  FastForward,
  FileText,
  Radio,
  Shield,
  Sliders,
} from 'lucide-react';

export default function QSOCSidebar({ activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'threat_monitor', label: 'Threat Monitor', icon: Radio },
    { id: 'security_events', label: 'Security Events', icon: FileText },
    { id: 'analytics', label: 'Analytics & Sweeps', icon: BarChart3 },
    { id: 'experiment_lab', label: 'Experiment Lab', icon: Sliders },
    { id: 'soc_demo', label: 'Full SOC Demo', icon: FastForward },
    { id: 'reports', label: 'Reports & Export', icon: Download },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-white/[0.08] bg-[#090a0b]/95 lg:flex lg:flex-col lg:justify-between ${sidebarCollapsed ? 'w-[72px]' : 'w-[264px]'}`}>
      <div>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-sky-200">
              <Shield className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-normal text-zinc-50">QSOC</div>
                <div className="text-[11px] text-zinc-500">Quantum Security</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-full p-1.5 text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200 lg:block"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="px-3 py-3">
          {!sidebarCollapsed && <div className="section-kicker px-3 pb-3">Navigation</div>}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-white/[0.075] text-zinc-50'
                      : 'text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-sky-200' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  {!sidebarCollapsed && <span className="truncate text-left">{item.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-white/[0.07] pt-4">
            {!sidebarCollapsed && <div className="section-kicker px-3 pb-3">System</div>}
            <button
              type="button"
              onClick={() => setActiveTab('system_health')}
              title={sidebarCollapsed ? 'System Health' : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                activeTab === 'system_health'
                  ? 'bg-white/[0.075] text-zinc-50'
                  : 'text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200'
              }`}
            >
              <Cpu className={`h-4 w-4 shrink-0 ${activeTab === 'system_health' ? 'text-sky-200' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              {!sidebarCollapsed && <span>System Health</span>}
            </button>
          </div>
        </nav>
      </div>

      {!sidebarCollapsed && (
        <div className="m-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">AerSimulator</span>
            <span className="pill status-safe">Online</span>
          </div>
          <div className="mt-2 text-[11px] leading-5 text-zinc-600">Deterministic QDS verification core active.</div>
        </div>
      )}
    </aside>
  );
}
