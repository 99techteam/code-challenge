import type { Request, Response, NextFunction } from 'express';

import { authorizeRole } from '../authorize-role.middleware';

describe('authorizeRole middleware', () => {
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

  it('should return 403 if no user or role is present', () => {
    authorizeRole(['admin'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. No role information found.',
    });
  });

  it('should return 403 if user has invalid role', () => {
    (req as any).user = { role: 'user' };
    authorizeRole(['admin'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Insufficient role.',
    });
  });

  it('should call next if user has valid role', () => {
    (req as any).user = { role: 'admin' };
    authorizeRole(['admin', 'manager'])(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
