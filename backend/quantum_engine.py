import numpy as np
from typing import Dict, Any, Optional
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator
import qiskit_aer.noise as aer_noise

def build_aer_noise_model(noise_level: float = 0.015) -> aer_noise.NoiseModel:
    """
    Constructs a calibrated Qiskit Aer NoiseModel simulating physical quantum hardware:
    1. Single-qubit depolarizing error on 1-qubit rotation and Hadamard gates.
    2. Two-qubit depolarizing error on CNOT and Controlled-Z gates.
    3. Readout assignment error on measurement operations.
    
    Parameters are scaled proportionally by noise_level (default 0.015 ~ 1.5% base noise).
    """
    nm = aer_noise.NoiseModel()
    
    # 1-Qubit gate error (e.g., 0.3% error at 0.015 base)
    p_1q = max(min(noise_level * 0.2, 0.1), 0.0001)
    error_1q = aer_noise.depolarizing_error(p_1q, 1)
    nm.add_all_qubit_quantum_error(error_1q, ['ry', 'rz', 'rx', 'h', 'sx', 'x'])

    # 2-Qubit gate error (e.g., 1.5% error at 0.015 base)
    p_2q = max(min(noise_level * 1.0, 0.2), 0.0005)
    error_2q = aer_noise.depolarizing_error(p_2q, 2)
    nm.add_all_qubit_quantum_error(error_2q, ['cx', 'cz'])

    # Measurement / Readout assignment error (e.g., 1.8% flip at 0.015 base)
    p_ro = max(min(noise_level * 1.2, 0.2), 0.0005)
    ro_matrix = [[1.0 - p_ro, p_ro], [p_ro, 1.0 - p_ro]]
    error_ro = aer_noise.ReadoutError(ro_matrix)
    nm.add_all_qubit_readout_error(error_ro)

    return nm

