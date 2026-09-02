import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_empty_analytics_handling():
    """
    Phase 3B Test 1: Empty analytics store must return clean zero values without division by zero.
    """
    client.post("/api/analytics/reset")
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_attempts"] == 0
    assert data["safe_count"] == 0
    assert data["attack_detected_count"] == 0
    assert data["detection_rate"] == 0.0
    assert data["classification_metrics"]["precision"] == 0.0
    assert data["classification_metrics"]["recall"] == 0.0
    print("✓ Phase 3B: Empty analytics handling verified.")

def test_analytics_aggregation_and_counts():
    """
    Phase 3B Test 2: Event recording and aggregation across verdicts and attack types.
    """
    client.post("/api/analytics/reset")
    client.post("/api/reset_replay_store")

    # 1. Execute Clean transaction
    r1 = client.post("/api/simulate", json={"attack_type": "none", "shots": 1000, "simulation_mode": "ideal"})
    assert r1.json()["verdict"] == "SAFE"

    # 2. Execute Channel Manipulation attack
    r2 = client.post("/api/simulate", json={"attack_type": "channel_manipulation", "attack_strength": 0.60, "shots": 1000, "simulation_mode": "ideal"})
    assert r2.json()["verdict"] == "ATTACK DETECTED"

    # 3. Execute Signature Forgery attack
    r3 = client.post("/api/simulate", json={"attack_type": "signature_forgery", "attack_strength": 0.80, "shots": 1000, "simulation_mode": "ideal"})
    assert r3.json()["verdict"] == "ATTACK DETECTED"

    # 4. Execute Signer Impersonation attack
    r4 = client.post("/api/simulate", json={"attack_type": "signer_impersonation", "signer_id": "mallory_fake", "shots": 1000, "simulation_mode": "ideal"})
    assert r4.json()["verdict"] == "ATTACK DETECTED"

    # Check Aggregated Analytics
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_attempts"] == 4
    assert data["safe_count"] == 1
    assert data["attack_detected_count"] == 3
    assert data["attack_type_distribution"]["none"] == 1
    assert data["attack_type_distribution"]["channel_manipulation"] == 1
    assert data["attack_type_distribution"]["signature_forgery"] == 1
    assert data["attack_type_distribution"]["signer_impersonation"] == 1
    assert data["average_qber"] > 0.0
    print("✓ Phase 3B: Analytics aggregation and counts verified.")

def test_ground_truth_classification_metrics():
    """
    Phase 3B Test 3: Ground-truth confusion matrix & classification metrics.
    """
    client.post("/api/analytics/reset")
    
    # 2 Clean runs -> 2 TN
    client.post("/api/simulate", json={"attack_type": "none", "simulation_mode": "ideal"})
    client.post("/api/simulate", json={"attack_type": "none", "simulation_mode": "ideal"})

    # 2 Attack runs -> 2 TP
    client.post("/api/simulate", json={"attack_type": "channel_manipulation", "attack_strength": 0.70, "simulation_mode": "ideal"})
    client.post("/api/simulate", json={"attack_type": "signature_forgery", "attack_strength": 0.80, "simulation_mode": "ideal"})

    res = client.get("/api/analytics")
    metrics = res.json()["classification_metrics"]
    assert metrics["true_positives"] == 2
    assert metrics["true_negatives"] == 2
    assert metrics["false_positives"] == 0
    assert metrics["false_negatives"] == 0
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == 1.0
    assert metrics["false_positive_rate"] == 0.0
    print("✓ Phase 3B: Ground-truth classification metrics verified.")

def test_simulation_mode_separation():
    """
    Phase 3B Test 4: Analytics dataset filtering by simulation_mode (ideal vs realistic_noise).
    """
    client.post("/api/analytics/reset")

    # 2 ideal runs
    client.post("/api/simulate", json={"attack_type": "none", "simulation_mode": "ideal"})
    client.post("/api/simulate", json={"attack_type": "channel_manipulation", "attack_strength": 0.5, "simulation_mode": "ideal"})

    # 3 noisy runs
    client.post("/api/simulate", json={"attack_type": "none", "simulation_mode": "realistic_noise"})
    client.post("/api/simulate", json={"attack_type": "none", "simulation_mode": "realistic_noise"})
    client.post("/api/simulate", json={"attack_type": "signature_forgery", "attack_strength": 0.7, "simulation_mode": "realistic_noise"})

    # Filter Ideal
    res_ideal = client.get("/api/analytics?simulation_mode=ideal")
    assert res_ideal.json()["total_attempts"] == 2
    assert res_ideal.json()["simulation_mode_distribution"]["ideal"] == 2

    # Filter Realistic Noise
    res_noise = client.get("/api/analytics?simulation_mode=realistic_noise")
    assert res_noise.json()["total_attempts"] == 3
    assert res_noise.json()["simulation_mode_distribution"]["realistic_noise"] == 3
    print("✓ Phase 3B: Simulation mode dataset separation verified.")

def test_live_parameter_sweep():
    """
    Phase 3B Test 5: Live controlled parameter sweep endpoint POST /api/analytics/sweep.
    """
    res = client.post("/api/analytics/sweep?simulation_mode=ideal&shots=500&repetitions=2")
    assert res.status_code == 200
    data = res.json()
    assert len(data["strengths"]) == 6
    assert len(data["channel_manipulation"]) == 6
    assert len(data["signature_forgery"]) == 6
    assert len(data["chart_series"]) == 6

    # Verify scaling
    chan_points = data["channel_manipulation"]
    assert chan_points[0]["mean_qber"] == 0.0 # 0% attack has 0% error in ideal mode
    assert chan_points[-1]["mean_qber"] > 0.40 # 100% attack has high error
    print("✓ Phase 3B: Live parameter sweep endpoint verified.")

if __name__ == "__main__":
    test_empty_analytics_handling()
    test_analytics_aggregation_and_counts()
    test_ground_truth_classification_metrics()
    test_simulation_mode_separation()
    test_live_parameter_sweep()
    print("\n🎉 ALL PHASE 3B SECURITY ANALYTICS TESTS PASSED!")
