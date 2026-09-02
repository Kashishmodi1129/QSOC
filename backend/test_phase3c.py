import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_security_events_lifecycle_and_scenarios():
    """
    Phase 3C Test 1: Verify all 5 attack/clean scenarios generate persistent audit records with correct action & verdict.
    """
    client.post("/api/security-events/reset")
    client.post("/api/reset_replay_store")

    # 1. Clean Transaction -> SAFE -> ACCEPT
    r_clean = client.post("/api/simulate", json={"attack_type": "none", "shots": 1000, "simulation_mode": "ideal"})
    assert r_clean.status_code == 200
    assert r_clean.json()["verdict"] == "SAFE"

    # 2. Replay Attack -> ATTACK DETECTED -> REJECT
    # First get the recorded signature to replay
    sigs = client.get("/api/signatures").json()
    assert len(sigs) > 0
    target_sig = sigs[0]
    r_replay = client.post("/api/simulate", json={
        "attack_type": "replay_attack",
        "signature_id": target_sig["signature_id"],
        "nonce": target_sig["nonce"],
        "simulation_mode": "ideal"
    })
    assert r_replay.status_code == 200
    assert r_replay.json()["verdict"] == "ATTACK DETECTED"

    # 3. Forgery Attack -> ATTACK DETECTED -> REJECT
    r_forge = client.post("/api/simulate", json={"attack_type": "signature_forgery", "attack_strength": 0.80, "simulation_mode": "ideal"})
    assert r_forge.status_code == 200
    assert r_forge.json()["verdict"] == "ATTACK DETECTED"

    # 4. Impersonation Attack -> ATTACK DETECTED -> REJECT
    r_imp = client.post("/api/simulate", json={"attack_type": "signer_impersonation", "signer_id": "mallory_fake", "simulation_mode": "ideal"})
    assert r_imp.status_code == 200
    assert r_imp.json()["verdict"] == "ATTACK DETECTED"

    # 5. Channel Manipulation Attack -> ATTACK DETECTED -> REJECT
    r_chan = client.post("/api/simulate", json={"attack_type": "channel_manipulation", "attack_strength": 0.60, "simulation_mode": "ideal"})
    assert r_chan.status_code == 200
    assert r_chan.json()["verdict"] == "ATTACK DETECTED"

    # Verify all 5 events are in SQLite audit log
    res = client.get("/api/security-events")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 5
    assert len(data["events"]) == 5

    events = data["events"]
    actions = [e["action"] for e in events]
    verdicts = [e["verdict"] for e in events]

    assert actions.count("ACCEPT") == 1
    assert actions.count("REJECT") == 4
    assert verdicts.count("SAFE") == 1
    assert verdicts.count("ATTACK DETECTED") == 4
    print("✓ Phase 3C: All 5 scenarios generated exact persistent audit events.")

def test_event_detail_retrieval_and_uniqueness():
    """
    Phase 3C Test 2: Verify GET /api/security-events/{event_id} and event_id uniqueness.
    """
    res = client.get("/api/security-events")
    events = res.json()["events"]
    assert len(events) >= 5

    event_ids = [e["event_id"] for e in events]
    assert len(event_ids) == len(set(event_ids)), "All event_ids must be unique"

    # Test single event detail endpoint
    sample_id = events[0]["event_id"]
    r_detail = client.get(f"/api/security-events/{sample_id}")
    assert r_detail.status_code == 200
    detail = r_detail.json()
    assert detail["event_id"] == sample_id
    assert "timestamp" in detail
    assert "reason" in detail
    assert "signature_id" in detail
    assert "nonce" in detail

    # Test non-existent event
    r_404 = client.get("/api/security-events/EVT-NON-EXISTENT-999")
    assert r_404.status_code == 404
    print("✓ Phase 3C: Event detail retrieval and uniqueness verified.")

def test_event_filtering_capabilities():
    """
    Phase 3C Test 3: Test filtering by verdict, attack_type, and simulation_mode.
    """
    # 1. Filter by verdict=SAFE
    r_safe = client.get("/api/security-events?verdict=SAFE")
    assert r_safe.status_code == 200
    assert all(e["verdict"] == "SAFE" for e in r_safe.json()["events"])
    assert r_safe.json()["total_count"] == 1

    # 2. Filter by verdict=ATTACK DETECTED
    r_attk = client.get("/api/security-events?verdict=ATTACK DETECTED")
    assert r_attk.status_code == 200
    assert all(e["verdict"] == "ATTACK DETECTED" for e in r_attk.json()["events"])
    assert r_attk.json()["total_count"] == 4

    # 3. Filter by attack_type=replay_attack
    r_rep = client.get("/api/security-events?attack_type=replay_attack")
    assert r_rep.status_code == 200
    assert all(e["attack_type"] == "replay_attack" for e in r_rep.json()["events"])
    assert r_rep.json()["total_count"] == 1

    # 4. Filter by simulation_mode=ideal
    r_ideal = client.get("/api/security-events?simulation_mode=ideal")
    assert r_ideal.status_code == 200
    assert r_ideal.json()["total_count"] == 5

    # 5. Filter by simulation_mode=realistic_noise
    # Generate 1 realistic noise event
    client.post("/api/simulate", json={"attack_type": "none", "simulation_mode": "realistic_noise"})
    r_noise = client.get("/api/security-events?simulation_mode=realistic_noise")
    assert r_noise.status_code == 200
    assert r_noise.json()["total_count"] == 1
    print("✓ Phase 3C: Security audit event filtering verified.")

def test_reset_behavior_preserves_signers():
    """
    Phase 3C Test 4: Resetting security events must clear audit log but keep signers intact.
    """
    r_reset = client.post("/api/security-events/reset")
    assert r_reset.status_code == 200

    # Events should be 0
    res_events = client.get("/api/security-events")
    assert res_events.json()["total_count"] == 0
    assert len(res_events.json()["events"]) == 0

    # Signers must still exist and be intact
    res_signers = client.get("/api/signers")
    assert res_signers.status_code == 200
    signers = res_signers.json()
    assert len(signers) >= 3
    signer_ids = [s["signer_id"] for s in signers]
    assert "alice_authorized" in signer_ids
    assert "bob_authorized" in signer_ids
    assert "mallory_revoked" in signer_ids
    print("✓ Phase 3C: Reset behavior preserves signers registry.")

if __name__ == "__main__":
    test_security_events_lifecycle_and_scenarios()
    test_event_detail_retrieval_and_uniqueness()
    test_event_filtering_capabilities()
    test_reset_behavior_preserves_signers()
    print("\n🎉 ALL PHASE 3C SECURITY AUDIT LOG TESTS PASSED!")
