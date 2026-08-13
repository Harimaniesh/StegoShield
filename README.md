# StegoShield — AI-Powered Secure Steganography & Steganalysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38BDF8.svg)](https://tailwindcss.com)

**StegoShield** is a production-quality, modern cybersecurity web application built for secure image steganography, authenticated AES-256-GCM payload encryption, digital image forensics, visual difference mapping, and statistical steganalysis risk scoring.

---

## Key Features

1. **Secure LSB Steganography**
   - Embed secret text messages or small binary files into PNG, JPEG, or BMP images.
   - Encrypt payloads with **AES-256-GCM** using keys derived via **PBKDF2-HMAC-SHA256** (100,000 iterations).
   - Random 16-byte salt and 12-byte nonce generated per payload.
   - Automatic lossless preservation (PNG output) to prevent LSB bit degradation.
   - Live payload capacity calculator with overflow protection.

2. **Payload Extraction & Decryption**
   - Extract hidden payload headers (`STGO` magic identifier).
   - Authenticated decryption using AES-256-GCM tag verification.
   - Instant text message reveal or binary file download.
   - Safe exception handling preventing key material leakage or stack trace exposure.

3. **Forensic Steganalysis**
   - **Shannon Entropy Analysis**: Multi-channel entropy calculations (bits/byte) to detect encrypted data density.
   - **LSB Bit Balance**: Percentage distribution of 1s in LSBs across RGB channels (detects artificial 50.0% LSB uniformity).
   - **Chi-Square Test**: Adjacent pixel pair frequency smoothing analysis.
   - **High-Frequency Noise Estimation**: Laplacian operator variance in spatial domain.
   - **Threat Risk Score**: Categorized risk ratings (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with analytical disclaimers.

4. **Forensic Image Comparison**
   - Pixel difference mapping between original clean cover images and stego images.
   - Comparative forensic metrics: Peak Signal-to-Noise Ratio (**PSNR** in dB), Mean Absolute Error (**MAE**), and changed pixel percentage.
   - Visual Difference Heatmap (25x amplified LSB contrast map).

5. **EXIF & Header Metadata Inspection**
   - Comprehensive EXIF tag parser (Camera make/model, Software encoder, Exposure, Creation timestamps, Color Space).
   - Graceful fallback for sanitized or stripped metadata headers.

6. **Operational Audit Log & Dashboard**
   - Immutable SQLite activity database via SQLAlchemy.
   - Real-time telemetry dashboard cards and Recharts analytics.
   - Search, action filters, and CSV export for security reporting.

---

## Project Architecture

```
Cybersecurity/
├── backend/
│   ├── app/
│   │   ├── api/              # REST API endpoints (steganography, analysis, history)
│   │   ├── core/             # Database connection & config settings
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── schemas/          # Pydantic request & response models
│   │   ├── security/         # AES-256-GCM, PBKDF2, SHA-256, and File sanitization
│   │   ├── steganography/    # LSB embedding & extraction engine
│   │   ├── analysis/         # Steganalysis, comparison, & metadata engines
│   │   └── main.py           # FastAPI application entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI elements (Sidebar, Header, Dropzone, CapacityMeter, RiskBadge)
│   │   ├── pages/            # 8 Main application pages
│   │   ├── services/         # Axios API service handlers
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── tests/
│   ├── backend/              # Pytest unit & integration tests
│   └── conftest.py
└── README.md
```

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React icons, Axios.
- **Backend**: Python 3.10+, FastAPI, Pillow (PIL), OpenCV (`opencv-python-headless`), NumPy, Cryptography (`pyca/cryptography`), SQLAlchemy ORM.
- **Database**: SQLite (`stegoshield.db`).

---

## Quick Start & Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ & npm

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI backend server (listening on 127.0.0.1:8000)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (listening on 127.0.0.1:5173)
npm run dev
```

Open your browser at `http://127.0.0.1:5173`.

---

## API Documentation

FastAPI automatically serves interactive OpenAPI documentation at:
- **Swagger UI**: `http://127.0.0.1:8000/api/docs`
- **ReDoc**: `http://127.0.0.1:8000/api/redoc`

### Primary Endpoints:
- `POST /api/steganography/capacity` — Calculate available LSB payload bytes.
- `POST /api/steganography/embed` — Encrypt payload with AES-256-GCM & embed into cover image.
- `POST /api/steganography/extract` — Extract & decrypt embedded payload.
- `POST /api/analysis/steganalyze` — Perform forensic steganalysis scan & risk score.
- `POST /api/analysis/compare` — Generate pixel difference map, PSNR, & MAE.
- `POST /api/analysis/metadata` — Parse EXIF header tags.
- `GET /api/history` — Query operational audit log.
- `GET /api/dashboard/stats` — Fetch telemetry dashboard metrics.
- `GET /api/health` — Service status endpoint.

---

## Cryptography & Security Model

1. **Authenticated Encryption**: Uses AES-256 in Galois/Counter Mode (GCM) providing both confidentiality and integrity authentication tags.
2. **Key Derivation**: Passwords are stretched using PBKDF2-HMAC-SHA256 with 100,000 iterations and 16-byte random salts per operation.
3. **Local Host Isolation**: Server binds strictly to `127.0.0.1` to prevent unauthorized network exposure.
4. **Input & Upload Sanitization**: Magic byte header validation via Pillow prevents malicious executable uploads; paths are stripped of directory traversal sequences (`../`).
5. **No Password Persistence**: Passwords and raw encryption keys are never logged to disk or returned in API responses.

---

## Running Automated Tests

To execute the complete backend unit & API integration test suite:

```bash
# From workspace root
python -m pytest tests/backend
```

All 15 unit and integration tests cover:
- AES-256-GCM encryption / decryption with valid and invalid passwords.
- LSB bit embedding and extraction accuracy.
- Steganalysis Shannon entropy & Chi-square calculations.
- PSNR & MAE pixel difference calculations.
- FastAPI endpoint workflows end-to-end.

---

## Ethical & Legal Disclaimer

This platform is created **exclusively for educational purposes, digital forensics research, and authorized security assessments**. It is not intended for unauthorized covert communication or data exfiltration. Always acquire proper authorization before analyzing external files or systems.
