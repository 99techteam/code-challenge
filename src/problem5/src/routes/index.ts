import { Router } from 'express';

import Paths from './common/Paths';
import UserRoutes from './UserRoutes';

const apiRouter = Router();


// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Search, UserRoutes.search);
userRouter.get(Paths.Users.GetOne, UserRoutes.getOne);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

export default apiRouter;
