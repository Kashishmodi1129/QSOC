import React, { useState, useEffect } from 'react';
import IntroExperience from './components/IntroExperience';
import QSOCSidebar from './components/QSOCSidebar';
import QSOCHeader from './components/QSOCHeader';
import KPICards from './components/KPICards';
import PrimaryThreatMonitor from './components/PrimaryThreatMonitor';
import AISecurityAnalystPanel from './components/AISecurityAnalystPanel';
import RecentThreatActivity from './components/RecentThreatActivity';
import ExperimentLab from './components/ExperimentLab';
import SOCDemoView from './components/SOCDemoView';
import AnalyticsView from './components/AnalyticsView';
import IncidentInvestigationModal from './components/IncidentInvestigationModal';
import SystemHealthView from './components/SystemHealthView';
import CommandMenuModal from './components/CommandMenuModal';
import { Download, FileText, AlertTriangle } from 'lucide-react';

export default function App() {
  // Intro Screen State
  const [showIntro, setShowIntro] = useState(true);

  // Command Menu Modal State
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  // Navigation State: 'dashboard' | 'threat_monitor' | 'security_events' | 'analytics' | 'experiment_lab' | 'soc_demo' | 'reports' | 'system_health'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Simulation Mode: 'ideal' | 'realistic_noise'
  const [simulationMode, setSimulationMode] = useState('ideal');

  // System Health State
  const [systemHealth, setSystemHealth] = useState(null);

  // Calibration State
  const [baseline, setBaseline] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calibRuns, setCalibRuns] = useState(5);
  const [calibNoise, setCalibNoise] = useState(0.015);

  // Manual Attack Lab State
  const [attackType, setAttackType] = useState('none');
  const [attackStrength, setAttackStrength] = useState(50);
  const [shots, setShots] = useState(1000);
  const [forgeryDeltaTheta, setForgeryDeltaTheta] = useState(1.570796);
  const [signerId, setSignerId] = useState('alice_authorized');
  const [certificateId, setCertificateId] = useState('CERT-QDS-2026-ALICE-ROOT');
  
  // Token State Management
  const [activeFreshTokens, setActiveFreshTokens] = useState({
    signature_id: '',
    nonce: '',
    session_id: ''
  });
  const [replayTarget, setReplayTarget] = useState(null);
  const [recentSignatures, setRecentSignatures] = useState([]);
  const [signersList, setSignersList] = useState([]);

  // Simulation Execution State
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // AI Security Analyst State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Full Security Demo State
  const [runningDemo, setRunningDemo] = useState(false);
  const [demoResult, setDemoResult] = useState(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsFilterMode, setAnalyticsFilterMode] = useState('all');
  const [sweepData, setSweepData] = useState(null);
  const [runningSweep, setRunningSweep] = useState(false);

  // Security Audit Log State
  const [securityEvents, setSecurityEvents] = useState([]);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [modalAiAnalysis, setModalAiAnalysis] = useState(null);
  const [loadingModalAi, setLoadingModalAi] = useState(false);
  const [eventFilterVerdict, setEventFilterVerdict] = useState('all');
  const [eventFilterAttackType, setEventFilterAttackType] = useState('all');
  const [eventFilterMode, setEventFilterMode] = useState('all');

  // Initialize
  useEffect(() => {
    fetchHealth();
    fetchBaseline();
    fetchSignatures();
    fetchSigners();
    fetchAnalytics();
    fetchSecurityEvents();
    generateNewFreshTokens();
    runInitialSweep();
  }, []);

  const generateNewFreshTokens = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ts = Date.now().toString().slice(-4);
    const tokens = {
      signature_id: `SIG-${ts}-${randomHex}`,
      nonce: `NONCE-${randomHex}-${Math.floor(Math.random() * 9000 + 1000)}`,
      session_id: `SESS-${randomHex}`
    };
    setActiveFreshTokens(tokens);
    return tokens;
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.warn("Health check unavailable");
    }
  };

  const fetchBaseline = async () => {
    try {
      const res = await fetch('/api/baseline');
      if (res.ok) {
        const data = await res.json();
        setBaseline(data);
        if (data.simulation_mode) {
          setSimulationMode(data.simulation_mode);
        }
      }
    } catch (err) {
      console.warn("Baseline not yet initialized.");
    }
  };

  const fetchSignatures = async () => {
    try {
      const res = await fetch('/api/signatures');
      if (res.ok) {
        const data = await res.json();
        setRecentSignatures(data);
      }
    } catch (err) {
      console.warn("Failed fetching signatures.");
    }
  };

  const fetchSigners = async () => {
    try {
      const res = await fetch('/api/signers');
      if (res.ok) {
        const data = await res.json();
        setSignersList(data);
      }
    } catch (err) {
      console.warn("Failed fetching signers.");
    }
  };

  const fetchAnalytics = async (mode = analyticsFilterMode) => {
    try {
      const url = mode === 'all' ? '/api/analytics' : `/api/analytics?simulation_mode=${mode}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.warn("Failed fetching analytics.");
    }
  };

  const fetchSecurityEvents = async (
    v = eventFilterVerdict, 
    at = eventFilterAttackType, 
    sm = eventFilterMode
  ) => {
    try {
      let query = [];
      if (v && v !== 'all') query.push(`verdict=${encodeURIComponent(v)}`);
      if (at && at !== 'all') query.push(`attack_type=${encodeURIComponent(at)}`);
      if (sm && sm !== 'all') query.push(`simulation_mode=${encodeURIComponent(sm)}`);
      query.push(`limit=50`);

      const url = `/api/security-events?${query.join('&')}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSecurityEvents(data.events || []);
      }
    } catch (err) {
      console.warn("Failed fetching security events.");
    }
  };

  const runInitialSweep = async () => {
    try {
      const res = await fetch(`/api/analytics/sweep?simulation_mode=${simulationMode}&shots=500&repetitions=2`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSweepData(data);
      }
    } catch (err) {
      console.warn("Initial sweep fetch skipped.");
    }
  };

  const handleRunSweepExperiment = async () => {
    setRunningSweep(true);
    try {
      const res = await fetch(`/api/analytics/sweep?simulation_mode=${simulationMode}&shots=1000&repetitions=3`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSweepData(data);
      }
    } catch (err) {
      setErrorMsg(`Sweep Experiment Error: ${err.message}`);
    } finally {
      setRunningSweep(false);
    }
  };

  const handleResetAnalytics = async () => {
    try {
      await fetch('/api/analytics/reset', { method: 'POST' });
      fetchAnalytics(analyticsFilterMode);
    } catch (err) {
      console.warn("Error resetting analytics:", err);
    }
  };

  const handleClearSecurityEvents = async () => {
    try {
      await fetch('/api/security-events/reset', { method: 'POST' });
      fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, eventFilterMode);
    } catch (err) {
      console.warn("Error clearing security events:", err);
    }
  };

  const handleCalibrate = async () => {
    setCalibrating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runs: calibRuns,
          shots: shots,
          baseline_noise: calibNoise,
          simulation_mode: simulationMode,
        })
      });
      if (!res.ok) throw new Error("Calibration failed on backend");
      const data = await res.json();
      setBaseline(data);
      runInitialSweep();
      fetchHealth();
    } catch (err) {
      setErrorMsg(`Calibration Error: ${err.message}`);
    } finally {
      setCalibrating(false);
    }
  };

  const handleResetReplayStore = async () => {
    try {
      await fetch('/api/reset_replay_store', { method: 'POST' });
      setReplayTarget(null);
      fetchSignatures();
      generateNewFreshTokens();
    } catch (err) {
      console.warn("Error resetting replay store:", err);
    }
  };

  const requestAiAnalysis = async (simData) => {
    if (!simData) return;
    setLoadingAi(true);
    try {
      const evidence = {
        verdict: simData.verdict,
        attack_type: simData.attack_type,
        action: simData.verdict === 'SAFE' ? 'ACCEPT' : 'REJECT',
        simulation_mode: simData.simulation_mode || simulationMode,
        qber: simData.detection?.observed_qber ?? null,
        baseline_qber: simData.detection?.baseline_qber ?? (baseline?.baseline_error_mean ?? null),
        tvd: simData.detection?.total_variation_distance ?? null,
        p_value: simData.detection?.p_value ?? null,
        z_score: simData.detection?.z_score ?? null,
        signer_id: simData.classical_checks?.signer_id || signerId,
        signer_check: simData.classical_checks?.identity_passed ? 'VALID' : 'SPOOFED_OR_REVOKED',
        nonce_check: simData.classical_checks?.replay_passed ? 'UNIQUE' : 'REPLAYED',
        reason: simData.primary_reason,
        signature_id: simData.classical_checks?.signature_id,
        session_id: simData.classical_checks?.session_id,
      };

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidence)
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.warn("AI analysis request failed:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const requestModalAiAnalysis = async (evt) => {
    if (!evt) return;
    setLoadingModalAi(true);
    try {
      const evidence = {
        verdict: evt.verdict,
        attack_type: evt.attack_type,
        action: evt.action,
        simulation_mode: evt.simulation_mode,
        qber: evt.qber,
        baseline_qber: evt.baseline_qber,
        tvd: evt.tvd,
        p_value: evt.p_value,
        z_score: evt.z_score,
        signer_id: evt.signer_id,
        signer_check: evt.attack_type === 'signer_impersonation' ? 'SPOOFED_OR_REVOKED' : 'VALID',
        nonce_check: evt.attack_type === 'replay_attack' ? 'REPLAYED' : 'UNIQUE',
        reason: evt.reason,
        signature_id: evt.signature_id,
        session_id: evt.session_id,
      };

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidence)
      });
      if (res.ok) {
        const data = await res.json();
        setModalAiAnalysis(data);
      }
    } catch (err) {
      console.warn("Modal AI analysis failed:", err);
    } finally {
      setLoadingModalAi(false);
    }
  };

  const handleOpenEventModal = (evt) => {
    setSelectedEventDetail(evt);
    setModalAiAnalysis(null);
    requestModalAiAnalysis(evt);
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    setErrorMsg(null);
    setAiAnalysis(null);
    try {
      let finalSigner = signerId;
      let finalCert = certificateId;
      let finalStrength = attackStrength / 100.0;
      let finalDeltaTheta = 0.0;
      let targetSigId = '';
      let targetNonce = '';
      let targetSessId = '';

      if (attackType === 'replay_attack') {
        if (replayTarget) {
          targetSigId = replayTarget.signature_id;
          targetNonce = replayTarget.nonce;
          targetSessId = replayTarget.session_id;
          finalSigner = replayTarget.signer_id;
        } else if (recentSignatures.length > 0) {
          targetSigId = recentSignatures[0].signature_id;
          targetNonce = recentSignatures[0].nonce;
          targetSessId = recentSignatures[0].session_id;
          finalSigner = recentSignatures[0].signer_id;
        }
      } else {
        const fresh = generateNewFreshTokens();
        targetSigId = fresh.signature_id;
        targetNonce = fresh.nonce;
        targetSessId = fresh.session_id;

        if (attackType === 'signature_forgery') {
          finalDeltaTheta = Number(forgeryDeltaTheta);
        } else if (attackType === 'signer_impersonation') {
          if (signerId === 'mallory_unauthorized') {
            finalSigner = 'mallory_unauthorized';
            finalCert = 'CERT-FORGED-SPOOFED-2026';
          } else if (signerId === 'mallory_revoked') {
            finalSigner = 'mallory_revoked';
            finalCert = 'CERT-REVOKED-MAL-2026';
          }
        }
      }

      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: shots,
          simulation_mode: simulationMode,
          attack_type: attackType,
          attack_strength: finalStrength,
          forgery_delta_theta: finalDeltaTheta,
          baseline_noise: calibNoise,
          signer_id: finalSigner,
          certificate_id: finalCert,
          signature_id: targetSigId || undefined,
          nonce: targetNonce || undefined,
          session_id: targetSessId || undefined,
          custom_baseline: baseline,
        })
      });

      if (!res.ok) throw new Error("Simulation execution failed");
      const data = await res.json();
      setSimulationResult(data);
      
      fetchSignatures();
      fetchAnalytics(analyticsFilterMode);
      fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, eventFilterMode);
      fetchHealth();

      requestAiAnalysis(data);

      if (attackType !== 'replay_attack') {
        generateNewFreshTokens();
      }
    } catch (err) {
      setErrorMsg(`Simulation Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleRunFullSecurityDemo = async () => {
    setRunningDemo(true);
    setDemoResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/demo/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulation_mode: simulationMode,
          shots: shots,
        })
      });

      if (!res.ok) throw new Error("Full Demo Execution Failed");
      const data = await res.json();
      setDemoResult(data);

      fetchSignatures();
      fetchAnalytics(analyticsFilterMode);
      fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, eventFilterMode);
      fetchHealth();
    } catch (err) {
      setErrorMsg(`Demo Runner Error: ${err.message}`);
    } finally {
      setRunningDemo(false);
    }
  };

  const handleExportReport = async (format = 'json') => {
    try {
      const url = `/api/reports/export?format=${format}&simulation_mode=${simulationMode === 'all' ? '' : simulationMode}`;
      if (format === 'csv') {
        window.location.href = url;
      } else {
        const res = await fetch(url);
        const data = await res.json();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `qsoc_security_report_${new Date().toISOString().replace(/[:.]/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.warn("Export failed:", err);
    }
  };

  // Filter events when search active
  const displayedEvents = securityEvents.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.event_id && e.event_id.toLowerCase().includes(q)) ||
      (e.signer_id && e.signer_id.toLowerCase().includes(q)) ||
      (e.attack_type && e.attack_type.toLowerCase().includes(q)) ||
      (e.verdict && e.verdict.toLowerCase().includes(q)) ||
      (e.signature_id && e.signature_id.toLowerCase().includes(q)) ||
      (e.nonce && e.nonce.toLowerCase().includes(q))
    );
  });

  // Render Intro on first visit
  if (showIntro) {
    return <IntroExperience onEnter={() => setShowIntro(false)} />;
  }

  return (
    <div className="app-shell min-h-screen text-zinc-100 selection:bg-sky-200/20 selection:text-sky-100">
      
      {/* SIDEBAR */}
      <QSOCSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* MAIN CONTENT AREA */}
      <div className={`min-w-0 transition-[padding] duration-200 ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]'}`}>
        
        {/* TOP COMMAND BAR */}
        <QSOCHeader
          simulationMode={simulationMode}
          setSimulationMode={(m) => {
            setSimulationMode(m);
            runInitialSweep();
          }}
          systemHealth={systemHealth}
          onExportReport={handleExportReport}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenCommandMenu={() => setCommandMenuOpen(true)}
        />

        {/* ERROR NOTIFICATION BANNER */}
        {errorMsg && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200 md:mx-7">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN VIEWPORT */}
        <main className="mx-auto w-full max-w-[1500px] space-y-8 p-4 md:p-7">
          
          {/* VIEW: DASHBOARD (MAIN UNIFIED SOC VIEW) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-7">
              
              {/* Top View Title */}
              <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-end">
                <div>
                  <div className="section-kicker">Overview</div>
                  <h1 className="page-title mt-3 max-w-4xl">
                    Quantum security operations center
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                    Deterministic quantum digital-signature verification, threat detection, incident intelligence, analytics, and exportable audit evidence.
                  </p>
                </div>
                <div className="surface rounded-[1.6rem] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">System State</span>
                    <span className="pill status-safe">Operational</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-zinc-600">Mode</div>
                      <div className="telemetry mt-1 text-zinc-200">{simulationMode === 'realistic_noise' ? 'realistic_noise' : 'ideal'}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">AI Analyst</div>
                      <div className="telemetry mt-1 text-zinc-200">{systemHealth?.components?.ai_analyst?.status === 'CONNECTED' ? 'Groq' : 'Fallback'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Telemetry */}
              <KPICards analyticsData={analyticsData} />

              {/* Primary Threat Monitor (Centerpiece) */}
              <PrimaryThreatMonitor
                simulationResult={simulationResult}
                baseline={baseline}
                simulationMode={simulationMode}
              />

              {/* Grid: AI Security Analyst & Recent Threat Activity */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_520px]">
                <div>
                  <RecentThreatActivity
                    securityEvents={displayedEvents.slice(0, 8)}
                    onInvestigate={handleOpenEventModal}
                    onRefresh={() => fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, eventFilterMode)}
                    onClear={handleClearSecurityEvents}
                    filterVerdict={eventFilterVerdict}
                    setFilterVerdict={(v) => {
                      setEventFilterVerdict(v);
                      fetchSecurityEvents(v, eventFilterAttackType, eventFilterMode);
                    }}
                    filterAttackType={eventFilterAttackType}
                    setFilterAttackType={(at) => {
                      setEventFilterAttackType(at);
                      fetchSecurityEvents(eventFilterVerdict, at, eventFilterMode);
                    }}
                    filterMode={eventFilterMode}
                    setFilterMode={(sm) => {
                      setEventFilterMode(sm);
                      fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, sm);
                    }}
                  />
                </div>
                <div>
                  <AISecurityAnalystPanel
                    aiAnalysis={aiAnalysis}
                    loadingAi={loadingAi}
                    onReAnalyze={() => requestAiAnalysis(simulationResult)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW: THREAT MONITOR */}
          {activeTab === 'threat_monitor' && (
            <div className="space-y-4">
              <KPICards analyticsData={analyticsData} />
              <PrimaryThreatMonitor
                simulationResult={simulationResult}
                baseline={baseline}
                simulationMode={simulationMode}
              />
              <AISecurityAnalystPanel
                aiAnalysis={aiAnalysis}
                loadingAi={loadingAi}
                onReAnalyze={() => requestAiAnalysis(simulationResult)}
              />
            </div>
          )}

          {/* VIEW: SECURITY EVENTS */}
          {activeTab === 'security_events' && (
            <div className="space-y-4">
              <RecentThreatActivity
                securityEvents={displayedEvents}
                onInvestigate={handleOpenEventModal}
                onRefresh={() => fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, eventFilterMode)}
                onClear={handleClearSecurityEvents}
                filterVerdict={eventFilterVerdict}
                setFilterVerdict={(v) => {
                  setEventFilterVerdict(v);
                  fetchSecurityEvents(v, eventFilterAttackType, eventFilterMode);
                }}
                filterAttackType={eventFilterAttackType}
                setFilterAttackType={(at) => {
                  setEventFilterAttackType(at);
                  fetchSecurityEvents(eventFilterVerdict, at, eventFilterMode);
                }}
                filterMode={eventFilterMode}
                setFilterMode={(sm) => {
                  setEventFilterMode(sm);
                  fetchSecurityEvents(eventFilterVerdict, eventFilterAttackType, sm);
                }}
              />
            </div>
          )}

          {/* VIEW: EXPERIMENT LAB */}
          {activeTab === 'experiment_lab' && (
            <div className="space-y-4">
              <ExperimentLab
                attackType={attackType}
                setAttackType={setAttackType}
                attackStrength={attackStrength}
                setAttackStrength={setAttackStrength}
                forgeryDeltaTheta={forgeryDeltaTheta}
                setForgeryDeltaTheta={setForgeryDeltaTheta}
                signerId={signerId}
                setSignerId={setSignerId}
                certificateId={certificateId}
                setCertificateId={setCertificateId}
                activeFreshTokens={activeFreshTokens}
                generateNewFreshTokens={generateNewFreshTokens}
                replayTarget={replayTarget}
                setReplayTarget={setReplayTarget}
                recentSignatures={recentSignatures}
                onResetReplayStore={handleResetReplayStore}
                shots={shots}
                setShots={setShots}
                baseline={baseline}
                calibrating={calibrating}
                onCalibrate={handleCalibrate}
                simulating={simulating}
                onRunSimulation={handleRunSimulation}
                simulationMode={simulationMode}
              />
              
              <PrimaryThreatMonitor
                simulationResult={simulationResult}
                baseline={baseline}
                simulationMode={simulationMode}
              />
            </div>
          )}

          {/* VIEW: FULL SOC DEMO */}
          {activeTab === 'soc_demo' && (
            <div className="space-y-4">
              <SOCDemoView
                runningDemo={runningDemo}
                demoResult={demoResult}
                onRunDemo={handleRunFullSecurityDemo}
                simulationMode={simulationMode}
              />
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <KPICards analyticsData={analyticsData} />
              <AnalyticsView
                analyticsData={analyticsData}
                sweepData={sweepData}
                runningSweep={runningSweep}
                onRunSweep={handleRunSweepExperiment}
                onResetAnalytics={handleResetAnalytics}
                analyticsFilterMode={analyticsFilterMode}
                setAnalyticsFilterMode={(m) => {
                  setAnalyticsFilterMode(m);
                  fetchAnalytics(m);
                }}
                simulationMode={simulationMode}
              />
            </div>
          )}

          {/* VIEW: REPORTS & EXPORT */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="section-kicker">Reports & Export</div>
                  <h1 className="page-title mt-2">Compliance evidence</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Export the existing QSOC security report and audit log without changing backend report contracts.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <section className="surface rounded-[1.6rem] p-5">
                  <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="section-kicker">JSON</div>
                  <h2 className="mt-2 text-xl font-semibold text-zinc-50">Executive security report</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Includes system health, KPI summary, confusion matrix, attack distribution, and audit traces.
                  </p>
                  <button onClick={() => handleExportReport('json')} className="btn-primary mt-6">
                    <Download className="h-3.5 w-3.5" />
                    Download JSON
                  </button>
                </section>

                <section className="surface rounded-[1.6rem] p-5">
                  <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="section-kicker">CSV</div>
                  <h2 className="mt-2 text-xl font-semibold text-zinc-50">Security audit log</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Spreadsheet export of verification events, QBER statistics, and deterministic security actions.
                  </p>
                  <button onClick={() => handleExportReport('csv')} className="btn-primary mt-6">
                    <Download className="h-3.5 w-3.5" />
                    Download CSV
                  </button>
                </section>
              </div>

              <section className="surface rounded-[1.6rem] p-5">
                <div className="section-kicker">Export Scope</div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {['System Health', 'Security Events', 'Analytics', 'Quantum Telemetry'].map((item) => (
                    <div key={item} className="surface-soft rounded-2xl p-4 text-sm text-zinc-400">
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* VIEW: SYSTEM HEALTH */}
          {activeTab === 'system_health' && (
            <div className="space-y-4">
              <SystemHealthView
                systemHealth={systemHealth}
                onRefreshHealth={fetchHealth}
              />
            </div>
          )}

        </main>

      </div>

      {/* FORENSIC INCIDENT INVESTIGATION DRAWER */}
      <IncidentInvestigationModal
        event={selectedEventDetail}
        onClose={() => setSelectedEventDetail(null)}
        aiAnalysis={modalAiAnalysis}
        loadingAi={loadingModalAi}
        onReAnalyze={() => requestModalAiAnalysis(selectedEventDetail)}
      />

      {/* COMMAND PALETTE MODAL (⌘K) */}
      <CommandMenuModal
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
        onOpen={() => setCommandMenuOpen(true)}
        onNavigate={(tab) => {
          if (tab) setActiveTab(tab);
          setCommandMenuOpen(false);
        }}
        onRunSimulation={handleRunSimulation}
        onRunDemo={handleRunFullSecurityDemo}
        onExportReport={handleExportReport}
      />

    </div>
  );
}
