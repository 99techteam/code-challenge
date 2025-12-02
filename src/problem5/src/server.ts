import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import routes from './routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ message: 'Task API is running', docs: '/api/tasks' });
});

app.use('/api', routes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error', detail: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`);
  });
}

export default app;
