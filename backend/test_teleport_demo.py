import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator

def run_test():
    # 3 qubits: q0 (signature state), q1 (Alice Bell half), q2 (Bob Bell half)
    qr = QuantumRegister(3, 'q')
    cr_alice = ClassicalRegister(2, 'c_alice') # c0 from q0, c1 from q1
    cr_bob = ClassicalRegister(1, 'c_verif')   # verification outcome
    qc = QuantumCircuit(qr, cr_alice, cr_bob)

    # 1. State preparation for Alice's signature (e.g. theta = pi/3, phi = pi/4)
    theta, phi = np.pi / 3, np.pi / 4
    qc.ry(theta, qr[0])
    qc.rz(phi, qr[0])
    qc.barrier()

    # 2. Bell pair creation between Alice (q1) and Bob (q2)
    qc.h(qr[1])
    qc.cx(qr[1], qr[2])
    qc.barrier()

    # 3. Alice Bell measurement
    qc.cx(qr[0], qr[1])
    qc.h(qr[0])
    qc.measure(qr[0], cr_alice[0])
    qc.measure(qr[1], cr_alice[1])
    qc.barrier()

    # 4. Bob Pauli correction
    with qc.if_test((cr_alice[1], 1)):
        qc.x(qr[2])
    with qc.if_test((cr_alice[0], 1)):
        qc.z(qr[2])
    qc.barrier()

    # 5. Bob Verification: Inverse preparation unitary
    qc.rz(-phi, qr[2])
    qc.ry(-theta, qr[2])
    qc.measure(qr[2], cr_bob[0])

    simulator = AerSimulator()
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts()
    print("Circuit generated and ran successfully!")
    print("Measurement raw counts sample:", list(counts.items())[:5])

if __name__ == "__main__":
    run_test()
