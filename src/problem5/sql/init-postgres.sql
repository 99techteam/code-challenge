-- PostgreSQL initialization script
-- Create resources table with proper constraints and indexes

-- Drop table if exists (for development)
DROP TABLE IF EXISTS resources CASCADE;

-- Create resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_created_at ON resources(created_at);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at 
    BEFORE UPDATE ON resources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO resources (name, description, category, status) VALUES
    ('Database Server', 'Primary PostgreSQL database server', 'infrastructure', 'active'),
    ('Web Application', 'Main web application frontend', 'application', 'active'),
    ('API Gateway', 'Authentication and routing gateway', 'middleware', 'active'),
    ('Monitoring Dashboard', 'System monitoring and alerting', 'tools', 'active'),
    ('Load Balancer', 'Traffic distribution service', 'infrastructure', 'maintenance');

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON TABLE resources TO crud_user;
-- GRANT USAGE, SELECT ON SEQUENCE resources_id_seq TO crud_user;