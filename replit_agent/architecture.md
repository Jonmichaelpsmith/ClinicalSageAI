# TrialSage Architecture

## Overview

TrialSage is a comprehensive platform for clinical trial management, regulatory documentation, and compliance. The system helps pharmaceutical/biotech companies manage their Investigational New Drug (IND) applications, Clinical Study Reports (CSR), and other regulatory documentation. Key features include document management, workflow automation, AI-assisted content generation, and regulatory compliance validation.

The application follows a modern web architecture with a React frontend, Express.js backend, and Supabase (PostgreSQL) database. It includes AI capabilities through OpenAI integration and implements various security measures including AES-256 encryption for sensitive data.

## System Architecture

TrialSage follows a client-server architecture with several interconnected components:

### Frontend

- **Framework**: React 18+ with TypeScript
- **UI Components**: shadcn components library
- **Styling**: TailwindCSS
- **State Management**: React Context/Query with server state

### Backend

- **Primary Server**: Express.js (Node.js)
- **Secondary API**: FastAPI (Python) for specific AI-related functionality
- **Authentication**: JWT-based authentication with Supabase integration

### Data Layer

- **Primary Database**: PostgreSQL (via Supabase)
- **File Storage**: Local file system with capability to use S3 or other storage solutions
- **Caching**: Not explicitly defined, likely using in-memory or Redis (implied by Celery integration)

### AI Integration

- **Primary AI Provider**: OpenAI API
- **Alternative Models**: Hugging Face models (BAAI/bge-large-en-v1.5 for embeddings, mistralai/Mixtral-8x7B-Instruct-v0.1 for text)

## Key Components

### 1. IND Preparation Wizard

A multi-step wizard interface that guides users through all steps of creating an IND application:
- Progress tracking
- Comprehensive forms for each preparation stage
- AI-assisted guidance
- Document generation
- Integration with existing components

### 2. Vault Module

Enterprise-grade document management for regulatory, clinical, and safety documentation:
- Secure document storage
- Powerful document search (metadata and content)
- Version control
- AI-powered document insights (summarization and tagging)
- Audit trails
- Role-based access control
- Optional blockchain verification for document integrity
- FDA 21 CFR Part 11 compliance

### 3. Clinical Evaluation Report (CER) Generation

Automated system for generating Clinical Evaluation Reports:
- Multi-source data integration (FDA FAERS, FDA MAUDE, EU EUDAMED)
- Lean authoring implementation
- Compliance with latest regulations
- PDF generation capabilities

### 4. Knowledge Enhancement System

Automated system for continuously improving the platform's knowledge base:
- Imports clinical trial reports from Health Canada
- Fetches academic papers from PubMed and other sources
- Monitors clinical trial registries for new publications
- Processes data using Hugging Face models
- Schedules regular updates

### 5. CSR Extraction & Structuring Pipeline

Transforms raw PDF Clinical Study Reports into structured, searchable data:
- Text extraction from PDFs
- Structured JSON conversion using LLMs
- Vector embeddings for similarity search
- Database integration for searchable storage

## Data Flow

1. **User Authentication Flow**:
   - User logs in via the frontend
   - Authentication request sent to Supabase
   - JWT token issued and stored for subsequent requests
   - User permissions loaded and applied to the interface

2. **Document Management Flow**:
   - Documents uploaded through the Vault interface
   - Backend validates, processes, and stores documents
   - Metadata stored in PostgreSQL
   - Optional blockchain verification for document integrity
   - AI processing extracts insights and generates summaries

3. **IND Preparation Flow**:
   - User navigates through the wizard interface
   - Data collected at each step
   - AI assistance provides guidance and suggestions
   - Documents generated based on collected data
   - Regulatory compliance validated

4. **Knowledge Enhancement Flow**:
   - Scheduled jobs fetch new clinical trial data
   - Data processed and structured
   - Vector embeddings created for similarity search
   - Knowledge base updated with new information

## External Dependencies

### APIs and Services

1. **Supabase**:
   - Authentication and user management
   - PostgreSQL database for data storage
   - Used for JWT token generation and validation

2. **OpenAI API**:
   - Used for AI-assisted content generation
   - Document summarization
   - Natural language understanding

3. **MashableBI Analytics**:
   - Integration for analytics and business intelligence
   - API endpoints for data visualization

4. **External Data Sources**:
   - Health Canada Clinical Trials Database
   - FDA FAERS (Adverse Event Reporting System)
   - FDA MAUDE (Medical Device Reports)
   - EU EUDAMED (European Database on Medical Devices)
   - PubMed and other academic sources

### Libraries and Frameworks

1. **Frontend**:
   - React 18+
   - TailwindCSS
   - shadcn components

2. **Backend**:
   - Express.js
   - FastAPI
   - Celery (Python task queue)
   - Redis (implied by Celery)

3. **Security**:
   - AES-256 encryption
   - JWT authentication
   - API request signing

## Deployment Strategy

TrialSage is configured for multiple deployment options:

### Vercel Deployment (Primary)

- **Build Process**: Automated through Vercel integration
- **Configuration**: Environment variables set in Vercel project settings
- **Scaling**: Automatic scaling through Vercel
- **Pre-deployment**: Validation scripts ensure build quality
- **Domain**: Custom domain support with SSL

### Docker Deployment (Alternative)

- **Container**: Node.js 20-slim base image
- **Production Mode**: Runs in NODE_ENV=production
- **Server Command**: `node server/index.js`

### Development Environment

- **Local Setup**: npm scripts for development
- **Configuration**: .env files for different environments
- **Port Configuration**: Configurable through environment variables

### CI/CD Considerations

- **Build Validation**: Scripts to validate build artifacts before deployment
- **Environment Variables**: Comprehensive set required for deployment
- **Post-Deployment**: Tasks for configuring services and monitoring

## Security Architecture

1. **Authentication**:
   - JWT-based token authentication
   - Supabase integration for user management
   - Session management and role-based access

2. **Data Protection**:
   - AES-256 encryption for sensitive data
   - API security with request signing
   - SecureToast notification system

3. **Compliance Features**:
   - FDA 21 CFR Part 11 compliance for electronic signatures
   - Comprehensive audit logs
   - Blockchain verification option for data integrity

4. **Frontend Security**:
   - CSRF protection
   - Content Security Policy implementation
   - Input validation and sanitization