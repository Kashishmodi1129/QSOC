from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class CalibrationRequest(BaseModel):
    runs: int = Field(default=5, ge=1, le=20, description="Number of calibration runs")
    shots: int = Field(default=1000, ge=100, le=10000, description="Number of shots per run")
    baseline_noise: float = Field(default=0.015, ge=0.0, le=0.2, description="Controlled baseline environmental noise")
    theta: float = Field(default=1.047197551, description="Bloch sphere angle theta (default pi/3)")
    phi: float = Field(default=0.785398163, description="Bloch sphere angle phi (default pi/4)")
    simulation_mode: str = Field(default="ideal", description="'ideal' or 'realistic_noise'")

class BaselineCalibrationData(BaseModel):
    baseline_error_mean: float
    baseline_error_std: float
    baseline_distribution: Dict[str, float]
    shots_calibrated: int
    runs_count: int
    calibrated_at: str
    simulation_mode: str = "ideal"
    noise_model_used: str

class SimulationRequest(BaseModel):
    shots: int = Field(default=1000, ge=100, le=10000)
    simulation_mode: str = Field(default="ideal", description="'ideal' or 'realistic_noise'")
    attack_type: str = Field(default="none", description="'none', 'channel_manipulation', 'signature_forgery', 'replay_attack', 'signer_impersonation'")
    attack_strength: float = Field(default=0.0, ge=0.0, le=1.0, description="Attack strength from 0.0 to 1.0 (0% to 100%)")
    baseline_noise: Optional[float] = Field(default=0.015, ge=0.0, le=0.2)
    theta: float = Field(default=1.047197551)
    phi: float = Field(default=0.785398163)
    forgery_delta_theta: float = Field(default=0.0)
    forgery_delta_phi: float = Field(default=0.0)
    signer_id: str = Field(default="alice_authorized")
    certificate_id: Optional[str] = Field(default="CERT-QDS-2026-ALICE-ROOT")
    signature_id: Optional[str] = None
    nonce: Optional[str] = None
    session_id: Optional[str] = None
    message: Optional[str] = Field(default="Authorize Treasury Transfer")
    custom_baseline: Optional[BaselineCalibrationData] = None

class QuantumMeasurementData(BaseModel):
    total_shots: int
    verif_0_count: int
    verif_1_count: int
    observed_error_rate: float
    distribution: Dict[str, float]
    alice_bell_distribution: Dict[str, int]
    raw_counts: Dict[str, int]
    circuit_summary: Dict[str, Any]

class ThreatDetectionResult(BaseModel):
    verdict: str  # "SAFE", "SUSPICIOUS", "ATTACK DETECTED"
    threat_level: str  # "LOW", "ELEVATED", "CRITICAL"
    observed_qber: float
    baseline_qber: float
    deviation: float
    total_variation_distance: float
    chi_square_stat: float
    p_value: float
    z_score: float
    threshold_safe: float
    threshold_attack: float
    rule_triggered: str
    is_attack_detected: bool

class SimulationResponse(BaseModel):
    measurement: Optional[QuantumMeasurementData] = None
    detection: Optional[ThreatDetectionResult] = None
    baseline: BaselineCalibrationData
    attack_applied: Dict[str, Any]
    is_valid: bool
    verdict: str
    attack_type: str
    threat_level: str
    primary_reason: str
    simulation_mode: str = "ideal"
    classical_checks: Dict[str, Any]
