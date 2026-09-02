import os
import io
import csv
import hashlib
import uuid
import numpy as np
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Dict, Any, List, Optional

from models import (
    CalibrationRequest,
    BaselineCalibrationData,
    SimulationRequest,
    SimulationResponse,
    QuantumMeasurementData,
    ThreatDetectionResult,
)
from quantum_engine import QDSQuantumEngine
from statistical_detector import StatisticalThreatDetector
from security_manager import SecurityManager
from analytics import AnalyticsEngine, SessionEventRecord, run_parameter_sweep
from ai_security_analyst import AISecurityAnalyst, SecurityEvidencePayload, AIAnalysisResponse

app = FastAPI(
    title="Quantum Digital Signature (QDS) Security Lab API",
    description="Unified Cyber Threat Detection Framework for Teleportation-based QDS with AI Security Analyst & SOC Demo Engine",
    version="3.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

quantum_engine = QDSQuantumEngine()
detector = StatisticalThreatDetector()
security_manager = SecurityManager()
analytics_engine = AnalyticsEngine()
ai_analyst = AISecurityAnalyst()

# Initialize with default ideal calibration
detector.calibrate_baseline(
    engine=quantum_engine,
    runs=5,
    shots=1000,
    baseline_noise=0.015,
    simulation_mode="ideal",
)

# =============================================================================
# SYSTEM HEALTH & STATUS (PHASE 3E)
# =============================================================================

@app.get("/api/health")
def health_check():
    """
    Returns comprehensive system health status across all core QDS components.
    Does not expose private credentials.
    """
    has_key = ai_analyst.get_api_key() is not None
    analytics_summary = analytics_engine.get_aggregated_metrics()
    return {
        "status": "online",
        "service": "QDS Security Lab Core (Phase 3E SOC Demo Engine)",
        "has_active_baseline": detector.active_baseline is not None,
        "active_simulation_mode": detector.active_baseline.simulation_mode if detector.active_baseline else "ideal",
        "ai_analyst_configured": has_key,
        "components": {
            "quantum_engine": {
                "status": "OPERATIONAL",
                "mode": detector.active_baseline.simulation_mode if detector.active_baseline else "ideal",
                "description": "AerSimulator / Statevector teleportation verification engine with controlled noise models"
            },
            "threat_detector": {
                "status": "ACTIVE",
                "description": "Exact Binomial Hypothesis Test, TVD, Standardized Z-Score with Sigma Calibration"
            },
            "analytics_engine": {
                "status": "TRACKING",
                "total_events_tracked": analytics_summary.get("total_attempts", 0),
                "detection_rate": analytics_summary.get("detection_rate", 0.0)
            },
            "audit_log": {
                "status": "PERSISTENT",
                "storage": "SQLite Database (security_events table active)"
            },
            "ai_analyst": {
                "status": "CONNECTED" if has_key else "FALLBACK",
                "provider": f"Groq Cloud AI ({ai_analyst.model_name})" if has_key else "Deterministic Fallback Security Analyst",
                "configured": has_key
            }
        }
    }

@app.post("/api/calibrate", response_model=BaselineCalibrationData)
def calibrate_baseline(req: CalibrationRequest):
    try:
        baseline = detector.calibrate_baseline(
            engine=quantum_engine,
            runs=req.runs,
            shots=req.shots,
            baseline_noise=req.baseline_noise,
            theta=req.theta,
            phi=req.phi,
            simulation_mode=req.simulation_mode,
        )
        return baseline
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calibration error: {str(e)}")

@app.get("/api/baseline", response_model=BaselineCalibrationData)
def get_current_baseline():
    if detector.active_baseline is None:
        raise HTTPException(status_code=404, detail="No baseline calibrated yet.")
    return detector.active_baseline

@app.get("/api/signers")
def list_signers():
    return security_manager.get_registered_signers()

@app.get("/api/signatures")
def list_signatures():
    return security_manager.get_recent_signatures()

@app.post("/api/reset_replay_store")
def reset_replay_store():
    security_manager.reset_signature_store()
    return {"status": "success", "message": "Replay signature store reset."}

# =============================================================================
# PHASE 3C: SECURITY AUDIT LOG ENDPOINTS
# =============================================================================

@app.get("/api/security-events")
def list_security_events(
    verdict: Optional[str] = Query(None, description="Filter by verdict (SAFE, SUSPICIOUS, ATTACK DETECTED)"),
    attack_type: Optional[str] = Query(None, description="Filter by attack type"),
    simulation_mode: Optional[str] = Query(None, description="Filter by simulation mode (ideal, realistic_noise)"),
    signer_id: Optional[str] = Query(None, description="Filter by signer identity"),
    start_time: Optional[str] = Query(None, description="Filter by start ISO timestamp"),
    end_time: Optional[str] = Query(None, description="Filter by end ISO timestamp"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    Returns persistent security audit log events stored in SQLite.
    Supports filtering and pagination.
    """
    return security_manager.get_security_events(
        verdict=verdict,
        attack_type=attack_type,
        simulation_mode=simulation_mode,
        signer_id=signer_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset,
    )

@app.get("/api/security-events/{event_id}")
def get_security_event(event_id: str):
    """Returns complete details of a single security audit event."""
    event = security_manager.get_security_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Security event '{event_id}' not found.")
    return event

@app.post("/api/security-events/reset")
def reset_security_events():
    """
    Demo/dev reset operation to clear security audit events.
    Leaves signer credentials and registry intact.
    """
    security_manager.reset_security_events()
    return {"status": "success", "message": "Security audit events cleared."}

# =============================================================================
# PHASE 3D: AI SECURITY ANALYST ENDPOINTS
# =============================================================================

@app.post("/api/ai/analyze", response_model=AIAnalysisResponse)
def analyze_with_ai(evidence: SecurityEvidencePayload):
    """
    Generates human-readable explanation and SOC recommendations from structured evidence.
    AI is strictly an analyst-assistance layer and CANNOT alter the deterministic verdict.
    """
    return ai_analyst.analyze_incident(evidence)

# =============================================================================
# SECURITY ANALYTICS ENDPOINTS
# =============================================================================

@app.get("/api/analytics")
def get_analytics(simulation_mode: Optional[str] = Query(None, description="'ideal' or 'realistic_noise'")):
    """
    Returns aggregated security analytics metrics and confusion matrix data
    from actual session events.
    """
    return analytics_engine.get_aggregated_metrics(simulation_mode=simulation_mode)

@app.post("/api/analytics/reset")
def reset_analytics():
    """Resets in-memory session analytics metrics."""
    analytics_engine.reset()
    return {"status": "success", "message": "Session analytics store reset."}

@app.post("/api/analytics/sweep")
def run_sweep(
    simulation_mode: str = Query("ideal", description="'ideal' or 'realistic_noise'"),
    shots: int = Query(1000, ge=100, le=5000),
    repetitions: int = Query(3, ge=1, le=10),
):
    """
    Executes live controlled parameter sweeps (QBER vs Attack Strength)
    for Channel Manipulation and Signature Forgery.
    """
    active_baseline = detector.active_baseline
    if active_baseline is None or active_baseline.simulation_mode != simulation_mode:
        active_baseline = detector.calibrate_baseline(quantum_engine, simulation_mode=simulation_mode)

    sweep_results = run_parameter_sweep(
        engine=quantum_engine,
        detector=detector,
        baseline=active_baseline,
        simulation_mode=simulation_mode,
        shots=shots,
        repetitions=repetitions,
    )
    return sweep_results

# =============================================================================
# PHASE 3E: FULL SECURITY DEMO RUNNER
# =============================================================================

class DemoRunRequest(BaseModel):
    simulation_mode: str = "ideal"
    shots: int = 1000

@app.post("/api/demo/run")
def run_full_security_demo(req: Optional[DemoRunRequest] = None):
    """
    Executes the full 5-step Security Operations Demo across the authoritative pipeline:
    1. Clean Transaction (SAFE)
    2. Quantum Channel Manipulation (ATTACK DETECTED)
    3. Quantum Signature Forgery (ATTACK DETECTED)
    4. Cryptographic Replay Attack (ATTACK DETECTED)
    5. Signer Impersonation (ATTACK DETECTED)
    
    Each step runs through the actual simulation and verification pipeline,
    creating persistent SQLite audit events and updating live analytics.
    """
    mode = req.simulation_mode if req else "ideal"
    shots_cnt = req.shots if req else 1000

    results = []

    # 1. Clean Transaction
    clean_req = SimulationRequest(
        attack_type="none",
        shots=shots_cnt,
        simulation_mode=mode,
        signer_id="alice_authorized",
        certificate_id="CERT-QDS-2026-ALICE-ROOT"
    )
    step1 = simulate_and_verify(clean_req)
    clean_sig_id = step1.classical_checks["signature_id"]
    clean_nonce = step1.classical_checks["nonce"]
    clean_sess = step1.classical_checks["session_id"]
    results.append({
        "step": 1,
        "scenario": "Clean Transaction",
        "attack_type": "none",
        "expected_verdict": "SAFE",
        "actual_verdict": step1.verdict,
        "action": step1.verdict == "SAFE" and "ACCEPT" or "REJECT",
        "threat_level": step1.threat_level,
        "qber": step1.detection.observed_qber if step1.detection else None,
        "p_value": step1.detection.p_value if step1.detection else None,
        "z_score": step1.detection.z_score if step1.detection else None,
        "primary_reason": step1.primary_reason,
        "signature_id": clean_sig_id,
        "nonce": clean_nonce,
        "simulation_mode": mode
    })

    # 2. Quantum Channel Manipulation
    ch_req = SimulationRequest(
        attack_type="channel_manipulation",
        attack_strength=0.60,
        shots=shots_cnt,
        simulation_mode=mode,
        signer_id="alice_authorized",
        certificate_id="CERT-QDS-2026-ALICE-ROOT"
    )
    step2 = simulate_and_verify(ch_req)
    results.append({
        "step": 2,
        "scenario": "Quantum Channel Manipulation",
        "attack_type": "channel_manipulation",
        "expected_verdict": "ATTACK DETECTED",
        "actual_verdict": step2.verdict,
        "action": "REJECT",
        "threat_level": step2.threat_level,
        "qber": step2.detection.observed_qber if step2.detection else None,
        "p_value": step2.detection.p_value if step2.detection else None,
        "z_score": step2.detection.z_score if step2.detection else None,
        "primary_reason": step2.primary_reason,
        "signature_id": step2.classical_checks["signature_id"],
        "nonce": step2.classical_checks["nonce"],
        "simulation_mode": mode
    })

    # 3. Quantum Signature Forgery
    forg_req = SimulationRequest(
        attack_type="signature_forgery",
        forgery_delta_theta=1.570796,  # pi/2
        forgery_delta_phi=1.570796,
        shots=shots_cnt,
        simulation_mode=mode,
        signer_id="alice_authorized",
        certificate_id="CERT-QDS-2026-ALICE-ROOT"
    )
    step3 = simulate_and_verify(forg_req)
    results.append({
        "step": 3,
        "scenario": "Signature Forgery Attack",
        "attack_type": "signature_forgery",
        "expected_verdict": "ATTACK DETECTED",
        "actual_verdict": step3.verdict,
        "action": "REJECT",
        "threat_level": step3.threat_level,
        "qber": step3.detection.observed_qber if step3.detection else None,
        "p_value": step3.detection.p_value if step3.detection else None,
        "z_score": step3.detection.z_score if step3.detection else None,
        "primary_reason": step3.primary_reason,
        "signature_id": step3.classical_checks["signature_id"],
        "nonce": step3.classical_checks["nonce"],
        "simulation_mode": mode
    })

    # 4. Cryptographic Replay Attack (Targeting the clean token from Step 1)
    replay_req = SimulationRequest(
        attack_type="replay_attack",
        signature_id=clean_sig_id,
        nonce=clean_nonce,
        session_id=clean_sess,
        shots=shots_cnt,
        simulation_mode=mode,
        signer_id="alice_authorized"
    )
    step4 = simulate_and_verify(replay_req)
    results.append({
        "step": 4,
        "scenario": "Cryptographic Replay Attack",
        "attack_type": "replay_attack",
        "expected_verdict": "ATTACK DETECTED",
        "actual_verdict": step4.verdict,
        "action": "REJECT",
        "threat_level": step4.threat_level,
        "qber": None,
        "p_value": None,
        "z_score": None,
        "primary_reason": step4.primary_reason,
        "signature_id": clean_sig_id,
        "nonce": clean_nonce,
        "simulation_mode": mode
    })

    # 5. Signer Impersonation Attack
    imp_req = SimulationRequest(
        attack_type="signer_impersonation",
        signer_id="mallory_unauthorized",
        certificate_id="CERT-FORGED-SPOOFED-2026",
        shots=shots_cnt,
        simulation_mode=mode
    )
    step5 = simulate_and_verify(imp_req)
    results.append({
        "step": 5,
        "scenario": "Signer Impersonation Attack",
        "attack_type": "signer_impersonation",
        "expected_verdict": "ATTACK DETECTED",
        "actual_verdict": step5.verdict,
        "action": "REJECT",
        "threat_level": step5.threat_level,
        "qber": None,
        "p_value": None,
        "z_score": None,
        "primary_reason": step5.primary_reason,
        "signature_id": step5.classical_checks["signature_id"],
        "nonce": step5.classical_checks["nonce"],
        "simulation_mode": mode
    })

    safe_count = sum(1 for r in results if r["actual_verdict"] == "SAFE")
    attacks_count = sum(1 for r in results if r["actual_verdict"] == "ATTACK DETECTED")

    return {
        "status": "success",
        "simulation_mode": mode,
        "total_steps": len(results),
        "steps": results,
        "summary": {
            "safe_count": safe_count,
            "attacks_detected_count": attacks_count,
            "clean_passed": results[0]["actual_verdict"] == "SAFE",
            "all_attacks_blocked": all(r["actual_verdict"] == "ATTACK DETECTED" for r in results[1:]),
            "detection_accuracy": 1.0 if (results[0]["actual_verdict"] == "SAFE" and all(r["actual_verdict"] == "ATTACK DETECTED" for r in results[1:])) else (attacks_count / 4.0)
        }
    }

# =============================================================================
# PHASE 3E: SECURITY REPORT EXPORT ENDPOINT
# =============================================================================

@app.get("/api/reports/export")
def export_security_report(
    format: str = Query("json", description="'json' or 'csv'"),
    simulation_mode: Optional[str] = Query(None, description="'ideal' or 'realistic_noise'"),
):
    """
    Exports structured SOC Security Report in JSON or CSV format.
    Includes executive KPI metrics, confusion matrix, and complete persistent audit event records.
    """
    events_data = security_manager.get_security_events(
        simulation_mode=simulation_mode,
        limit=200
    )
    events = events_data.get("events", [])
    analytics_summary = analytics_engine.get_aggregated_metrics(simulation_mode=simulation_mode)

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Event ID", "Timestamp (UTC)", "Scenario", "Detected Attack Type",
            "Verdict", "Action", "Signer ID", "Signature ID", "Nonce",
            "Observed QBER", "Baseline QBER", "TVD", "Exact p-value", "Z-score",
            "Simulation Mode", "Diagnostic Reason"
        ])
        for ev in events:
            writer.writerow([
                ev.get("event_id", ""),
                ev.get("timestamp", ""),
                ev.get("scenario", ""),
                ev.get("attack_type", ""),
                ev.get("verdict", ""),
                ev.get("action", ""),
                ev.get("signer_id", ""),
                ev.get("signature_id", ""),
                ev.get("nonce", ""),
                f"{ev.get('qber')*100:.2f}%" if ev.get("qber") is not None else "",
                f"{ev.get('baseline_qber')*100:.4f}%" if ev.get("baseline_qber") is not None else "",
                f"{ev.get('tvd'):.4f}" if ev.get("tvd") is not None else "",
                f"{ev.get('p_value'):.6f}" if ev.get("p_value") is not None else "",
                f"{ev.get('z_score'):.2f}" if ev.get("z_score") is not None else "",
                ev.get("simulation_mode", ""),
                ev.get("reason", "").replace("\n", " "),
            ])
        csv_content = output.getvalue()
        filename = f"qds_security_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    # JSON export
    cm = analytics_summary.get("classification_metrics", {})
    report_payload = {
        "report_title": "Quantum Digital Signature (QDS) SOC Incident & Security Audit Report",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "filter_simulation_mode": simulation_mode or "all",
        "system_health": {
            "quantum_engine": "OPERATIONAL",
            "statistical_detector": "ACTIVE",
            "analytics_engine": "TRACKING",
            "audit_storage": "SQLite Persistent",
            "ai_analyst": "CONNECTED" if ai_analyst.get_api_key() else "FALLBACK",
        },
        "executive_summary": {
            "total_verifications": analytics_summary.get("total_attempts", 0),
            "safe_transactions": analytics_summary.get("safe_count", 0),
            "suspicious_transactions": analytics_summary.get("suspicious_count", 0),
            "attacks_blocked": analytics_summary.get("attack_detected_count", 0),
            "threat_detection_rate": analytics_summary.get("detection_rate", 0.0),
            "average_qber": analytics_summary.get("average_qber", 0.0),
            "precision": cm.get("precision", 0.0),
            "recall": cm.get("recall", 0.0),
            "false_positive_rate": cm.get("false_positive_rate", 0.0),
            "false_negative_rate": cm.get("false_negative_rate", 0.0),
        },
        "confusion_matrix": {
            "true_positives": cm.get("true_positives", 0),
            "false_positives": cm.get("false_positives", 0),
            "true_negatives": cm.get("true_negatives", 0),
            "false_negatives": cm.get("false_negatives", 0),
        },
        "attack_type_distribution": analytics_summary.get("attack_type_distribution", {}),
        "audit_log_events_count": len(events),
        "audit_log_events": events
    }
    return report_payload

# =============================================================================
# UNIFIED SIMULATION & SECURITY VERIFICATION
# =============================================================================

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_and_verify(req: SimulationRequest):
    """
    Unified QDS Security Verification Engine.
    Executes Classical Security Checks (Impersonation, Replay) followed by
    Quantum Simulation (Ideal / Realistic Noise) & Exact Binomial Statistical Threat Detection.
    Generates exactly ONE persistent SQLite Security Audit Event per verification attempt.
    """
    active_baseline = req.custom_baseline or detector.active_baseline
    if active_baseline is None:
        active_baseline = detector.calibrate_baseline(quantum_engine, simulation_mode=req.simulation_mode)

    event_id = f"EVT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    ts_now = datetime.utcnow().isoformat() + "Z"

    # Token Resolution & Generation
    if req.attack_type == "replay_attack":
        if req.signature_id and req.nonce:
            sig_id = req.signature_id
            nonce_val = req.nonce
            sess_id = req.session_id or f"SESS-{uuid.uuid4().hex[:6].upper()}"
        else:
            recent = security_manager.get_recent_signatures(limit=1)
            if recent:
                sig_id = recent[0]["signature_id"]
                nonce_val = recent[0]["nonce"]
                sess_id = recent[0]["session_id"]
            else:
                sig_id = f"SIG-PRIOR-{uuid.uuid4().hex[:6].upper()}"
                nonce_val = f"NONCE-PRIOR-{uuid.uuid4().hex[:6].upper()}"
                sess_id = f"SESS-PRIOR-{uuid.uuid4().hex[:6].upper()}"
                security_manager.record_verified_signature(
                    signature_id=sig_id,
                    nonce=nonce_val,
                    session_id=sess_id,
                    signer_id=req.signer_id,
                    message_digest="hash-prior-001",
                    status="PRIOR_VERIFIED_SIGNATURE"
                )
    else:
        sig_id = req.signature_id or f"SIG-{uuid.uuid4().hex[:8].upper()}"
        nonce_val = req.nonce or f"NONCE-{uuid.uuid4().hex[:8].upper()}"
        sess_id = req.session_id or f"SESS-{uuid.uuid4().hex[:8].upper()}"

    msg_text = req.message or "Default QDS Transaction"
    msg_hash = hashlib.sha256(msg_text.encode()).hexdigest()[:16]

    classical_status = {
        "identity_passed": True,
        "replay_passed": True,
        "signer_id": req.signer_id,
        "claimed_certificate": req.certificate_id,
        "signature_id": sig_id,
        "nonce": nonce_val,
        "session_id": sess_id,
        "details": "All classical security checks passed."
    }

    # =========================================================================
    # 1. CLASSICAL SECURITY CHECK: SIGNER IMPERSONATION
    # =========================================================================
    if req.attack_type == "signer_impersonation":
        id_valid, id_reason, _ = security_manager.verify_signer_identity(
            signer_id=req.signer_id if req.signer_id != "alice_authorized" else "mallory_unauthorized",
            claimed_certificate_id="CERT-SPOOFED-FAKE-2026",
        )
    else:
        id_valid, id_reason, _ = security_manager.verify_signer_identity(
            signer_id=req.signer_id,
            claimed_certificate_id=req.certificate_id,
        )

    if not id_valid:
        classical_status["identity_passed"] = False
        classical_status["details"] = id_reason
        
        # 1. Persistent SQLite Audit Record
        security_manager.record_security_event(
            event_id=event_id,
            timestamp=ts_now,
            scenario=req.attack_type,
            attack_type="signer_impersonation",
            verdict="ATTACK DETECTED",
            signer_id=req.signer_id,
            signature_id=sig_id,
            session_id=sess_id,
            nonce=nonce_val,
            reason=id_reason,
            action="REJECT",
            simulation_mode=req.simulation_mode,
            baseline_qber=active_baseline.baseline_error_mean,
        )

        # 2. In-Memory Session Analytics Record
        analytics_engine.record_event(SessionEventRecord(
            event_id=event_id,
            timestamp=ts_now,
            simulation_mode=req.simulation_mode,
            ground_truth_attack=req.attack_type,
            attack_strength=req.attack_strength,
            detected_verdict="ATTACK DETECTED",
            detected_attack_type="signer_impersonation",
            threat_level="CRITICAL",
            is_valid=False,
            observed_qber=None,
            baseline_qber=active_baseline.baseline_error_mean,
            tvd=None,
            p_value=None,
            z_score=None,
            signer_id=req.signer_id,
            signature_id=sig_id,
            nonce=nonce_val,
            reason=id_reason,
        ))

        return SimulationResponse(
            measurement=None,
            detection=None,
            baseline=active_baseline,
            attack_applied={"type": "signer_impersonation", "strength": 1.0},
            is_valid=False,
            verdict="ATTACK DETECTED",
            attack_type="signer_impersonation",
            threat_level="CRITICAL",
            primary_reason=id_reason,
            simulation_mode=req.simulation_mode,
            classical_checks=classical_status,
        )

    # =========================================================================
    # 2. CLASSICAL SECURITY CHECK: REPLAY ATTACK DETECTION
    # =========================================================================
    if req.attack_type == "replay_attack":
        recent_matches = [s for s in security_manager.get_recent_signatures(100) if s["signature_id"] == sig_id or s["nonce"] == nonce_val]
        if not recent_matches:
            security_manager.record_verified_signature(
                signature_id=sig_id,
                nonce=nonce_val,
                session_id=sess_id,
                signer_id=req.signer_id,
                message_digest=msg_hash,
                status="PRIOR_VERIFIED_SIGNATURE",
            )
        
        replay_ok, replay_reason = security_manager.check_replay_protection(
            signature_id=sig_id,
            nonce=nonce_val,
        )
    else:
        replay_ok, replay_reason = security_manager.check_replay_protection(
            signature_id=sig_id,
            nonce=nonce_val,
        )

    if not replay_ok:
        classical_status["replay_passed"] = False
        classical_status["details"] = replay_reason

        # 1. Persistent SQLite Audit Record
        security_manager.record_security_event(
            event_id=event_id,
            timestamp=ts_now,
            scenario=req.attack_type,
            attack_type="replay_attack",
            verdict="ATTACK DETECTED",
            signer_id=req.signer_id,
            signature_id=sig_id,
            session_id=sess_id,
            nonce=nonce_val,
            reason=replay_reason,
            action="REJECT",
            simulation_mode=req.simulation_mode,
            baseline_qber=active_baseline.baseline_error_mean,
        )

        # 2. In-Memory Session Analytics Record
        analytics_engine.record_event(SessionEventRecord(
            event_id=event_id,
            timestamp=ts_now,
            simulation_mode=req.simulation_mode,
            ground_truth_attack=req.attack_type,
            attack_strength=req.attack_strength,
            detected_verdict="ATTACK DETECTED",
            detected_attack_type="replay_attack",
            threat_level="CRITICAL",
            is_valid=False,
            observed_qber=None,
            baseline_qber=active_baseline.baseline_error_mean,
            tvd=None,
            p_value=None,
            z_score=None,
            signer_id=req.signer_id,
            signature_id=sig_id,
            nonce=nonce_val,
            reason=replay_reason,
        ))

        return SimulationResponse(
            measurement=None,
            detection=None,
            baseline=active_baseline,
            attack_applied={"type": "replay_attack", "strength": 1.0},
            is_valid=False,
            verdict="ATTACK DETECTED",
            attack_type="replay_attack",
            threat_level="CRITICAL",
            primary_reason=replay_reason,
            simulation_mode=req.simulation_mode,
            classical_checks=classical_status,
        )

    # =========================================================================
    # 3. QUANTUM VERIFICATION & STATISTICAL THREAT DETECTION
    # =========================================================================
    delta_th = req.forgery_delta_theta
    delta_ph = req.forgery_delta_phi
    if req.attack_type == "signature_forgery" and delta_th == 0.0:
        delta_th = req.attack_strength * np.pi * 0.5
        delta_ph = req.attack_strength * np.pi * 0.5

    measurement = quantum_engine.run_simulation(
        theta=req.theta,
        phi=req.phi,
        attack_type=req.attack_type,
        attack_strength=req.attack_strength,
        baseline_noise=req.baseline_noise or 0.015,
        shots=req.shots,
        forgery_delta_theta=delta_th,
        forgery_delta_phi=delta_ph,
        simulation_mode=req.simulation_mode,
    )

    detection = detector.analyze_measurement(
        measurement_data=measurement,
        baseline=active_baseline,
    )

    # Determine unified security verdict & action
    if detection.verdict == "ATTACK DETECTED":
        is_valid = False
        threat_level = "CRITICAL"
        verdict = "ATTACK DETECTED"
        action = "REJECT"
        if req.attack_type == "signature_forgery":
            attack_identified = "signature_forgery"
            primary_reason = (
                f"SIGNATURE FORGERY DETECTED: Forged quantum state perturbation (delta_theta = {delta_th:.2f} rad) "
                f"induced anomalous verification error QBER {detection.observed_qber:.2%} (Exact p <= 0.001, Z = {detection.z_score:.2f})."
            )
        elif req.attack_type == "channel_manipulation":
            attack_identified = "channel_manipulation"
            primary_reason = (
                f"QUANTUM CHANNEL MANIPULATION DETECTED: Channel disturbance (strength = {req.attack_strength*100:.0f}%) "
                f"elevated QBER to {detection.observed_qber:.2%} exceeding attack threshold {detection.threshold_attack:.2%}."
            )
        else:
            attack_identified = "anomalous_quantum_noise"
            primary_reason = f"UNEXPECTED QUANTUM ANOMALY: QBER {detection.observed_qber:.2%} exceeds baseline limits."
    elif detection.verdict == "SUSPICIOUS":
        is_valid = False
        threat_level = "ELEVATED"
        verdict = "SUSPICIOUS"
        action = "FLAG_FOR_REVIEW"
        attack_identified = req.attack_type if req.attack_type != "none" else "mild_channel_noise"
        primary_reason = (
            f"SUSPICIOUS CHANNEL ACTIVITY: Observed QBER {detection.observed_qber:.2%} is elevated above normal "
            f"baseline variance ({detection.threshold_safe:.2%}), but below definitive attack threshold."
        )
    else:
        is_valid = True
        threat_level = "LOW"
        verdict = "SAFE"
        action = "ACCEPT"
        attack_identified = "none"
        primary_reason = (
            f"VALID SIGNATURE ACCEPTED: Classical credentials verified and quantum verification state "
            f"matches expected signature (QBER = {detection.observed_qber:.2%}, Exact p = {detection.p_value:.4f} > 0.05)."
        )
        security_manager.record_verified_signature(
            signature_id=sig_id,
            nonce=nonce_val,
            session_id=sess_id,
            signer_id=req.signer_id,
            message_digest=msg_hash,
            status="ACCEPTED",
        )

    # 1. Persistent SQLite Audit Record
    security_manager.record_security_event(
        event_id=event_id,
        timestamp=ts_now,
        scenario=req.attack_type,
        attack_type=attack_identified,
        verdict=verdict,
        signer_id=req.signer_id,
        signature_id=sig_id,
        session_id=sess_id,
        nonce=nonce_val,
        reason=primary_reason,
        action=action,
        simulation_mode=req.simulation_mode,
        qber=detection.observed_qber,
        baseline_qber=detection.baseline_qber,
        tvd=detection.total_variation_distance,
        p_value=detection.p_value,
        z_score=detection.z_score,
    )

    # 2. In-Memory Session Analytics Record
    analytics_engine.record_event(SessionEventRecord(
        event_id=event_id,
        timestamp=ts_now,
        simulation_mode=req.simulation_mode,
        ground_truth_attack=req.attack_type,
        attack_strength=req.attack_strength,
        detected_verdict=verdict,
        detected_attack_type=attack_identified,
        threat_level=threat_level,
        is_valid=is_valid,
        observed_qber=detection.observed_qber,
        baseline_qber=detection.baseline_qber,
        tvd=detection.total_variation_distance,
        p_value=detection.p_value,
        z_score=detection.z_score,
        signer_id=req.signer_id,
        signature_id=sig_id,
        nonce=nonce_val,
        reason=primary_reason,
    ))

    return SimulationResponse(
        measurement=measurement,
        detection=detection,
        baseline=active_baseline,
        attack_applied={
            "type": req.attack_type,
            "strength": req.attack_strength,
            "forgery_delta_theta": delta_th,
            "forgery_delta_phi": delta_ph,
        },
        is_valid=is_valid,
        verdict=verdict,
        attack_type=attack_identified,
        threat_level=threat_level,
        primary_reason=primary_reason,
        simulation_mode=req.simulation_mode,
        classical_checks=classical_status,
    )

# Mount static frontend build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend build index not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
