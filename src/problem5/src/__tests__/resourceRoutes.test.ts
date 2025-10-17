import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Resource from '../models/Resource';
import dotenv from 'dotenv';

dotenv.config();

describe('Resource Routes', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Resource.deleteMany({});
  });

  it('POST /api/resources should create a resource', async () => {
    const res = await request(app).post('/api/resources').send({ name: 'Test', value: 10 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test');
  });

  it('GET /api/resources should list resources', async () => {
    await Resource.create({ name: 'Test', value: 10 });
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});