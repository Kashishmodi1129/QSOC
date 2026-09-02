import sqlite3
import os
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "qds_security.db")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes SQLite schema for signature tracking (Replay protection),
    signer registry (Impersonation detection), and Security Audit Log.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Signers Registry (Authorized Public Identities & Certificates)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signers (
            signer_id TEXT PRIMARY KEY,
            signer_name TEXT NOT NULL,
            public_key_fingerprint TEXT NOT NULL,
            certificate_id TEXT NOT NULL,
            is_revoked INTEGER DEFAULT 0
        )
    """)

    # 2. Verified Signatures & Nonces (Replay Protection)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signatures (
            signature_id TEXT PRIMARY KEY,
            nonce TEXT UNIQUE NOT NULL,
            session_id TEXT NOT NULL,
            signer_id TEXT NOT NULL,
            message_digest TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            verification_status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # 3. Security Audit Log (Phase 3C Persistent Verification Events)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS security_events (
            event_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            scenario TEXT NOT NULL,
            attack_type TEXT NOT NULL,
            verdict TEXT NOT NULL,
            signer_id TEXT NOT NULL,
            signature_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            nonce TEXT NOT NULL,
            qber REAL,
            baseline_qber REAL,
            tvd REAL,
            p_value REAL,
            z_score REAL,
            reason TEXT NOT NULL,
            action TEXT NOT NULL,
            simulation_mode TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Populate default registered signers if table is empty
    cursor.execute("SELECT COUNT(*) FROM signers")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO signers (signer_id, signer_name, public_key_fingerprint, certificate_id, is_revoked)
            VALUES (?, ?, ?, ?, ?)
        """, [
            ("alice_authorized", "Alice (Authorized Sovereign Signer)", "SHA256:4a8f9c1b3d2e6a7f0c5b8e9d1a3f7c2b", "CERT-QDS-2026-ALICE-ROOT", 0),
            ("bob_authorized", "Bob (Authorized Treasury Arbiter)", "SHA256:9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e", "CERT-QDS-2026-BOB-TREASURY", 0),
            ("mallory_revoked", "Mallory (Revoked Certificate)", "SHA256:11112222333344445555666677778888", "CERT-REVOKED-MAL-2026", 1),
        ])

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
