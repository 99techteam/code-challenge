import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { createResource, deleteResource, getResourceById, listResources, updateResource } from './repository';
import { HttpError, parseCreatePayload, parseListFilters, parseUpdatePayload } from './validation';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(helmet());
app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/resources', (req, res, next) => {
  try {
    const payload = parseCreatePayload(req.body);
    const resource = createResource(payload);
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

app.get('/resources', (req, res, next) => {
  try {
    const filters = parseListFilters(req.query as Record<string, unknown>);
    const resources = listResources(filters);
    res.json({ data: resources, total: resources.length });
  } catch (error) {
    next(error);
  }
});

app.get('/resources/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'Parameter "id" must be a positive integer.');
    }

    const resource = getResourceById(id);

    if (!resource) {
      throw new HttpError(404, `Resource with id ${id} not found.`);
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
});

app.patch('/resources/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'Parameter "id" must be a positive integer.');
    }

    const payload = parseUpdatePayload(req.body);
    const resource = updateResource(id, payload);

    if (!resource) {
      throw new HttpError(404, `Resource with id ${id} not found.`);
    }

    res.json(resource);
  } catch (error) {
    next(error);
  }
});

app.delete('/resources/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'Parameter "id" must be a positive integer.');
    }

    const removed = deleteResource(id);

    if (!removed) {
      throw new HttpError(404, `Resource with id ${id} not found.`);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, details: error.details ?? null });
    return;
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[UnhandledError]', error);
  res.status(500).json({ error: 'Internal Server Error', message });
});

app.listen(PORT, () => {
  console.log(`Problem 5 API server listening on http://localhost:${PORT}`);
});

