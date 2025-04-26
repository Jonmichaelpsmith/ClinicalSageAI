# TrialSage Vault: Auto-Retention Scheduler

## Introduction

The Auto-Retention Scheduler is an enterprise-grade document lifecycle management module for TrialSage Vault that ensures compliance with regulatory requirements by automating document retention policies. This module helps clinical trial and pharmaceutical organizations maintain proper document management practices in accordance with 21 CFR Part 11, HIPAA, and other regulatory standards.

## Installation

The Auto-Retention Scheduler is pre-installed as part of the TrialSage Vault platform. To verify the installation:

1. Log in to your TrialSage Vault instance
2. Navigate to the Retention Settings page
3. Verify that you can view the retention dashboard

## Configuration Requirements

The Auto-Retention Scheduler requires:

- **Database**: PostgreSQL 13+ for policy and audit storage
- **Email Server**: SMTP configuration for notifications
- **Environment Variables**:
  - `SUPABASE_URL`: URL to your Supabase instance
  - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase
  - `SMTP_HOST`: SMTP server hostname
  - `SMTP_PORT`: SMTP server port
  - `SMTP_USER`: SMTP authentication username
  - `SMTP_PASSWORD`: SMTP authentication password
  - `SMTP_SECURE`: Use TLS for SMTP connection (true/false)
  - `EMAIL_FROM`: Default sender email address

## Getting Started

### Setting Up Your First Retention Policy

1. Navigate to the Retention Settings page
2. Click on "Create Policy"
3. Fill in the policy details:
   - Policy Name: A descriptive name (e.g., "Trial Protocol Retention")
   - Document Type: Select the document type this policy applies to
   - Retention Period: How long to retain documents (e.g., 36 months)
   - Archiving Options: Configure whether to archive before deletion
   - Notification Settings: Configure notification timeframes
4. Save the policy

### Scheduling Policy Execution

The retention job runs automatically on the following schedule:

- Daily at 1:00 AM: Basic cleanup job
- Weekly on Sundays at 2:00 AM: Deep scan job
- Monthly on the 1st at 3:00 AM: Comprehensive archive job

You can customize this schedule by modifying the cron expressions in the configuration.

## Manual Execution

For manual execution or testing, you can run the retention job directly:

### Via Web Interface

1. Navigate to Retention Settings
2. Click the "Run Retention Job" button
3. Monitor progress in the dashboard

### Via Command Line

```bash
# Run from project root directory
node server/bin/run-retention.js
```

This will execute the job with detailed console output.

## Security Features

The Auto-Retention Scheduler implements multiple layers of security:

### Authentication & Authorization

- All retention management actions require authentication
- Policy management requires administrative privileges
- Document operations respect tenant boundaries

### Input Validation

- All inputs are validated using Zod schemas
- Error handling with standardized response format
- Protection against injection attacks

### Audit Logging

- All retention operations are logged with:
  - Timestamp
  - User information
  - Action details
  - Entity references
  - SHA-256 integrity hashing

### Error Handling

- Comprehensive error handling for all operations
- Graceful degradation in failure scenarios
- Detailed error reporting for troubleshooting

## API Documentation

The Auto-Retention Scheduler exposes a RESTful API:

### Policy Management

```
GET    /api/retention/policies         # List all policies
GET    /api/retention/policies/:id     # Get specific policy 
POST   /api/retention/policies         # Create new policy
PUT    /api/retention/policies/:id     # Update existing policy
DELETE /api/retention/policies/:id     # Delete policy
```

### Job Management

```
POST   /api/retention/run-job          # Manually trigger job
GET    /api/retention/document-types   # Get document types
```

## Understanding Audit Logs

The audit log for retention operations uses this format:

```json
{
  "timestamp": "2024-04-26T12:00:00.000Z",
  "action": "document.archive",
  "userId": "user_123",
  "username": "admin_user",
  "entityType": "document",
  "entityId": "doc_456",
  "details": {
    "document_name": "Example.pdf",
    "policy_id": "policy_789",
    "archive_id": "archive_101112"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "application": "TrialSage Vault",
  "version": "1.0.0",
  "integrity_hash": "a1b2c3d4e5f6..."
}
```

## Architecture Details

The Auto-Retention Scheduler uses a modular architecture:

1. **Policy Management Module**
   - Handles CRUD operations for retention policies
   - Performs policy validation
   - Enforces access controls

2. **Job Execution Engine**
   - Processes documents based on policies
   - Manages archiving operations
   - Handles document deletion

3. **Notification System**
   - Detects approaching expirations
   - Sends email notifications
   - Maintains notification history

4. **Audit Logging Subsystem**
   - Records all operations
   - Generates integrity hashes
   - Provides tamper evidence

5. **Dashboard Visualization**
   - Displays retention statistics
   - Shows upcoming expirations
   - Visualizes recent activity

## Best Practices

For optimal use of the Auto-Retention Scheduler:

1. **Document Classification**
   - Ensure all documents have proper type classification
   - Use consistent naming for document types
   - Review document types periodically

2. **Policy Configuration**
   - Align retention periods with relevant regulations
   - Configure notification periods appropriately
   - Document policy reasoning for audit purposes

3. **Monitoring & Maintenance**
   - Review retention dashboard regularly
   - Check audit logs for error patterns
   - Test notification delivery quarterly

4. **Compliance Verification**
   - Maintain documentation of retention policies
   - Archive audit logs for regulatory inspections
   - Perform periodic compliance self-assessments

## Troubleshooting Guide

### Common Issues

| Issue | Possible Causes | Solution |
|-------|----------------|----------|
| Job fails to start | Database connection issue | Check DB connectivity and credentials |
| Documents not archived | Storage path issues | Verify storage path exists and is writable |
| Missing notifications | SMTP configuration | Check SMTP settings and logs |
| Permission errors | Insufficient user role | Ensure user has admin privileges |
| Policy validation errors | Invalid input data | Review policy creation form for errors |

### Diagnostic Commands

To verify database connection:
```sql
SELECT * FROM retention_policies LIMIT 1;
```

To check audit logs:
```bash
cat logs/audit.log | grep "retention"
```

## License

The Auto-Retention Scheduler is part of TrialSage Vault and is covered by the TrialSage Enterprise License. Copyright © 2025 Concept2Cures Inc.