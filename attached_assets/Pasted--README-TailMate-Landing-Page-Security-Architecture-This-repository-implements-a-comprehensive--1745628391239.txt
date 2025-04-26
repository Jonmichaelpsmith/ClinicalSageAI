# README: TailMate Landing Page Security Architecture

This repository implements a comprehensive, multi-layered security system to ensure your TailMate landing page remains **immutable**—only changing when you explicitly authorize it. The security architecture consists of **14 defense layers**, each providing a unique milestone of protection.

---

## Table of Contents

1. [Overview](#overview)
2. [Security Layers](#security-layers)
3. [Getting Started](#getting-started)
4. [Control Panel Script](#control-panel-script)
5. [Deployment Workflows](#deployment-workflows)
6. [Maintenance & Audits](#maintenance--audits)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

TailMate’s landing page security uses a **defense-in-depth** strategy with:  

- **Strategic decoupling** via CDN hosting  
- **Runtime guards** (read-only mounts & server middleware)  
- **Version control safeguards** (Git hooks, submodules, GPG signing)  
- **Continuous verification** (CI/CD pipelines, smoke tests, daily audits)  
- **Automated recovery** (backups & rollbacks)  
- **Immutable deployments** (Docker/IaC & service worker caching)  

By combining these layers, any unauthorized or accidental change to the landing assets is detected and blocked before it impacts end users.

---

## Security Layers

1. **Strategic Decoupling**: Host `landing/` on a dedicated CDN (Netlify/Vercel) via a separate Git repo and DNS routing.
2. **Directory Isolation & Submodule Versioning**: Manage `landing/` as a Git submodule, updated only through tagged releases.
3. **Runtime Read-Only Enforcement**: Use `chmod -R 444` on startup and Express middleware to block write operations.
4. **Git Guardrails & Commit Signing**: Pre-commit hook prevents unauthorized commits; branch protection enforces GPG-signed commits.
5. **Unlock/Lock Workflow Scripts**: `scripts/unlock-landing` and `scripts/lock-landing` manage file permissions under ACL control.
6. **CI/CD Verification Gates**: GitHub Actions pipeline checks for diffs, file permissions, and checksum mismatches on pull requests.
7. **Real-Time Monitoring & Alerts**: `infra/fileWatcher.js` uses `chokidar` and Slack webhooks to notify on any file operations.
8. **Automated Backups & Rollback**: `infra/backup_and_deploy.sh` snapshots before deploy and auto-rolls back if post-deploy checks fail.
9. **Cryptographic Integrity Checks**: SHA256 checksums in `landing/landing.hashes` verified at startup and in CI.
10. **Immutable Infrastructure (Docker & IaC)**: Multi-stage Docker builds produce read-only assets with pinned image digests.
11. **Canary & Staging Gating**: Deploy to a staging domain, run smoke tests, then promote to production on success.
12. **Edge Caching & Service Worker Fallback**: Service worker caches known-good assets and falls back on mismatch.
13. **Scheduled Integrity Audits**: `infra/audit.sh` runs daily via cron to detect drift against upstream Git.
14. **Executive Control Interface**: Unified CLI script (`scripts/tailmate-landing-security.sh`) to monitor and manage all protections.

---

## Getting Started

1. **Clone Repo**  
   ```bash
   git clone https://github.com/your-org/tailmate.git
   cd tailmate
   git submodule update --init --recursive
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Configure Environment**  
   - Set `SLACK_WEBHOOK_URL` for real-time alerts.
   - Ensure `cron` or Replit scheduler is enabled for audits.

4. **Initial Setup**  
   ```bash
   chmod +x scripts/*.sh
   ./scripts/lock-landing     # enforce lockdown
   ```

---

## Control Panel Script

Use `scripts/tailmate-landing-security.sh` to interact with the security system:

```bash
# Show current status (permissions, checksum, backups)
./scripts/tailmate-landing-security.sh status

# Create a fresh backup
./scripts/tailmate-landing-security.sh backup

# Lock landing page files
./scripts/tailmate-landing-security.sh lock

# Temporarily unlock for edits
./scripts/tailmate-landing-security.sh unlock

# Verify checksums
./scripts/tailmate-landing-security.sh verify
```

---

## Deployment Workflows

- **Backend-Only Deploy**: Always run `backup_and_deploy.sh` to snapshot and verify landing integrity.
- **Static Site Updates**:
  1. `cd landing`
  2. `git checkout -b landing-updates`
  3. Make changes → `git tag -a vX.Y.Z`
  4. Push → CDN auto-deploy.
  5. `cd ..` → `git add landing` → PR review → merge.

- **Docker/IaC**: Build images with pinned digests and deploy via Kubernetes or Terraform.

---

## Maintenance & Audits

- **Daily Cron**: `infra/audit.sh` alerts you if `landing/` drift is detected.
- **Canary Releases**: Route to `staging.example.com` for smoke testing.
- **Review Backups**: Stored under `infra/backups`, purged after N days as per policy.

---

## Troubleshooting

- **Service Worker Registration Fails**: Ensure `register-service-worker.ts` path matches your Vite or build output.
- **Checksum Mismatch**: Run `./scripts/tailmate-landing-security.sh backup` and update `landing.hashes` baseline.
- **Pre-Commit Hook Blocked**: Run `./scripts/unlock-landing` or inspect staged files.

---

## Contributing

1. Fork this repo.  
2. Create your feature branch: `git checkout -b feature/your-feature`.  
3. Commit your changes with GPG signature.  
4. Open a pull request with description of your changes.  
5. Ensure all checks (CI, audits) pass.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

*Congratulations! Your TailMate landing page is now protected by an enterprise-grade security architecture.*

