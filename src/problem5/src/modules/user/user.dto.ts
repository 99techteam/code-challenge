import { Expose } from 'class-transformer';
import { UserAttributes } from './user.interface';

export class UserDto implements UserAttributes {
  @Expose()
  id!: number;

  @Expose()
  username!: string;

  @Expose()
  email!: string;

  password!: string;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;

  @Expose()
  deleted_at!: Date;
}
