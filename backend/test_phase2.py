import pytest
import numpy as np
from fastapi.testclient import TestClient

from main import app
from quantum_engine import QDSQuantumEngine
from statistical_detector import StatisticalThreatDetector
from security_manager import SecurityManager

client = TestClient(app)

# =============================================================================
# 1. PHASE 1 REGRESSION TESTS (MUST PASS WITHOUT MODIFICATION)
# =============================================================================

def test_phase1_ideal_teleportation_fidelity():
    engine = QDSQuantumEngine(seed=42)
    res = engine.run_simulation(shots=1000, attack_type="none", attack_strength=0.0, baseline_noise=0.0)
    assert res["total_shots"] == 1000
    assert res["verif_0_count"] == 1000
    assert res["verif_1_count"] == 0
    assert res["observed_error_rate"] == 0.0
    print("✓ Phase 1 Regression: Ideal teleportation fidelity verified.")

def test_phase1_arbitrary_signature_states():
    engine = QDSQuantumEngine(seed=123)
    test_states = [(0.0, 0.0), (np.pi, 0.0), (np.pi/2, 0.0), (np.pi/2, np.pi/2), (np.pi/4, np.pi/3)]
    for th, ph in test_states:
        res = engine.run_simulation(theta=th, phi=ph, attack_type="none", attack_strength=0.0, baseline_noise=0.0, shots=500)
        assert res["observed_error_rate"] == 0.0
    print("✓ Phase 1 Regression: Arbitrary signature states verified.")

def test_phase1_channel_manipulation_scaling():
    engine = QDSQuantumEngine(seed=888)
    detector = StatisticalThreatDetector()
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.015)
    
    for strength in [0.25, 0.50, 0.75, 1.00]:
        sim = engine.run_simulation(shots=1000, attack_type="channel_manipulation", attack_strength=strength, baseline_noise=0.015)
        det = detector.analyze_measurement(sim, baseline)
        assert det.verdict == "ATTACK DETECTED"
        assert det.observed_qber > 0.03
    print("✓ Phase 1 Regression: Channel manipulation scaling verified.")

# =============================================================================
# 2. PHASE 2 ATTACK 1: SIGNATURE FORGERY TESTS
# =============================================================================

def test_signature_forgery_quantum_state_perturbation():
    """
    Verifies signature forgery where state |psi(theta+delta_theta, phi+delta_phi)>
    is tested against expected verification projection U_prep(theta, phi)^dagger.
    """
    engine = QDSQuantumEngine(seed=701)
    detector = StatisticalThreatDetector()
    baseline = detector.calibrate_baseline(engine, runs=5, shots=1000, baseline_noise=0.0)

    # 1. Zero perturbation (Authentic Signature)
    res_clean = engine.run_simulation(
        theta=np.pi / 3, phi=np.pi / 4,
        attack_type="signature_forgery",
        attack_strength=0.0,
        forgery_delta_theta=0.0,
        shots=1000
    )
    det_clean = detector.analyze_measurement(res_clean, baseline)
    assert det_clean.verdict == "SAFE"
    assert det_clean.observed_qber == 0.0

    # 2. Small perturbation (delta_theta = pi/6 rad ~ 30 deg)
    # Theoretical mismatch error = sin^2(delta_theta/2) = sin^2(pi/12) ~ 0.067 (6.7%)
    res_mild = engine.run_simulation(
        theta=np.pi / 3, phi=np.pi / 4,
        attack_type="signature_forgery",
        attack_strength=0.20,
        forgery_delta_theta=np.pi / 6,
        shots=1000
    )
    det_mild = detector.analyze_measurement(res_mild, baseline)
    assert 0.04 <= det_mild.observed_qber <= 0.09
    assert det_mild.verdict in ["SUSPICIOUS", "ATTACK DETECTED"]

    # 3. Severe perturbation (delta_theta = pi/2 rad ~ 90 deg)
    # Theoretical mismatch error = sin^2(pi/4) = 0.50 (50% error)
    res_severe = engine.run_simulation(
        theta=np.pi / 3, phi=np.pi / 4,
        attack_type="signature_forgery",
        attack_strength=0.80,
        forgery_delta_theta=np.pi / 2,
        shots=1000
    )
    det_severe = detector.analyze_measurement(res_severe, baseline)
    assert 0.45 <= det_severe.observed_qber <= 0.55
    assert det_severe.verdict == "ATTACK DETECTED"
    assert det_severe.p_value < 1e-10
    print("✓ Phase 2 Attack 1: Signature Forgery state perturbation tests passed.")

# =============================================================================
# 3. PHASE 2 ATTACK 2: REPLAY ATTACK DETECTION TESTS
# =============================================================================

