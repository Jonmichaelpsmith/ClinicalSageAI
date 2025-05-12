-- Migration for Literature Management System for 510(k) Submissions

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create literature sources table
CREATE TABLE IF NOT EXISTS literature_sources (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  api_endpoint VARCHAR(512),
  requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create literature entries table
CREATE TABLE IF NOT EXISTS literature_entries (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  source_id INTEGER NOT NULL REFERENCES literature_sources(id),
  external_id VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[],
  publication_date DATE,
  journal VARCHAR(512),
  abstract TEXT,
  full_text TEXT,
  doi VARCHAR(255),
  pmid VARCHAR(255),
  url VARCHAR(1024),
  citation_count INTEGER DEFAULT 0,
  publication_type VARCHAR(255),
  keywords TEXT[],
  mesh_terms TEXT[],
  embedding VECTOR(1536),
  fulltext_available BOOLEAN DEFAULT FALSE,
  pdf_path VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, organization_id, source_id, external_id)
);

-- Create index on tenant_id and organization_id for data isolation
CREATE INDEX IF NOT EXISTS idx_literature_entries_tenant_org 
ON literature_entries(tenant_id, organization_id);

-- Create index on title and abstract for text search
CREATE INDEX IF NOT EXISTS idx_literature_entries_text_search 
ON literature_entries USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(abstract, '')));

-- Create index on vector embedding for similarity search
CREATE INDEX IF NOT EXISTS idx_literature_entries_embedding 
ON literature_entries USING hnsw (embedding vector_cosine_ops) WITH (ef_construction = 128, m = 16);

-- Create literature search history table
CREATE TABLE IF NOT EXISTS literature_search_history (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  user_id INTEGER,
  query_text TEXT NOT NULL,
  sources TEXT[],
  filters JSONB,
  semantic_search BOOLEAN DEFAULT FALSE,
  result_count INTEGER,
  execution_time_ms INTEGER,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on tenant_id and organization_id for data isolation
CREATE INDEX IF NOT EXISTS idx_literature_search_history_tenant_org 
ON literature_search_history(tenant_id, organization_id);

-- Create literature citations table (which papers are cited in which documents)
CREATE TABLE IF NOT EXISTS literature_citations (
  id SERIAL PRIMARY KEY,
  literature_id INTEGER NOT NULL REFERENCES literature_entries(id),
  document_id INTEGER NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  section_id VARCHAR(255) NOT NULL,
  section_name VARCHAR(255),
  citation_text TEXT,
  tenant_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(literature_id, document_id, document_type, section_id)
);

-- Create index on document_id and document_type for retrieving citations for a document
CREATE INDEX IF NOT EXISTS idx_literature_citations_document 
ON literature_citations(document_id, document_type);

-- Create index on tenant_id and organization_id for data isolation
CREATE INDEX IF NOT EXISTS idx_literature_citations_tenant_org 
ON literature_citations(tenant_id, organization_id);

-- Create literature summaries table (AI-generated summaries of literature)
CREATE TABLE IF NOT EXISTS literature_summaries (
  id SERIAL PRIMARY KEY,
  literature_ids INTEGER[] NOT NULL,
  search_id INTEGER,
  summary_type VARCHAR(50) NOT NULL,
  focus TEXT,
  summary_text TEXT NOT NULL,
  tenant_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  user_id INTEGER,
  model_used VARCHAR(255),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on tenant_id and organization_id for data isolation
CREATE INDEX IF NOT EXISTS idx_literature_summaries_tenant_org 
ON literature_summaries(tenant_id, organization_id);

-- Insert default literature sources
INSERT INTO literature_sources (source_name, source_type, api_endpoint, requires_auth, enabled, priority)
VALUES 
  ('PubMed', 'academic', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/', TRUE, TRUE, 10),
  ('FDA', 'regulatory', 'https://api.fda.gov/', FALSE, TRUE, 9),
  ('ClinicalTrials', 'clinical', 'https://clinicaltrials.gov/api/', FALSE, TRUE, 8)
ON CONFLICT (id) DO NOTHING;