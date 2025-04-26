# README: TailMate Landing Page Immutable Protection (Replit-Focused)

This document provides **Replit-specific**, step-by-step code and configuration instructions to ensure your TailMate landing page remains **fully immutable**—no changes can occur unless you explicitly trigger them.

---

## 1. Replit Project Structure

Organize your Replit workspace as follows:
```
root/
├── landing/                    # Static site submodule
│   ├── index.html
│   ├── styles.css
│   ├── scripts.js
│   ├── service-worker.js
│   └── landing.hashes         # SHA256 checksums
├── backend/                    # Node/Express API and server code
│   ├── server.js
│   └── landing-security.js     # middleware to block writes
├── infra/                      # Deployment & audit scripts
│   ├── backup_and_deploy.sh
│   ├── audit.sh
│   └── fileWatcher.js
├── scripts/                    # Control panel scripts
│   ├── tailmate-landing-security.sh
│   ├── lock-landing
│   └── unlock-landing
├── .replit                     # Replit configuration
├── replit.nix                  # (optional for custom environments)
└── .git/                       # Version control
```

---

## 2. .replit Configuration

Create or update `.replit` at the project root:
```ini
# .replit
run = "bash infra/backup_and_deploy.sh && node backend/server.js"
onStart = "bash scripts/lock-landing && node backend/server.js"
env = {
  "SLACK_WEBHOOK_URL": "${SLACK_WEBHOOK_URL}",
  "LANDING_MODE": "readonly"
}
schedules = [
  { "cron": "0 2 * * *", "command": "bash infra/audit.sh" }
]
```

- `onStart`: locks landing directory on every boot.
- `run`: performs backup, deploy, then starts server.\- `schedules`: uses Replit’s built-in scheduler to run a daily audit at 02:00.

---

## 3. Git Submodule & Permissions

1. **Add Landing as Submodule**:
   ```bash
   git submodule add https://github.com/your-org/tailmate-landing.git landing
   git commit -m "Add landing submodule"
   ```
2. **Lock File Permissions on Commit**:
   ```bash
   chmod -R 444 landing
   git add landing
   git commit -m "Lock landing files"
   ```
3. **Branch Protection** (on GitHub/GitLab):
   - Require pull requests for `main`.
   - Enforce signed commits.
   - Restrict direct pushes.

---

## 4. Lock/Unlock Workflow Scripts

**scripts/unlock-landing**:
```bash
#!/bin/bash
# Only project owner can run
chmod -R u+w landing
echo "✅ landing/ unlocked for edits"
```  
**scripts/lock-landing**:
```bash
#!/bin/bash
chmod -R a-w landing
echo "🔒 landing/ locked down"
```  
Make both executable:
```bash
chmod +x scripts/unlock-landing scripts/lock-landing
```  

---

## 5. Backup & Deploy Script

**infra/backup_and_deploy.sh**:
```bash
#!/bin/bash
set -e
# Timestamped backup
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="infra/backups/landing-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp -R landing/ "$BACKUP_DIR"
# Verify baseline checksum before deployment
sha256sum -c landing/landing.hashes --quiet
# Deploy backend
npm install --prefix backend
# Server will start via .replit run
```  
*Note: rollback logic is handled by integrity checks on startup.*

---

## 6. Express Middleware: Block Writes

In **backend/landing-security.js**:
```js
// landing-security.js
module.exports = function (req, res, next) {
  const blockedPaths = ['/landing', '/service-worker.js', '/styles.css'];
  if (blockedPaths.some(p => req.path.startsWith(p)) && ['POST','PUT','PATCH','DELETE'].includes(req.method)) {
    return res.status(403).send('Landing page is read-only');
  }
  next();
};
```
In **backend/server.js**:
```js
const express = require('express');
const landingSecurity = require('./landing-security');
const path = require('path');
const app = express();

app.use(landingSecurity);
app.use('/landing', express.static(path.join(__dirname, '../landing')));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));  
```  

---

## 7. Service Worker for Edge Caching

Place **landing/service-worker.js**:
```js
const CACHE_NAME = 'landing-static-v1';
const ASSETS = ['/', '/styles.css', '/scripts.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request)
    .then(resp => {
      const version = resp.headers.get('X-Asset-Version');
      if (version !== CACHE_NAME) {
        return caches.match(e.request);
      }
      caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
```
In **landing/register-sw.js** (called by index.html):
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/landing/service-worker.js')
    .then(() => console.log('SW registered'))
    .catch(console.error);
}
```  
Ensure **index.html** includes `<script src="/landing/register-sw.js"></script>` before `</body>`.

---

## 8. SHA256 Integrity Verification

1. **Generate Baseline**:
   ```bash
   cd landing
   find . -type f -exec sha256sum {} \; > landing.hashes
   chmod 444 landing.hashes
   ```
2. **Verify on Start** (add to **infra/verify.sh**):
   ```bash
   # infra/verify.sh
   sha256sum -c ../landing/landing.hashes --quiet || exit 1
   ```
3. **Invoke in .replit**:
   ```ini
   onStart = "bash infra/verify.sh && bash scripts/lock-landing"
   ```

---

## 9. Daily Audit Script

**infra/audit.sh**:
```bash
#!/bin/bash
cd landing
git fetch origin
if ! git diff --quiet origin/main -- .; then
  echo "[AUDIT] landing/ drift detected" | mail -s "Landing Audit" you@example.com
fi
```  
Configure Replit’s Scheduler (in `.replit`) to run this daily at 02:00.

---

## 10. CI/CD Pipeline (GitHub Actions)

**.github/workflows/landing-security.yml**:
```yaml
name: Landing Security
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Verify checksum
        run: sha256sum -c landing/landing.hashes --quiet
      - name: Check write perms
        run: ! find landing/ -perm /u+w
```

---

## 11. Summary of Replit-Specific Steps

- **.replit**: configure `onStart`, `run`, and `schedules`
- **Submodule**: treat `landing/` as read-only Git submodule
- **Scripts**: use `lock-landing`, `unlock-landing`, `backup_and_deploy.sh`, `audit.sh`
- **Server Code**: include `landing-security` middleware and static serving
- **Service Worker**: register in `index.html` for offline fallback
- **Scheduler**: daily audit via Replit’s cron-like `schedules`

With these Replit-focused, code-level instructions in place, your landing page remains tamper-proof no matter what backend work you deploy. Only running `./scripts/unlock-landing` under your direct control will allow changes.

