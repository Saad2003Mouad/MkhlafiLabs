# MIKHLAFI LABS — Private Edition Deployment & Administration Guide
# دليل نشر وتشغيل المنصة داخل البنية التحتية الخاصة للعميل (On-Premises / Air-Gapped)

**Document Version:** 2.0.0  
**Classification:** Enterprise Confidential / Deployment Engineering  
**Effective Date:** October 2026  
**Audience:** Chief Technology Officers (CTO), Chief Information Security Officers (CISO), DevSecOps Engineers, Enterprise Infrastructure Auditors.

---

## 1. Executive Architecture & Sovereign Data Guarantees
## 1. البنية المعمارية وضمانات سيادة البيانات

**MIKHLAFI LABS Private Edition (النسخة الخاصة)** is an enterprise decision intelligence platform engineered for on-premises deployment inside sovereign data centers, banking intranets, government clouds, or air-gapped industrial environments.

### Core Guarantees:
1. **100% Data Sovereignty (سيادة البيانات الكاملة):**
   - Zero outbound telemetry or external phone-home network calls.
   - All financial records, ledger transactions, forensic anomaly matrices, and operational logs reside exclusively inside the customer's perimeter.
2. **Offline Cryptographic Licensing (ترخيص تشفير غير متصل):**
   - Verified via deterministic HMAC-SHA256 cryptographic signatures. No continuous internet connection is required to validate entitlement tiers, licensed seats, or maintenance dates.
3. **Provider-Independent AI (ذكاء اصطناعي محلي مستقل):**
   - Operates fully offline using deterministic statistical engines and local on-premises LLM runtimes (such as Ollama or local vLLM). No paid cloud AI API keys (OpenAI, Gemini, Anthropic) are mandatory.
4. **Physical Tenant Storage Segregation (عزل مساحات التخزين):**
   - Dedicated namespaces under `data/tenants/<tenantId>/` with discrete quotas for database storage, export dumps, document uploads, and encrypted backups.

---

## 2. System Prerequisites & Hardware Specifications
## 2. المتطلبات الفنية والمواصفات العتادية

| Component | Minimum Specification (Standard Enterprise) | Recommended (High-Volume / Local LLM) |
| :--- | :--- | :--- |
| **Operating System** | RHEL 9+ / Rocky Linux 9+ / Ubuntu 22.04 LTS | RHEL 9+ / SLES 15 Enterprise |
| **CPU Architecture** | 8 vCPUs (x86_64 or ARM64 Neoverse) | 16–32 vCPUs (AVX-512 supported for local inference) |
| **System Memory (RAM)** | 32 GB ECC DDR4/DDR5 | 64–128 GB ECC DDR5 |
| **Storage Subsystem** | 500 GB NVMe PCIe Gen4 (RAID 1/10) | 2 TB+ Enterprise NVMe (RAID 10) |
| **Network Interfaces** | 1x 10GbE Network Card | 2x 10GbE / 25GbE Redundant Bonding (LACP) |
| **Container Engine** | Docker Engine 24.0+ & Docker Compose v2.20+ | Docker Engine / Podman 4.5+ with rootless support |
| **Database Engine** | PostgreSQL 16.x Enterprise / PGlite in-process | PostgreSQL 16.x with Citus or TimescaleDB extensions |

---

## 3. Air-Gapped Installation & Orchestration Procedure
## 3. خطوات التثبيت داخل البيئات المعزولة عن الإنترنت

### Step 3.1: Offline Image & Artifact Transfer
On an internet-connected build station, export the verified Docker images and code tarball:
```bash
# Export production container image
docker save mikhlafi-labs/platform:latest | gzip -9 > mikhlafi-platform-v2.0.0.tar.gz
docker save postgres:16-alpine | gzip -9 > postgres-16-alpine.tar.gz

# Compute SHA256 checksums
sha256sum mikhlafi-platform-v2.0.0.tar.gz postgres-16-alpine.tar.gz > CHECKSUMS.sha256
```
Transfer the verified artifacts via approved secure media (e.g., cryptographic optical disc or encrypted USB storage) into the target bastion host.

### Step 3.2: Load Images on Target Host
```bash
# Verify integrity
sha256sum -c CHECKSUMS.sha256

# Load container images
docker load < mikhlafi-platform-v2.0.0.tar.gz
docker load < postgres-16-alpine.tar.gz
```

### Step 3.3: Configure Production Environment Variables
Create `/opt/mikhlafi-labs/.env` with strict permissions (`chmod 600 .env`):
```ini
# Core Configuration
NODE_ENV=production
PORT=3000

# PostgreSQL 16 Credentials (Must use strong random strings)
POSTGRES_USER=mikhlafi_prod_admin
POSTGRES_PASSWORD=A9#kL2!z98xP0q1vB7$mZ3#wQ
POSTGRES_DB=mikhlafi_enterprise_production
DATABASE_URL=postgresql://mikhlafi_prod_admin:A9#kL2!z98xP0q1vB7$mZ3#wQ@mikhlafi-db:5432/mikhlafi_enterprise_production?sslmode=disable

# Security Secrets (64+ Characters)
SESSION_SECRET=a8f9c102b3e4d587a6b0c1d2e3f4a5b6c7d8e9f0123456789abcdef012345678
LICENSE_SIGNING_SECRET=mikhlafi_enterprise_private_edition_master_hmac_secret_2026_secure

# AI Inference Mode (Default: Local Deterministic)
AI_PROVIDER=local_deterministic
# Optional Local LLM:
# AI_PROVIDER=local_ollama
# AI_OLLAMA_ENDPOINT=http://mikhlafi-ollama:11434
# AI_OLLAMA_MODEL=llama3.1

# Localization Defaults
DEFAULT_CURRENCY=SAR
DEFAULT_LOCALE=ar
```

