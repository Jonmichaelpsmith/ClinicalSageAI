-- Migration to create the semantic data model for Clinical Study Reports (CSRs)
-- Based on ICH E3 guidelines for Structure and Content of Clinical Study Reports

-- =========================================================================
-- CORE CSR TABLES
-- =========================================================================

-- Clinical Study Report (CSR) Primary Table
CREATE TABLE IF NOT EXISTS "csr_reports" (
  "id" SERIAL PRIMARY KEY,
  "csr_id" VARCHAR(100) NOT NULL UNIQUE,
  "title" VARCHAR(500),
  "study_id" VARCHAR(100),
  "protocol_id" VARCHAR(100),
  "nctrial_id" VARCHAR(100),
  "sponsor" VARCHAR(250),
  "sponsor_id" INTEGER,
  "indication" VARCHAR(250),
  "therapeutic_area" VARCHAR(250),
  "phase" VARCHAR(50),
  "drug_name" VARCHAR(250),
  "region" VARCHAR(100),
  "file_name" VARCHAR(500),
  "file_path" VARCHAR(1000),
  "file_size" INTEGER,
  "upload_date" TIMESTAMP DEFAULT NOW(),
  "report_date" DATE,
  "summary" TEXT,
  "status" VARCHAR(50) DEFAULT 'active',
  "source" VARCHAR(100) DEFAULT 'manual',
  "processed_at" TIMESTAMP,
  "vectorized" BOOLEAN DEFAULT FALSE,
  "has_details" BOOLEAN DEFAULT FALSE,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Detailed CSR Information Table
CREATE TABLE IF NOT EXISTS "csr_details" (
  "id" SERIAL PRIMARY KEY,
  "report_id" INTEGER NOT NULL REFERENCES "csr_reports"("id") ON DELETE CASCADE,
  
  -- Study Design Information
  "study_design" TEXT,
  "study_type" VARCHAR(100),
  "design_features" JSONB,
  "randomization" VARCHAR(100),
  "blinding" VARCHAR(100),
  "control_type" VARCHAR(100),
  
  -- Study Objectives
  "primary_objective" TEXT,
  "secondary_objectives" JSONB,
  "exploratory_objectives" JSONB,
  
  -- Study Description & Context
  "study_description" TEXT,
  "inclusion_criteria" TEXT,
  "exclusion_criteria" TEXT,
  "population" TEXT,
  
  -- Study Timeline & Duration
  "study_start_date" DATE,
  "study_end_date" DATE,
  "study_duration" VARCHAR(100),
  "follow_up_period" VARCHAR(100),
  
  -- Participant Information
  "sample_size" INTEGER,
  "enrollment_details" JSONB,
  "age_range" VARCHAR(100),
  "gender_distribution" JSONB,
  "ethnicity_distribution" JSONB,
  
  -- Treatment & Intervention
  "treatment_arms" JSONB,
  "intervention_details" JSONB,
  "dosing_regimen" TEXT,
  "comparator_details" TEXT,
  
  -- Endpoints & Analysis
  "endpoints" JSONB,
  "primary_endpoints" JSONB,
  "secondary_endpoints" JSONB,
  "statistical_methods" JSONB,
  "analysis_population" TEXT,
  "hypothesis" TEXT,
  
  -- Results
  "results" JSONB,
  "efficacy_results" JSONB,
  "safety_results" JSONB,
  "conclusions" TEXT,
  "limitations" TEXT,
  
  -- Safety Information
  "safety" JSONB,
  "adverse_events" JSONB,
  "serious_adverse_events" JSONB,
  "sae_count" INTEGER,
  "teae_count" INTEGER,
  
  -- Study Completion
  "completion_rate" DOUBLE PRECISION,
  "discontinuation_reasons" JSONB,
  
  -- Processing Information
  "processing_status" VARCHAR(50) DEFAULT 'pending',
  "processed" BOOLEAN DEFAULT FALSE,
  "extraction_date" TIMESTAMP DEFAULT NOW(),
  "processing_log" JSONB,
  "confidence_score" DOUBLE PRECISION,
  "last_updated" TIMESTAMP DEFAULT NOW()
);

-- CSR Document Segments
CREATE TABLE IF NOT EXISTS "csr_segments" (
  "id" SERIAL PRIMARY KEY,
  "report_id" INTEGER NOT NULL REFERENCES "csr_reports"("id") ON DELETE CASCADE,
  "section_id" VARCHAR(50) NOT NULL,
  "section_type" VARCHAR(100) NOT NULL,
  "section_title" VARCHAR(500),
  "section_number" VARCHAR(50),
  "parent_section_id" VARCHAR(50),
  "content" TEXT,
  "page_start" INTEGER,
  "page_end" INTEGER,
  "extracted_entities" JSONB,
  "vector_embedding" JSONB,
  "confidence_score" DOUBLE PRECISION,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- CSR Tables, Figures, and Listings
CREATE TABLE IF NOT EXISTS "csr_elements" (
  "id" SERIAL PRIMARY KEY,
  "report_id" INTEGER NOT NULL REFERENCES "csr_reports"("id") ON DELETE CASCADE,
  "segment_id" INTEGER REFERENCES "csr_segments"("id") ON DELETE SET NULL,
  "element_type" VARCHAR(50) NOT NULL,
  "element_id" VARCHAR(50),
  "title" TEXT,
  "content_text" TEXT,
  "content_json" JSONB,
  "page_number" INTEGER,
  "extracted_data" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- =========================================================================
-- THERAPEUTIC AREAS & TRIAL ONTOLOGIES
-- =========================================================================

-- Therapeutic Areas
CREATE TABLE IF NOT EXISTS "therapeutic_areas" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(250) NOT NULL UNIQUE,
  "parent_id" INTEGER REFERENCES "therapeutic_areas"("id"),
  "description" TEXT,
  "synonyms" JSONB,
  "mesh_id" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Indications
CREATE TABLE IF NOT EXISTS "indications" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(250) NOT NULL UNIQUE,
  "therapeutic_area_id" INTEGER REFERENCES "therapeutic_areas"("id"),
  "description" TEXT,
  "synonyms" JSONB,
  "mesh_id" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Study Phases
CREATE TABLE IF NOT EXISTS "study_phases" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- =========================================================================
-- ENDPOINT AND OUTCOME MEASURE DICTIONARY
-- =========================================================================

-- Endpoint Categories
CREATE TABLE IF NOT EXISTS "endpoint_categories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(250) NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Standard Endpoints
CREATE TABLE IF NOT EXISTS "standard_endpoints" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(250) NOT NULL,
  "category_id" INTEGER REFERENCES "endpoint_categories"("id"),
  "description" TEXT,
  "measure_type" VARCHAR(100),
  "time_frame" VARCHAR(250),
  "synonyms" JSONB,
  "therapeutic_areas" JSONB,
  "frequency" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- CSR-Endpoint Mapping
CREATE TABLE IF NOT EXISTS "csr_endpoints" (
  "id" SERIAL PRIMARY KEY,
  "report_id" INTEGER NOT NULL REFERENCES "csr_reports"("id") ON DELETE CASCADE,
  "endpoint_id" INTEGER REFERENCES "standard_endpoints"("id"),
  "endpoint_type" VARCHAR(50) NOT NULL,
  "custom_endpoint_name" VARCHAR(500),
  "description" TEXT,
  "measure_type" VARCHAR(100),
  "time_frame" VARCHAR(250),
  "results" JSONB,
  "statistical_significance" BOOLEAN,
  "p_value" DOUBLE PRECISION,
  "confidence_interval" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- =========================================================================
-- ANALYTICS & VECTORIZATION
-- =========================================================================

-- CSR Vector Embeddings
CREATE TABLE IF NOT EXISTS "csr_embeddings" (
  "id" SERIAL PRIMARY KEY,
  "report_id" INTEGER NOT NULL REFERENCES "csr_reports"("id") ON DELETE CASCADE,
  "segment_id" INTEGER REFERENCES "csr_segments"("id"),
  "embedding_type" VARCHAR(50) NOT NULL,
  "model_name" VARCHAR(100) NOT NULL,
  "vector_dimension" INTEGER NOT NULL,
  "embedding_vector" JSONB NOT NULL,
  "embedding_text" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- CSR Search Keywords
CREATE TABLE IF NOT EXISTS "csr_keywords" (
  "id" SERIAL PRIMARY KEY,
  "report_id" INTEGER NOT NULL REFERENCES "csr_reports"("id") ON DELETE CASCADE,
  "segment_id" INTEGER REFERENCES "csr_segments"("id"),
  "keyword" VARCHAR(250) NOT NULL,
  "keyword_type" VARCHAR(50),
  "relevance_score" DOUBLE PRECISION,
  "frequency" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- =========================================================================
-- INDEXES
-- =========================================================================

-- CSR Reports indexes
CREATE INDEX IF NOT EXISTS "idx_csr_reports_csr_id" ON "csr_reports"("csr_id");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_nctrial_id" ON "csr_reports"("nctrial_id");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_indication" ON "csr_reports"("indication");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_therapeutic_area" ON "csr_reports"("therapeutic_area");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_phase" ON "csr_reports"("phase");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_drug_name" ON "csr_reports"("drug_name");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_sponsor" ON "csr_reports"("sponsor");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_status" ON "csr_reports"("status");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_upload_date" ON "csr_reports"("upload_date");
CREATE INDEX IF NOT EXISTS "idx_csr_reports_processed" ON "csr_reports"("vectorized");

-- CSR Details indexes
CREATE INDEX IF NOT EXISTS "idx_csr_details_report_id" ON "csr_details"("report_id");
CREATE INDEX IF NOT EXISTS "idx_csr_details_sample_size" ON "csr_details"("sample_size");
CREATE INDEX IF NOT EXISTS "idx_csr_details_processing_status" ON "csr_details"("processing_status");
CREATE INDEX IF NOT EXISTS "idx_csr_details_processed" ON "csr_details"("processed");

-- CSR Segments indexes
CREATE INDEX IF NOT EXISTS "idx_csr_segments_report_id" ON "csr_segments"("report_id");
CREATE INDEX IF NOT EXISTS "idx_csr_segments_section_type" ON "csr_segments"("section_type");
CREATE INDEX IF NOT EXISTS "idx_csr_segments_section_id" ON "csr_segments"("section_id");

-- CSR Elements indexes
CREATE INDEX IF NOT EXISTS "idx_csr_elements_report_id" ON "csr_elements"("report_id");
CREATE INDEX IF NOT EXISTS "idx_csr_elements_segment_id" ON "csr_elements"("segment_id");
CREATE INDEX IF NOT EXISTS "idx_csr_elements_element_type" ON "csr_elements"("element_type");

-- Therapeutic Areas indexes
CREATE INDEX IF NOT EXISTS "idx_therapeutic_areas_parent_id" ON "therapeutic_areas"("parent_id");

-- Indications indexes
CREATE INDEX IF NOT EXISTS "idx_indications_therapeutic_area_id" ON "indications"("therapeutic_area_id");

-- Standard Endpoints indexes
CREATE INDEX IF NOT EXISTS "idx_standard_endpoints_category_id" ON "standard_endpoints"("category_id");

-- CSR Endpoints indexes
CREATE INDEX IF NOT EXISTS "idx_csr_endpoints_report_id" ON "csr_endpoints"("report_id");
CREATE INDEX IF NOT EXISTS "idx_csr_endpoints_endpoint_id" ON "csr_endpoints"("endpoint_id");
CREATE INDEX IF NOT EXISTS "idx_csr_endpoints_endpoint_type" ON "csr_endpoints"("endpoint_type");

-- CSR Embeddings indexes
CREATE INDEX IF NOT EXISTS "idx_csr_embeddings_report_id" ON "csr_embeddings"("report_id");
CREATE INDEX IF NOT EXISTS "idx_csr_embeddings_segment_id" ON "csr_embeddings"("segment_id");
CREATE INDEX IF NOT EXISTS "idx_csr_embeddings_embedding_type" ON "csr_embeddings"("embedding_type");

-- CSR Keywords indexes
CREATE INDEX IF NOT EXISTS "idx_csr_keywords_report_id" ON "csr_keywords"("report_id");
CREATE INDEX IF NOT EXISTS "idx_csr_keywords_segment_id" ON "csr_keywords"("segment_id");
CREATE INDEX IF NOT EXISTS "idx_csr_keywords_keyword" ON "csr_keywords"("keyword");

-- =========================================================================
-- SEED DATA FOR LOOKUP TABLES
-- =========================================================================

-- Seed Study Phases
INSERT INTO "study_phases" ("name", "description") 
VALUES 
  ('Phase 1', 'Initial studies to determine the metabolism and pharmacologic actions of drugs in humans'),
  ('Phase 1/2', 'Combined Phase 1 and Phase 2 studies'),
  ('Phase 2', 'Controlled clinical studies to evaluate the effectiveness of the drug for a particular indication'),
  ('Phase 2/3', 'Combined Phase 2 and Phase 3 studies'),
  ('Phase 3', 'Expanded controlled and uncontrolled trials to gather additional information about effectiveness and safety'),
  ('Phase 4', 'Post-marketing studies to delineate additional information including risks, benefits, and optimal use')
ON CONFLICT (name) DO NOTHING;

-- Seed Endpoint Categories
INSERT INTO "endpoint_categories" ("name", "description") 
VALUES 
  ('Efficacy', 'Endpoints measuring the therapeutic effect of the intervention'),
  ('Safety', 'Endpoints measuring adverse events and safety concerns'),
  ('Pharmacokinetic', 'Endpoints measuring drug absorption, distribution, metabolism, and excretion'),
  ('Pharmacodynamic', 'Endpoints measuring biochemical and physiological effects of drugs'),
  ('Patient-Reported Outcomes', 'Endpoints measuring outcomes directly reported by patients'),
  ('Biomarker', 'Endpoints measuring biological indicators of disease state or treatment response'),
  ('Composite', 'Endpoints combining multiple outcome measures into a single measure'),
  ('Surrogate', 'Endpoints used as substitutes for clinical outcomes')
ON CONFLICT (name) DO NOTHING;

-- Populate ICH E3 Standard CSR Sections
INSERT INTO "csr_segments" ("report_id", "section_id", "section_type", "section_title", "section_number")
SELECT 
  r.id, 
  CONCAT('ICH-', s.section_number), 
  'Standard ICH E3 Section', 
  s.section_title, 
  s.section_number
FROM 
  "csr_reports" r,
  (VALUES
    ('1', 'Title Page'),
    ('2', 'Synopsis'),
    ('3', 'Table of Contents'),
    ('4', 'List of Abbreviations and Definitions'),
    ('5', 'Ethics'),
    ('6', 'Investigators and Study Administrative Structure'),
    ('7', 'Introduction'),
    ('8', 'Study Objectives'),
    ('9', 'Investigational Plan'),
    ('9.1', 'Overall Study Design and Plan'),
    ('9.2', 'Discussion of Study Design'),
    ('9.3', 'Selection of Study Population'),
    ('9.3.1', 'Inclusion Criteria'),
    ('9.3.2', 'Exclusion Criteria'),
    ('9.4', 'Treatments'),
    ('9.5', 'Efficacy and Safety Variables'),
    ('9.6', 'Data Quality Assurance'),
    ('9.7', 'Statistical Methods Planned in the Protocol'),
    ('9.8', 'Changes in the Conduct of the Study'),
    ('10', 'Study Patients'),
    ('10.1', 'Disposition of Patients'),
    ('10.2', 'Protocol Deviations'),
    ('11', 'Efficacy Evaluation'),
    ('11.1', 'Data Sets Analyzed'),
    ('11.2', 'Demographic and Other Baseline Characteristics'),
    ('11.3', 'Measurements of Treatment Compliance'),
    ('11.4', 'Efficacy Results and Tabulations'),
    ('12', 'Safety Evaluation'),
    ('12.1', 'Extent of Exposure'),
    ('12.2', 'Adverse Events'),
    ('12.3', 'Deaths, Serious Adverse Events, and Other Significant Adverse Events'),
    ('12.4', 'Clinical Laboratory Evaluation'),
    ('12.5', 'Vital Signs, Physical Findings, and Other Observations'),
    ('13', 'Discussion and Overall Conclusions'),
    ('14', 'Tables, Figures, and Graphs'),
    ('15', 'Reference List'),
    ('16', 'Appendices')
  ) AS s(section_number, section_title)
WHERE r.csr_id IS NOT NULL AND r.has_details = true AND NOT EXISTS (
  SELECT 1 FROM "csr_segments" 
  WHERE report_id = r.id AND section_id = CONCAT('ICH-', s.section_number)
);

-- Create row migration tracking
CREATE TABLE IF NOT EXISTS "_migration_metadata" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "executed_at" TIMESTAMP DEFAULT NOW()
);

INSERT INTO "_migration_metadata" ("name") VALUES ('0002_csr_semantic_model.sql');