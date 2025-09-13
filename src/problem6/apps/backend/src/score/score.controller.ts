import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScoreService } from './score.service';

@Controller('api/score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('update')
  @UseGuards(AuthGuard('jwt'))
  async updateScore(@Req() req) {
    const userId = req.user.userId;
    const newScore = await this.scoreService.incrementScore(userId);
    return { message: 'Score updated', newScore };
  }

  @Get('top10')
  async getTop10() {
    return this.scoreService.getTop10();
  }
}
