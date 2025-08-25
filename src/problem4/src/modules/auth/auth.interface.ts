import { IBaseService } from '@/shared/services/base';
import { User } from '../user/user.entity';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface IAuthService extends IBaseService<User> {
  login(email: string, password: string): Promise<UserPayload>;
}

export interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface AuthPayload extends JwtPayload {
  id: number;
  email: string;
  username: string;
  avatar: string;
}

export interface AuthAttributes {
  email: string;
  password: string;
  remember?: boolean;
}

export interface UserPayload extends Pick<AuthAttributes, 'email'>, JwtPayload {
  id: number;
  username: string;
  expires?: string | number;
}
