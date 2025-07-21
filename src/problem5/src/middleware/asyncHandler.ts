import { Request, Response, NextFunction, RequestHandler } from 'express';

// Async wrapper to catch errors from async route handlers
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Alternative syntax for class methods
export const asyncMethod = (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const method = descriptor.value;

  descriptor.value = function (req: Request, res: Response, next: NextFunction) {
    const result = method.apply(this, [req, res, next]);
    
    if (result && typeof result.catch === 'function') {
      result.catch(next);
    }
    
    return result;
  };

  return descriptor;
}; 