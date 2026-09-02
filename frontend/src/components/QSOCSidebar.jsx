import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Sliders, 
  TrendingUp, 
  FileText, 
  Download, 
  FastForward, 
  Radio, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function QSOCSidebar({ activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed }) {
  const navItems = [
    {
      group: 'MONITORING',
      items: [
        { id: 'dashboard', label: 'SOC Dashboard', icon: Activity },
        { id: 'threat_monitor', label: 'Primary Threat Monitor', icon: Radio },
        { id: 'security_events', label: 'Security Events', icon: FileText },
        { id: 'analytics', label: 'Analytics & Sweeps', icon: TrendingUp },
      ]
    },
    {
      group: 'OPERATIONS & DEMO',
      items: [
        { id: 'experiment_lab', label: 'Experiment Lab', icon: Sliders },
        { id: 'soc_demo', label: 'Full SOC Demo', icon: FastForward, badge: '5-STEP' },
        { id: 'reports', label: 'Reports & Export', icon: Download },
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'system_health', label: 'System Health', icon: Cpu },
      ]
    }
  ];

  return (
    <aside 
      className={`fixed lg:sticky top-0 left-0 h-screen z-30 flex-shrink-0 bg-[#0B0E13] border-r border-[#19202C] flex flex-col justify-between transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#19202C] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 bg-[#141A24] border border-[#222B3B] rounded-lg text-sky-400 flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-100 tracking-tight">
                    QSOC
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-[#161E2C] text-slate-400 border border-[#222B3C] rounded">
                    v3.5
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-[#141A24] rounded hidden lg:block transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-2.5 space-y-5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                      isActive
                        ? 'bg-[#151C27] text-slate-100 font-semibold border-l-2 border-sky-400 pl-2'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#111620]'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#161F2C] text-sky-400 border border-[#212E42]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Status */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-[#19202C] text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            AerSimulator
          </span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
      )}
    </aside>
  );
}
