import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

sqlite3.verbose();

export async function connectToDatabase(): Promise<Database> {
	const db = await open({
		filename: './app.db',
		driver: sqlite3.Database
	});
	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE
		)
	`);
	return db;
}

class DatabaseConnection {
    private static instance: DatabaseConnection
    private db: Database | null = null;

    private constructor() {}

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async getDatabase(): Promise<Database> {
        this.db = this.db ?? await connectToDatabase();
        return this.db;
    }
}

// By default the database only initializes when the first repository tries to access it
const databaseConnection = DatabaseConnection.getInstance();

export { databaseConnection };