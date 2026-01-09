import { Request, Response } from 'express';
import { asyncMiddleware } from '../middleware/AsyncMiddleware';
import * as Logger from '../../../utils/Logger';
import { UpdateUserInformationByIdUsecase } from '../../../application/usecase/UpdateUserInformationByIdUsecase';
import { GetUserInformationUsecase } from '../../../application/usecase/GetUserInformationUsecase';

/**
 * Getting user information by userId
 *
 * @yields {200} return user information
 * @yields {404} Not found user
 * @yields {500} Server error
 */
const handler = async (req: Request, res: Response) => {
  try {
    const userUpdateUC = new UpdateUserInformationByIdUsecase();
    const userUC = new GetUserInformationUsecase();
    const userId = req.params['userId'];
    const user = await userUC.getUserById(userId);
    if (user) {
      Logger.instance.info({ "message": { "Delete User Handler: User found, proceeding to delete.": user } });
      const success = await userUpdateUC.deleteUserById(userId);
      if (success) {
        res.status(200).json({ success: true, message: "User deleted successfully." });
      } else {
        res.sendStatus(404);
      }
      return;
    } else {
      res.sendStatus(404);
      return;
    }

  } catch (e) {
    if (e instanceof Error) {
      Logger.instance.error(e.message);
    } else {
      Logger.instance.error("Unknown error occurred.");
    }
    res.sendStatus(500);
    return;
  }
};

export const DeleteUserInformationByIdHandler = asyncMiddleware(handler);
