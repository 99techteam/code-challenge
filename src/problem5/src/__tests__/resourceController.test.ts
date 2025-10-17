import mongoose, { Document } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Resource, { IResource } from '../models/Resource';
import {
  createResource,
  listResources,
  getResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController';
import { NotFoundError, ValidationError } from '../utils/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

describe('Resource Controller', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB:', connection.connection.name); // Debug log
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Resource.deleteMany({});
  });

  it('should create a resource', async () => {
    const req: Partial<Request> = { body: { name: 'Test', value: 10 } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next: NextFunction = jest.fn();
    await createResource(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test', value: 10 }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw validation error on create', async () => {
    const req: Partial<Request> = { body: { name: '', value: 10 } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next: NextFunction = jest.fn();
    await createResource(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should list resources', async () => {

    const req = { query: {} } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await Resource.create({ name: 'Test', value: 10 });

    await listResources(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Test' })])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should get a resource', async () => {
    const resource: IResource & Document = await Resource.create({ name: 'Test', value: 10 });
    const req: Partial<Request> = { params: { id: resource._id.toString() } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next: NextFunction = jest.fn();
    await getResource(req as Request, res as Response, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw not found on get', async () => {
    const req: Partial<Request> = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next: NextFunction = jest.fn();
    await getResource(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should update a resource', async () => {
    const resource: IResource & Document = await Resource.create({ name: 'Test', value: 10 });
    const req: Partial<Request> = { params: { id: resource._id.toString() }, body: { value: 20 } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next: NextFunction = jest.fn();
    await updateResource(req as Request, res as Response, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ value: 20 }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should delete a resource', async () => {
    const resource: IResource & Document = await Resource.create({ name: 'Test', value: 10 });
    const req: Partial<Request> = { params: { id: resource._id.toString() } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next: NextFunction = jest.fn();
    await deleteResource(req as Request, res as Response, next);
    expect(res.json).toHaveBeenCalledWith({ message: 'Resource deleted successfully' });
    expect(next).not.toHaveBeenCalled();
  });
});