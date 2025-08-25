import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  Secret,
  SignOptions,
  TokenExpiredError,
} from 'jsonwebtoken';
import { env } from '../configs';
import { HttpStatusCode } from 'axios';
import { AuthPayload } from '@/modules/auth/auth.interface';
import { AppError } from './error.util';
import type { StringValue } from 'ms';

const { expires_in, secret: initSecret } = env.jwt;

export const sign = (
  data: string | Buffer | object,
  expiresIn: number | StringValue,
  secret: Secret = initSecret
): string => {
  const options: SignOptions = {};

  if (expiresIn !== undefined) {
    options.expiresIn = expiresIn;
  }

  return jwt.sign(data, secret, options);
};

export const getExpiresIn = (remember = false) => {
  const currentDate = new Date();
  let defaultExpiresInDate = expires_in;
  if (remember) {
    defaultExpiresInDate = 30;
  }

  currentDate.setDate(currentDate.getDate() + defaultExpiresInDate);
  return {
    expiresIn: Math.floor(currentDate.getTime() / 1000),
    defaultExpiresInDate,
  };
};

export const verifyToken = (token: string, secret: string): AuthPayload => {
  try {
    return jwt.verify(token, secret) as AuthPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError('The token has expired.', HttpStatusCode.Unauthorized);
    }
    if (error instanceof JsonWebTokenError) {
      throw new AppError('Invalid token.', HttpStatusCode.BadRequest);
    }
    if (error instanceof NotBeforeError) {
      throw new AppError('Token is not active.', HttpStatusCode.BadRequest);
    }

    throw new AppError('Token is unknown.', HttpStatusCode.BadRequest);
  }
};
