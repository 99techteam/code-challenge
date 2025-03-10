import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import itemRoutes from './routes/ItemRoutes';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

app.use('/api', itemRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
