// src/index.ts
import express, { type Request, type Response } from 'express';
import Database from 'better-sqlite3';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize SQLite Database (creates 'app.db' file in the root)
const db = new Database('app.db', { verbose: console.log });

// Create the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active'
  )
`);

// Prepared Statements for performance and security
const insertResource = db.prepare('INSERT INTO resources (name, description, status) VALUES (?, ?, ?)');
const selectAllResources = db.prepare('SELECT * FROM resources');
const selectResourcesByStatus = db.prepare('SELECT * FROM resources WHERE status = ?');
const selectResourceById = db.prepare('SELECT * FROM resources WHERE id = ?');
const updateResource = db.prepare('UPDATE resources SET name = ?, description = ?, status = ? WHERE id = ?');
const deleteResource = db.prepare('DELETE FROM resources WHERE id = ?');

// 1. Create a resource
app.post('/resources', (req: Request, res: Response) => {
  const { name, description, status } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const info = insertResource.run(name, description || null, status || 'active');
    res.status(201).json({ id: info.lastInsertRowid, name, description, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// 2. List resources with basic filters (e.g., ?status=active)
app.get('/resources', (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    let resources;
    if (status && typeof status === 'string') {
      resources = selectResourcesByStatus.all(status);
    } else {
      resources = selectAllResources.all();
    }
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// 3. Get details of a resource
app.get('/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resource = selectResourceById.get(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// 4. Update resource details
app.put('/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    const existing = selectResourceById.get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const updatedName = name !== undefined ? name : existing.name;
    const updatedDesc = description !== undefined ? description : existing.description;
    const updatedStatus = status !== undefined ? status : existing.status;

    updateResource.run(updatedName, updatedDesc, updatedStatus, id);
    res.status(200).json({ id: Number(id), name: updatedName, description: updatedDesc, status: updatedStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// 5. Delete a resource
app.delete('/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const info = deleteResource.run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
