import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Get database path from environment variables or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Create Sequelize instance with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Test database connection and sync models
export const initDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync all models - create tables if they don't exist
        await sequelize.sync();
        console.log('Database models synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

export default sequelize;