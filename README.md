# QSOC — Quantum Security Operations Center

> A quantum-security operations lab for detecting, investigating, and analyzing attacks against Quantum Digital Signature (QDS) communication channels.

QSOC is an end-to-end security operations platform that combines **quantum simulation, statistical anomaly detection, classical cryptographic verification, persistent security auditing, analytics, and AI-assisted incident analysis** into a single SOC-style interface.

Instead of treating quantum security as a purely theoretical problem, QSOC simulates realistic quantum communication conditions, introduces controlled attack scenarios, measures their statistical and cryptographic impact, and produces an actionable security verdict.

---

## What QSOC Does

QSOC models a Quantum Digital Signature verification pipeline and answers four core questions:

1. **Is the quantum communication behaving normally?**
2. **Does the observed behavior statistically differ from the calibrated baseline?**
3. **Are the classical cryptographic controls valid?**
4. **Should the transaction/signature be accepted or rejected?**

The platform combines these signals into a deterministic security decision:

```text
Quantum Simulation
       ↓
Telemetry + Measurements
       ↓
QBER / Statistical Analysis
       ↓
Quantum Threat Detection
       ↓
Classical Cryptographic Verification
       ↓
Security Verdict
       ↓
ACCEPT / REJECT
       ↓
Audit Log + Analytics
       ↓
AI-Assisted Incident Diagnosis
```

---

# Key Features

## ⚛️ Quantum Security Simulation

QSOC uses **Qiskit and Qiskit Aer** to simulate quantum communication and verification behavior.

### Simulation capabilities

* Ideal quantum-channel simulation
* Realistic noisy-channel simulation
* Configurable channel manipulation
* Quantum measurement collection
* QBER calculation
* Baseline QBER calibration
* Comparison between observed and expected behavior
* Quantum telemetry for every verification event

The system is designed as a **quantum-security simulation and research/demo environment**, rather than a connection to physical quantum hardware.

---

## 🛡️ Deterministic Threat Detection

Security decisions are made using deterministic detection logic rather than relying on an LLM.

QSOC can classify verification events into:

* `SAFE`
* `SUSPICIOUS`
* `ATTACK DETECTED`

and assign corresponding threat levels such as:

* `LOW`
* `ELEVATED`
* `CRITICAL`

The authoritative security action is:

```text
SAFE            → ACCEPT
ATTACK DETECTED → REJECT
```

AI analysis is supplementary and never replaces the deterministic security verdict.

---

# Quantum Threat Detection

QSOC analyzes multiple statistical signals to identify anomalous quantum behavior.

### QBER

Quantum Bit Error Rate is measured against a calibrated baseline to detect abnormal channel behavior.

### QBER Deviation

Observed QBER is compared against expected behavior to determine whether the channel has moved outside its normal operating range.

### Total Variation Distance

The observed measurement distribution is compared against the expected distribution using Total Variation Distance (TVD).

### Chi-Square Analysis

Measurement distributions can be evaluated for statistically significant deviation from expected behavior.

### Exact Binomial Analysis

Exact binomial probability calculations provide an additional statistical signal for observed error rates.

### Z-Score Analysis

Observed QBER can also be evaluated using standardized deviation from the calibrated baseline.

These signals provide multiple independent indicators instead of relying on a single threshold.

---

# 🔐 Classical Cryptographic Controls

Quantum telemetry alone is not sufficient to trust a transaction.

QSOC therefore combines quantum analysis with classical verification controls.

The system checks:

* Signer identity
* Certificate validity
* Signature validity
* Nonce/session information
* Signature freshness
* Replay protection
* Cryptographic identifiers
* Expected signer relationships

This creates a layered verification model:

```text
Quantum Integrity
       +
Classical Cryptographic Integrity
       =
Security Decision
```

---

# 🚨 Attack Scenarios

QSOC includes controlled scenarios designed to demonstrate different classes of security failures.

## 1. Quantum Channel Manipulation

Introduces abnormal behavior into the quantum communication channel.

Expected result:

```text
ATTACK DETECTED
REJECT
```

---

## 2. Signature Forgery

Simulates a forged quantum signature condition.

A representative signature perturbation can be introduced using:

```text
δθ = π/2
```

