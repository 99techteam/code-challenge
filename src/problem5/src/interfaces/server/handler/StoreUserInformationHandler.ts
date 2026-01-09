import { Request, Response } from "express";
import * as bcrypt from 'bcrypt';
import { asyncMiddleware } from "../middleware/AsyncMiddleware";
import * as Logger from "../../../utils/Logger";
import { StoreUserInformationUsecase } from "../../../application/usecase/StoreUserInformationUsecase";
import * as schema from "../../../domain/schema";
import { AlreadyExistUserError } from "../../../application/controller/errors/AlreadyExistUserError";

/**
 * Store user information
 *
 * @yields {201} return success storing
 * @yields {409} Already exist user
 * @yields {500} Server error
 */
const handler = async (req: Request, res: Response) => {

  const storeUserUC = new StoreUserInformationUsecase();
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userInformation: schema.IUserData = {
      email: req.body.email,
      password: hashedPassword,
      emailVerified: false,
      name: req.body.name,
      picture: req.body.picture,
      phone: req.body.phone,
      city: req.body.city,
      address: req.body.address,
      age: req.body.age,
      gender: req.body.gender,
      fatherName: req.body.fatherName,
      joinDate: req.body.joinDate,
      userRole: 0,
      isBlock: false
    };
    const user = await storeUserUC.storeUserInformation(userInformation);
    if (user) {
      res.status(201).json({ success: true, user });
    } else {
      res.status(500).json({ success: false, error: "Failed to store user information." });
    }
    return;
  } catch (e) {
    if (e instanceof AlreadyExistUserError) {
      Logger.instance.error(e.message);
      res.status(409).json({success: false, error: e.message});
    } else {
      Logger.instance.error("Unknown error occurred.");
      res.sendStatus(500);
    }
    return;
  }
};

export const StoreUserInformationHandler = asyncMiddleware(handler);
