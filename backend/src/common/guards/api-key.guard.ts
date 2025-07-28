import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const apiSecret = request.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
      throw new UnauthorizedException('API Key 和 Secret 是必需的');
    }

    // 查找API密钥记录
    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: { 
        apiKey: apiKey,
        isActive: true 
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('无效的 API Key');
    }

    // 验证API Secret
    const isSecretValid = await bcrypt.compare(apiSecret, apiKeyRecord.apiSecretHash);
    if (!isSecretValid) {
      throw new UnauthorizedException('无效的 API Secret');
    }

    // 将API密钥信息附加到请求对象
    request.apiKeyInfo = {
      id: apiKeyRecord.id,
      channelName: apiKeyRecord.channelName,
      apiKey: apiKeyRecord.apiKey,
    };

    return true;
  }
} 