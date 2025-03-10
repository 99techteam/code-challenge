import { Request, Response, NextFunction } from 'express';

interface ErrorResponse extends Error {
    statusCode?: number;
}

const errorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);

    const statusCode = err.statusCode || 500;
    const env = process.env.NODE_ENV || 'development';

    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        error: env === 'development' ? err : {},
    });
};


export default errorHandler;
