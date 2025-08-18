import { Sequelize } from 'sequelize';
import { config } from '../config';

// Create Sequelize instance
export const sequelize = new Sequelize({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  username: config.database.user,
  password: config.database.password,
  dialect: 'postgres',
  logging: false, // Disable SQL logging for cleaner output
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test database connection
export const testSequelizeConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to database with Sequelize:', error);
    throw error;
  }
};

// Close database connection
export const closeSequelizeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Sequelize database connection closed');
  } catch (error) {
    console.error('Error closing Sequelize connection:', error);
    throw error;
  }
};
