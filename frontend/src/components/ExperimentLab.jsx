import React from 'react';
import { Activity, Database, History, Play, RefreshCw, ShieldAlert, Sliders, Sparkles, Trash2 } from 'lucide-react';
import { StatusBadge } from './ui.jsx';

const scenarios = [
  { id: 'none', label: 'Clean Transaction', desc: 'Authentic Alice, fresh unique nonce, coherent channel', tag: 'SAFE' },
  { id: 'channel_manipulation', label: 'Quantum Channel Manipulation', desc: 'Depolarizing and unitary quantum channel disturbance', tag: 'QUANTUM' },
  { id: 'signature_forgery', label: 'Quantum Signature Forgery', desc: 'Perturbs state parameters on the Bloch sphere', tag: 'QUANTUM' },
  { id: 'replay_attack', label: 'Cryptographic Replay', desc: 'Reuses a previously consumed signature token or nonce', tag: 'CLASSICAL' },
  { id: 'signer_impersonation', label: 'Signer Impersonation', desc: 'Spoofed identity, forged certificate, or revoked key', tag: 'CLASSICAL' },
];

function LabSection({ eyebrow, title, children, action }) {
  return (
    <section className="surface rounded-[1.6rem] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="section-kicker">{eyebrow}</div>
          <h3 className="mt-1 text-base font-semibold text-zinc-50">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ExperimentLab({
  attackType,
  setAttackType,
  attackStrength,
  setAttackStrength,
  forgeryDeltaTheta,
  setForgeryDeltaTheta,
  signerId,
  setSignerId,
  certificateId,
  setCertificateId,
  activeFreshTokens,
  generateNewFreshTokens,
  replayTarget,
  setReplayTarget,
  recentSignatures,
  onResetReplayStore,
  shots,
  setShots,
  baseline,
  calibrating,
  onCalibrate,
  simulating,
  onRunSimulation,
  simulationMode,
}) {
  const handleSelectAttackType = (typeId) => {
    setAttackType(typeId);
    if (typeId !== 'replay_attack') {
      setReplayTarget(null);
      generateNewFreshTokens();
      if (typeId !== 'signer_impersonation') {
        setSignerId('alice_authorized');
        setCertificateId('CERT-QDS-2026-ALICE-ROOT');
      }
    } else if (recentSignatures?.length > 0 && !replayTarget) {
      setReplayTarget(recentSignatures[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-kicker">Experiment Lab</div>
          <h1 className="page-title mt-2">Threat injection console</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Configure controlled quantum and classical attack scenarios against the live deterministic verification engine.
          </p>
        </div>
        <StatusBadge value={simulationMode === 'realistic_noise' ? 'Realistic Noise' : 'Ideal'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <LabSection eyebrow="01 Threat Scenario" title="Select verification scenario">
            <div className="grid gap-2 md:grid-cols-2">
              {scenarios.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleSelectAttackType(item.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    attackType === item.id
                      ? 'border-sky-200/35 bg-sky-200/[0.055]'
                      : 'border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.045]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-zinc-100">{item.label}</span>
                    <span className="pill">{item.tag}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-zinc-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </LabSection>

          <LabSection eyebrow="02 Attack Parameters" title="Scenario-specific controls">
            <div className="space-y-4">
              {attackType === 'channel_manipulation' && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <label className="text-zinc-400">Disturbance Strength</label>
                    <span className="telemetry text-sky-200">{attackStrength}%</span>
                  </div>
                  <input type="range" min="1" max="100" value={attackStrength} onChange={(e) => setAttackStrength(Number(e.target.value))} className="w-full accent-sky-200" />
                  <div className="mt-2 flex justify-between text-xs text-zinc-600">
                    <span>Weak</span><span>Moderate</span><span>Maximum</span>
                  </div>
                </div>
              )}

              {attackType === 'signature_forgery' && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <label className="text-zinc-400">Perturbation Angle</label>
                    <span className="telemetry text-zinc-200">{forgeryDeltaTheta.toFixed(3)} rad / {(forgeryDeltaTheta * 180 / Math.PI).toFixed(0)} deg</span>
                  </div>
                  <input type="range" min="0.1" max="3.14159" step="0.05" value={forgeryDeltaTheta} onChange={(e) => setForgeryDeltaTheta(Number(e.target.value))} className="w-full accent-sky-200" />
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[
                      { label: '30 deg', val: 0.5236 },
                      { label: '60 deg', val: 1.0472 },
                      { label: '90 deg', val: 1.5708 },
                      { label: '180 deg', val: 3.1415 },
                    ].map((preset) => (
                      <button key={preset.label} type="button" onClick={() => setForgeryDeltaTheta(preset.val)} className="btn-secondary min-h-8 px-2">
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {attackType === 'replay_attack' && (
                <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">Target replay token</span>
                    <button onClick={onResetReplayStore} className="btn-danger min-h-8 px-3">
                      <Trash2 className="h-3.5 w-3.5" />
                      Reset Store
                    </button>
                  </div>
                  {replayTarget ? (
                    <div className="telemetry space-y-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-xs">
                      <div className="truncate text-zinc-100">Sig: {replayTarget.signature_id}</div>
                      <div className="truncate text-zinc-400">Nonce: {replayTarget.nonce}</div>
                      <div className="truncate text-zinc-500">Signer: {replayTarget.signer_id}</div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-sm text-zinc-600">
                      Select a signature from the replay registry.
                    </div>
                  )}
                </div>
              )}

              {attackType === 'signer_impersonation' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-400">Claimed signer identity</label>
                  <select
                    value={signerId}
                    onChange={(e) => {
                      setSignerId(e.target.value);
                      if (e.target.value === 'alice_authorized') setCertificateId('CERT-QDS-2026-ALICE-ROOT');
                      else if (e.target.value === 'bob_authorized') setCertificateId('CERT-QDS-2026-BOB-TREASURY');
                      else if (e.target.value === 'mallory_revoked') setCertificateId('CERT-REVOKED-MAL-2026');
                      else setCertificateId('CERT-FORGED-SPOOFED-2026');
                    }}
                    className="field telemetry"
                  >
                    <option value="alice_authorized">Alice (Authorized Sovereign Signer) - VALID</option>
                    <option value="bob_authorized">Bob (Authorized Treasury Arbiter) - VALID</option>
                    <option value="mallory_unauthorized">Mallory (Unregistered Attacker Identity) - SPOOFED</option>
                    <option value="mallory_revoked">Mallory (Revoked Certificate) - REVOKED</option>
                  </select>
                  <div className="telemetry rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-xs text-zinc-400">
                    Certificate: <span className="text-zinc-100">{certificateId}</span>
                  </div>
                </div>
              )}

              {attackType === 'none' && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4">
                  <Activity className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <p className="text-sm leading-6 text-zinc-400">Clean transaction mode uses authorized identity, fresh tokens, and the calibrated quantum baseline.</p>
                </div>
              )}
            </div>
          </LabSection>

          <LabSection eyebrow="03 Cryptographic Identity" title="Transaction identity and measurement budget">
            <div className="grid gap-4 md:grid-cols-2">
              {attackType !== 'replay_attack' && (
                <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-zinc-300">Next generated transaction</div>
                    <button type="button" onClick={generateNewFreshTokens} className="btn-secondary min-h-8 px-3" title="Generate fresh nonce and tokens">
                      <Sparkles className="h-3.5 w-3.5" />
                      Fresh
                    </button>
                  </div>
                  <div className="telemetry truncate text-sm text-zinc-100">{activeFreshTokens.signature_id}</div>
                  <div className="telemetry mt-1 truncate text-xs text-zinc-500">{activeFreshTokens.nonce} / {activeFreshTokens.session_id}</div>
                </div>
              )}

              <div className={attackType !== 'replay_attack' ? '' : 'md:col-span-2'}>
                <div className="mb-2 text-sm font-medium text-zinc-400">Measurement Shots</div>
                <div className="grid grid-cols-5 gap-2">
                  {[100, 500, 1000, 5000, 10000].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShots(s)}
                      className={`rounded-full border px-2 py-2 text-xs transition ${shots === s ? 'border-sky-200/35 bg-sky-200/[0.08] text-sky-100' : 'border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:text-zinc-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </LabSection>
        </div>

        <aside className="space-y-5">
          <LabSection
            eyebrow="04 Quantum Baseline"
            title="Calibration"
            action={(
              <button onClick={onCalibrate} disabled={calibrating} className="btn-secondary">
                <RefreshCw className={`h-3.5 w-3.5 ${calibrating ? 'animate-spin' : ''}`} />
                {calibrating ? 'Calibrating' : 'Calibrate'}
              </button>
            )}
          >
            {baseline ? (
              <div className="grid gap-3">
                <div className="surface-soft rounded-2xl p-4">
                  <div className="text-xs text-zinc-500">Baseline p0</div>
                  <div className="telemetry mt-1 text-2xl font-semibold text-zinc-50">{(baseline.baseline_error_mean * 100).toFixed(4)}%</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="surface-soft rounded-2xl p-3">
                    <div className="text-xs text-zinc-500">Uncertainty</div>
                    <div className="telemetry mt-1 text-sm text-zinc-200">+/-{(baseline.baseline_error_std * 100).toFixed(4)}%</div>
                  </div>
                  <div className="surface-soft rounded-2xl p-3">
                    <div className="text-xs text-zinc-500">Runs</div>
                    <div className="telemetry mt-1 text-sm text-zinc-200">{baseline.runs_count} x {baseline.shots_calibrated}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-5 text-sm text-zinc-600">No baseline loaded yet.</div>
            )}
          </LabSection>

          <LabSection eyebrow="Replay Registry" title="Active nonces">
            {recentSignatures?.length > 0 ? (
              <div className="max-h-80 overflow-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Sig ID</th>
                      <th className="text-left">Signer</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignatures.map((sig) => (
                      <tr key={sig.signature_id}>
                        <td>
                          <div className="telemetry max-w-[150px] truncate text-zinc-200">{sig.signature_id}</div>
                          <div className="telemetry max-w-[150px] truncate text-[11px] text-zinc-600">{sig.nonce}</div>
                        </td>
                        <td className="telemetry text-zinc-500">{sig.signer_id}</td>
                        <td className="text-right">
                          <button
                            onClick={() => {
                              setAttackType('replay_attack');
                              setReplayTarget(sig);
                            }}
                            className={replayTarget?.signature_id === sig.signature_id ? 'btn-primary min-h-8 px-3' : 'btn-secondary min-h-8 px-3'}
                          >
                            {replayTarget?.signature_id === sig.signature_id ? 'Targeted' : 'Replay'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-5 text-center text-sm text-zinc-600">
                No signatures recorded yet.
              </div>
            )}
          </LabSection>

          <section className="surface rounded-[1.6rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-zinc-500" />
              <div>
                <div className="section-kicker">05 Execute Verification</div>
                <div className="mt-1 text-base font-semibold text-zinc-50">Unified threat engine</div>
              </div>
            </div>
            <button onClick={onRunSimulation} disabled={simulating} className="btn-primary min-h-12 w-full">
              {simulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {simulating ? 'Verifying across engine' : 'Execute Unified Verification'}
            </button>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
              <span>Scenario</span>
              <span className="capitalize">{attackType.replace(/_/g, ' ')}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
