# IND Wizard FastAPI Service

This guide explains how to launch the IND Wizard API, access the user interfaces, and generate eCTD sequences.

## Prerequisites

- Python 3.11 or higher
- `OPENAI_API_KEY` environment variable for AI features
- Optional environment variables:
  - `REDIS_URL` – Celery broker/backend URL (default `redis://localhost:6379/0`)
  - `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` – email alert settings
  - `TEAMS_WEBHOOK_URL` – Microsoft Teams notifications

## Starting the Service

From the project root run:

```bash
python start_ind_automation_api.py
```

The service starts on port `8001`. Visit `http://localhost:8001/docs` to view the interactive Swagger documentation.

## HTML Interfaces

The repository includes several static pages showcasing the IND Wizard UI:

- [ind-wizard.html](../ind-wizard.html) – basic workflow demo
- [ind-wizard-marketing.html](../ind-wizard-marketing.html) – marketing landing page
- [solutions_ind_wizard.html](../solutions_ind_wizard.html) – solution overview

Open these files in a browser while the API is running for a complete experience.

## Building eCTD Sequences

1. **Create a project**
   ```bash
   curl -X POST http://localhost:8001/api/projects \
        -H 'Content-Type: application/json' \
        -d '{"sponsor":"ACME Pharma","drug_name":"DemoDrug","protocol":"DD-101","pi_name":"Dr. Smith","pi_address":"123 Main St"}'
   ```
   Note the returned `project_id`.
2. **Generate the next sequence number**
   ```bash
   curl -X POST http://localhost:8001/api/ind/$PROJECT_ID/sequence
   ```
   The response contains the new `serial_number`.
3. **Download the eCTD package**
   ```bash
   curl -O http://localhost:8001/api/ind/$PROJECT_ID/ectd/$SERIAL_NUMBER
   ```
   The resulting ZIP contains the CTD folder structure, index.xml, and checksums.

Alternatively, use the `EctdBuilder` component found in the client application to trigger these steps through the UI.
