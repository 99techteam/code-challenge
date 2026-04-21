import { Request, Response } from 'express';
import { HttpStatus } from '../constants/http';
import { datasource } from '../datasource';
import { Resource } from '../entities';
import { CreateDTO, ModifyDTO, ResourceIdDTO, ListDTO } from '../dto/resource.dto';

export const create = async (req: Request, res: Response) => {
  const parsed = CreateDTO.safeParse(req.body);
  if (!parsed.success) {
    res.status(HttpStatus.BadRequest).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const repo = datasource.getRepository(Resource);
  const resource = repo.create(parsed.data);
  const saved = await repo.save(resource);
  res.status(HttpStatus.Created).json(saved);
};

export const list = async (req: Request, res: Response) => {
  const parsed = ListDTO.safeParse(req.query);
  if (!parsed.success) {
    res.status(HttpStatus.BadRequest).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const { name, status, page, size } = parsed.data;
  const qb = datasource.getRepository(Resource).createQueryBuilder('resource');

  if (name) {
    qb.andWhere('resource.name LIKE :name', { name: `%${name}%` });
  }
  if (status) {
    qb.andWhere('resource.status = :status', { status });
  }

  qb.offset((page - 1) * size).limit(size);

  const [items, total] = await qb.getManyAndCount();
  res.json({ data: items, total, page, limit: size });
};

export const get = async (req: Request, res: Response) => {
  const parsed = ResourceIdDTO.safeParse(req.params['id']);
  if (!parsed.success) {
    res.status(HttpStatus.BadRequest).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const resource = await datasource.getRepository(Resource).findOneBy({ id: parsed.data });
  if (!resource) {
    res.status(HttpStatus.NotFound).json({ error: 'Resource not found' });
    return;
  }

  res.json(resource);
};

export const modify = async (req: Request, res: Response) => {
  const idParsed = ResourceIdDTO.safeParse(req.params['id']);
  if (!idParsed.success) {
    res.status(HttpStatus.BadRequest).json({ error: idParsed.error.issues[0]?.message });
    return;
  }

  const parsed = ModifyDTO.safeParse(req.body);
  if (!parsed.success) {
    res.status(HttpStatus.BadRequest).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const repo = datasource.getRepository(Resource);
  const resource = await repo.findOneBy({ id: idParsed.data });

  if (!resource) {
    res.status(HttpStatus.NotFound).json({ error: 'Resource not found' });
    return;
  }

  const { name, description, status } = parsed.data;
  if (name !== undefined) {
    resource.name = name;
  }
  if (description !== undefined) {
    resource.description = description;
  }
  if (status !== undefined) {
    resource.status = status;
  }

  const updated = await repo.save(resource);
  res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
  const parsed = ResourceIdDTO.safeParse(req.params['id']);
  if (!parsed.success) {
    res.status(HttpStatus.BadRequest).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const repo = datasource.getRepository(Resource);
  const resource = await repo.findOneBy({ id: parsed.data });

  if (!resource) {
    res.status(HttpStatus.NotFound).json({ error: 'Resource not found' });
    return;
  }

  await repo.remove(resource);
  res.status(HttpStatus.NoContent).send();
};
