-- Create dashboards table for storing saved analytics views

CREATE TABLE IF NOT EXISTS dashboards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  vega_spec JSONB NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_dashboards_org ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON dashboards(created_by);

-- Add function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp on update
DROP TRIGGER IF EXISTS update_dashboards_timestamp ON dashboards;
CREATE TRIGGER update_dashboards_timestamp
BEFORE UPDATE ON dashboards
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboards TO current_user;
GRANT USAGE, SELECT ON SEQUENCE dashboards_id_seq TO current_user;