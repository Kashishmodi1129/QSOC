import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Database, 
  Bot, 
  RefreshCw 
} from 'lucide-react';

export default function SystemHealthView({
  systemHealth,
  onRefreshHealth
}) {
  const components = systemHealth?.components || {};

  const healthItems = [
    {
      id: 'quantum_engine',
      name: 'Quantum Simulation Engine',
      status: components.quantum_engine?.status || 'OPERATIONAL',
      icon: Cpu,
      isOk: true,
      description: components.quantum_engine?.description || 'AerSimulator Statevector teleportation verification engine with controlled noise models',
      meta: `Mode: ${components.quantum_engine?.mode || 'ideal'}`
    },
    {
      id: 'threat_detector',
      name: 'Deterministic Threat Detector',
      status: components.threat_detector?.status || 'ACTIVE',
      icon: ShieldCheck,
      isOk: true,
      description: components.threat_detector?.description || 'Exact Binomial Hypothesis Test, TVD, Standardized Z-Score with Sigma Calibration',
      meta: 'Authoritative Security Core'
    },
    {
      id: 'analytics_engine',
      name: 'Session Analytics Engine',
      status: components.analytics_engine?.status || 'TRACKING',
      icon: Activity,
      isOk: true,
      description: 'In-memory ground-truth classification metrics, confusion matrix tracking and real-time parameter sweeps',
      meta: `Tracked Events: ${components.analytics_engine?.total_events_tracked ?? 0}`
    },
    {
      id: 'audit_log',
      name: 'Persistent SQLite Audit Store',
      status: components.audit_log?.status || 'PERSISTENT',
      icon: Database,
      isOk: true,
      description: components.audit_log?.storage || 'SQLite Database (security_events table active with unique event indexing)',
      meta: 'Schema v3.5 (ACID Persistent)'
    },
    {
      id: 'ai_analyst',
      name: 'AI Security Analyst Layer',
      status: components.ai_analyst?.status || 'CONNECTED',
      icon: Bot,
      isOk: components.ai_analyst?.status === 'CONNECTED',
      description: components.ai_analyst?.provider || 'Groq Cloud AI (openai/gpt-oss-120b)',
      meta: components.ai_analyst?.status === 'CONNECTED' ? 'Live External Groq API' : 'Deterministic Rule-Based Fallback'
    }
  ];

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#19202C]">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Subsystem Health & Operational Telemetry</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time status across quantum, statistical, database and AI layers
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="px-2.5 py-1 bg-[#121620] hover:bg-[#181E2B] text-slate-200 text-[11px] font-mono rounded border border-[#1E2533] flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Subsystems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
        {healthItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0E1219] border border-[#19202C] shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#141A24] border border-[#222B3B] text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-100">{item.name}</h3>
                    <span className="text-[9px] text-slate-500 block">{item.meta}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  item.isOk
                    ? 'bg-[#062419] text-emerald-400 border-[#134E3A]'
                    : 'bg-[#241804] text-amber-400 border-[#593E0D]'
                }`}>
                  {item.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-2 border-t border-[#141A24]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
