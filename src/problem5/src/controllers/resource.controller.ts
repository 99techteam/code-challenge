import type { RequestHandler } from 'express';
import {
  createResource as createResourceRecord,
  deleteResource as deleteResourceRecord,
  getResourceById,
  listResources,
  updateResource as updateResourceRecord,
} from '../services/resource.service.js';
import {
  parseCreateResource,
  parseResourceId,
  parseResourceListQuery,
  parseUpdateResource,
} from '../validations/resource.validation.js';

export const createResource: RequestHandler = async (req, res) => {
  const input = parseCreateResource(req.body);
  const resource = await createResourceRecord(input);
  res.status(201).json(resource);
};

export const listResourceRecords: RequestHandler = async (req, res) => {
  const query = parseResourceListQuery(req.query);
  const result = await listResources(query);
  res.json(result);
};

export const getResource: RequestHandler<{ id: string }> = async (req, res) => {
  const id = parseResourceId(req.params.id);
  const resource = await getResourceById(id);
  res.json(resource);
};

export const updateResource: RequestHandler<{ id: string }> = async (req, res) => {
  const id = parseResourceId(req.params.id);
  const input = parseUpdateResource(req.body);
  const resource = await updateResourceRecord(id, input);
  res.json(resource);
};

export const deleteResource: RequestHandler<{ id: string }> = async (req, res) => {
  const id = parseResourceId(req.params.id);
  await deleteResourceRecord(id);
  res.status(204).end();
};
