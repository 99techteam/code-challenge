import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authorize user based on their role from JWT payload.
 * @param allowedRoles - list of roles that can access the route
 */
export function authorizeRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const user = req.user;

    if (!user?.role) {
      return res.status(403).json({ message: 'Access denied. No role information found.' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }

    next();
  };
}
