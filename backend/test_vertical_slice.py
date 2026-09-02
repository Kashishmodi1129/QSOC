import pytest
import numpy as np
from scipy import stats
from quantum_engine import QDSQuantumEngine
from statistical_detector import StatisticalThreatDetector

def test_ideal_teleportation_fidelity():
    """
    Test 1: Under ideal zero-noise conditions, the teleportation-based
    verification must achieve 100% fidelity (0% error rate).
    """
    engine = QDSQuantumEngine(seed=42)
    res = engine.run_simulation(
        theta=np.pi / 3,
        phi=np.pi / 4,
        attack_type="none",
        attack_strength=0.0,
        baseline_noise=0.0,
        shots=1000
    )
    
    assert res["total_shots"] == 1000
    assert res["verif_0_count"] == 1000
    assert res["verif_1_count"] == 0
    assert res["observed_error_rate"] == 0.0
    assert res["distribution"]["0"] == 1.0
    assert res["distribution"]["1"] == 0.0
    print("✓ Test 1: Ideal teleportation verification achieved 100% fidelity.")

def test_arbitrary_signature_states():
    """
    Test 2: Verify teleportation across multiple distinct quantum states on the Bloch sphere.
    """
    engine = QDSQuantumEngine(seed=123)
    test_states = [
        (0.0, 0.0),                  # |0> state
        (np.pi, 0.0),                # |1> state
        (np.pi / 2, 0.0),            # |+> state
        (np.pi / 2, np.pi / 2),      # |+i> state
        (np.pi / 4, np.pi / 3),      # arbitrary superposition
    ]

    for th, ph in test_states:
        res = engine.run_simulation(
            theta=th,
            phi=ph,
            attack_type="none",
            attack_strength=0.0,
            baseline_noise=0.0,
            shots=500
        )
        assert res["observed_error_rate"] == 0.0, f"Failed for state theta={th}, phi={ph}"
    print("✓ Test 2: Arbitrary signature states on Bloch sphere verified successfully.")

def test_baseline_calibration_and_smoothing():
    """
    Test 3: Empirical calibration computes mathematically valid baseline mean,
    standard deviation, and distribution with Laplace/Succession smoothing on zero error.
    """
    engine = QDSQuantumEngine(seed=999)
    detector = StatisticalThreatDetector()
    
    baseline = detector.calibrate_baseline(
        engine=engine,
        runs=5,
        shots=1000,
        baseline_noise=0.0,
        theta=np.pi / 3,
        phi=np.pi / 4
    )
    
    assert baseline.runs_count == 5
    assert baseline.shots_calibrated == 1000
    assert baseline.baseline_error_mean > 0.0  # Laplace smoothed baseline floor
    assert baseline.baseline_error_std > 0.0
    assert abs((baseline.baseline_distribution["0"] + baseline.baseline_distribution["1"]) - 1.0) < 1e-5
    print(f"✓ Test 3: Calibrated baseline: mean error = {baseline.baseline_error_mean:.6f}, std = {baseline.baseline_error_std:.6f}")

def test_exact_binomial_consistency():
    """
    Test 4: Verify that Exact Binomial Test produces consistent p-values
    and eliminates spurious false alarms on small counts.
    """
    detector = StatisticalThreatDetector()
    engine = QDSQuantumEngine(seed=10)
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.0)
    
    # Case 1: 0 errors in 1000 shots
    res_0 = {"total_shots": 1000, "verif_0_count": 1000, "verif_1_count": 0}
    det_0 = detector.analyze_measurement(res_0, baseline)
    assert det_0.verdict == "SAFE"
    assert det_0.p_value == 1.0
    assert det_0.z_score < 0

    # Case 2: 1 error in 1000 shots (0.10% QBER)
    # Under exact binomial with p0 = 0.0002, 1 error has p = 0.1813 > 0.05 -> SAFE
    res_1 = {"total_shots": 1000, "verif_0_count": 999, "verif_1_count": 1}
    det_1 = detector.analyze_measurement(res_1, baseline)
    assert det_1.verdict == "SAFE"
    assert det_1.p_value > 0.05
    print(f"✓ Test 4: 1/1000 count correctly verified as SAFE (p = {det_1.p_value:.4f}, Z = {det_1.z_score:.2f}).")

def test_100_clean_runs_statistics():
    """
    Test 5: Run 100 repeated 0%-attack simulations and report statistical metrics.
    """
    engine = QDSQuantumEngine(seed=555)
    detector = StatisticalThreatDetector()
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.015)
    
    verdicts = {"SAFE": 0, "SUSPICIOUS": 0, "ATTACK DETECTED": 0}
    qbers = []
    
    for _ in range(100):
        sim = engine.run_simulation(shots=1000, attack_type="none", attack_strength=0.0, baseline_noise=0.015)
        det = detector.analyze_measurement(sim, baseline)
        verdicts[det.verdict] += 1
        qbers.append(det.observed_qber)
        
    mean_qber = float(np.mean(qbers))
    std_qber = float(np.std(qbers))
    
    print("\n--- 100 Clean Runs (0% Attack) Benchmark ---")
    print(f"SAFE: {verdicts['SAFE']}% | SUSPICIOUS: {verdicts['SUSPICIOUS']}% | ATTACK DETECTED: {verdicts['ATTACK DETECTED']}%")
    print(f"Mean QBER: {mean_qber:.4%} | Std QBER: {std_qber:.4%}")
    
    # 0% intentional attack must have 0% false alarms (no ATTACK DETECTED)
    assert verdicts["ATTACK DETECTED"] == 0, f"False positive occurred: {verdicts['ATTACK DETECTED']}% attack detected on clean runs"
    assert verdicts["SAFE"] >= 95, f"Expected at least 95% SAFE, got {verdicts['SAFE']}%"

def test_attack_sweeps_detection_scaling():
    """
    Test 6: Verify detection rate increases appropriately with attack strength (25%, 50%, 75%, 100%).
    """
    engine = QDSQuantumEngine(seed=888)
    detector = StatisticalThreatDetector()
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.015)
    
    print("\n--- Attack Strength Scaling Benchmark ---")
    for strength in [0.25, 0.50, 0.75, 1.00]:
        det_count = 0
        qbers = []
        for _ in range(30):
            sim = engine.run_simulation(shots=1000, attack_type="channel_manipulation", attack_strength=strength, baseline_noise=0.015)
            det = detector.analyze_measurement(sim, baseline)
            if det.verdict == "ATTACK DETECTED":
                det_count += 1
            qbers.append(det.observed_qber)
            
        rate = det_count / 30.0
        mean_qber = float(np.mean(qbers))
        print(f"Attack {int(strength*100):3d}%: Mean QBER = {mean_qber:6.2%}, Detection Rate = {rate:6.1%}")
        assert rate >= 0.95, f"Detection rate too low for {strength}: {rate}"

if __name__ == "__main__":
    test_ideal_teleportation_fidelity()
    test_arbitrary_signature_states()
    test_baseline_calibration_and_smoothing()
    test_exact_binomial_consistency()
    test_100_clean_runs_statistics()
    test_attack_sweeps_detection_scaling()
    print("\n🎉 ALL REFINED PHASE 1 STATISTICAL DETECTOR TESTS PASSED!")
