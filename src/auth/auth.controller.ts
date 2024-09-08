import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, UserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // controller for creating a new user
  @Post('register')
  register(@Body() userDto: UserDto) {
    return this.authService.register(userDto);
  }

  // controller to login a registered user
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
