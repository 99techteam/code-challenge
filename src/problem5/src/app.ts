import express from 'express';
import { errorHandler, notFoundHandler } from './errors/error-handler.js';
import { resourceRouter } from './routes/resource.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/resources', resourceRouter);
app.use(notFoundHandler);
app.use(errorHandler);
