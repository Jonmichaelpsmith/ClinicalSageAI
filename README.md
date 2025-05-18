# TrialSage™ - Multi-tenant Clinical Research Platform

TrialSage™ is an advanced multi-tenant AI-powered regulatory document management platform for clinical research professionals, focusing on streamlined Clinical Evaluation Report (CER) generation and comprehensive compliance analysis.

## Key Features

- **Multi-tenant Architecture**: Enterprise-grade security isolation with tenant-specific contexts
- **Quality Management**: Risk-based quality controls with CTQ (Critical-to-Quality) factor management
- **Regulatory Compliance**: Comprehensive tracking, documentation, and validation
- **Document Management**: Streamlined document creation, storage, and retrieval
- **AI-powered Analysis**: Advanced analysis of clinical data and literature

## Documentation

- [Progress Tracking](./PROGRESS.md) - Current status of project implementation
- [Quality Gating API Reference](./docs/quality-gating-api-reference.md) - API endpoints for validation
- [Deployment Guide](./DEPLOYMENT.md) - Instructions for deploying the platform

## Technical Stack

- **Frontend**: React with Shadcn/UI components
- **Backend**: Express.js and FastAPI
- **Database**: PostgreSQL with row-level security
- **Authentication**: Clerk.dev with custom tenant context
- **ORM**: Drizzle for database interactions
- **AI Integration**: OpenAI GPT-4o for document intelligence

## Getting Started
### Prerequisites
- Python 3.11+
- Node.js 18+

1. Clone the repository
2. Install dependencies using `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server with `npm run dev`

## Architecture

The platform uses a multi-tenant architecture similar to Salesforce's model, with strict tenant isolation at both application and database levels. All tables include organization_id columns enforced through Row-Level Security policies, and API requests pass through tenant context middleware.

## eCTD Module

TrialSage includes utilities for generating and validating Electronic Common Technical Document (eCTD) sequences.

### Routes and Utilities
- `POST /api/ectd` - create a new dossier skeleton
- `GET /api/ectd/:id/outline` - retrieve the outline and AI suggestions
- `POST /api/ectd/validate` - upload a sequence ZIP for validation
- `GET /api/ectd/validate/:jobId` - check validation status

The builder UI is available at `/ectd-planner` when running the client.

Relevant source files:
- [server/utils/ectd_xml.py](server/utils/ectd_xml.py)
- [server/utils/write_ectd_xml.py](server/utils/write_ectd_xml.py)
- [server/routes/ectd.js](server/routes/ectd.js)
- [server/routes/ectdValidator.js](server/routes/ectdValidator.js)
- [server/routes/sequence_create_region.py](server/routes/sequence_create_region.py)

### Generating a Sequence

Sequences can be generated via the API. Example using `curl`:
```bash
curl -X POST http://localhost:3000/api/ind/sequence/create-region \
  -H 'Content-Type: application/json' \
  -d '{"base": "0000", "region": "FDA", "plan": []}'
```

## License

Proprietary software - All rights reserved

