import { transformerPassword } from '@shared/utils/encryption.util';
import { BaseEntities } from '@/shared/entities/base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { UserAttributes } from './user.interface';

@Entity('users')
export class User extends BaseEntities implements UserAttributes {
  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({
    type: 'varchar',
    transformer: transformerPassword,
    nullable: false,
  })
  @Exclude()
  password!: string;
}
