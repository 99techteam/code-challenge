import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env['PORT'] ?? 3000);

app.use(cors());
app.use(express.json({ limit: '32kb' }));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 120;
}

function notFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

app.post('/resources', async (req: Request, res: Response): Promise<void> => {
  if (!isRecord(req.body) || !validName(req.body.name)) {
    res.status(400).json({ error: 'name is required and must be 1–120 characters' });
    return;
  }
  const description = req.body.description;
  if (description !== undefined && description !== null && typeof description !== 'string') {
    res.status(400).json({ error: 'description must be a string or null' });
    return;
  }

  try {
    const resource = await prisma.resource.create({
      data: { name: req.body.name.trim(), description: description?.trim() || null },
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error('Create resource failed:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

app.get('/resources', async (req: Request, res: Response): Promise<void> => {
  const name = req.query.name;
  if (name !== undefined && typeof name !== 'string') {
    res.status(400).json({ error: 'name filter must be a single string' });
    return;
  }
  try {
    const resources = await prisma.resource.findMany({
      where: name ? { name: { contains: name } } : {},
      orderBy: { createdAt: 'desc' },
    });
    res.json(resources);
  } catch (error) {
    console.error('List resources failed:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.get('/resources/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    res.json(resource);
  } catch (error) {
    console.error('Get resource failed:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

app.put('/resources/:id', async (req: Request, res: Response): Promise<void> => {
  if (!isRecord(req.body)) {
    res.status(400).json({ error: 'Request body must be an object' });
    return;
  }
  const { name, description } = req.body;
  if (name === undefined && description === undefined) {
    res.status(400).json({ error: 'Provide name or description to update' });
    return;
  }
  if (name !== undefined && !validName(name)) {
    res.status(400).json({ error: 'name must be 1–120 characters' });
    return;
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    res.status(400).json({ error: 'description must be a string or null' });
    return;
  }

  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name: (name as string).trim() } : {}),
        ...(description !== undefined ? { description: typeof description === 'string' ? description.trim() : null } : {}),
      },
    });
    res.json(resource);
  } catch (error) {
    if (notFound(error)) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    console.error('Update resource failed:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

app.delete('/resources/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (notFound(error)) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    console.error('Delete resource failed:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction): void => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }
  console.error('Unhandled request error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => console.log(`Resource API listening on http://localhost:${port}`));

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
