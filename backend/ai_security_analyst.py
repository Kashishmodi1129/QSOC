import os
import json
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class SecurityEvidencePayload(BaseModel):
    verdict: str  # "SAFE", "SUSPICIOUS", "ATTACK DETECTED"
    attack_type: str  # "none", "channel_manipulation", "signature_forgery", "replay_attack", "signer_impersonation"
    action: str  # "ACCEPT", "REJECT", "FLAG_FOR_REVIEW"
    simulation_mode: str = "ideal"  # "ideal", "realistic_noise"
    qber: Optional[float] = None
    baseline_qber: Optional[float] = None
    tvd: Optional[float] = None
    p_value: Optional[float] = None
    z_score: Optional[float] = None
    signer_id: Optional[str] = "alice_authorized"
    signer_check: Optional[str] = "VALID"
    nonce_check: Optional[str] = "UNIQUE"
    reason: str
    signature_id: Optional[str] = None
    session_id: Optional[str] = None

class AIAnalysisContent(BaseModel):
    summary: str
    explanation: str
    evidence: List[str]
    recommendation: str
    severity: str

class AIAnalysisResponse(BaseModel):
    available: bool
    provider: str
    deterministic_verdict: str
    action: str
    analysis: AIAnalysisContent
    disclaimer: str = "AI is an analyst-assistance layer. The deterministic security engine remains authoritative for threat classification."

