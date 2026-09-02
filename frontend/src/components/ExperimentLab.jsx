import React from 'react';
import { 
  Sliders, 
  Play, 
  RefreshCw, 
  Database, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  History 
} from 'lucide-react';

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
  simulationMode
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
    } else {
      if (recentSignatures?.length > 0 && !replayTarget) {
        setReplayTarget(recentSignatures[0]);
      }
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="pb-2.5 border-b border-[#19202C]">
        <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Experiment Lab & Threat Injection Console</span>
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Execute controlled threat injections against the deterministic verification engine
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT COLUMN: Scenario Selection & Attack Parameters */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* 1. SCENARIO SELECTOR */}
          <div className="bg-[#0E1219] border border-[#19202C] rounded-xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                1. Threat Scenario Selection
              </h3>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'none', label: 'No Attack (Clean Transaction)', desc: 'Authentic Alice, fresh unique nonce, coherent channel', tag: 'SAFE' },
                { id: 'channel_manipulation', label: 'Quantum Channel Manipulation', desc: 'Depolarizing & unitary quantum channel disturbance', tag: 'QUANTUM' },
                { id: 'signature_forgery', label: 'Quantum Signature Forgery', desc: 'Perturbs state parameters (δθ, δϕ) on Bloch sphere', tag: 'QUANTUM' },
                { id: 'replay_attack', label: 'Cryptographic Replay Attack', desc: 'Reuses a previously consumed signature token or nonce', tag: 'CLASSICAL' },
                { id: 'signer_impersonation', label: 'Signer Impersonation Attack', desc: 'Spoofed identity, forged certificate, or revoked key', tag: 'CLASSICAL' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAttackType(item.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    attackType === item.id
                      ? 'bg-[#151C27] border-sky-400/80 text-slate-100 shadow-sm'
                      : 'bg-[#090C12] border-[#161D28] text-slate-400 hover:border-[#222C3D] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${attackType === item.id ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                      {item.label}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      item.tag === 'SAFE' ? 'bg-[#062419] text-emerald-400 border border-[#134E3A]' :
                      item.tag === 'QUANTUM' ? 'bg-[#141F2E] text-sky-400 border border-[#213045]' :
                      'bg-[#1F142E] text-purple-300 border border-[#37214F]'
                    }`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 pl-3.5 font-sans">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. DYNAMIC SCENARIO PARAMETERS */}
          <div className="bg-[#0E1219] border border-[#19202C] rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>2. Attack Parameters & Cryptographic Identifiers</span>
            </h3>

            {/* CHANNEL MANIPULATION PARAMS */}
            {attackType === 'channel_manipulation' && (
              <div className="space-y-2 p-3 bg-[#090C12] rounded border border-[#161D28]">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 text-[11px]">Disturbance Strength:</label>
                  <span className="font-mono font-bold text-sky-400 bg-[#141C28] px-2 py-0.5 rounded border border-[#202C3D]">
                    {attackStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={attackStrength}
                  onChange={(e) => setAttackStrength(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#1A2230] rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Weak (10%)</span>
                  <span>Moderate (50%)</span>
                  <span>Max (100%)</span>
                </div>
              </div>
            )}

            {/* SIGNATURE FORGERY PARAMS */}
            {attackType === 'signature_forgery' && (
              <div className="space-y-2 p-3 bg-[#090C12] rounded border border-[#161D28]">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 text-[11px]">Perturbation Angle (δθ):</label>
                  <span className="font-mono font-bold text-slate-200 bg-[#141C28] px-2 py-0.5 rounded border border-[#202C3D]">
                    {forgeryDeltaTheta.toFixed(3)} rad ({(forgeryDeltaTheta * 180 / Math.PI).toFixed(0)}°)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.14159"
                  step="0.05"
                  value={forgeryDeltaTheta}
                  onChange={(e) => setForgeryDeltaTheta(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#1A2230] rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[
                    { label: '30°', val: 0.5236 },
                    { label: '60°', val: 1.0472 },
                    { label: '90°', val: 1.5708 },
                    { label: '180°', val: 3.1415 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setForgeryDeltaTheta(p.val)}
                      className="py-1 text-[9px] font-mono rounded bg-[#121620] hover:bg-[#181E2B] border border-[#1E2533] text-slate-300"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REPLAY ATTACK PARAMS */}
            {attackType === 'replay_attack' && (
              <div className="space-y-2 p-3 bg-[#090C12] rounded border border-[#161D28]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Target Replay Token:</span>
                  <button
                    onClick={onResetReplayStore}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono"
                  >
                    <Trash2 className="w-3 h-3" /> Reset Store
                  </button>
                </div>
                {replayTarget ? (
                  <div className="p-2 rounded bg-[#10151E] border border-[#1D2636] text-xs font-mono space-y-0.5">
                    <div className="text-slate-200 font-bold truncate">Sig: {replayTarget.signature_id}</div>
                    <div className="text-slate-400 text-[10px] truncate">Nonce: {replayTarget.nonce}</div>
                    <div className="text-slate-500 text-[9px]">Signer: {replayTarget.signer_id}</div>
                  </div>
                ) : (
                  <div className="p-2.5 text-center text-[10px] text-slate-400 bg-[#121620] border border-[#1E2533] rounded font-mono">
                    Select a signature token from the registry on the right to replay.
                  </div>
                )}
              </div>
            )}

            {/* IMPERSONATION PARAMS */}
            {attackType === 'signer_impersonation' && (
              <div className="space-y-2 p-3 bg-[#090C12] rounded border border-[#161D28]">
                <label className="text-xs text-slate-300 block">Select Claimed Signer Identity:</label>
                <select
                  value={signerId}
                  onChange={(e) => {
                    setSignerId(e.target.value);
                    if (e.target.value === 'alice_authorized') {
                      setCertificateId('CERT-QDS-2026-ALICE-ROOT');
                    } else if (e.target.value === 'bob_authorized') {
                      setCertificateId('CERT-QDS-2026-BOB-TREASURY');
                    } else if (e.target.value === 'mallory_revoked') {
                      setCertificateId('CERT-REVOKED-MAL-2026');
                    } else {
                      setCertificateId('CERT-FORGED-SPOOFED-2026');
                    }
                  }}
                  className="w-full bg-[#121620] border border-[#1E2533] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#323E54] font-mono"
                >
                  <option value="alice_authorized">Alice (Authorized Sovereign Signer) - VALID</option>
                  <option value="bob_authorized">Bob (Authorized Treasury Arbiter) - VALID</option>
                  <option value="mallory_unauthorized">Mallory (Unregistered Attacker Identity) - SPOOFED</option>
                  <option value="mallory_revoked">Mallory (Revoked Certificate) - REVOKED</option>
                </select>
                <div className="text-[10px] font-mono text-slate-400 bg-[#10151E] p-1.5 rounded border border-[#1D2636]">
                  <span>Certificate: <strong className="text-slate-200">{certificateId}</strong></span>
                </div>
              </div>
            )}

            {/* FRESH TOKEN DISPLAY FOR CLEAN RUNS */}
            {attackType !== 'replay_attack' && (
              <div className="p-2 bg-[#090C12] rounded border border-[#161D28] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Next Generated Transaction ID:</span>
                  <span className="text-slate-200 font-bold">{activeFreshTokens.signature_id}</span>
                </div>
                <button
                  type="button"
                  onClick={generateNewFreshTokens}
                  className="p-1 bg-[#121620] hover:bg-[#181E2B] text-slate-400 hover:text-slate-200 rounded border border-[#1E2533] transition-colors"
                  title="Generate Fresh Nonce & Tokens"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* SHOTS SELECTOR */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Measurement Shots (N):
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[100, 500, 1000, 5000, 10000].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShots(s)}
                    className={`py-1 text-xs font-mono rounded border transition-colors ${
                      shots === s
                        ? 'bg-[#151C27] border-sky-400 text-sky-400 font-semibold'
                        : 'bg-[#090C12] border-[#161D28] text-slate-400 hover:border-[#222C3D]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* PRIMARY ACTION BUTTON */}
            <button
              onClick={onRunSimulation}
              disabled={simulating}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-[#080A0D] font-bold text-xs tracking-wide rounded-lg transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Across Unified Threat Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>EXECUTE UNIFIED VERIFICATION & THREAT DETECTION</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* RIGHT COLUMN: Calibration & Signatures Registry */}
        <div className="lg:col-span-6 space-y-4">

          {/* BASELINE CALIBRATION */}
          <div className="bg-[#0E1219] border border-[#19202C] rounded-xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-200">
                  Quantum Baseline Calibration ({simulationMode === 'realistic_noise' ? 'Realistic Noise' : 'Ideal'})
                </h3>
              </div>
              <button
                onClick={onCalibrate}
                disabled={calibrating}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#121620] hover:bg-[#181E2B] disabled:opacity-50 text-slate-200 font-semibold text-[11px] rounded border border-[#1E2533] transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${calibrating ? 'animate-spin' : ''}`} />
                <span>{calibrating ? "Calibrating..." : "Calibrate"}</span>
              </button>
            </div>

            {baseline && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#090C12] p-2.5 rounded border border-[#161D28]">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Baseline p_0</span>
                  <span className="font-bold text-slate-200">{(baseline.baseline_error_mean * 100).toFixed(4)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Uncertainty</span>
                  <span className="font-bold text-slate-300">±{(baseline.baseline_error_std * 100).toFixed(4)}%</span>
                </div>
                <div className="col-span-2 text-[9px] text-slate-500 pt-1 border-t border-[#141A24]">
                  Mode: {baseline.simulation_mode || 'ideal'} ({baseline.runs_count} runs × {baseline.shots_calibrated} shots)
                </div>
              </div>
            )}
          </div>

          {/* RECENT SIGNATURES / REPLAY REGISTRY */}
          <div className="bg-[#0E1219] border border-[#19202C] rounded-xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                Replay Protection Registry (Active Nonces)
              </h3>
            </div>

            {recentSignatures?.length > 0 ? (
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-[#090C12] text-slate-500 border-b border-[#161D28]">
                    <tr>
                      <th className="py-1.5 px-2.5">Sig ID</th>
                      <th className="py-1.5 px-2.5">Nonce</th>
                      <th className="py-1.5 px-2.5">Signer</th>
                      <th className="py-1.5 px-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141A24]">
                    {recentSignatures.map((sig) => (
                      <tr key={sig.signature_id} className="hover:bg-[#141A25]">
                        <td className="py-1.5 px-2.5 text-slate-200 font-semibold truncate max-w-[100px]">{sig.signature_id}</td>
                        <td className="py-1.5 px-2.5 text-slate-400 truncate max-w-[110px]">{sig.nonce}</td>
                        <td className="py-1.5 px-2.5 text-slate-400">{sig.signer_id}</td>
                        <td className="py-1.5 px-2.5 text-right">
                          <button
                            onClick={() => {
                              setAttackType('replay_attack');
                              setReplayTarget(sig);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                              replayTarget?.signature_id === sig.signature_id
                                ? 'bg-sky-500 text-[#080A0D] font-bold border-sky-400'
                                : 'bg-[#121620] text-slate-300 border-[#1E2533] hover:bg-[#181E2B]'
                            }`}
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
              <div className="p-4 text-center text-[10px] text-slate-500 border border-dashed border-[#161D28] rounded font-mono">
                No signatures recorded yet. Execute an authentic transaction to populate the replay registry.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
