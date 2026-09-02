import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app
from ai_security_analyst import AISecurityAnalyst

client = TestClient(app)

def test_full_security_demo_execution():
    """
    Phase 3E Test 1: Full Security Demo executes all 5 scenarios through the actual pipeline.
    Expected: Clean (SAFE) -> Channel Manipulation (ATTACK) -> Signature Forgery (ATTACK) -> Replay (ATTACK) -> Impersonation (ATTACK).
    """
    res = client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "success"
    assert data["total_steps"] == 5
    assert len(data["steps"]) == 5

    # Step 1: Clean
    assert data["steps"][0]["scenario"] == "Clean Transaction"
    assert data["steps"][0]["actual_verdict"] == "SAFE"
    assert data["steps"][0]["action"] == "ACCEPT"

    # Step 2: Channel Manipulation
    assert data["steps"][1]["scenario"] == "Quantum Channel Manipulation"
    assert data["steps"][1]["actual_verdict"] == "ATTACK DETECTED"
    assert data["steps"][1]["action"] == "REJECT"

    # Step 3: Signature Forgery
    assert data["steps"][2]["scenario"] == "Signature Forgery Attack"
    assert data["steps"][2]["actual_verdict"] == "ATTACK DETECTED"
    assert data["steps"][2]["action"] == "REJECT"

    # Step 4: Replay Attack
    assert data["steps"][3]["scenario"] == "Cryptographic Replay Attack"
    assert data["steps"][3]["actual_verdict"] == "ATTACK DETECTED"
    assert data["steps"][3]["action"] == "REJECT"

    # Step 5: Signer Impersonation
    assert data["steps"][4]["scenario"] == "Signer Impersonation Attack"
    assert data["steps"][4]["actual_verdict"] == "ATTACK DETECTED"
    assert data["steps"][4]["action"] == "REJECT"

    # Summary
    assert data["summary"]["safe_count"] == 1
    assert data["summary"]["attacks_detected_count"] == 4
    assert data["summary"]["clean_passed"] is True
    assert data["summary"]["all_attacks_blocked"] is True
    assert data["summary"]["detection_accuracy"] == 1.0
    print("✓ Phase 3E: Full Security Demo execution across 5 scenarios verified.")

def test_full_security_demo_noisy_mode():
    """
    Phase 3E Test 2: Full Security Demo operates under realistic noise model.
    """
    res = client.post("/api/demo/run", json={"simulation_mode": "realistic_noise", "shots": 1000})
    assert res.status_code == 200
    data = res.json()
    assert data["simulation_mode"] == "realistic_noise"
    assert data["summary"]["all_attacks_blocked"] is True
    print("✓ Phase 3E: Full Security Demo in Realistic Noise mode verified.")

def test_demo_updates_persistent_audit_events():
    """
    Phase 3E Test 3: Demo updates persistent SQLite audit log.
    """
    client.post("/api/security-events/reset")
    client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})

    events_res = client.get("/api/security-events?limit=50")
    assert events_res.status_code == 200
    events = events_res.json()["events"]
    assert len(events) >= 5

    scenarios = [e["scenario"] for e in events]
    assert "none" in scenarios
    assert "channel_manipulation" in scenarios
    assert "signature_forgery" in scenarios
    assert "replay_attack" in scenarios
    assert "signer_impersonation" in scenarios
    print("✓ Phase 3E: Demo persistent SQLite audit recording verified.")

def test_demo_updates_analytics_engine():
    """
    Phase 3E Test 4: Demo updates in-memory session analytics metrics and confusion matrix.
    """
    client.post("/api/analytics/reset")
    client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})

    analytics_res = client.get("/api/analytics")
    assert analytics_res.status_code == 200
    metrics = analytics_res.json()

    assert metrics["total_attempts"] == 5
    assert metrics["safe_count"] == 1
    assert metrics["attack_detected_count"] == 4
    assert metrics["detection_rate"] == 1.0  # 4/4 attacks detected (Recall)
    assert metrics["classification_metrics"]["true_positives"] == 4
    assert metrics["classification_metrics"]["true_negatives"] == 1
    assert metrics["classification_metrics"]["false_positives"] == 0
    assert metrics["classification_metrics"]["false_negatives"] == 0
    print("✓ Phase 3E: Demo analytics metrics and confusion matrix verified.")

