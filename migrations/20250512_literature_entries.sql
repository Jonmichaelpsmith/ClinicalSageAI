-- Literature Entries Migration
-- Creates tables and indexes for the enhanced literature discovery feature

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create literature_entries table
CREATE TABLE IF NOT EXISTS literature_entries (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT,
  journal TEXT,
  publication_date DATE,
  pmid TEXT,
  doi TEXT,
  url TEXT,
  source TEXT NOT NULL,
  relevance_score FLOAT,
  full_text TEXT,
  metadata JSONB,
  organization_id TEXT,
  tenant_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create literature_embeddings table
CREATE TABLE IF NOT EXISTS literature_embeddings (
  id SERIAL PRIMARY KEY,
  literature_id INTEGER NOT NULL REFERENCES literature_entries(id) ON DELETE CASCADE,
  embedding_type TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create semantic_search_history table
CREATE TABLE IF NOT EXISTS semantic_search_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  query TEXT NOT NULL,
  result_count INTEGER,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  organization_id TEXT,
  tenant_id TEXT
);

-- Create literature_citations table
CREATE TABLE IF NOT EXISTS literature_citations (
  id SERIAL PRIMARY KEY,
  document_id TEXT NOT NULL,
  section_id TEXT,
  literature_id INTEGER REFERENCES literature_entries(id) ON DELETE SET NULL,
  citation_text TEXT NOT NULL,
  citation_style TEXT DEFAULT 'APA',
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  organization_id TEXT,
  tenant_id TEXT,
  user_id TEXT
);

-- Create literature_summaries table
CREATE TABLE IF NOT EXISTS literature_summaries (
  id SERIAL PRIMARY KEY,
  literature_id INTEGER NOT NULL REFERENCES literature_entries(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  summary_type TEXT NOT NULL, -- e.g., 'abstract', 'conclusion', 'methods', 'full'
  ai_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  organization_id TEXT,
  tenant_id TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_literature_tenant ON literature_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_literature_org ON literature_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_literature_pmid ON literature_entries(pmid);
CREATE INDEX IF NOT EXISTS idx_literature_doi ON literature_entries(doi);
CREATE INDEX IF NOT EXISTS idx_literature_date ON literature_entries(publication_date);
CREATE INDEX IF NOT EXISTS idx_literature_source ON literature_entries(source);
CREATE INDEX IF NOT EXISTS idx_citations_document ON literature_citations(document_id);
CREATE INDEX IF NOT EXISTS idx_citations_literature ON literature_citations(literature_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON semantic_search_history(user_id);