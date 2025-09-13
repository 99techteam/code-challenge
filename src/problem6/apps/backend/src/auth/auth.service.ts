import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (user && (await user.isCorrectPassword(password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new Error('Invalid credentials');
    const token = jwt.sign(
      { uid: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '2d' },
    );
    return { access_token: token };
  }
  async register(username: string, password: string, email: string) {
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) throw new Error('Username already exists');
    const newUser = new this.userModel({
      username,
      password,
      email,
      role: 'user',
    });
    return await newUser.save();
  }
}