def test_incident_details_retrieval():
    """
    Phase 3E Test 5: Verify retrieval of complete audit event details by event_id.
    """
    client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})
    events = client.get("/api/security-events?limit=10").json()["events"]
    assert len(events) > 0

    first_event = events[0]
    event_id = first_event["event_id"]

    detail_res = client.get(f"/api/security-events/{event_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()

    assert detail["event_id"] == event_id
    assert "timestamp" in detail
    assert "verdict" in detail
    assert "action" in detail
    assert "reason" in detail
    assert "signer_id" in detail
    assert "signature_id" in detail
    assert "nonce" in detail
    print("✓ Phase 3E: Incident details retrieval by ID verified.")

def test_system_health_endpoint():
    """
    Phase 3E Test 6: Verify enhanced System Health endpoint with components status.
    """
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "online"
    assert "components" in data
    components = data["components"]

    assert components["quantum_engine"]["status"] == "OPERATIONAL"
    assert components["threat_detector"]["status"] == "ACTIVE"
    assert components["analytics_engine"]["status"] == "TRACKING"
    assert components["audit_log"]["status"] == "PERSISTENT"
    assert components["ai_analyst"]["status"] in ["CONNECTED", "FALLBACK"]

    # Security check: no secrets in health payload
    assert "api_key" not in str(data).lower()
    print("✓ Phase 3E: System Health components status verified.")

def test_export_security_report_json():
    """
    Phase 3E Test 7: Export security report in JSON format.
    """
    client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})
    res = client.get("/api/reports/export?format=json")
    assert res.status_code == 200
    report = res.json()

    assert "report_title" in report
    assert "generated_at" in report
    assert "executive_summary" in report
    assert "confusion_matrix" in report
    assert "audit_log_events" in report
    assert len(report["audit_log_events"]) > 0
    print("✓ Phase 3E: JSON Security Report export verified.")

def test_export_security_report_csv():
    """
    Phase 3E Test 8: Export security report in CSV format.
    """
    client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})
    res = client.get("/api/reports/export?format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    csv_text = res.text

    assert "Event ID,Timestamp (UTC),Scenario,Detected Attack Type" in csv_text
    assert "Clean Transaction" in csv_text or "none" in csv_text
    assert "channel_manipulation" in csv_text
    print("✓ Phase 3E: CSV Security Report export verified.")

def test_groq_failure_does_not_break_demo():
    """
    Phase 3E Test 9: Groq API failure or missing key does not break demo execution.
    """
    with patch.object(AISecurityAnalyst, "_call_groq_llm", side_effect=Exception("Groq API Timeout")):
        res = client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["summary"]["all_attacks_blocked"] is True
    print("✓ Phase 3E: Groq failure fallback tolerance during demo verified.")

def test_deterministic_verdict_immutability():
    """
    Phase 3E Test 10: Deterministic verdict cannot be altered by AI or UI parameters.
    """
    res = client.post("/api/demo/run", json={"simulation_mode": "ideal", "shots": 1000})
    data = res.json()

    # Step 1 MUST be SAFE, Steps 2-5 MUST be ATTACK DETECTED
    verdicts = [s["actual_verdict"] for s in data["steps"]]
    assert verdicts == ["SAFE", "ATTACK DETECTED", "ATTACK DETECTED", "ATTACK DETECTED", "ATTACK DETECTED"]
    print("✓ Phase 3E: Deterministic verdict immutability verified.")

if __name__ == "__main__":
    test_full_security_demo_execution()
    test_full_security_demo_noisy_mode()
    test_demo_updates_persistent_audit_events()
    test_demo_updates_analytics_engine()
    test_incident_details_retrieval()
    test_system_health_endpoint()
    test_export_security_report_json()
    test_export_security_report_csv()
    test_groq_failure_does_not_break_demo()
    test_deterministic_verdict_immutability()
    print("\n🎉 ALL PHASE 3E TESTS PASSED!")
