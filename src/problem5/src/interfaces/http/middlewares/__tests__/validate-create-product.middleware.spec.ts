import type { Request, Response, NextFunction } from 'express';

import { validateCreateProduct } from '../validate-create-product.middleware';

describe('validateCreateProduct middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

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

  it('should call next() when payload is valid', () => {
    req.body = {
      name: 'Product A',
      description: 'Some description',
      price: 100,
      stock: 10,
      quantity: 5,
      category: `Category A`,
    };

    validateCreateProduct(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if payload is missing fields', () => {
    req.body = {
      name: 'Product A',
    };

    validateCreateProduct(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if fields are of wrong type', () => {
    req.body = {
      name: 'Product A',
      description: 'Description',
      price: 'not a number',
      stock: 'not a number',
      quantity: 'not a number',
      category: 'Category A',
    };

    validateCreateProduct(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });
});
