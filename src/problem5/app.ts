import express from 'express';
import bodyParser from 'body-parser';
import resourceRoutes from './routes/resourceRoutes';

const app = express();
app.use(bodyParser.json());
app.use('/resources', resourceRoutes);

export default app;
