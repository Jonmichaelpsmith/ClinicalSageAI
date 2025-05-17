-- Migration: Create document_templates table
-- Date: 2025-05-15

CREATE TABLE IF NOT EXISTS document_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  module_section TEXT NOT NULL,
  description TEXT,
  structure JSONB,
  domains TEXT[],
  recommended_for TEXT[],
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
