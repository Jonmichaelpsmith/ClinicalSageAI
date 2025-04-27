# TrialSage™ Production Deployment Guide

## Industrial-Grade Server Infrastructure

This document provides instructions for TrialSage's production deployment with enterprise-grade uptime guarantees and fault tolerance.

## Server Components

The TrialSage architecture includes multiple redundant server implementations to ensure maximum reliability:

1. **ES Module Server** (`server-esm.js`) - Primary server implementation using ES modules
2. **CommonJS Server** (`server-cjs.js`) - Secondary server implementation using CommonJS
3. **Legacy Server** (`trialsage-server.mjs`) - Tertiary fallback server

## Startup Methods

### 1. Standard Workflow (Recommended)

The built-in Replit workflow is the recommended way to start TrialSage:

```
npm run dev
```

This automatically handles port bindings, process management, and dependency loading.

### 2. Industrial Grade Mode

For enterprise deployments requiring maximum uptime, use the industrial-grade startup:

```
./start.sh --industrial
```

This starts the server with:
- Watchdog monitoring
- Auto-recovery from crashes
- Memory/resource monitoring
- Detailed logging
- Multi-level fallback system

### 3. Direct Server Mode

For diagnostic purposes, you can directly start a specific server implementation:

```
./start.sh --direct
```

This will auto-detect available server implementations and launch the most appropriate one.

## Watchdog Service

The watchdog service (`trialsage-watchdog.js`) provides continuous monitoring and automatic recovery:

- Health checks every 30 seconds
- Automatic restart of failed servers
- Memory usage monitoring
- Detailed logging of server status
- Self-healing capabilities

To start the watchdog manually:

```
node trialsage-watchdog.js
```

## Logging

Log files are stored in the `logs/` directory:

- `server.log` - General server logs
- `errors.log` - Error-specific logs
- `watchdog.log` - Watchdog service logs
- `<server>-stdout.log` - Standard output from each server type
- `<server>-stderr.log` - Standard error from each server type

## Configuration

Environment variables:

- `NODE_ENV` - Set to "production" for production environments
- `PORT` - Server port (default: 5000)
- `SESSION_SECRET` - Secret key for session encryption (auto-generated if not provided)
- `LOG_LEVEL` - Logging verbosity (default: "info")

## Troubleshooting

If the server is not starting:

1. Check the logs in `logs/` directory for errors
2. Verify the process is not already running (`ps aux | grep node`)
3. Make sure the port is not in use (`lsof -i :5000`)
4. Try starting the server directly with `node server-esm.js`

## Recovery Procedures

In the rare case of complete system failure:

1. Check all logs in `logs/` directory
2. Kill any existing Node.js processes: `pkill -f node`
3. Remove any stale PID files: `rm -f *.pid`
4. Restart with the industrial-grade mode: `./start.sh --industrial`

## Contact

For emergency technical support, contact:

- Technical Lead: support@trialsage.com
- System Administrator: sysadmin@trialsage.com