Expected result:

```text
ATTACK DETECTED
REJECT
```

---

## 3. Cryptographic Replay

Simulates reuse of previously valid cryptographic material.

Replay protection checks identifiers such as nonce/session information to prevent previously observed verification events from being accepted again.

Expected result:

```text
ATTACK DETECTED
REJECT
```

---

## 4. Signer Impersonation

Simulates a mismatch between the expected signer and the presented signer identity.

Classical signer and certificate verification are used to identify the mismatch.

Expected result:

```text
ATTACK DETECTED
REJECT
```

---

# 🧪 Manual Testing Lab

QSOC provides an interactive testing environment where individual verification scenarios can be executed and investigated.

The Manual Testing Lab exposes security-relevant telemetry including:

* Verification result
* Threat classification
* Threat level
* QBER
* Baseline QBER
* Statistical measurements
* Quantum distribution data
* Classical verification state
* Signer identity
* Certificate information
* Cryptographic identifiers
* Security action

This allows individual scenarios to be examined without running the complete SOC demonstration.

---

# 🎬 Full SOC Demo

QSOC includes a complete automated security demonstration.

The demo executes a five-step sequence:

| Step | Scenario                     | Expected Result          |
| ---- | ---------------------------- | ------------------------ |
| 01   | Clean Transaction            | SAFE / ACCEPT            |
| 02   | Quantum Channel Manipulation | ATTACK DETECTED / REJECT |
| 03   | Signature Forgery            | ATTACK DETECTED / REJECT |
| 04   | Cryptographic Replay         | ATTACK DETECTED / REJECT |
| 05   | Signer Impersonation         | ATTACK DETECTED / REJECT |

The demonstration produces:

* Sequential security events
* Threat classifications
* Security actions
* Analytics updates
* QBER distributions
* Detection statistics
* Confusion-matrix style results
* Persistent audit records

This provides a reproducible end-to-end SOC workflow.

---

# 🔎 Incident Investigation

Every significant security event can be investigated through the incident investigation interface.

The investigation view is organized around the evidence used to reach the decision.

### 01 — Authoritative Verdict

Shows:

* Security verdict
* Threat level
* Recommended action
* Deterministic detection result

### 02 — Quantum Telemetry

Shows:

* QBER
* Baseline QBER
* Statistical measurements
* Distribution information
* Quantum anomaly signals

### 03 — Classical Controls

Shows:

* Signer verification
* Certificate verification
* Signature verification
* Replay protection
* Session/nonce validation

### 04 — Cryptographic Identifiers

Provides the identifiers required to correlate and investigate the security event.

### 05 — AI Incident Diagnosis

The AI Security Analyst explains the observed evidence and provides an analyst-oriented interpretation.

The AI explanation is **not authoritative**. The deterministic security engine remains the source of truth.

---

# 🤖 AI Security Analyst

QSOC integrates **Groq Cloud AI** as an optional analyst-assistance layer.

Current configured model:

```text
openai/gpt-oss-120b
```

The AI layer receives security evidence generated by the verification pipeline and produces an analyst-oriented diagnosis.

It can help explain:

* Why an event was considered anomalous
* Which telemetry contributed to the detection
* Which classical control failed
* What type of attack is likely occurring
* Why the system accepted or rejected the event
* What evidence an analyst should investigate

### Deterministic fallback

QSOC does not depend entirely on the availability of the AI service.

If Groq is unavailable, the platform falls back to deterministic analysis so that the core security workflow continues to function.

```text
Security Engine
      ↓
Deterministic Verdict
      ↓
 ┌───────────────┐
 │ Groq available│
 └───────┬───────┘
         │
    AI diagnosis
         │
         ▼
 Analyst explanation

If unavailable:

Deterministic fallback
```

The AI layer therefore enhances investigation rather than controlling security decisions.

---

# 📊 Security Analytics

QSOC maintains analytics generated from verification events.

Analytics include:

* Clean vs attack outcomes
* Detection performance
* QBER distributions
* Attack distributions
* Scenario-level outcomes
* Confusion-matrix style analysis
* Aggregated verification results

Analytics are generated from actual simulation and verification events rather than static dashboard data.

---

# 📋 Persistent Security Audit Log

