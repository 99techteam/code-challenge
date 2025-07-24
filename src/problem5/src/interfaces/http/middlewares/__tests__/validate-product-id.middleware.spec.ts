import express, { type Request, type Response } from 'express';
import request from 'supertest';

import { validateProductId } from '../validate-product-id.middleware';

describe('validateProductId Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/products/:id', validateProductId, (req: Request, res: Response) => {
      res.status(200).json({ message: 'Valid ID' });
    });
  });

  it('should return 400 if id is not a valid UUID', async () => {
    const res = await request(app).get('/products/invalid-id');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid product ID format. Must be a UUID.' });
  });

  it('should call next if id is valid UUID', async () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const res = await request(app).get(`/products/${validUuid}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Valid ID' });
  });
});
