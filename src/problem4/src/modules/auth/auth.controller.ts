import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import BaseController from '@/shared/controllers/base.controller';
import { IAuthController, IAuthService } from './auth.interface';
import { apiSuccess } from '@/shared/utils/response.util';
import { getExpiresIn, sign } from '@/shared/utils/jwt.util';
import { env } from '@/shared/configs';
import { isTrueSet } from '@/shared/utils/string.util';
import { plainObject } from '@/shared/dto';

class AuthController
  extends BaseController<IAuthService>
  implements IAuthController
{
  constructor() {
    super(new AuthService());
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, remember } = req.body;
      const isRemember = isTrueSet(remember);
      const { expiresIn, defaultExpiresInDate } = getExpiresIn(isRemember);
      const loggedUser = await this.service.login(email, password);
      const token = sign(loggedUser, `${defaultExpiresInDate}d`);
      const response = {
        ...loggedUser,
        expires: expiresIn,
      };

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: expiresIn,
      });

      return apiSuccess(res, next, response, 'success');
    } catch (error) {
      next(error);
    }
  }

  public async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = res.locals.user;
      const profile = await this.service.find(user.id);

      return apiSuccess(
        res,
        next,
        plainObject(this.service.dto, profile),
        'success'
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
