import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logDatabase, logError, logInfo } from '../utils/logger';

dotenv.config();

class DatabaseManager {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'resources_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Create the resources table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS resources (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100),
          isActive BOOLEAN DEFAULT TRUE,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;

      await this.pool.execute(createTableQuery);

      // Create indexes for better performance
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name)',
        'CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category)',
        'CREATE INDEX IF NOT EXISTS idx_resources_isActive ON resources(isActive)'
      ];

      for (const indexQuery of indexes) {
        try {
          await this.pool.execute(indexQuery);
        } catch (error) {
          // Ignore "index already exists" errors
          logDatabase('Index creation skipped (likely already exists)');
        }
      }

      logDatabase('Database initialized successfully');
    } catch (error) {
      logError('Error initializing database', error);
      throw error;
    }
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  // Method to seed database with sample data (useful for testing)
  public async seedDatabase(): Promise<void> {
    try {
      const sampleResources = [
        {
          name: 'Sample Resource 1',
          description: 'This is a sample resource for testing',
          category: 'Testing',
          isActive: true
        },
        {
          name: 'Sample Resource 2',
          description: 'Another sample resource',
          category: 'Demo',
          isActive: true
        },
        {
          name: 'Sample Resource 3',
          description: 'Third sample resource',
          category: 'Testing',
          isActive: false
        }
      ];

      // Check if resources table is empty
      const [rows] = await this.pool.execute('SELECT COUNT(*) as count FROM resources');
      const count = (rows as any[])[0].count;
      
      if (count === 0) {
        const insertQuery = `
          INSERT INTO resources (name, description, category, isActive)
          VALUES (?, ?, ?, ?)
        `;

        for (const resource of sampleResources) {
          await this.pool.execute(insertQuery, [
            resource.name,
            resource.description,
            resource.category,
            resource.isActive
          ]);
        }
        logInfo('Database seeded with sample data');
      }
    } catch (error) {
      logError('Error seeding database', error);
    }
  }
}

// Create a singleton instance
export const databaseManager = new DatabaseManager(); 