### Step 3.4: Launch Services via Docker Compose
```bash
cd /opt/mikhlafi-labs
docker compose up -d

# Check operational logs
docker compose logs -f mikhlafi-app
```

---

## 4. Cryptographic License Issuance & Offline Activation
## 4. إصدار الترخيص المشفر وتفعيله دون اتصال بالإنترنت

Private Edition relies on cryptographic authorization generated by Mikhlafi Labs Operator Authority:

### Issuing an Air-Gapped License (Platform Operator):
```bash
# Call License Manager CLI or Operator API
curl -X POST http://127.0.0.1:3000/api/v1/admin/licenses/issue \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=<OPERATOR_COOKIE>" \
  -d '{
    "organizationId": "c0000000-0000-0000-0000-000000000002",
    "edition": "PRIVATE_ENTERPRISE",
    "tier": "complete",
    "customerName": "Aram Logistics Co.",
    "seats": 250,
    "validDays": 365,
    "maintenanceContractDays": 365,
    "allowedCapabilities": [
      "financial-leaks",
      "executive-decisions",
      "risk-radar",
      "project-intelligence",
      "procurement-suppliers",
      "customer-churn",
      "data-quality",
      "ai-assistant"
    ]
  }'
```

### Verifying the Cryptographic License Offline:
The returned license token contains an immutable canonical payload and HMAC-SHA256 signature:
```json
{
  "licenseKey": "MIKHLAFI-PRIV-0001-2026",
  "organizationId": "c0000000-0000-0000-0000-000000000002",
  "edition": "PRIVATE_ENTERPRISE",
  "tier": "complete",
  "seats": 250,
  "issuedAt": "2026-10-13T20:00:00.000Z",
  "expiresAt": "2027-10-13T20:00:00.000Z",
  "maintenanceExpiresAt": "2027-10-13T20:00:00.000Z",
  "signature": "d4a8e29bf4c017e8..."
}
```
Any modification to the customer name, expiration date, or seat limit automatically invalidates the signature and locks unauthorized capabilities without disrupting core operational uptime.

---

## 5. Per-Tenant Operational Storage Hierarchy
## 5. هيكلية تخزين بيانات المستأجر المعزولة

Each organization receives an isolated, scoped filesystem hierarchy:
```
/app/data/tenants/<tenantId>/
├── db/            # Local tenant database storage / PGlite sqlite files
├── uploads/       # Raw ERP exports, CSV invoices, Excel ledger statements
├── exports/       # Formatted PDF executive reports, forensic audit evidence
├── backups/       # Point-in-time encrypted database dumps (.sql.gz)
└── secrets/       # Rotated ERP read-only database tokens and connector keys
```

### Automated Rollback Safeguard:
If provisioning fails during any step (e.g. database migration timeout or schema conflict), `TenantManager.rollbackTenantProvisioning()` systematically purges orphaned directories and drops any uncommitted schemas, preventing data corruption or storage leakage.

---

## 6. Backup, Restoration & Disaster Recovery
## 6. إجراءات النسخ الاحتياطي والاستعادة في حالات الطوارئ

### Single-Tenant Hot Backup:
To create a standalone, tenant-scoped backup:
```bash
# Dump tenant schema and specific records
docker exec -t mikhlafi-postgres-db pg_dump \
  -U mikhlafi_prod_admin \
  -d mikhlafi_enterprise_production \
  --schema=tenant_<tenantId> \
  --format=custom \
  --file=/var/lib/postgresql/data/backup_tenant_<tenantId>_$(date +%Y%m%d).dump

# Move dump to encrypted tenant backups directory
gzip -9 /opt/mikhlafi-labs/data/tenants/<tenantId>/backups/backup_$(date +%Y%m%d).sql
```

### Restoration Procedure:
```bash
docker exec -i mikhlafi-postgres-db pg_restore \
  -U mikhlafi_prod_admin \
  -d mikhlafi_enterprise_production \
  --clean --if-exists \
  /var/lib/postgresql/data/backup_tenant_<tenantId>_20261013.dump
```

---

## 7. Security Hardening & Reverse Proxy Configuration
## 7. التحصين الأمني وإعداد الوسيط العكسي (Nginx / F5)

Deploy an enterprise reverse proxy in front of port 3000 with mandatory TLS 1.3:

```nginx
# /etc/nginx/conf.d/mikhlafi-platform.conf
server {
    listen 443 ssl http2;
    server_name intelligence.enterprise.internal;

    ssl_certificate /etc/ssl/certs/enterprise_wildcard.crt;
    ssl_certificate_key /etc/ssl/private/enterprise_wildcard.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Enterprise Hardening Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:;" always;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
}
```

---

## 8. Incident Response & Health Verification
## 8. التحقق من الصحة والاستجابة للحوادث

### Healthcheck Command:
```bash
curl -I http://127.0.0.1:3000/api/v1/benchmarks/financial
# Expected: HTTP/1.1 200 OK
```

### Self-Diagnostics Suite:
Run the built-in diagnostic and regression test suite directly inside the production container:
```bash
docker exec -it mikhlafi-platform-runtime node --test apps/api/tests/*.test.js
# Expected: 77 passed, 0 failed
```

---
*MIKHLAFI LABS — Private Edition Deployment Guide*  
*Author: Engineering & Architecture Core*
