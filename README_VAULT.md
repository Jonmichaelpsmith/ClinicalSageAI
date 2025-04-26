# TrialSage Vault™ Setup

## Overview

TrialSage Vault™ is an enterprise-grade document management system designed specifically for regulatory and clinical teams. It features:

- AI-powered document intelligence
- Secure storage with Supabase
- Automatic document summarization and tagging
- FDA 21 CFR Part 11 compliance
- Comprehensive audit logging

## Prerequisites

- Node.js 16+
- Supabase account (https://supabase.com)
- OpenAI API key (https://platform.openai.com)

## Setup Instructions

### 1. Environment Setup

Copy the `.env.template` file to `.env` and fill in your credentials:

```bash
cp .env.template .env
```

Edit the `.env` file with your credentials:

```
# Supabase
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
JWT_SECRET=your-secure-random-string

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Express
PORT=4000
```

### 2. Supabase Setup

Create a new Supabase project and run the setup script:

```bash
node scripts/setup_supabase.js
```

This will:
- Create a `vault-files` storage bucket
- Create `documents` and `audit_logs` tables
- Set up Row Level Security (RLS) policies

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
node server/index.js
```

### 5. In a separate terminal, start the frontend (if using a separate front-end):

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password

### Documents

- `POST /api/documents` - Upload a document with AI analysis
- `GET /api/documents` - List documents (with tenant filtering)
- `GET /api/documents/:id` - Get a specific document

### Audit Logs

- `GET /api/audit` - Get audit logs for the current tenant

## Project Structure

```
├── server/
│   ├── index.js                # Express server entry point
│   ├── lib/
│   │   └── supabaseClient.js   # Supabase client configuration
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── documents.js        # Document management routes
│   │   └── audit.js            # Audit logging routes
│   └── services/
│       └── ai.js               # OpenAI services for document analysis
├── client/                     # React front-end (if applicable)
├── scripts/
│   └── setup_supabase.js       # Database and storage setup script
└── .env                        # Environment variables
```

## Security Notes

- Make sure to keep your API keys and JWT secrets secure
- Use Supabase Row Level Security for data isolation between tenants
- Rotate your JWT secret periodically for enhanced security
- Always serve the application over HTTPS in production