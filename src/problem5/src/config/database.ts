import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface Database {
  run: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  close: () => Promise<void>;
}

class DatabaseConnection {
  private db: sqlite3.Database | null = null;
  private isConnected: boolean = false;

  constructor(private filename: string = 'database.sqlite') {
    // Enable verbose mode for better debugging
    sqlite3.verbose();
    
    // Use in-memory database for tests
    if (process.env.NODE_ENV === 'test') {
      this.filename = ':memory:';
    }
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.filename, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database.');
          this.isConnected = true;
          resolve();
        }
      });
    });
  }

  public async initialize(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    // Create resources table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.run(createTableSQL);
    
    // Create trigger to update updated_at timestamp
    const createTriggerSQL = `
      CREATE TRIGGER IF NOT EXISTS update_resources_updated_at
      AFTER UPDATE ON resources
      FOR EACH ROW
      BEGIN
        UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `;

    await this.run(createTriggerSQL);
    
    console.log('Database tables initialized successfully.');
  }

  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed.');
          this.isConnected = false;
          this.db = null;
          resolve();
        }
      });
    });
  }

  public getDatabase(): Database {
    return {
      run: this.run.bind(this),
      get: this.get.bind(this),
      all: this.all.bind(this),
      close: this.close.bind(this)
    };
  }
}

// Singleton database instance
let dbInstance: DatabaseConnection | null = null;

export const getDatabase = (): Database => {
  if (!dbInstance) {
    dbInstance = new DatabaseConnection();
  }
  return dbInstance.getDatabase();
};

export const initializeDatabase = async (): Promise<void> => {
  if (!dbInstance) {
    dbInstance = new DatabaseConnection();
    await dbInstance.connect();
  }
  await dbInstance.initialize();
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};