import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return {
      success: true,
      data: await this.authService.login(req.user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return {
      success: true,
      data: {
        id: req.user.id,
        username: req.user.username,
        fullName: req.user.fullName,
        role: {
          id: req.user.role.id,
          name: req.user.role.name,
          description: req.user.role.description,
        },
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return {
      success: true,
      data: { message: '退出登录成功' },
    };
  }
} 