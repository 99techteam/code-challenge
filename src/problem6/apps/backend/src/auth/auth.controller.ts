import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;
    return this.authService.login(username, password);
  }
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password, email } = registerDto;
    const user = await this.authService.register(username, password, email);
    return { message: 'User registered successfully', userId: user._id };
  }
}
