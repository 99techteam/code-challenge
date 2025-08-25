import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';

interface ErrorInterface extends Error {
    statusCode?: number;
}

class ErrorHandler {
    static handle(
        error: ErrorInterface,
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const statusCode =
            error.statusCode ?? HttpStatusCode.InternalServerError;
        const responseData = {
            code: statusCode,
            message: error.message || 'Internal Server Error',
        };

        if (statusCode === HttpStatusCode.InternalServerError) {
            console.error(error);
        }

        let stack: any = error.stack;

        if (stack) {
            const errorRegex = /^(\w+):\s(.+)\n([\s\S]+)/;
            const match = stack.match(errorRegex);

            if (match) {
                const [, errorType, errorMessage, stackTrace] = match;

                stack = {
                    type: errorType,
                    message: errorMessage,
                    stackTrace: stackTrace
                        .split('\n')
                        .map((line: string) => line.trim()),
                };
            }
        }

        return res.status(responseData.code).json({
            ...responseData,
            stack,
        });
    }
}

export default ErrorHandler;
