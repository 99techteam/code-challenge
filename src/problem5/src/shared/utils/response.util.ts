import { NextFunction, Response } from 'express';
import { exec } from 'child_process';
import { HttpStatusCode } from 'axios';

export const apiSuccess = <T>(
	response: Response,
	next: NextFunction,
	data: T,
	message?: string | null,
): void => {
	response.locals.data = data;
	response.locals.message = message;

	return next();
};

export const getServerStatus = (port: number): Promise<number> => {
	return new Promise((resolve, reject) => {
		exec(
			`curl -s --retry 10 --retry-connrefused -o /dev/null -w "%{http_code}" http://localhost:${port}/health`,
			(error, stdout, stderr) => {
				if (error) {
					reject(error);
				} else {
					resolve(parseInt(stdout));
				}
			},
		);
	});
};

export const verifyServerHealth = async (port: number) => {
	try {
		const statusCode = await getServerStatus(port);
		if (statusCode === HttpStatusCode.Ok) {
			console.log('Test hosting successful');
			process.exit(0);
		}
		throw new Error(`Test hosting failed: ${statusCode}.`);
	} catch (error) {
		throw new Error(`Error executing curl: ${error}`);
	}
};
