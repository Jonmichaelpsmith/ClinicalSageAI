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

1. Clone the repository
2. Install dependencies using `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server with `npm run dev`

## Architecture

The platform uses a multi-tenant architecture similar to Salesforce's model, with strict tenant isolation at both application and database levels. All tables include organization_id columns enforced through Row-Level Security policies, and API requests pass through tenant context middleware.

## CSR Intelligence Engine

TrialSage's CSR Intelligence Engine converts clinical study reports into structured knowledge that powers search and benchmarking across thousands of documents. The `knowledge_scheduler.js` script keeps this knowledge current by automatically importing new CSRs, enhancing academic sources, and monitoring journal feeds.

### Scheduler Commands

```bash
node knowledge_scheduler.js
node knowledge_scheduler.js status
```

For advanced configuration and manual task options, see [KNOWLEDGE_ENHANCEMENT_README.md](./KNOWLEDGE_ENHANCEMENT_README.md).

## License

Proprietary software - All rights reserved