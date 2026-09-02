import pytest
import numpy as np
from fastapi.testclient import TestClient

from main import app
from quantum_engine import QDSQuantumEngine
from statistical_detector import StatisticalThreatDetector

client = TestClient(app)

def test_realistic_noise_calibration():
    """
    Phase 3A Test 1: Calibrate baseline under realistic physical noise model (Qiskit Aer NoiseModel).
    Asserts that baseline captures non-zero error floor (p0 > 1%) and empirical variance.
    """
    engine = QDSQuantumEngine(seed=101)
    detector = StatisticalThreatDetector()

    baseline = detector.calibrate_baseline(
        engine=engine,
        runs=5,
        shots=1000,
        baseline_noise=0.015,
        simulation_mode="realistic_noise"
    )

    assert baseline.simulation_mode == "realistic_noise"
    assert baseline.baseline_error_mean >= 0.01, f"Expected realistic error floor >= 1%, got {baseline.baseline_error_mean:.4%}"
    assert baseline.baseline_error_std > 0.0
    assert "Realistic Noise" in baseline.noise_model_used
    print(f"✓ Phase 3A: Calibrated realistic noisy baseline: mean error = {baseline.baseline_error_mean:.4%}, std = {baseline.baseline_error_std:.4%}")

def test_legitimate_noisy_transaction_safe():
    """
    Phase 3A Test 2: In realistic noise mode, a clean authentic transaction must
    conform to the calibrated noisy baseline and be classified as SAFE.
    """
    engine = QDSQuantumEngine(seed=202)
    detector = StatisticalThreatDetector()
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.015, simulation_mode="realistic_noise")

    sim = engine.run_simulation(
        shots=1000,
        attack_type="none",
        attack_strength=0.0,
        baseline_noise=0.015,
        simulation_mode="realistic_noise"
    )

    det = detector.analyze_measurement(sim, baseline)
    print(f"✓ Legitimate Noisy Run: QBER = {det.observed_qber:.2%}, Baseline = {det.baseline_qber:.2%}, p-val = {det.p_value:.4f}, Z = {det.z_score:.2f}")
    assert det.verdict == "SAFE"
    assert det.p_value > 0.05

def test_noisy_transaction_plus_attack_detected():
    """
    Phase 3A Test 3: In realistic noise mode, when an attack is applied,
    QBER surges significantly beyond the noisy baseline and is flagged as ATTACK DETECTED.
    """
    engine = QDSQuantumEngine(seed=303)
    detector = StatisticalThreatDetector()
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.015, simulation_mode="realistic_noise")

    # Attack 1: Quantum Channel Manipulation in noisy environment
    sim_chan = engine.run_simulation(
        shots=1000,
        attack_type="channel_manipulation",
        attack_strength=0.50,
        baseline_noise=0.015,
        simulation_mode="realistic_noise"
    )
    det_chan = detector.analyze_measurement(sim_chan, baseline)
    print(f"✓ Noisy Channel Attack: QBER = {det_chan.observed_qber:.2%}, Baseline = {det_chan.baseline_qber:.2%}, p-val = {det_chan.p_value:.3e}")
    assert det_chan.verdict == "ATTACK DETECTED"
    assert det_chan.p_value <= 0.001
    assert det_chan.observed_qber > baseline.baseline_error_mean + 0.10

    # Attack 2: Signature Forgery in noisy environment
    sim_forge = engine.run_simulation(
        shots=1000,
        attack_type="signature_forgery",
        attack_strength=0.80,
        forgery_delta_theta=np.pi / 2,
        baseline_noise=0.015,
        simulation_mode="realistic_noise"
    )
    det_forge = detector.analyze_measurement(sim_forge, baseline)
    print(f"✓ Noisy Forgery Attack: QBER = {det_forge.observed_qber:.2%}, Baseline = {det_forge.baseline_qber:.2%}, p-val = {det_forge.p_value:.3e}")
    assert det_forge.verdict == "ATTACK DETECTED"
    assert det_forge.p_value <= 0.001
    assert det_forge.observed_qber > 0.40

def test_api_simulation_mode_support():
    """
    Phase 3A Test 4: Verify API handles simulation_mode toggle between ideal and realistic_noise.
    """
    # 1. Calibrate realistic noise via API
    r_calib = client.post("/api/calibrate", json={
        "runs": 5,
        "shots": 1000,
        "baseline_noise": 0.015,
        "simulation_mode": "realistic_noise"
    })
    assert r_calib.status_code == 200
    base_data = r_calib.json()
    assert base_data["simulation_mode"] == "realistic_noise"
    assert base_data["baseline_error_mean"] > 0.01

    # 2. Run simulation in realistic_noise mode via API
    r_sim = client.post("/api/simulate", json={
        "simulation_mode": "realistic_noise",
        "attack_type": "none",
        "shots": 1000,
        "baseline_noise": 0.015
    })
    assert r_sim.status_code == 200
    res_data = r_sim.json()
    assert res_data["simulation_mode"] == "realistic_noise"
    assert res_data["verdict"] == "SAFE"
    print("✓ Phase 3A: API realistic noise calibration and simulation verified.")

if __name__ == "__main__":
    test_realistic_noise_calibration()
    test_legitimate_noisy_transaction_safe()
    test_noisy_transaction_plus_attack_detected()
    test_api_simulation_mode_support()
    print("\n🎉 ALL PHASE 3A REALISTIC NOISE TESTS PASSED!")
