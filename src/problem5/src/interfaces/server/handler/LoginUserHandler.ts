import { Request, Response } from "express";
import { config } from "dotenv";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { asyncMiddleware } from "../middleware/AsyncMiddleware";
import * as Logger from "../../../utils/Logger";
import { GetUserInformationUsecase } from "../../../application/usecase/GetUserInformationUsecase";


config();

const jwtSecretKey = process.env.APP_KEY as string;
/**
 * Getting user information by userId
 *
 * @yields {200} return user information
 * @yields {404} Not found user
 * @yields {500} Server error
 */
const handler = async (req: Request, res: Response) => {

  const userUC = new GetUserInformationUsecase();
  try {
    const { email, password} = req.body;
    const user = await userUC.getUserPasswordByEmail(email);
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }
      const token = jwt.sign({ userId: user._id, userEmail: user.email }, jwtSecretKey, {
        expiresIn: '7d',
      });
      res.status(200).json({ success: true , expire:'7d', token });
    } else {
      res.status(404).json({error:"Not found user."});
    }
    return;
  } catch (e) {
    if (e instanceof Error) {
      Logger.instance.error(e.name);
      if (e.name == "NotFoundError") {
        res.status(404).json({error: "User not found!"});
        return;
      }
    } else {
      Logger.instance.error("Unknown error occurred.");
    }
    res.status(500).json(e);
    return;
  }
};

export const LoginUserHandler = asyncMiddleware(handler);
