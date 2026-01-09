import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { asyncMiddleware } from "../middleware/AsyncMiddleware";
import * as Logger from "../../../utils/Logger";
import * as schema from "../../../domain/schema";
import { NotFoundError } from "../../../domain/interface";
import { UpdateUserInformationByIdUsecase,  } from "../../../application/usecase/UpdateUserInformationByIdUsecase";
import { GetUserInformationUsecase } from "../../../application/usecase/GetUserInformationUsecase";

/**
 * Update user information (partial update)
 *
 * @yields {200} User updated successfully
 * @yields {404} User not found
 * @yields {500} Server error
 */
const handler = async (req: Request, res: Response) => {
  const updateUserUC = new UpdateUserInformationByIdUsecase();
  const userUC = new GetUserInformationUsecase();

  try {
    const userId = req.params['userId'];
    const existingUser = await userUC.getUserById(userId);
    if (existingUser == null) {
      return res.status(404).json({
        success: false,
        error: "Not found user with given id.",
      });
    }
    let password = existingUser.password;
    if (req.body.password) {
      password = await bcrypt.hash(req.body.password, 10);
    }

    const payload: schema.IUserData = {
      email: req.body['email'] ?? existingUser.email,
      password: password,
      emailVerified: req.body['emailVerified'] ?? existingUser.emailVerified,
      name: req.body['name'] ?? existingUser.name,
      picture: req.body['picture'] ?? existingUser.picture,
      phone: req.body['phone'] ?? existingUser.phone,
      city: req.body['city'] ?? existingUser.city,
      address: req.body['address'] ?? existingUser.address,
      age: req.body['age'] ?? existingUser.age,
      gender: req.body['gender'] ?? existingUser.gender,
      fatherName: req.body['fatherName'] ?? existingUser.fatherName,
      joinDate: req.body['joinDate'] ?? existingUser.joinDate,
      userRole: req.body['userRole'] ?? existingUser.userRole,
      isBlock: req.body['isBlock'] ?? existingUser.isBlock,
    };

    const updatedUser = await updateUserUC.updateUserInformationById(
      userId,
      payload
    );

    if (updatedUser == null) {
      return res.status(404).json({
        success: false,
        error: "Not found user with given id.",
      });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      Logger.instance.warn(error.message);
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    Logger.instance.error({
      module: "UpdateUserInformationHandler",
      error,
    });

    return res.sendStatus(500);
  }
};

export const UpdateUserInformationHandler = asyncMiddleware(handler);
