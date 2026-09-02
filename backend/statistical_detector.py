import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional, List
from scipy import stats

from quantum_engine import QDSQuantumEngine
from models import BaselineCalibrationData, ThreatDetectionResult

class StatisticalThreatDetector:
    """
    Deterministic Statistical Threat Detection Engine for QDS Verification.
    
    STATISTICAL FOUNDATION & DESIGN JUSTIFICATION:
    ---------------------------------------------
    1. Binary Measurement Model:
       Verification errors on Bob's qubit follow a Binomial distribution:
           K ~ Binomial(N, p)
       where N is measurement shots and p is the error probability.

    2. Simulation Modes:
       - 'ideal': Noiseless circuit execution. Baseline p_0 ~ 0.0%.
       - 'realistic_noise': Aer NoiseModel with depolarizing & readout errors.
         Baseline p_0 is calibrated empirically (e.g. 2% - 6% error floor).

    3. Exact One-Sided Binomial Hypothesis Test:
       Null Hypothesis H_0: p <= p_0 vs Alternative H_1: p > p_0
       p-value = P(K >= k_obs | N, p_0) = sum_{j=k_obs}^N (N choose j) p_0^j (1 - p_0)^(N-j)
       Evaluated using scipy.stats.binom.sf(k_obs - 1, N, p_0).

    4. Total Variation Distance (TVD):
       TVD(P, Q) = 0.5 * sum_{k in {0,1}} |P(k) - Q(k)| = |e_obs - p_0|
       for binary verification distributions.

    5. Combined Standard Error & Z-Score:
       SE = sqrt( p_0(1 - p_0)/N + sigma_calib^2 )
       Z = (e_obs - p_0) / SE
    """

    def __init__(self):
        self.active_baseline: Optional[BaselineCalibrationData] = None

    def calibrate_baseline(
        self,
        engine: QDSQuantumEngine,
        runs: int = 5,
        shots: int = 1000,
        baseline_noise: float = 0.015,
        theta: float = np.pi / 3,
        phi: float = np.pi / 4,
        simulation_mode: str = "ideal",
    ) -> BaselineCalibrationData:
        """
        Calibrates the baseline error probability p_0 and empirical standard deviation
        across multiple clean simulation runs for the specified simulation_mode.
        """
        error_counts: List[int] = []
        error_rates: List[float] = []

        for _ in range(runs):
            sim_res = engine.run_simulation(
                theta=theta,
                phi=phi,
                attack_type="none",
                attack_strength=0.0,
                baseline_noise=baseline_noise,
                shots=shots,
                simulation_mode=simulation_mode,
            )
            k_err = sim_res["verif_1_count"]
            error_counts.append(k_err)
            error_rates.append(sim_res["observed_error_rate"])

        total_calib_shots = runs * shots
        total_calib_errors = sum(error_counts)

        # Baseline error probability estimation:
        if total_calib_errors == 0:
            p0 = 1.0 / (total_calib_shots + 2) # Laplace smoothing floor
        else:
            p0 = total_calib_errors / total_calib_shots

        # Inter-batch standard deviation across calibration runs
        sample_std = float(np.std(error_rates, ddof=1)) if runs > 1 else 0.0
        # Theoretical sampling error floor
        se_floor = float(np.sqrt(p0 * (1.0 - p0) / shots))
        effective_std = max(sample_std, se_floor, 0.001)

        distribution = {
            "0": round(1.0 - p0, 6),
            "1": round(p0, 6),
        }

        mode_label = "Realistic Noise (Aer NoiseModel)" if simulation_mode == "realistic_noise" else "Ideal (Noiseless Simulation)"
        baseline_data = BaselineCalibrationData(
            baseline_error_mean=round(p0, 6),
            baseline_error_std=round(effective_std, 6),
            baseline_distribution=distribution,
            shots_calibrated=shots,
            runs_count=runs,
            calibrated_at=datetime.utcnow().isoformat() + "Z",
            simulation_mode=simulation_mode,
            noise_model_used=f"{mode_label}: noise_level={baseline_noise:.3f} ({total_calib_errors}/{total_calib_shots} errors across {runs} runs)",
        )

        self.active_baseline = baseline_data
        return baseline_data

    def analyze_measurement(
        self,
        measurement_data: Dict[str, Any],
        baseline: Optional[BaselineCalibrationData] = None,
    ) -> ThreatDetectionResult:
        """
        Performs deterministic statistical threat detection using the Exact Binomial
        hypothesis test, Total Variation Distance, and Z-Score against the calibrated baseline.
        """
        if baseline is None:
            if self.active_baseline is None:
                baseline = BaselineCalibrationData(
                    baseline_error_mean=0.001,
                    baseline_error_std=0.002,
                    baseline_distribution={"0": 0.999, "1": 0.001},
                    shots_calibrated=1000,
                    runs_count=1,
                    calibrated_at=datetime.utcnow().isoformat() + "Z",
                    simulation_mode="ideal",
                    noise_model_used="Default initial baseline fallback",
                )
            else:
                baseline = self.active_baseline

        total_shots = measurement_data["total_shots"]
        verif_0 = measurement_data["verif_0_count"]
        verif_1 = measurement_data["verif_1_count"]
        
        obs_qber = float(verif_1 / total_shots) if total_shots > 0 else 0.0
        base_qber = baseline.baseline_error_mean
        base_std = baseline.baseline_error_std

        # 1. Error rate deviation & TVD
        deviation = obs_qber - base_qber
        tvd = abs(obs_qber - base_qber)

        # 2. Combined Standard Error & Standardized Z-Score
        binomial_var = (base_qber * (1.0 - base_qber)) / max(total_shots, 1)
        total_se = float(np.sqrt(binomial_var + (base_std ** 2)))
        total_se = max(total_se, 1e-6)
        z_score = float((obs_qber - base_qber) / total_se)

        # 3. Exact Binomial Hypothesis Test
        if verif_1 == 0:
            p_value = 1.0
        else:
            p_value = float(stats.binom.sf(verif_1 - 1, total_shots, base_qber))

        # 4. Standardized Chi-square pseudo-statistic
        chi2_stat = float(z_score ** 2) if z_score > 0 else 0.0

        # 5. Deterministic Decision Thresholds
        tau_safe = base_qber + 1.96 * total_se
        tau_attack = max(base_qber + 3.29 * total_se, base_qber + 0.08)

        # 6. Unified Deterministic Verdict Logic
        if p_value > 0.05 and obs_qber <= tau_safe:
            verdict = "SAFE"
            threat_level = "LOW"
            is_attack = False
            rule = (
                f"Observed error count ({verif_1}/{total_shots}, QBER = {obs_qber:.2%}) conforms to "
                f"calibrated baseline ({base_qber:.4%} ± {base_std:.4%}). "
                f"Exact Binomial test: p = {p_value:.4f} > 0.05, Z = {z_score:.2f} (Hypothesis H0 Accepted: Normal)."
            )
        elif p_value <= 0.001 or obs_qber >= tau_attack:
            verdict = "ATTACK DETECTED"
            threat_level = "CRITICAL"
            is_attack = True
            rule = (
                f"Statistically significant anomaly detected! Observed QBER ({obs_qber:.2%}, {verif_1}/{total_shots} err) "
                f"exceeds attack threshold ({tau_attack:.2%}). "
                f"Exact Binomial test: p = {p_value:.3e} <= 0.001, Z = {z_score:.2f} (Hypothesis H0 Rejected: Attack Detected)."
            )
        else:
            verdict = "SUSPICIOUS"
            threat_level = "ELEVATED"
            is_attack = False
            rule = (
                f"Elevated channel disturbance observed. Observed QBER ({obs_qber:.2%}) is in the marginal "
                f"anomaly zone (tau_safe = {tau_safe:.2%}). "
                f"Exact Binomial test: p = {p_value:.4f}, Z = {z_score:.2f}."
            )

        return ThreatDetectionResult(
            verdict=verdict,
            threat_level=threat_level,
            observed_qber=round(obs_qber, 6),
            baseline_qber=round(base_qber, 6),
            deviation=round(deviation, 6),
            total_variation_distance=round(tvd, 6),
            chi_square_stat=round(chi2_stat, 6),
            p_value=round(p_value, 8),
            z_score=round(z_score, 4),
            threshold_safe=round(tau_safe, 6),
            threshold_attack=round(tau_attack, 6),
            rule_triggered=rule,
            is_attack_detected=is_attack,
        )
