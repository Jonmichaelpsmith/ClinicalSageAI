-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  module_section TEXT NOT NULL,
  description TEXT,
  structure JSONB,
  fields JSONB,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
