import 'reflect-metadata';
import express from 'express';
import resourceRoutes from './routes/resource';

const app = express();
const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/resources', resourceRoutes);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