def test_classical_replay_attack_protection():
    """
    Verifies SQLite nonce and signature ID replay detection.
    """
    sec = SecurityManager()
    sec.reset_signature_store()

    test_sig_id = "SIG-TEST-REPLAY-001"
    test_nonce = "NONCE-TEST-REPLAY-ABC"
    
    # 1. First submission should pass uniqueness check
    ok_1, msg_1 = sec.check_replay_protection(signature_id=test_sig_id, nonce=test_nonce)
    assert ok_1 is True
    assert "fresh and unique" in msg_1

    # Record the verified signature
    recorded = sec.record_verified_signature(
        signature_id=test_sig_id,
        nonce=test_nonce,
        session_id="SESS-100",
        signer_id="alice_authorized",
        message_digest="hash123",
        status="ACCEPTED"
    )
    assert recorded is True

    # 2. Repeated submission with the same signature ID must be rejected
    ok_2, msg_2 = sec.check_replay_protection(signature_id=test_sig_id, nonce="NONCE-DIFFERENT")
    assert ok_2 is False
    assert "REPLAY ATTACK DETECTED" in msg_2

    # 3. Repeated submission with the same nonce must be rejected
    ok_3, msg_3 = sec.check_replay_protection(signature_id="SIG-DIFFERENT", nonce=test_nonce)
    assert ok_3 is False
    assert "REPLAY ATTACK DETECTED" in msg_3
    print("✓ Phase 2 Attack 2: Classical Replay Attack detection verified.")

# =============================================================================
# 4. PHASE 2 ATTACK 3: SIGNER IMPERSONATION TESTS
# =============================================================================

def test_classical_signer_impersonation_detection():
    """
    Verifies signer identity and credential validation against trusted registry.
    """
    sec = SecurityManager()

    # 1. Authorized Signer with valid certificate -> PASS
    ok_auth, msg_auth, data_auth = sec.verify_signer_identity(
        signer_id="alice_authorized",
        claimed_certificate_id="CERT-QDS-2026-ALICE-ROOT"
    )
    assert ok_auth is True
    assert data_auth["is_revoked"] == 0

    # 2. Spoofed / Mismatched Certificate -> FAIL (IMPERSONATION DETECTED)
    ok_spoof, msg_spoof, _ = sec.verify_signer_identity(
        signer_id="alice_authorized",
        claimed_certificate_id="CERT-FORGED-SPOOFED-2026"
    )
    assert ok_spoof is False
    assert "SIGNER IMPERSONATION DETECTED" in msg_spoof
    assert "Certificate mismatch" in msg_spoof

    # 3. Unknown / Fake Signer ID -> FAIL (IMPERSONATION DETECTED)
    ok_fake, msg_fake, _ = sec.verify_signer_identity(
        signer_id="mallory_attacker_fake",
        claimed_certificate_id="ANY-CERT"
    )
    assert ok_fake is False
    assert "SIGNER IMPERSONATION DETECTED" in msg_fake
    assert "Unknown or unregistered" in msg_fake

    # 4. Revoked Signer -> FAIL (IMPERSONATION DETECTED)
    ok_rev, msg_rev, _ = sec.verify_signer_identity(
        signer_id="mallory_revoked",
        claimed_certificate_id="CERT-REVOKED-MAL-2026"
    )
    assert ok_rev is False
    assert "SIGNER IMPERSONATION DETECTED" in msg_rev
    assert "REVOKED" in msg_rev
    print("✓ Phase 2 Attack 3: Signer Impersonation detection verified.")

# =============================================================================
# 5. UNIFIED THREAT ENGINE API INTEGRATION TESTS
# =============================================================================