class AISecurityAnalyst:
    """
    Groq AI Security Analyst Service.
    
    ARCHITECTURAL PRINCIPLES:
    1. AI is strictly an explanation and analyst-assistance layer.
    2. The deterministic security engine remains 100% authoritative for all security decisions.
    3. The AI never determines whether something is an attack and cannot override verdicts or actions.
    4. Seamless graceful fallback when GROQ_API_KEY is not set or API fails.
    """

    def __init__(self):
        self.model_name = "openai/gpt-oss-120b"

    def get_api_key(self) -> Optional[str]:
        """Fetches API key from backend environment only."""
        return os.environ.get("GROQ_API_KEY", "").strip() or None

    def analyze_incident(self, evidence: SecurityEvidencePayload) -> AIAnalysisResponse:
        """
        Processes structured security evidence and generates human-readable diagnostic analysis.
        Uses Groq API if GROQ_API_KEY is present, otherwise falls back to deterministic rule-based analyst.
        """
        api_key = self.get_api_key()
        
        if api_key:
            try:
                ai_result = self._call_groq_llm(evidence, api_key)
                if ai_result:
                    return AIAnalysisResponse(
                        available=True,
                        provider=f"Groq Cloud AI ({self.model_name})",
                        deterministic_verdict=evidence.verdict,
                        action=evidence.action,
                        analysis=ai_result,
                    )
            except Exception as e:
                # Log internal error without leaking keys or failing verification
                pass

        # Deterministic Rule-Based Fallback
        fallback_analysis = self._generate_deterministic_fallback(evidence)
        return AIAnalysisResponse(
            available=False,
            provider="Deterministic Fallback Security Analyst",
            deterministic_verdict=evidence.verdict,
            action=evidence.action,
            analysis=fallback_analysis,
        )

    def _call_groq_llm(self, evidence: SecurityEvidencePayload, api_key: str) -> Optional[AIAnalysisContent]:
        """Calls Groq API with strict JSON schema instructions."""
        from groq import Groq
        client = Groq(api_key=api_key)

        system_prompt = (
            "You are a specialized Quantum Cybersecurity Analyst assisting a security operations center (SOC).\n"
            "Analyze the provided structured evidence from a Quantum Digital Signature (QDS) teleportation verification engine.\n"
            "IMPORTANT RULES:\n"
            "1. The deterministic security verdict provided in the evidence is AUTHORITATIVE. Do NOT attempt to alter it.\n"
            "2. Explain clearly WHY the system reached this verdict based on quantum measurement physics (QBER, TVD, Exact Binomial p-value) or classical controls (replay nonces, certificate verification).\n"
            "3. Format your response STRICTLY as valid JSON with keys: 'summary', 'explanation', 'evidence' (array of strings), 'recommendation', and 'severity' ('LOW', 'ELEVATED', 'HIGH', 'CRITICAL')."
        )

        user_prompt = f"Security Evidence Payload:\n{evidence.model_dump_json(indent=2)}"

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=self.model_name,
            temperature=0.2,
            max_tokens=600,
            response_format={"type": "json_object"}
        )

        raw_content = chat_completion.choices[0].message.content
        data = json.loads(raw_content)

        return AIAnalysisContent(
            summary=str(data.get("summary", "Automated QDS Incident Assessment")),
            explanation=str(data.get("explanation", "Verification completed according to baseline standards.")),
            evidence=list(data.get("evidence", [evidence.reason])),
            recommendation=str(data.get("recommendation", "Proceed with standard protocol.")),
            severity=str(data.get("severity", "CRITICAL" if evidence.verdict == "ATTACK DETECTED" else "LOW")).upper()
        )

    def _generate_deterministic_fallback(self, evidence: SecurityEvidencePayload) -> AIAnalysisContent:
        """
        Generates robust, deterministic rule-based analysis when Groq is unavailable.
        """
        qber_str = f"{evidence.qber * 100:.2f}%" if evidence.qber is not None else "N/A"
        base_str = f"{evidence.baseline_qber * 100:.4f}%" if evidence.baseline_qber is not None else "N/A"
        pval_str = f"{evidence.p_value:.4e}" if evidence.p_value is not None else "N/A"
        z_str = f"{evidence.z_score:.2f}" if evidence.z_score is not None else "N/A"

        evidence_items = []
        if evidence.qber is not None:
            evidence_items.append(f"Observed QBER: {qber_str} (Calibrated Baseline: {base_str})")
        if evidence.p_value is not None:
            evidence_items.append(f"Exact Binomial p-value: {pval_str} (Z-score: {z_str})")
        if evidence.tvd is not None:
            evidence_items.append(f"Total Variation Distance (TVD): {evidence.tvd:.4f}")
        evidence_items.append(f"Signer Identity Status: {evidence.signer_check}")
        evidence_items.append(f"Nonce Uniqueness Status: {evidence.nonce_check}")

        if evidence.verdict == "SAFE":
            summary = "Authentic Quantum Digital Signature Verified"
            explanation = (
                f"The transaction successfully passed all classical identity and nonce freshness checks. "
                f"Quantum teleportation measurement statistics (QBER = {qber_str}) conform to the calibrated "
                f"baseline ({base_str}) with an Exact Binomial p-value of {pval_str} (> 0.05)."
            )
            recommendation = "Accept signature and authorize downstream transaction workflow."
            severity = "LOW"

        elif evidence.attack_type == "replay_attack":
            summary = "Cryptographic Replay Attack Detected"
            explanation = (
                f"A previously consumed signature token or cryptographic nonce was re-submitted for verification. "
                f"The classical replay protection registry blocked token reuse."
            )
            recommendation = "Reject transaction immediately. Invalidate session token and flag replay source IP/node."
            severity = "HIGH"

        elif evidence.attack_type == "signer_impersonation":
            summary = "Signer Identity Impersonation Attempt Detected"
            explanation = (
                f"The claimed signer identity '{evidence.signer_id}' failed authentication against the root registry. "
                f"Either the signer certificate is revoked, spoofed, or unknown."
            )
            recommendation = "Reject transaction immediately. Quarantine unauthorized connection and alert identity administrator."
            severity = "CRITICAL"

        elif evidence.attack_type == "signature_forgery":
            summary = "Quantum Signature State Forgery Detected"
            explanation = (
                f"Quantum state perturbation detected on the verification channel. The observed error rate "
                f"(QBER = {qber_str}) significantly deviates from the legitimate signature state (Exact p = {pval_str} <= 0.001)."
            )
            recommendation = "Reject transaction. Abort quantum state reception and trigger quantum key/state re-issuance."
            severity = "CRITICAL"

        elif evidence.attack_type == "channel_manipulation":
            summary = "Quantum Channel Disturbance Detected"
            explanation = (
                f"Anomalous error rates observed on the quantum communication link (QBER = {qber_str} vs baseline {base_str}). "
                f"Indicates active eavesdropping or channel degradation exceeding safety bounds."
            )
            recommendation = "Reject transaction. Re-calibrate baseline and inspect physical/simulated optical fiber link."
            severity = "HIGH"

        else:
            summary = "Elevated Channel Variance / Anomaly Detected"
            explanation = (
                f"Verification error rate is elevated above standard baseline variance (QBER = {qber_str}). "
                f"Requires operational review."
            )
            recommendation = "Hold transaction in quarantine for manual supervisor verification or re-measurement."
            severity = "ELEVATED"

        return AIAnalysisContent(
            summary=summary,
            explanation=explanation,
            evidence=evidence_items,
            recommendation=recommendation,
            severity=severity
        )
