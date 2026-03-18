import express from 'express';
import userRouter from './ports/primary/user.controller';
import errorHandler from './configs/error.middleware';

const app = express();
const port = 3000;

app.use(express.json());
app.use(errorHandler);

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/users', userRouter);

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
