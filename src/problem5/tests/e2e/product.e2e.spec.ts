import type { Server } from 'http';

import request from 'supertest';
import type { Application } from 'express';

import { createApp } from '../../src/infrastructure/http/express/app';
import { prisma } from '../../src/infrastructure/database/prisma/client';
import { redisCache } from '../../src/infrastructure/cache';
type App = Application | Server;

let app: App;
const BASE_URL = '/api/v1/products';

beforeAll(async () => {
  app = await createApp();
  await prisma.product.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  await redisCache.disconnect();
});

describe('Product E2E', () => {
  let createdId: string;

  it('should create a product', async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        stock: 50,
        tags: ['electronics'],
        slug: 'test-product',
        category: 'gadgets',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('should get all products', async () => {
    const res = await request(app).get(BASE_URL);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');

    const { page, total, totalPages } = res.body.pagination;

    expect(typeof page).toBe('number');
    expect(typeof total).toBe('number');
    expect(typeof totalPages).toBe('number');
    expect(totalPages).toBeLessThanOrEqual(total);
  });

  it('should update the product', async () => {
    const res = await request(app)
      .put(`${BASE_URL}/${createdId}`)
      .send({
        name: 'Updated Product',
        description: 'Updated Description',
        price: 1500,
        stock: 100,
        tags: ['updated'],
        slug: 'updated-product',
        category: 'updated-gadgets',
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product');
  });

  it('should get product by id', async () => {
    const res = await request(app).get(`${BASE_URL}/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('should delete the product', async () => {
    const res = await request(app).delete(`${BASE_URL}/${createdId}`);
    expect(res.status).toBe(204);
  });
});
