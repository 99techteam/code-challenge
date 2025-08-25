import { Application } from 'express';
import { env } from '.';

const header = (server: Application) => {
	server.use((req, res, next) => {
		const origin = req.headers.origin || '';
		const allowedOrigins = env.app.allow_origin;

		if (allowedOrigins == origin) {
			res.setHeader('Access-Control-Allow-Origin', origin);
		}

		res.header('Access-Control-Allow-Credentials', 'true');
		res.header('preflightContinue', 'false');
		res.header('Connection', 'Keep-Alive');
		res.header(
			'Access-Control-Allow-Methods',
			'GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE',
		);
		res.header(
			'Access-Control-Allow-Headers',
			`Content-Type, Origin, X-Requested-With, Accept, Authorization, access-token, X-Access-Token`,
		);

		if (req.method === 'OPTIONS') {
			res.send(200);
		} else {
			next();
		}
	});
};

export default header;
