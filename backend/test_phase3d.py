import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
from ai_security_analyst import AISecurityAnalyst, SecurityEvidencePayload, AIAnalysisContent

client = TestClient(app)

def test_ai_analyst_fallback_when_no_key():
    """
    Phase 3D Test 1: When GROQ_API_KEY is not set, system returns structured deterministic fallback.
    """
    evidence = {
        "verdict": "ATTACK DETECTED",
        "attack_type": "channel_manipulation",
        "action": "REJECT",
        "simulation_mode": "realistic_noise",
        "qber": 0.229,
        "baseline_qber": 0.048,
        "tvd": 0.181,
        "p_value": 0.000001,
        "z_score": 7.42,
        "signer_id": "alice_authorized",
        "signer_check": "VALID",
        "nonce_check": "UNIQUE",
        "reason": "Quantum channel disturbance detected exceeding baseline."
    }

    with patch.dict("os.environ", {}, clear=True):
        res = client.post("/api/ai/analyze", json=evidence)
        assert res.status_code == 200
        data = res.json()
        assert data["available"] is False
        assert "Deterministic Fallback" in data["provider"]
        assert data["deterministic_verdict"] == "ATTACK DETECTED"
        assert data["action"] == "REJECT"
        assert "summary" in data["analysis"]
        assert "recommendation" in data["analysis"]
        assert len(data["analysis"]["evidence"]) > 0
    print("✓ Phase 3D: Fallback analysis when no API key verified.")

def test_ai_cannot_overwrite_deterministic_verdict():
    """
    Phase 3D Test 2: AI output cannot alter or overwrite the deterministic verdict or action.
    """
    evidence = {
        "verdict": "ATTACK DETECTED",
        "attack_type": "signature_forgery",
        "action": "REJECT",
        "simulation_mode": "ideal",
        "qber": 0.495,
        "baseline_qber": 0.0002,
        "tvd": 0.4948,
        "p_value": 0.0,
        "z_score": 15.2,
        "signer_id": "alice_authorized",
        "signer_check": "VALID",
        "nonce_check": "UNIQUE",
        "reason": "Signature forgery detected."
    }

    res = client.post("/api/ai/analyze", json=evidence)
    assert res.status_code == 200
    data = res.json()
    assert data["deterministic_verdict"] == "ATTACK DETECTED"
    assert data["action"] == "REJECT"
    print("✓ Phase 3D: Deterministic verdict protection verified.")

def test_mocked_groq_api_success():
    """
    Phase 3D Test 3: Test successful Groq AI analysis using mocked client.
    """
    mock_content = AIAnalysisContent(
        summary="Quantum Channel Interception Alert",
        explanation="Teleportation measurement statistics demonstrate elevated depolarizing noise consistent with eavesdropping.",
        evidence=["QBER = 22.90%", "p-value < 0.001"],
        recommendation="Isolate fiber segment and re-key session.",
        severity="HIGH"
    )

    with patch.object(AISecurityAnalyst, "get_api_key", return_value="gsk_mock_test_key_12345"):
        with patch.object(AISecurityAnalyst, "_call_groq_llm", return_value=mock_content):
            evidence = {
                "verdict": "ATTACK DETECTED",
                "attack_type": "channel_manipulation",
                "action": "REJECT",
                "simulation_mode": "realistic_noise",
                "qber": 0.229,
                "baseline_qber": 0.048,
                "reason": "Observed error exceeds baseline threshold."
            }
            res = client.post("/api/ai/analyze", json=evidence)
            assert res.status_code == 200
            data = res.json()
            assert data["available"] is True
            assert "Groq Cloud AI" in data["provider"]
            assert data["deterministic_verdict"] == "ATTACK DETECTED"
            assert data["analysis"]["summary"] == "Quantum Channel Interception Alert"
            assert data["analysis"]["severity"] == "HIGH"
    print("✓ Phase 3D: Mocked Groq AI response verified.")

def test_mocked_groq_api_failure_fallback():
    """
    Phase 3D Test 4: When Groq raises a network/timeout error, it falls back seamlessly.
    """
    with patch.object(AISecurityAnalyst, "get_api_key", return_value="gsk_mock_test_key_12345"):
        with patch.object(AISecurityAnalyst, "_call_groq_llm", side_effect=Exception("Connection timeout to api.groq.com")):
            evidence = {
                "verdict": "SAFE",
                "attack_type": "none",
                "action": "ACCEPT",
                "simulation_mode": "ideal",
                "qber": 0.0,
                "baseline_qber": 0.0002,
                "reason": "Authentic signature verified."
            }
            res = client.post("/api/ai/analyze", json=evidence)
            assert res.status_code == 200
            data = res.json()
            assert data["available"] is False
            assert "Deterministic Fallback" in data["provider"]
            assert data["deterministic_verdict"] == "SAFE"
            assert data["action"] == "ACCEPT"
    print("✓ Phase 3D: Groq API failure fallback verified.")

def test_no_api_key_exposure():
    """
    Phase 3D Test 5: Verify GROQ_API_KEY is never exposed in any API endpoint.
    """
    mock_secret = "gsk_super_secret_key_never_leak_9999"
    with patch.dict("os.environ", {"GROQ_API_KEY": mock_secret}):
        # Check /api/health
        h = client.get("/api/health").json()
        assert mock_secret not in str(h)
        assert h["ai_analyst_configured"] is True

        # Check /api/ai/analyze
        r = client.post("/api/ai/analyze", json={
            "verdict": "SAFE",
            "attack_type": "none",
            "action": "ACCEPT",
            "reason": "Valid"
        }).json()
        assert mock_secret not in str(r)
    print("✓ Phase 3D: Security check passed: API key is never exposed.")

def test_security_verification_independent_of_ai():
    """
    Phase 3D Test 6: Core security verification (/api/simulate) operates flawlessly without AI.
    """
    r_sim = client.post("/api/simulate", json={
        "attack_type": "none",
        "shots": 1000,
        "simulation_mode": "ideal"
    })
    assert r_sim.status_code == 200
    assert r_sim.json()["verdict"] == "SAFE"
    assert r_sim.json()["is_valid"] is True
    print("✓ Phase 3D: Security verification independent of AI verified.")

if __name__ == "__main__":
    test_ai_analyst_fallback_when_no_key()
    test_ai_cannot_overwrite_deterministic_verdict()
    test_mocked_groq_api_success()
    test_mocked_groq_api_failure_fallback()
    test_no_api_key_exposure()
    test_security_verification_independent_of_ai()
    print("\n🎉 ALL PHASE 3D AI SECURITY ANALYST TESTS PASSED!")