def test_unified_api_threat_scenarios():
    """
    Tests the unified API endpoint POST /api/simulate across all 4 attack scenarios.
    """
    client.post("/api/reset_replay_store")

    # Scenario A: Clean Authentic QDS Transaction
    r_clean = client.post("/api/simulate", json={
        "attack_type": "none",
        "attack_strength": 0.0,
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-AUTH-001",
        "nonce": "NONCE-AUTH-001",
        "session_id": "SESS-AUTH-001",
        "shots": 1000
    })
    assert r_clean.status_code == 200
    d_clean = r_clean.json()
    assert d_clean["verdict"] == "SAFE"
    assert d_clean["is_valid"] is True
    assert d_clean["attack_type"] == "none"
    assert d_clean["threat_level"] == "LOW"

    # Scenario B: Signature Forgery Attack
    r_forge = client.post("/api/simulate", json={
        "attack_type": "signature_forgery",
        "attack_strength": 0.80,
        "forgery_delta_theta": np.pi / 2,
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-FORGE-001",
        "nonce": "NONCE-FORGE-001",
        "session_id": "SESS-FORGE-001",
        "shots": 1000
    })
    assert r_forge.status_code == 200
    d_forge = r_forge.json()
    assert d_forge["verdict"] == "ATTACK DETECTED"
    assert d_forge["is_valid"] is False
    assert d_forge["attack_type"] == "signature_forgery"
    assert d_forge["threat_level"] == "CRITICAL"
    assert d_forge["detection"]["observed_qber"] > 0.40

    # Scenario C: Replay Attack (Replay SIG-AUTH-001)
    r_replay = client.post("/api/simulate", json={
        "attack_type": "replay_attack",
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-AUTH-001", # previously verified signature
        "nonce": "NONCE-AUTH-001",
        "session_id": "SESS-AUTH-001",
        "shots": 1000
    })
    assert r_replay.status_code == 200
    d_replay = r_replay.json()
    assert d_replay["verdict"] == "ATTACK DETECTED"
    assert d_replay["is_valid"] is False
    assert d_replay["attack_type"] == "replay_attack"
    assert d_replay["threat_level"] == "CRITICAL"
    assert d_replay["classical_checks"]["replay_passed"] is False

    # Scenario D: Signer Impersonation Attack
    r_impers = client.post("/api/simulate", json={
        "attack_type": "signer_impersonation",
        "signer_id": "mallory_unregistered",
        "certificate_id": "CERT-FAKE-999",
        "signature_id": "SIG-IMP-001",
        "nonce": "NONCE-IMP-001",
        "session_id": "SESS-IMP-001",
        "shots": 1000
    })
    assert r_impers.status_code == 200
    d_impers = r_impers.json()
    assert d_impers["verdict"] == "ATTACK DETECTED"
    assert d_impers["is_valid"] is False
    assert d_impers["attack_type"] == "signer_impersonation"
    assert d_impers["threat_level"] == "CRITICAL"
    assert d_impers["classical_checks"]["identity_passed"] is False

    # Scenario E: Quantum Channel Manipulation
    r_chan = client.post("/api/simulate", json={
        "attack_type": "channel_manipulation",
        "attack_strength": 0.60,
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-CHAN-001",
        "nonce": "NONCE-CHAN-001",
        "session_id": "SESS-CHAN-001",
        "shots": 1000
    })
    assert r_chan.status_code == 200
    d_chan = r_chan.json()
    assert d_chan["verdict"] == "ATTACK DETECTED"
    assert d_chan["is_valid"] is False
    assert d_chan["attack_type"] == "channel_manipulation"
    assert d_chan["detection"]["observed_qber"] > 0.15

    print("✓ Phase 2 Unified Threat Engine API Integration tests passed!")

# =============================================================================
# 6. REGRESSION TESTS: STATE-MANAGEMENT & REPLAY FLOW VERIFICATION
# =============================================================================