QSOC uses **SQLite** for persistent security event storage.

Security events can be recorded for:

* Verification attempts
* Threat detections
* Security decisions
* Attack scenarios
* Investigation workflows
* SOC demo execution

The audit trail provides a persistent record that can be used for later investigation and reporting.

---

# ❤️ System Health & Telemetry

QSOC exposes system-level health information across the major platform components.

Health monitoring includes:

| Component        | Purpose                         |
| ---------------- | ------------------------------- |
| Quantum Engine   | Quantum simulation availability |
| Threat Detector  | Deterministic security analysis |
| Analytics Engine | Security analytics processing   |
| SQLite Audit Log | Persistent event storage        |
| Groq AI          | AI analyst availability         |

This makes it possible to distinguish between:

* A security failure
* A system failure
* An unavailable external AI service

---

# 📤 Security Report Export

Security data can be exported for external analysis and reporting.

Supported formats:

* JSON
* CSV

The exported information can be used for:

* Incident reporting
* Offline analysis
* Demonstrations
* Security research
* Audit workflows

---

# 🖥️ SOC Frontend

QSOC provides a React-based SOC interface designed around an enterprise security-operations workflow.

The interface includes:

* SOC dashboard
* Primary threat monitoring
* Security KPIs
* Quantum telemetry
* Threat analytics
* Manual Testing Lab
* Full SOC Demo
* Incident Investigation
* Audit/event views
* System health
* AI Security Analyst
* Report export
* Search/command interface

The interface is intentionally designed to prioritize **security evidence and information hierarchy over decorative effects**.

---

# ✨ Interaction Design

The frontend uses restrained interaction patterns for meaningful state changes.

Examples include:

* Animated KPI number transitions
* Subtle threat-state transitions
* Focused hover states
* Interactive threat-monitoring cards
* Command/search interactions
* Investigation drawers
* SOC demonstration timeline/stepper
* Refined action buttons
* Responsive layouts

The visual system emphasizes:

* Dark enterprise surfaces
* Strong typography
* Subtle borders
* Restrained blue/cyan accents
* Semantic green/amber/red states
* Technical monospace telemetry
* Minimal decorative effects

The introductory quantum experience provides the visual spectacle, while the main SOC environment keeps the interface focused on operational data.

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     QSOC FRONTEND                       │
│                 React + Vite                            │
│                                                         │
│ Dashboard │ Testing Lab │ SOC Demo │ Investigation      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                     │
│                                                         │
│ Simulation │ Verification │ Threat Detection            │
│ Analytics  │ Audit Log   │ AI Analyst                   │
└───────┬───────────┬────────────┬──────────────┬─────────┘
        │           │            │              │
        ▼           ▼            ▼              ▼
   Qiskit/Aer   Detection     SQLite         Groq AI
   Simulation    Engine       Audit Log      Analyst
        │
        ▼
 Quantum Telemetry
        │
        ▼
 Statistical Analysis
        │
        ▼
 Security Verdict
```

---

# 🧰 Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS
* Recharts
* Responsive component architecture

## Backend

* Python
* FastAPI
* Pydantic
* SQLite

## Quantum Computing

* Qiskit
* Qiskit Aer

## Statistical Analysis

* QBER analysis
* Total Variation Distance
* Chi-square analysis
* Exact binomial p-values
* Z-score analysis

## Artificial Intelligence

* Groq Cloud API
* `openai/gpt-oss-120b`
* Deterministic fallback analysis

---

# 📁 Project Structure

```text
qds-security-lab/
│
├── backend/
│   ├── API and application code
│   ├── Quantum simulation
│   ├── Threat detection
│   ├── Statistical analysis
│   ├── Cryptographic verification
│   ├── SQLite audit logging
│   ├── Groq AI integration
│   └── Tests
│
├── frontend/
│   ├── React application
│   ├── SOC dashboard
│   ├── Testing Lab
│   ├── SOC Demo
│   ├── Incident Investigation
│   ├── Analytics
│   └── UI components
│
├── README.md
└── ...
```

---

# 🔌 API

The backend exposes REST endpoints for the main security workflows.

### Health

```http
GET /api/health
```

Returns system component health and availability.

### Simulation / Verification

```http
POST /api/simulate
```

Runs a quantum security simulation and verification workflow.

### Full SOC Demonstration

```http
POST /api/demo/run
```

Executes the complete five-step SOC demonstration.

### AI Analysis

```http
POST /api/ai/analyze
```

Generates an AI-assisted incident analysis when the configured AI service is available, with deterministic fallback behavior.

### Report Export

```http
GET /api/reports/export
```

Exports security reporting data.

---

# 🚀 Getting Started

## Prerequisites

Install:

* Python 3.x
* Node.js and npm
* Git

The backend requires the Python dependencies specified by the project.

---

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd qds-security-lab
```

