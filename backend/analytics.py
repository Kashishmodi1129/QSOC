import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class SessionEventRecord(BaseModel):
    event_id: str
    timestamp: str
    simulation_mode: str  # 'ideal' | 'realistic_noise'
    ground_truth_attack: str  # 'none', 'channel_manipulation', 'signature_forgery', 'replay_attack', 'signer_impersonation'
    attack_strength: float
    detected_verdict: str  # 'SAFE', 'SUSPICIOUS', 'ATTACK DETECTED'
    detected_attack_type: str
    threat_level: str
    is_valid: bool
    observed_qber: Optional[float] = None
    baseline_qber: Optional[float] = None
    tvd: Optional[float] = None
    p_value: Optional[float] = None
    z_score: Optional[float] = None
    signer_id: str
    signature_id: str
    nonce: str
    reason: str

class AnalyticsEngine:
    """
    In-memory experiment session analytics engine for QDS Security Lab.
    Aggregates deterministic security verifications and calculates controlled
    simulation classification metrics without ML or fabrication.
    """

    def __init__(self):
        self.events: List[SessionEventRecord] = []

    def record_event(self, event: SessionEventRecord):
        self.events.append(event)

    def reset(self):
        self.events.clear()

    def get_aggregated_metrics(self, simulation_mode: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates aggregate statistics and confusion matrix metrics for the recorded session.
        If simulation_mode is provided ('ideal' or 'realistic_noise'), filters strictly by that mode.
        """
        filtered = self.events
        if simulation_mode:
            filtered = [e for e in self.events if e.simulation_mode == simulation_mode]

        total_attempts = len(filtered)
        if total_attempts == 0:
            return {
                "total_attempts": 0,
                "safe_count": 0,
                "suspicious_count": 0,
                "attack_detected_count": 0,
                "detection_rate": 0.0,
                "verdict_distribution": {"SAFE": 0, "SUSPICIOUS": 0, "ATTACK DETECTED": 0},
                "attack_type_distribution": {
                    "none": 0,
                    "channel_manipulation": 0,
                    "signature_forgery": 0,
                    "replay_attack": 0,
                    "signer_impersonation": 0
                },
                "simulation_mode_distribution": {"ideal": 0, "realistic_noise": 0},
                "average_qber": 0.0,
                "min_qber": 0.0,
                "max_qber": 0.0,
                "average_tvd": 0.0,
                "average_p_value": 0.0,
                "average_qber_by_attack_type": {},
                "classification_metrics": {
                    "true_positives": 0,
                    "false_positives": 0,
                    "true_negatives": 0,
                    "false_negatives": 0,
                    "precision": 0.0,
                    "recall": 0.0,
                    "false_positive_rate": 0.0,
                    "false_negative_rate": 0.0,
                    "disclaimer": "Controlled Simulation Metrics (Not Real-World Security Guarantees)"
                },
                "recent_events_count": 0,
            }

        # 1. Verdict & Mode Counts
        safe_cnt = sum(1 for e in filtered if e.detected_verdict == "SAFE")
        susp_cnt = sum(1 for e in filtered if e.detected_verdict == "SUSPICIOUS")
        attk_cnt = sum(1 for e in filtered if e.detected_verdict == "ATTACK DETECTED")

        ideal_cnt = sum(1 for e in filtered if e.simulation_mode == "ideal")
        noise_cnt = sum(1 for e in filtered if e.simulation_mode == "realistic_noise")

        # 2. Attack Type Distribution
        attk_dist: Dict[str, int] = {
            "none": 0,
            "channel_manipulation": 0,
            "signature_forgery": 0,
            "replay_attack": 0,
            "signer_impersonation": 0
        }
        for e in filtered:
            gt = e.ground_truth_attack
            attk_dist[gt] = attk_dist.get(gt, 0) + 1

        # 3. QBER, TVD, p-value statistics (from events with quantum measurement)
        qber_events = [e for e in filtered if e.observed_qber is not None]
        if qber_events:
            qbers = [e.observed_qber for e in qber_events]
            tvds = [e.tvd for e in qber_events if e.tvd is not None]
            pvals = [e.p_value for e in qber_events if e.p_value is not None]
            
            avg_qber = float(np.mean(qbers))
            min_qber = float(np.min(qbers))
            max_qber = float(np.max(qbers))
            avg_tvd = float(np.mean(tvds)) if tvds else 0.0
            avg_pval = float(np.mean(pvals)) if pvals else 0.0

            # Average QBER by attack type
            avg_qber_by_type: Dict[str, float] = {}
            for atype in ["none", "channel_manipulation", "signature_forgery"]:
                sub = [e.observed_qber for e in qber_events if e.ground_truth_attack == atype]
                if sub:
                    avg_qber_by_type[atype] = round(float(np.mean(sub)), 4)
        else:
            avg_qber, min_qber, max_qber, avg_tvd, avg_pval = 0.0, 0.0, 0.0, 0.0, 0.0
            avg_qber_by_type = {}

        # 4. Ground-Truth Classification Metrics
        # Positive = Attack Present (ground_truth != 'none')
        # Negative = Clean (ground_truth == 'none')
        # Predicted Positive = 'ATTACK DETECTED'
        # Predicted Negative = 'SAFE'
        tp = sum(1 for e in filtered if e.ground_truth_attack != "none" and e.detected_verdict == "ATTACK DETECTED")
        fp = sum(1 for e in filtered if e.ground_truth_attack == "none" and e.detected_verdict == "ATTACK DETECTED")
        tn = sum(1 for e in filtered if e.ground_truth_attack == "none" and e.detected_verdict == "SAFE")
        fn = sum(1 for e in filtered if e.ground_truth_attack != "none" and e.detected_verdict == "SAFE")

        total_attacks = sum(1 for e in filtered if e.ground_truth_attack != "none")
        detection_rate = float(tp / total_attacks) if total_attacks > 0 else 0.0

        precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

        return {
            "total_attempts": total_attempts,
            "safe_count": safe_cnt,
            "suspicious_count": susp_cnt,
            "attack_detected_count": attk_cnt,
            "detection_rate": round(detection_rate, 4),
            "verdict_distribution": {
                "SAFE": safe_cnt,
                "SUSPICIOUS": susp_cnt,
                "ATTACK DETECTED": attk_cnt
            },
            "attack_type_distribution": attk_dist,
            "simulation_mode_distribution": {
                "ideal": ideal_cnt,
                "realistic_noise": noise_cnt
            },
            "average_qber": round(avg_qber, 6),
            "min_qber": round(min_qber, 6),
            "max_qber": round(max_qber, 6),
            "average_tvd": round(avg_tvd, 6),
            "average_p_value": round(avg_pval, 6),
            "average_qber_by_attack_type": avg_qber_by_type,
            "classification_metrics": {
                "true_positives": tp,
                "false_positives": fp,
                "true_negatives": tn,
                "false_negatives": fn,
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "false_positive_rate": round(fpr, 4),
                "false_negative_rate": round(fnr, 4),
                "disclaimer": "Controlled Simulation Metrics (Not Real-World Security Guarantees)"
            },
            "recent_events_count": len(filtered),
        }

def run_parameter_sweep(
    engine: Any,
    detector: Any,
    baseline: Any,
    simulation_mode: str = "ideal",
    shots: int = 1000,
    repetitions: int = 3,
) -> Dict[str, Any]:
    """
    Executes controlled live parameter sweeps for QBER vs Attack Strength.
    Generates actual simulation data across 0% to 100% attack strengths.
    """
    strengths = [0.0, 0.10, 0.25, 0.50, 0.75, 1.00]
    channel_points = []
    forgery_points = []

    for s in strengths:
        # 1. Channel Manipulation Sweep
        chan_qbers = []
        chan_tvds = []
        chan_pvals = []
        chan_attacks = 0

        for _ in range(repetitions):
            sim = engine.run_simulation(
                shots=shots,
                attack_type="none" if s == 0.0 else "channel_manipulation",
                attack_strength=s,
                baseline_noise=baseline.baseline_error_mean if baseline else 0.015,
                simulation_mode=simulation_mode,
            )
            det = detector.analyze_measurement(sim, baseline)
            chan_qbers.append(det.observed_qber)
            chan_tvds.append(det.total_variation_distance)
            chan_pvals.append(det.p_value)
            if det.verdict == "ATTACK DETECTED":
                chan_attacks += 1

        channel_points.append({
            "strength": s,
            "strength_pct": int(s * 100),
            "mean_qber": round(float(np.mean(chan_qbers)), 4),
            "std_qber": round(float(np.std(chan_qbers)), 4),
            "mean_tvd": round(float(np.mean(chan_tvds)), 4),
            "p_value": round(float(np.mean(chan_pvals)), 6),
            "detection_rate": round(float(chan_attacks / repetitions), 4),
        })

        # 2. Signature Forgery Sweep
        forge_qbers = []
        forge_tvds = []
        forge_pvals = []
        forge_attacks = 0
        delta_th = s * np.pi * 0.5

        for _ in range(repetitions):
            sim = engine.run_simulation(
                shots=shots,
                attack_type="none" if s == 0.0 else "signature_forgery",
                attack_strength=s,
                forgery_delta_theta=delta_th,
                baseline_noise=baseline.baseline_error_mean if baseline else 0.015,
                simulation_mode=simulation_mode,
            )
            det = detector.analyze_measurement(sim, baseline)
            forge_qbers.append(det.observed_qber)
            forge_tvds.append(det.total_variation_distance)
            forge_pvals.append(det.p_value)
            if det.verdict == "ATTACK DETECTED":
                forge_attacks += 1

        forgery_points.append({
            "strength": s,
            "strength_pct": int(s * 100),
            "delta_theta_rad": round(delta_th, 4),
            "mean_qber": round(float(np.mean(forge_qbers)), 4),
            "std_qber": round(float(np.std(forge_qbers)), 4),
            "mean_tvd": round(float(np.mean(forge_tvds)), 4),
            "p_value": round(float(np.mean(forge_pvals)), 6),
            "detection_rate": round(float(forge_attacks / repetitions), 4),
        })

    # Prepare combined chart-ready data points
    chart_series = []
    base_val = baseline.baseline_error_mean if baseline else 0.0
    for i, s in enumerate(strengths):
        chart_series.append({
            "strength": f"{int(s * 100)}%",
            "strength_val": s,
            "Baseline": round(base_val * 100, 2),
            "Channel_Manipulation_QBER": round(channel_points[i]["mean_qber"] * 100, 2),
            "Signature_Forgery_QBER": round(forgery_points[i]["mean_qber"] * 100, 2),
            "Channel_Std": round(channel_points[i]["std_qber"] * 100, 2),
            "Forgery_Std": round(forgery_points[i]["std_qber"] * 100, 2),
        })

    return {
        "strengths": strengths,
        "channel_manipulation": channel_points,
        "signature_forgery": forgery_points,
        "chart_series": chart_series,
        "baseline_reference": round(base_val, 6),
        "simulation_mode": simulation_mode,
        "shots_per_point": shots,
        "repetitions_per_point": repetitions,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
