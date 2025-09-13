import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUserMethods {
  isCorrectPassword(password: string): Promise<boolean>;
}

export type UserDocument = User & Document & IUserMethods;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  score: number;

  @Prop({ required: true })
  email: string;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    if (typeof this.password === 'string') {
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isCorrectPassword = async function (password: string) {
  if (!password || !this.password) return false;
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.log(error);
    return false;
  }
};
