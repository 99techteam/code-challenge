import { BaseService } from '@/shared/services/base.service';
import { User } from '../user/user.entity';
import { UserDto } from '../user/user.dto';
import datasource from '@/databases/datasource';
import { HttpStatusCode } from 'axios';
import { compareHash } from '@/shared/utils/encryption.util';
import { AppError } from '@/shared/utils/error.util';
import { IAuthService, UserPayload } from './auth.interface';

export class AuthService extends BaseService<User> implements IAuthService {
  constructor() {
    const userRepository = datasource.getRepository(User);
    super(userRepository, UserDto);
  }

  public async login(email: string, password: string): Promise<UserPayload> {
    const user = await this.findOne({ email });

    if (!user) {
      throw new AppError('Email does not match.', HttpStatusCode.Forbidden);
    }

    const isMatch = compareHash(password, user.password);

    if (!isMatch) {
      throw new AppError('Password is incorrect.', HttpStatusCode.Forbidden);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
