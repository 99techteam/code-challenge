import type { Request, Response, NextFunction } from 'express';

import { authorizeScope } from '../authorize-scope.middleware';

describe('authorizeScope middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 403 if no user or scope info is present', () => {
    authorizeScope(['product:read'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. No scope information found.',
    });
  });

  it('should return 403 if user lacks required scope', () => {
    req.user = { id: 'user-123', role: 'user', scopes: ['product:write'] };
    authorizeScope(['product:read'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Insufficient scope.',
    });
  });

  it('should call next if user has one of the required scopes', () => {
    req.user = { id: 'user-123', role: 'user', scopes: ['product:read', 'product:write'] };
    authorizeScope(['product:read'])(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
