-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS resources_db;

-- Use the database
USE resources_db;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON resources_db.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- Create the resources table
CREATE TABLE IF NOT EXISTS resources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_isActive ON resources(isActive);

-- Insert sample data
INSERT IGNORE INTO resources (id, name, description, category, isActive) VALUES
(1, 'Sample Resource 1', 'This is a sample resource for testing', 'Testing', TRUE),
(2, 'Sample Resource 2', 'Another sample resource', 'Demo', TRUE),
(3, 'Sample Resource 3', 'Third sample resource', 'Testing', FALSE); 