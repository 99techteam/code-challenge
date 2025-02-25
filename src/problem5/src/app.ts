import express, { Request, Response, NextFunction } from 'express';
import taskRouter from './routes/tasks';
import dbPromise from './db';

// Initialize the database table
async function initDb() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
}

initDb().catch(err => console.error('Database initialization failed:', err));

// Set up Express app
const app = express();

app.use(express.json()); // Parse JSON request bodies
app.use('/tasks', taskRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});