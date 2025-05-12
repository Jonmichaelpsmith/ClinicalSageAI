-- Migration for literature entries and embeddings tables
-- This adds support for literature search, semantic embeddings, and citations

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create literature_entries table
CREATE TABLE IF NOT EXISTS literature_entries (
  id TEXT PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[],
  journal TEXT,
  source TEXT NOT NULL,
  year INT,
  abstract TEXT,
  url TEXT,
  pmid TEXT,
  nct_id TEXT,
  doi TEXT,
  publication_type TEXT[],
  summary TEXT,
  insights JSONB,
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create literature_embeddings table for vector search
CREATE TABLE IF NOT EXISTS literature_embeddings (
  id TEXT PRIMARY KEY REFERENCES literature_entries(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  vector vector(1536), -- OpenAI embeddings are 1536-dimensional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_literature_entries_project_id ON literature_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_literature_entries_selected ON literature_entries(selected);
CREATE INDEX IF NOT EXISTS idx_literature_entries_source ON literature_entries(source);
CREATE INDEX IF NOT EXISTS idx_literature_entries_year ON literature_entries(year);
CREATE INDEX IF NOT EXISTS idx_literature_embeddings_project_id ON literature_embeddings(project_id);

-- Create vector index for semantic search
CREATE INDEX IF NOT EXISTS idx_literature_embeddings_vector ON literature_embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamps
DROP TRIGGER IF EXISTS literature_entries_updated_at ON literature_entries;
CREATE TRIGGER literature_entries_updated_at
BEFORE UPDATE ON literature_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS literature_embeddings_updated_at ON literature_embeddings;
CREATE TRIGGER literature_embeddings_updated_at
BEFORE UPDATE ON literature_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();