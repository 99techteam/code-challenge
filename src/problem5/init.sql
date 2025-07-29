-- Initialize the crud_server database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (though it should already exist from environment variables)
-- SELECT 'CREATE DATABASE crud_server' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'crud_server')\gexec

-- Connect to the crud_server database
\c crud_server;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: The actual tables will be created by MikroORM when the application starts
-- This file can be used for any additional initialization if needed 