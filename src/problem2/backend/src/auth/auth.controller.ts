import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { SwapDto } from '../dto/swap.dto';
import { TransferDto } from '../dto/transfer.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('balances')
  async getBalances(@Request() req) {
    return this.authService.getUserBalances(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('swap')
  async swap(@Request() req, @Body() swapDto: SwapDto) {
    return this.authService.swapTokens(req.user.userId, swapDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transfer(@Request() req, @Body() transferDto: TransferDto) {
    return this.authService.transferTokens(req.user.userId, transferDto);
  }
}