def test_ui_sequence_clean_replay_switch_back_clean():
    """
    Regression Test for exact user-reported UI workflow:
    1. Clean transaction A -> SAFE (stored into SQLite)
    2. Replay transaction A -> REPLAY_ATTACK (rejected)
    3. User switches back to No Attack -> Clean transaction B -> SAFE
    
    Verifies that:
    - signature_id(B) != signature_id(A)
    - nonce(B) != nonce(A)
    - session_id(B) != session_id(A)
    - Both A and B are registered as distinct consumed records in SQLite.
    """
    client.post("/api/reset_replay_store")

    # Step 1: Clean Transaction A
    res_a = client.post("/api/simulate", json={
        "attack_type": "none",
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-TX-AAA",
        "nonce": "NONCE-AAA-111",
        "session_id": "SESS-AAA",
        "shots": 1000
    })
    assert res_a.status_code == 200
    data_a = res_a.json()
    assert data_a["verdict"] == "SAFE"
    assert data_a["is_valid"] is True
    assert data_a["classical_checks"]["signature_id"] == "SIG-TX-AAA"
    assert data_a["classical_checks"]["nonce"] == "NONCE-AAA-111"

    # Step 2: Replay Transaction A (Reuses exact tokens of A)
    res_replay = client.post("/api/simulate", json={
        "attack_type": "replay_attack",
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-TX-AAA",
        "nonce": "NONCE-AAA-111",
        "session_id": "SESS-AAA",
        "shots": 1000
    })
    assert res_replay.status_code == 200
    data_replay = res_replay.json()
    assert data_replay["verdict"] == "ATTACK DETECTED"
    assert data_replay["attack_type"] == "replay_attack"
    assert data_replay["is_valid"] is False
    assert data_replay["classical_checks"]["replay_passed"] is False

    # Step 3: Switch back to No Attack (Clean Transaction B)
    # The frontend generates fresh tokens or omits them for backend generation
    res_b = client.post("/api/simulate", json={
        "attack_type": "none",
        "signer_id": "alice_authorized",
        "certificate_id": "CERT-QDS-2026-ALICE-ROOT",
        "signature_id": "SIG-TX-BBB",
        "nonce": "NONCE-BBB-222",
        "session_id": "SESS-BBB",
        "shots": 1000
    })
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert data_b["verdict"] == "SAFE"
    assert data_b["is_valid"] is True
    assert data_b["classical_checks"]["replay_passed"] is True

    # Assertions on token uniqueness
    sig_a = data_a["classical_checks"]["signature_id"]
    sig_b = data_b["classical_checks"]["signature_id"]
    nonce_a = data_a["classical_checks"]["nonce"]
    nonce_b = data_b["classical_checks"]["nonce"]
    sess_a = data_a["classical_checks"]["session_id"]
    sess_b = data_b["classical_checks"]["session_id"]

    assert sig_b != sig_a, f"Expected distinct signature IDs, got {sig_b} == {sig_a}"
    assert nonce_b != nonce_a, f"Expected distinct nonces, got {nonce_b} == {nonce_a}"
    assert sess_b != sess_a, f"Expected distinct session IDs, got {sess_b} == {sess_a}"

    # Verify both A and B reside in SQLite registry
    sigs_res = client.get("/api/signatures")
    assert sigs_res.status_code == 200
    recorded_ids = [s["signature_id"] for s in sigs_res.json()]
    assert "SIG-TX-AAA" in recorded_ids
    assert "SIG-TX-BBB" in recorded_ids
    print("✓ Regression Test 1 (Clean A -> Replay A -> Clean B) passed successfully!")

def test_multiple_replays_then_clean():
    """
    Regression Test:
    1. Clean A -> SAFE
    2. Replay A -> REPLAY_ATTACK
    3. Replay A again -> REPLAY_ATTACK
    4. Clean B -> SAFE
    5. Replay B -> REPLAY_ATTACK
    """
    client.post("/api/reset_replay_store")

    # 1. Clean A
    r_a = client.post("/api/simulate", json={"attack_type": "none", "signature_id": "SIG-A", "nonce": "NONCE-A"})
    assert r_a.json()["verdict"] == "SAFE"

    # 2. Replay A (first attempt)
    r_rep1 = client.post("/api/simulate", json={"attack_type": "replay_attack", "signature_id": "SIG-A", "nonce": "NONCE-A"})
    assert r_rep1.json()["verdict"] == "ATTACK DETECTED"
    assert r_rep1.json()["attack_type"] == "replay_attack"

    # 3. Replay A (second attempt)
    r_rep2 = client.post("/api/simulate", json={"attack_type": "replay_attack", "signature_id": "SIG-A", "nonce": "NONCE-A"})
    assert r_rep2.json()["verdict"] == "ATTACK DETECTED"
    assert r_rep2.json()["attack_type"] == "replay_attack"

    # 4. Clean B (fresh auto-generated tokens)
    r_b = client.post("/api/simulate", json={"attack_type": "none"})
    assert r_b.json()["verdict"] == "SAFE"
    sig_b = r_b.json()["classical_checks"]["signature_id"]
    nonce_b = r_b.json()["classical_checks"]["nonce"]
    assert sig_b != "SIG-A"
    assert nonce_b != "NONCE-A"

    # 5. Replay B
    r_rep_b = client.post("/api/simulate", json={"attack_type": "replay_attack", "signature_id": sig_b, "nonce": nonce_b})
    assert r_rep_b.json()["verdict"] == "ATTACK DETECTED"
    assert r_rep_b.json()["attack_type"] == "replay_attack"
    print("✓ Regression Test 2 (Multiple Replays -> Clean B -> Replay B) passed successfully!")

if __name__ == "__main__":
    test_phase1_ideal_teleportation_fidelity()
    test_phase1_arbitrary_signature_states()
    test_phase1_channel_manipulation_scaling()
    test_signature_forgery_quantum_state_perturbation()
    test_classical_replay_attack_protection()
    test_classical_signer_impersonation_detection()
    test_unified_api_threat_scenarios()
    test_ui_sequence_clean_replay_switch_back_clean()
    test_multiple_replays_then_clean()
    print("\n🎉 ALL 9 TEST SUITES IN PHASE 2 PASSED!")
