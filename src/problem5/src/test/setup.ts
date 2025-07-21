import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'resources_test_db';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'appuser';
process.env.DB_PASSWORD = 'password'; 