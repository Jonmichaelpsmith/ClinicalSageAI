-- Literature Management Tables for 510(k) submissions
-- Created: May 12, 2025

-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create literature entries table
CREATE TABLE IF NOT EXISTS "literature_entries" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" TEXT NOT NULL,
  "authors" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "abstract" TEXT,
  "publication_date" DATE,
  "journal" TEXT,
  "doi" TEXT,
  "url" TEXT,
  "source_name" VARCHAR(50) NOT NULL,
  "source_id" VARCHAR(100),
  "relevance_score" FLOAT,
  "organization_id" VARCHAR(36) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "embedding" VECTOR(1536)
);

-- Create indices for literature entries table
CREATE INDEX IF NOT EXISTS "idx_literature_entries_source" ON "literature_entries" ("source_name", "source_id");
CREATE INDEX IF NOT EXISTS "idx_literature_entries_organization" ON "literature_entries" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_literature_entries_publication_date" ON "literature_entries" ("publication_date");

-- Create document citations table
CREATE TABLE IF NOT EXISTS "document_citations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "literature_id" VARCHAR(36) NOT NULL,
  "document_id" VARCHAR(36) NOT NULL,
  "document_type" VARCHAR(50) NOT NULL,
  "section_id" VARCHAR(100) NOT NULL,
  "section_name" TEXT,
  "citation_text" TEXT,
  "organization_id" VARCHAR(36) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("literature_id") REFERENCES "literature_entries" ("id") ON DELETE CASCADE
);

-- Create indices for document citations table
CREATE INDEX IF NOT EXISTS "idx_document_citations_document" ON "document_citations" ("document_id", "document_type");
CREATE INDEX IF NOT EXISTS "idx_document_citations_literature" ON "document_citations" ("literature_id");
CREATE INDEX IF NOT EXISTS "idx_document_citations_organization" ON "document_citations" ("organization_id");

-- Create literature summaries table
CREATE TABLE IF NOT EXISTS "literature_summaries" (
  "id" VARCHAR(36) PRIMARY KEY,
  "summary_text" TEXT NOT NULL,
  "summary_type" VARCHAR(50) NOT NULL,
  "focus_area" TEXT,
  "literature_ids" TEXT[] NOT NULL,
  "organization_id" VARCHAR(36) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indices for literature summaries table
CREATE INDEX IF NOT EXISTS "idx_literature_summaries_type" ON "literature_summaries" ("summary_type");
CREATE INDEX IF NOT EXISTS "idx_literature_summaries_organization" ON "literature_summaries" ("organization_id");

-- Create literature summary entries table for many-to-many relationship
CREATE TABLE IF NOT EXISTS "literature_summary_entries" (
  "summary_id" VARCHAR(36) NOT NULL,
  "literature_id" VARCHAR(36) NOT NULL,
  "organization_id" VARCHAR(36) NOT NULL,
  PRIMARY KEY ("summary_id", "literature_id"),
  FOREIGN KEY ("summary_id") REFERENCES "literature_summaries" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("literature_id") REFERENCES "literature_entries" ("id") ON DELETE CASCADE
);

-- Create indices for literature summary entries table
CREATE INDEX IF NOT EXISTS "idx_literature_summary_entries_summary" ON "literature_summary_entries" ("summary_id");
CREATE INDEX IF NOT EXISTS "idx_literature_summary_entries_literature" ON "literature_summary_entries" ("literature_id");
CREATE INDEX IF NOT EXISTS "idx_literature_summary_entries_organization" ON "literature_summary_entries" ("organization_id");

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_literature_entries_timestamp
BEFORE UPDATE ON literature_entries
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_document_citations_timestamp
BEFORE UPDATE ON document_citations
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_literature_summaries_timestamp
BEFORE UPDATE ON literature_summaries
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Organization access control
CREATE OR REPLACE FUNCTION check_literature_entry_organization() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'organization_id cannot be null';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_document_citation_organization() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'organization_id cannot be null';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_literature_summary_organization() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'organization_id cannot be null';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for organization access control
CREATE TRIGGER enforce_literature_entry_organization
BEFORE INSERT OR UPDATE ON literature_entries
FOR EACH ROW
EXECUTE PROCEDURE check_literature_entry_organization();

CREATE TRIGGER enforce_document_citation_organization
BEFORE INSERT OR UPDATE ON document_citations
FOR EACH ROW
EXECUTE PROCEDURE check_document_citation_organization();

CREATE TRIGGER enforce_literature_summary_organization
BEFORE INSERT OR UPDATE ON literature_summaries
FOR EACH ROW
EXECUTE PROCEDURE check_literature_summary_organization();

-- Add created_by field to all tables
ALTER TABLE literature_entries ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);
ALTER TABLE document_citations ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);
ALTER TABLE literature_summaries ADD COLUMN IF NOT EXISTS created_by VARCHAR(36);

-- Comment on tables and columns
COMMENT ON TABLE literature_entries IS 'Stores literature entries from multiple sources for 510(k) submissions';
COMMENT ON TABLE document_citations IS 'Stores citations to literature entries within 510(k) documents';
COMMENT ON TABLE literature_summaries IS 'Stores AI-generated summaries of literature entries';
COMMENT ON TABLE literature_summary_entries IS 'Maps many-to-many relationship between summaries and literature entries';