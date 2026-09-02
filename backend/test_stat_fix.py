import numpy as np
from scipy import stats
from quantum_engine import QDSQuantumEngine

def evaluate_statistical_model():
    engine = QDSQuantumEngine(seed=42)
    
    # 1. Calibration
    # 5 runs of 1000 shots with calibrated baseline noise 0.015 (1.5% baseline error)
    calib_shots = 1000
    calib_runs = 5
    calib_errors = []
    for _ in range(calib_runs):
        res = engine.run_simulation(shots=calib_shots, attack_type="none", attack_strength=0.0, baseline_noise=0.015)
        calib_errors.append(res["verif_1_count"])
    
    total_calib_shots = calib_shots * calib_runs
    total_calib_errs = sum(calib_errors)
    p0 = max(total_calib_errs / total_calib_shots, 1.0 / (total_calib_shots + 2))
    print(f"Calibration: total errors = {total_calib_errs}/{total_calib_shots}, p0 = {p0:.4f}")

    # 2. Run 100 simulations at 0% attack
    print("\nRunning 100 clean simulations (0% attack, 1000 shots)...")
    verdicts = {"SAFE": 0, "SUSPICIOUS": 0, "ATTACK DETECTED": 0}
    qbers = []
    
    for i in range(100):
        sim = engine.run_simulation(shots=1000, attack_type="none", attack_strength=0.0, baseline_noise=0.015)
        k_obs = sim["verif_1_count"]
        n_shots = sim["total_shots"]
        e_obs = k_obs / n_shots
        qbers.append(e_obs)
        
        # Exact Binomial test for H0: p <= p0 vs H1: p > p0
        # sf(k_obs - 1) gives P(K >= k_obs)
        p_val = float(stats.binom.sf(k_obs - 1, n_shots, p0))
        se_bin = np.sqrt(p0 * (1 - p0) / n_shots)
        z = (e_obs - p0) / se_bin
        
        if p_val > 0.05:
            v = "SAFE"
        elif p_val <= 0.001:
            v = "ATTACK DETECTED"
        else:
            v = "SUSPICIOUS"
            
        verdicts[v] += 1

    print(f"0% Attack Verdicts over 100 runs:")
    print(f"  SAFE: {verdicts['SAFE']}%")
    print(f"  SUSPICIOUS: {verdicts['SUSPICIOUS']}%")
    print(f"  ATTACK DETECTED: {verdicts['ATTACK DETECTED']}%")
    print(f"  Mean QBER: {np.mean(qbers):.4%}")
    print(f"  Std QBER: {np.std(qbers):.4%}")

    # 3. Test Attack Strengths: 25%, 50%, 75%, 100%
    print("\nTesting Attack Strengths (50 runs each)...")
    for strength in [0.25, 0.50, 0.75, 1.00]:
        att_verdicts = {"SAFE": 0, "SUSPICIOUS": 0, "ATTACK DETECTED": 0}
        att_qbers = []
        for _ in range(50):
            sim = engine.run_simulation(shots=1000, attack_type="channel_manipulation", attack_strength=strength, baseline_noise=0.015)
            k_obs = sim["verif_1_count"]
            n_shots = sim["total_shots"]
            e_obs = k_obs / n_shots
            att_qbers.append(e_obs)
            p_val = float(stats.binom.sf(k_obs - 1, n_shots, p0))
            if p_val > 0.05:
                v = "SAFE"
            elif p_val <= 0.001 or e_obs > 0.08:
                v = "ATTACK DETECTED"
            else:
                v = "SUSPICIOUS"
            att_verdicts[v] += 1
            
        print(f"Strength {int(strength*100)}%: Mean QBER = {np.mean(att_qbers):.2%}, Detection Rate (ATTACK) = {att_verdicts['ATTACK DETECTED'] / 50:.1%}, SAFE = {att_verdicts['SAFE'] / 50:.1%}")

if __name__ == "__main__":
    evaluate_statistical_model()
