import type { Request, Response, NextFunction } from 'express';

import { validateUpdateProduct } from '../validate-update-product.middleware';

describe('validateUpdateProduct middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next if body is valid', () => {
    req.body = {
      name: 'Updated Product',
      price: 99.99,
      quantity: 5,
    };

    validateUpdateProduct(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if body is invalid', () => {
    req.body = {
      name: 123, // Invalid name
      price: 'cheap', // Invalid price
    };

    validateUpdateProduct(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid request payload',
      errors: expect.any(Array),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