---

## 2. Backend setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Configure Groq AI

Create:

```text
backend/.env
```

Add:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

**Never commit the real API key to Git.**

The core security engine does not depend on Groq being available.

---

## 4. Start the backend

From the `backend` directory, start the FastAPI application using the project's configured server entry point.

For example:

```bash
uvicorn <backend_entrypoint>:app --reload
```

---

## 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

---

# 🧪 Running Tests

QSOC includes an automated backend test suite covering the major security workflows.

Run:

```bash
pytest -v -s
```

The current project test suite passes:

```text
44 passed
```

The test coverage includes functionality across:

* Core verification
* Quantum simulation
* Threat detection
* Statistical analysis
* Classical security controls
* Replay protection
* Analytics
* SOC demonstration
* Report generation
* Health telemetry
* Incident investigation
* AI integration/fallback behavior

---

# 🔐 Security Considerations

QSOC is a **security research, demonstration, and simulation platform**.

It demonstrates how quantum telemetry, statistical analysis, classical cryptographic controls, audit trails, and AI-assisted investigation can work together in a SOC workflow.

It should not be interpreted as:

* A production QDS implementation
* A replacement for certified cryptographic libraries
* A physical quantum communication system
* A guarantee of real-world attack detection
* A production security monitoring platform

The quantum environment is simulated using Qiskit/Aer.

AI-generated explanations are advisory. **The deterministic security engine remains authoritative.**

---

# 🔑 Secrets & Configuration

Sensitive credentials should remain outside source control.

In particular:

```text
backend/.env
```

must not be committed if it contains real API keys.

Recommended Git hygiene includes secret scanning and push protection for repositories containing credentials or API integrations.

---

# 🎯 Why QSOC?

Quantum cryptography introduces security properties that are difficult to communicate through conventional cybersecurity dashboards.

QSOC brings the problem into a familiar SOC workflow:

```text
Observe
   ↓
Measure
   ↓
Detect
   ↓
Verify
   ↓
Decide
   ↓
Investigate
   ↓
Report
```

This makes quantum-security behavior observable and actionable for security analysts.

---

# 🧠 Core Design Principle

> **AI explains the incident. Deterministic security logic decides it.**

QSOC deliberately separates the security decision from the AI layer.

The quantum simulator and deterministic verification engine establish the evidence and security verdict.

The AI Security Analyst helps an operator understand that evidence.

This separation prevents an unavailable or incorrect AI response from silently changing the underlying security decision.

---

# 🏆 Demonstration Flow

A complete QSOC demonstration can be run as:

```text
ENTER QSOC
     ↓
System Health
     ↓
Clean Transaction
     ↓
Quantum Channel Manipulation
     ↓
Signature Forgery
     ↓
Cryptographic Replay
     ↓
Signer Impersonation
     ↓
Analytics
     ↓
Incident Investigation
     ↓
AI Security Analyst
     ↓
Security Report
```

The result is an end-to-end demonstration of a **Quantum Security Operations Center**, from quantum telemetry generation through security decision, investigation, analytics, and reporting.

---

# 📌 Project Status

QSOC currently provides a functional end-to-end prototype covering:

* Quantum simulation
* Security verification
* Deterministic threat detection
* Statistical anomaly analysis
* Classical cryptographic controls
* Multiple attack scenarios
* SOC demonstration workflow
* Persistent audit logging
* Analytics
* Incident investigation
* AI-assisted analysis
* Health monitoring
* Report export
* Automated backend testing

---

## License

No license is currently specified for this repository.

If this project is intended to be publicly distributed, add an appropriate license before publishing.
