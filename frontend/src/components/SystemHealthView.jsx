import React from 'react';
import { Activity, Bot, Cpu, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { SectionHeader, StatusBadge } from './ui.jsx';

export default function SystemHealthView({ systemHealth, onRefreshHealth }) {
  const components = systemHealth?.components || {};
  const healthItems = [
    {
      id: 'quantum_engine',
      name: 'Quantum Simulation Engine',
      status: components.quantum_engine?.status || 'OPERATIONAL',
      icon: Cpu,
      description: components.quantum_engine?.description || 'AerSimulator statevector teleportation verification engine with controlled noise models.',
      meta: `Mode: ${components.quantum_engine?.mode || 'ideal'}`,
    },
    {
      id: 'threat_detector',
      name: 'Deterministic Threat Detector',
      status: components.threat_detector?.status || 'ACTIVE',
      icon: ShieldCheck,
      description: components.threat_detector?.description || 'Exact binomial hypothesis test, TVD, and standardized Z-score with sigma calibration.',
      meta: 'Authoritative security core',
    },
    {
      id: 'analytics_engine',
      name: 'Session Analytics Engine',
      status: components.analytics_engine?.status || 'TRACKING',
      icon: Activity,
      description: 'Ground-truth classification metrics, confusion matrix tracking, and parameter sweeps.',
      meta: `Tracked Events: ${components.analytics_engine?.total_events_tracked ?? 0}`,
    },
    {
      id: 'audit_log',
      name: 'Persistent SQLite Audit Store',
      status: components.audit_log?.status || 'PERSISTENT',
      icon: Database,
      description: components.audit_log?.storage || 'SQLite database security_events table with unique event indexing.',
      meta: 'Schema v3.5',
    },
    {
      id: 'ai_analyst',
      name: 'AI Security Analyst Layer',
      status: components.ai_analyst?.status || 'CONNECTED',
      icon: Bot,
      description: components.ai_analyst?.provider || 'Groq Cloud AI or deterministic fallback analyst.',
      meta: components.ai_analyst?.status === 'CONNECTED' ? 'Live Groq API' : 'Deterministic fallback',
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader kicker="System Health" title="Subsystem status">
        <button onClick={onRefreshHealth} className="btn-secondary">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </SectionHeader>

      <section className="surface overflow-hidden rounded-[1.6rem]">
        <div className="divide-y divide-white/[0.06]">
          {healthItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="grid gap-4 p-5 md:grid-cols-[40px_1fr_auto] md:items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{item.name}</h3>
                    <span className="telemetry text-xs text-zinc-600">{item.meta}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{item.description}</p>
                </div>
                <StatusBadge value={item.status} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
