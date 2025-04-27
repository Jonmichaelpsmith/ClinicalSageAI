CREATE TABLE IF NOT EXISTS dashboards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  vega_spec JSONB NOT NULL,
  organization_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dashboards_organization ON dashboards(organization_id);
CREATE INDEX idx_dashboards_created_by ON dashboards(created_by);