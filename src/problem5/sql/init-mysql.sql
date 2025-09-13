-- MySQL initialization script
-- Create resources table with proper constraints and indexes

-- Use the database
USE crud_api;

-- Drop table if exists (for development)
DROP TABLE IF EXISTS resources;

-- Create resources table
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_created_at ON resources(created_at);

-- Insert sample data
INSERT INTO resources (name, description, category, status) VALUES
    ('Database Server', 'Primary MySQL database server', 'infrastructure', 'active'),
    ('Web Application', 'Main web application frontend', 'application', 'active'),
    ('API Gateway', 'Authentication and routing gateway', 'middleware', 'active'),
    ('Monitoring Dashboard', 'System monitoring and alerting', 'tools', 'active'),
    ('Load Balancer', 'Traffic distribution service', 'infrastructure', 'maintenance');

-- Grant permissions to the application user
GRANT SELECT, INSERT, UPDATE, DELETE ON crud_api.resources TO 'crud_user'@'%';
FLUSH PRIVILEGES;