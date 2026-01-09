import { Request, Response } from "express";
import { asyncMiddleware } from "../middleware/AsyncMiddleware";
import * as Logger from "../../../utils/Logger";
import { GetUserInformationUsecase } from "../../../application/usecase/GetUserInformationUsecase";

/**
 * Getting user information
 *
 * @yields {200} return user information
 * @yields {404} Not found user
 * @yields {500} Server error
 */
const handler = async (req: Request, res: Response) => {
  try {
    const userUC = new GetUserInformationUsecase();
    const page = req.body.page ? Number(req.body.page) : (req.query.page ? Number(req.query.page) : 1);
    const limit = req.body.limit ? Number(req.body.limit) : (req.query.limit ? Number(req.query.limit) : 10);
    const filters = {
      email: req.body.email ?? req.query.email as string | undefined,
      name: req.body.name ?? req.query.name as string | undefined,
      city: req.body.city  ?? req.query.city as string | undefined,
      gender: req.body.gender ?? req.query.gender as string | undefined,
      userRole: req.body.userRole ?? req.query.userRole !== undefined
        ? Number(req.body.userRole ?? req.query.userRole)
        : undefined,
      isBlock: req.body.isBlock ?? req.query.isBlock !== undefined
        ? Number(req.body.isBlock ?? req.query.isBlock)
        : undefined
    };
    const users = await userUC.getAllUsers(filters, {
      page,
      limit
    });
    if (users) {
      res.status(200).json({ success: true , users });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    if (e instanceof Error) {
      Logger.instance.error(e.message);
    } else {
      Logger.instance.error("Unknown error occurred.");
    }
    res.status(500).json(e);
  }
};

export const GetAllUserInformationHandler = asyncMiddleware(handler);