class QDSQuantumEngine:
    """
    Quantum Simulation Engine for Quantum Digital Signature (QDS) verification
    using Quantum Teleportation.
    
    Supports two simulation modes:
    - "ideal": Ideal, noiseless unitary evolution on AerSimulator.
    - "realistic_noise": Comprehensive physical noise modeling via Qiskit Aer NoiseModel
      (depolarizing gate errors + readout assignment errors).
    """

    def __init__(self, seed: Optional[int] = None):
        self.ideal_simulator = AerSimulator()
        self.seed = seed

    def build_circuit(
        self,
        theta: float = np.pi / 3,
        phi: float = np.pi / 4,
        attack_type: str = "none",
        attack_strength: float = 0.0,
        baseline_noise: float = 0.0,
        forgery_delta_theta: float = 0.0,
        forgery_delta_phi: float = 0.0,
    ) -> QuantumCircuit:
        """
        Constructs the teleportation-based QDS verification circuit.
        """
        qr = QuantumRegister(3, name="q")
        cr_alice = ClassicalRegister(2, name="c_alice")
        cr_bob = ClassicalRegister(1, name="c_verif")
        
        qc = QuantumCircuit(qr, cr_alice, cr_bob, name="QDS_Teleportation_Circuit")

        # 1. Alice Signature State Preparation on q0
        prep_theta = theta
        prep_phi = phi
        
        if attack_type in ["forgery", "signature_forgery"]:
            if forgery_delta_theta != 0.0 or forgery_delta_phi != 0.0:
                prep_theta = theta + forgery_delta_theta
                prep_phi = phi + forgery_delta_phi
            elif attack_strength > 0.0:
                prep_theta = theta + (attack_strength * np.pi * 0.5)
                prep_phi = phi + (attack_strength * np.pi * 0.5)

        qc.ry(prep_theta, qr[0])
        qc.rz(prep_phi, qr[0])
        qc.barrier(label="1. State Prep")

        # 2. Entangled Bell Pair Generation on (q1, q2)
        qc.h(qr[1])
        qc.cx(qr[1], qr[2])
        qc.barrier(label="2. Bell Pair Gen")

        # 3. Quantum Channel Transmission & Controlled Attack Disturbance on q2
        if attack_type == "channel_manipulation" and attack_strength > 0.0:
            rot_angle_x = attack_strength * np.pi * 0.5
            rot_angle_z = attack_strength * np.pi * 0.5
            qc.rx(rot_angle_x, qr[2])
            qc.rz(rot_angle_z, qr[2])
        elif baseline_noise > 0.0:
            qc.rx(baseline_noise * np.pi * 0.2, qr[2])
            qc.rz(baseline_noise * np.pi * 0.2, qr[2])

        qc.barrier(label="3. Channel")

        # 4. Alice Bell Transformation
        qc.cx(qr[0], qr[1])
        qc.h(qr[0])
        qc.barrier(label="4. Alice Bell Trans")

        # 5. Bob Pauli Correction (Deferred Measurement)
        qc.cx(qr[1], qr[2])
        qc.cz(qr[0], qr[2])
        qc.barrier(label="5. Pauli Corr")

        # 6. Bob Verification Projection & Measurements
        qc.rz(-phi, qr[2])
        qc.ry(-theta, qr[2])
        qc.barrier(label="6. Verification")

        # Measurements
        qc.measure(qr[0], cr_alice[0])
        qc.measure(qr[1], cr_alice[1])
        qc.measure(qr[2], cr_bob[0])

        return qc

    def run_simulation(
        self,
        theta: float = np.pi / 3,
        phi: float = np.pi / 4,
        attack_type: str = "none",
        attack_strength: float = 0.0,
        baseline_noise: float = 0.0,
        shots: int = 1000,
        forgery_delta_theta: float = 0.0,
        forgery_delta_phi: float = 0.0,
        simulation_mode: str = "ideal",
    ) -> Dict[str, Any]:
        """
        Executes the QDS circuit in either 'ideal' or 'realistic_noise' mode.
        """
        qc = self.build_circuit(
            theta=theta,
            phi=phi,
            attack_type=attack_type,
            attack_strength=attack_strength,
            baseline_noise=baseline_noise if simulation_mode == "ideal" else 0.0,
            forgery_delta_theta=forgery_delta_theta,
            forgery_delta_phi=forgery_delta_phi,
        )

        if simulation_mode == "realistic_noise":
            noise_lvl = baseline_noise if baseline_noise > 0.0 else 0.015
            noise_model = build_aer_noise_model(noise_level=noise_lvl)
            sim = AerSimulator(noise_model=noise_model)
        else:
            sim = self.ideal_simulator

        job = sim.run(qc, shots=shots, seed_simulator=self.seed)
        result = job.result()
        raw_counts = result.get_counts()

        verif_0_count = 0
        verif_1_count = 0
        alice_bell_dist = {"00": 0, "01": 0, "10": 0, "11": 0}

        for outcome, count in raw_counts.items():
            parts = outcome.split()
            if len(parts) == 2:
                v_bit, a_bits = parts[0], parts[1]
            elif len(parts) == 1 and len(parts[0]) == 3:
                v_bit, a_bits = parts[0][0], parts[0][1:]
            else:
                v_bit, a_bits = outcome[0], outcome[1:]

            if v_bit == '0':
                verif_0_count += count
            else:
                verif_1_count += count

            if a_bits in alice_bell_dist:
                alice_bell_dist[a_bits] += count
            else:
                alice_bell_dist[a_bits] = count

        total_shots = verif_0_count + verif_1_count
        observed_error_rate = float(verif_1_count / total_shots) if total_shots > 0 else 0.0

        distribution = {
            "0": float(verif_0_count / total_shots) if total_shots > 0 else 0.0,
            "1": float(verif_1_count / total_shots) if total_shots > 0 else 0.0,
        }

        circuit_summary = {
            "qubits_count": 3,
            "classical_bits_count": 3,
            "depth": qc.depth(),
            "operations": dict(qc.count_ops()),
            "signature_theta": theta,
            "signature_phi": phi,
            "attack_type": attack_type,
            "attack_strength": attack_strength,
            "simulation_mode": simulation_mode,
            "baseline_noise": baseline_noise,
            "forgery_delta_theta": forgery_delta_theta,
            "forgery_delta_phi": forgery_delta_phi,
        }

        return {
            "total_shots": total_shots,
            "verif_0_count": verif_0_count,
            "verif_1_count": verif_1_count,
            "observed_error_rate": round(observed_error_rate, 6),
            "distribution": distribution,
            "alice_bell_distribution": alice_bell_dist,
            "raw_counts": raw_counts,
            "circuit_summary": circuit_summary,
        }
