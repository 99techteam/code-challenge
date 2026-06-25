import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Resource } from '../entity/Resource';

const resourceRepository = AppDataSource.getRepository(Resource);

export async function createResource(req: Request, res: Response): Promise<Response> {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const resource = resourceRepository.create({ name, description });
  await resourceRepository.save(resource);
  return res.status(201).json(resource);
}

export async function listResources(req: Request, res: Response): Promise<Response> {
  const { name, description } = req.query;
  const where: any = {};

  if (name) {
    where.name = String(name);
  }
  if (description) {
    where.description = String(description);
  }

  const resources = await resourceRepository.find({ where });
  return res.json(resources);
}

export async function getResource(req: Request, res: Response): Promise<Response> {
  const resource = await resourceRepository.findOneBy({ id: Number(req.params.id) });
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  return res.json(resource);
}

export async function updateResource(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  const resource = await resourceRepository.findOneBy({ id });
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const { name, description } = req.body;
  if (name !== undefined) {
    resource.name = name;
  }
  if (description !== undefined) {
    resource.description = description;
  }

  await resourceRepository.save(resource);
  return res.json(resource);
}

export async function deleteResource(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  const resource = await resourceRepository.findOneBy({ id });
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  await resourceRepository.remove(resource);
  return res.status(204).send();
}
