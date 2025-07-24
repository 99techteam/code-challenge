import type { Request, Response, NextFunction } from 'express';

import { authorizeScope } from '../authorize-scope.middleware';
import { authorizeRole } from '../authorize-role.middleware';

describe('authorizeRole + authorizeScope combined', () => {
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

  it('should fail if user has valid scope but invalid role', () => {
    req.user = {
      id: 'user-123',
      role: 'user',
      scopes: ['product:read'],
    };

    authorizeRole(['admin'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should fail if user has valid role but missing scope', () => {
    req.user = {
      id: 'user-123',
      role: 'admin',
      scopes: ['other:read'],
    };

    authorizeScope(['product:read'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should pass if user has both valid role and scope', () => {
    req.user = {
      id: 'user-123',
      role: 'admin',
      scopes: ['product:read', 'product:write'],
    };

    authorizeRole(['admin'])(req as Request, res as Response, next);
    authorizeScope(['product:read'])(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
