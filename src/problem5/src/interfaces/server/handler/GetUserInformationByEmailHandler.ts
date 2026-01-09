import { Request, Response } from "express";
import { asyncMiddleware } from "../middleware/AsyncMiddleware";
import * as Logger from "../../../utils/Logger";
import { GetUserInformationUsecase } from "../../../application/usecase/GetUserInformationUsecase";

/**
 * Getting user information by userId
 *
 * @yields {200} return user information
 * @yields {404} Not found user
 * @yields {500} Server error
 */
const handler = async (req: Request, res: Response) => {
  try {
    const userUC = new GetUserInformationUsecase();
    const userEmail = req.params['userEmail'];
    const user = await userUC.getUserByEmail(userEmail);
    if (user) {
      res.status(200).json({ success: true , data: user });
    } else {
      res.sendStatus(404);
    }
    return;
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

export const GetUserInformationByEmailHandler = asyncMiddleware(handler);
