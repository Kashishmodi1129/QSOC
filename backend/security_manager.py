import sqlite3
import uuid
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from database import get_db_connection, init_db

class SecurityManager:
    """
    Classical Security Management & Audit Logging Layer for Quantum Digital Signatures (QDS).
    
    RESPONSIBILITIES:
    1. Signer Identity & Certificate Verification (Signer Impersonation Detection).
    2. Nonce, Signature ID, and Session Tracking (Replay Attack Detection).
    3. Persistent SQLite Audit Storage for Verified Tokens.
    4. Persistent Security Audit Log for all verification attempts and threat verdicts.
    """

    def __init__(self):
        init_db()

    def verify_signer_identity(
        self,
        signer_id: str,
        claimed_certificate_id: Optional[str] = None,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Validates signer identity against the trusted signer registry.
        Detects signer impersonation, spoofed certificate IDs, and revoked signers.
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM signers WHERE signer_id = ?", (signer_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return False, f"SIGNER IMPERSONATION DETECTED: Unknown or unregistered signer ID '{signer_id}'", None

        signer_data = dict(row)

        if signer_data["is_revoked"]:
            return False, f"SIGNER IMPERSONATION DETECTED: Signer credentials for '{signer_id}' have been REVOKED", signer_data

        if claimed_certificate_id and claimed_certificate_id != signer_data["certificate_id"]:
            return False, (
                f"SIGNER IMPERSONATION DETECTED: Certificate mismatch for signer '{signer_id}'. "
                f"Expected '{signer_data['certificate_id']}', presented '{claimed_certificate_id}'"
            ), signer_data

        return True, "Signer identity and certificate verified successfully.", signer_data

    def check_replay_protection(
        self,
        signature_id: str,
        nonce: str,
    ) -> Tuple[bool, str]:
        """
        Checks whether the signature ID or Nonce has already been consumed.
        Prevents cryptographic replay attacks.
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check for signature_id reuse
        cursor.execute("SELECT * FROM signatures WHERE signature_id = ?", (signature_id,))
        sig_row = cursor.fetchone()
        if sig_row:
            conn.close()
            return False, f"REPLAY ATTACK DETECTED: Signature ID '{signature_id}' has already been processed at {sig_row['timestamp']}"

        # Check for nonce reuse
        cursor.execute("SELECT * FROM signatures WHERE nonce = ?", (nonce,))
        nonce_row = cursor.fetchone()
        if nonce_row:
            conn.close()
            return False, f"REPLAY ATTACK DETECTED: Nonce '{nonce}' has already been consumed for signature '{nonce_row['signature_id']}'"

        conn.close()
        return True, "Nonce and Signature ID are fresh and unique."

    def record_verified_signature(
        self,
        signature_id: str,
        nonce: str,
        session_id: str,
        signer_id: str,
        message_digest: str,
        timestamp: Optional[str] = None,
        status: str = "ACCEPTED",
    ) -> bool:
        """
        Stores a verified signature record in SQLite to prevent future replay.
        """
        ts = timestamp or datetime.utcnow().isoformat() + "Z"
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO signatures (signature_id, nonce, session_id, signer_id, message_digest, timestamp, verification_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                signature_id,
                nonce,
                session_id,
                signer_id,
                message_digest,
                ts,
                status,
                datetime.utcnow().isoformat() + "Z"
            ))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()

    def get_registered_signers(self) -> List[Dict[str, Any]]:
        """Returns all registered identities from the registry."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM signers")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    def get_recent_signatures(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Returns recently recorded signatures."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM signatures ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    def reset_signature_store(self):
        """Clears signature replay store for fresh test cycles."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM signatures")
        conn.commit()
        conn.close()

    # =========================================================================
    # PHASE 3C: SECURITY AUDIT LOG METHODS
    # =========================================================================

    def record_security_event(
        self,
        scenario: str,
        attack_type: str,
        verdict: str,
        signer_id: str,
        signature_id: str,
        session_id: str,
        nonce: str,
        reason: str,
        action: str,
        simulation_mode: str = "ideal",
        qber: Optional[float] = None,
        baseline_qber: Optional[float] = None,
        tvd: Optional[float] = None,
        p_value: Optional[float] = None,
        z_score: Optional[float] = None,
        timestamp: Optional[str] = None,
        event_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Stores an immutable audit record for each unified verification request.
        """
        evt_id = event_id or f"EVT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        ts = timestamp or datetime.utcnow().isoformat() + "Z"
        created_at = datetime.utcnow().isoformat() + "Z"

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO security_events (
                event_id, timestamp, scenario, attack_type, verdict,
                signer_id, signature_id, session_id, nonce,
                qber, baseline_qber, tvd, p_value, z_score,
                reason, action, simulation_mode, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            evt_id, ts, scenario, attack_type, verdict,
            signer_id, signature_id, session_id, nonce,
            qber, baseline_qber, tvd, p_value, z_score,
            reason, action, simulation_mode, created_at
        ))

        conn.commit()
        conn.close()

        return {
            "event_id": evt_id,
            "timestamp": ts,
            "scenario": scenario,
            "attack_type": attack_type,
            "verdict": verdict,
            "signer_id": signer_id,
            "signature_id": signature_id,
            "session_id": session_id,
            "nonce": nonce,
            "qber": qber,
            "baseline_qber": baseline_qber,
            "tvd": tvd,
            "p_value": p_value,
            "z_score": z_score,
            "reason": reason,
            "action": action,
            "simulation_mode": simulation_mode,
            "created_at": created_at,
        }

    def get_security_events(
        self,
        verdict: Optional[str] = None,
        attack_type: Optional[str] = None,
        simulation_mode: Optional[str] = None,
        signer_id: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        Retrieves security audit log events with optional filtering and pagination.
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM security_events WHERE 1=1"
        params: List[Any] = []

        if verdict:
            query += " AND verdict = ?"
            params.append(verdict)
        if attack_type:
            query += " AND attack_type = ?"
            params.append(attack_type)
        if simulation_mode:
            query += " AND simulation_mode = ?"
            params.append(simulation_mode)
        if signer_id:
            query += " AND signer_id = ?"
            params.append(signer_id)
        if start_time:
            query += " AND timestamp >= ?"
            params.append(start_time)
        if end_time:
            query += " AND timestamp <= ?"
            params.append(end_time)

        # Count total matching rows
        count_query = query.replace("SELECT *", "SELECT COUNT(*)", 1)
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        events = [dict(r) for r in cursor.fetchall()]
        conn.close()

        return {
            "events": events,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
        }

    def get_security_event_by_id(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single security event record by event_id."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM security_events WHERE event_id = ?", (event_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def reset_security_events(self):
        """Clears all audit log events without modifying signer credentials."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM security_events")
        conn.commit()
        conn.close()
