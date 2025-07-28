import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '用户登录', description: '使用用户名和密码进行登录认证' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT令牌' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiResponse({ status: 429, description: '请求过于频繁，请稍后再试' })
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 登录接口：每分钟最多5次尝试
  @Post('login')
  async login(@Request() req: any, @Body() loginDto: LoginDto) {
    return {
      success: true,
      data: await this.authService.login(req.user),
    };
  }

  @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的详细信息' })
  @ApiResponse({ status: 200, description: '成功获取用户信息' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
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

  @ApiOperation({ summary: '用户退出登录', description: '退出当前登录状态' })
  @ApiResponse({ status: 200, description: '退出登录成功' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return {
      success: true,
      data: { message: '退出登录成功' },
    };
  }
} 