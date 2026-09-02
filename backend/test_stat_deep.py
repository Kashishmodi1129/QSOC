import numpy as np
from scipy import stats
from quantum_engine import QDSQuantumEngine

def run_deep_test(baseline_noise, label):
    print(f"\n==========================================")
    print(f"Testing Scenario: {label} (noise = {baseline_noise})")
    print(f"==========================================")
    engine = QDSQuantumEngine(seed=101)
    
    # 1. Calibration (5 runs of 1000 shots)
    calib_runs = 5
    calib_shots = 1000
    calib_errs = []
    for _ in range(calib_runs):
        res = engine.run_simulation(shots=calib_shots, attack_type="none", attack_strength=0.0, baseline_noise=baseline_noise)
        calib_errs.append(res["verif_1_count"])
    
    tot_shots = calib_runs * calib_shots
    tot_errs = sum(calib_errs)
    # Estimate p0: rule of succession floor if 0
    p0 = (tot_errs + 1) / (tot_shots + 2) if tot_errs == 0 else (tot_errs / tot_shots)
    p0_std = float(np.std([e/calib_shots for e in calib_errs], ddof=1)) if calib_runs > 1 else 0.0
    print(f"Calibrated p0 = {p0:.4f} ({tot_errs}/{tot_shots} errors), std = {p0_std:.4f}")
    
    # 2. 100 Runs at 0% attack
    verdicts = {"SAFE": 0, "SUSPICIOUS": 0, "ATTACK DETECTED": 0}
    p_values = []
    z_scores = []
    qbers = []
    
    for _ in range(100):
        sim = engine.run_simulation(shots=1000, attack_type="none", attack_strength=0.0, baseline_noise=baseline_noise)
        k_obs = sim["verif_1_count"]
        n_shots = sim["total_shots"]
        e_obs = k_obs / n_shots
        qbers.append(e_obs)
        
        # Exact Binomial test: P(K >= k_obs) under H0: p <= p0
        # If k_obs == 0, p-value is exactly 1.0
        p_val = 1.0 if k_obs == 0 else float(stats.binom.sf(k_obs - 1, n_shots, p0))
        p_values.append(p_val)
        
        se_bin = np.sqrt(p0 * (1.0 - p0) / n_shots)
        se_eff = np.sqrt(se_bin**2 + p0_std**2)
        se_eff = max(se_eff, 1e-6)
        z = (e_obs - p0) / se_eff
        z_scores.append(z)
        
        # Unified decision logic:
        # SAFE: p_val > 0.05 (observed error is within 95% confidence region of baseline)
        # SUSPICIOUS: 0.001 < p_val <= 0.05 (elevated variance)
        # ATTACK DETECTED: p_val <= 0.001 (exceeds 99.9% confidence boundary)
        if p_val > 0.05:
            verdict = "SAFE"
        elif p_val <= 0.001:
            verdict = "ATTACK DETECTED"
        else:
            verdict = "SUSPICIOUS"
            
        verdicts[verdict] += 1
        
    print(f"Results over 100 clean runs:")
    print(f"  SAFE: {verdicts['SAFE']}%")
    print(f"  SUSPICIOUS: {verdicts['SUSPICIOUS']}%")
    print(f"  ATTACK DETECTED: {verdicts['ATTACK DETECTED']}%")
    print(f"  Mean QBER: {np.mean(qbers):.4%}")
    print(f"  Std QBER: {np.std(qbers):.4%}")
    print(f"  Mean Z-Score: {np.mean(z_scores):.2f}, Mean p-val: {np.mean(p_values):.4f}")

    # 3. Attack sweeps
    for strength in [0.25, 0.50, 0.75, 1.00]:
        att_verdicts = {"SAFE": 0, "SUSPICIOUS": 0, "ATTACK DETECTED": 0}
        att_qbers = []
        for _ in range(50):
            sim = engine.run_simulation(shots=1000, attack_type="channel_manipulation", attack_strength=strength, baseline_noise=baseline_noise)
            k_obs = sim["verif_1_count"]
            n_shots = sim["total_shots"]
            e_obs = k_obs / n_shots
            att_qbers.append(e_obs)
            p_val = 1.0 if k_obs == 0 else float(stats.binom.sf(k_obs - 1, n_shots, p0))
            
            if p_val > 0.05:
                v = "SAFE"
            elif p_val <= 0.001:
                v = "ATTACK DETECTED"
            else:
                v = "SUSPICIOUS"
            att_verdicts[v] += 1
            
        print(f"  Attack {int(strength*100)}%: Mean QBER = {np.mean(att_qbers):.2%}, ATTACK = {att_verdicts['ATTACK DETECTED']/50:.1%}, SUSPICIOUS = {att_verdicts['SUSPICIOUS']/50:.1%}, SAFE = {att_verdicts['SAFE']/50:.1%}")

if __name__ == "__main__":
    run_deep_test(0.0, "Zero-Noise Ideal Baseline")
    run_deep_test(0.02, "Calibrated Channel Noise Baseline (2%)")
