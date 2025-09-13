import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async incrementScore(userId: string): Promise<number> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { score: 1 } },
      { new: true },
    );
    if (!user) throw new Error('User not found');
    this.eventEmitter.emit('score.updated', { userId });
    return user.score;
  }

  async getTop10(): Promise<any[]> {
    return this.userModel
      .find()
      .sort({ score: -1 })
      .limit(10)
      .select('username score');
  }
}
