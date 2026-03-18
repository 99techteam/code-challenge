import express, { Request, Response, NextFunction } from 'express';
import { userService } from './user.service-impl';

const userRouter = express.Router();

userRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const users = await userService.listBy(req.query);
		res.json(users);
	} catch (err) {
		next(err);
	}
});

userRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await userService.createUser(req.body);
		res.status(201).json(user);
	} catch (err) {
		next(err);
	}
});

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await userService.getUser(req.params.id);
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (err) {
		next(err);
	}
});

userRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await userService.updateUser(req.params.id, req.body);
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (err) {
		next(err);
	}
});

userRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const success = await userService.deleteUser(req.params.id);
		if (success) {
			res.status(204).send();
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (err) {
		next(err);
	}
});

export default userRouter;
