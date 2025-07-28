import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly usedNonces = new Set<string>();
  private readonly NONCE_EXPIRY = 5 * 60 * 1000; // 5分钟

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const apiSecret = request.headers['x-api-secret'];
    const timestamp = request.headers['x-timestamp'];
    const nonce = request.headers['x-nonce'];

    if (!apiKey || !apiSecret || !timestamp || !nonce) {
      throw new UnauthorizedException('API Key, Secret, timestamp 和 nonce 是必需的');
    }

    // 验证时间戳（防止重放攻击）
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (isNaN(requestTime) || Math.abs(now - requestTime) > this.NONCE_EXPIRY) {
      throw new UnauthorizedException('请求时间戳无效或已过期');
    }

    // 验证nonce（防止重复请求）
    const nonceKey = `${apiKey}:${nonce}:${timestamp}`;
    if (this.usedNonces.has(nonceKey)) {
      throw new UnauthorizedException('重复的请求nonce');
    }
    this.usedNonces.add(nonceKey);

    // 清理过期的nonce（简单实现，生产环境建议使用Redis）
    setTimeout(() => {
      this.usedNonces.delete(nonceKey);
    }, this.NONCE_EXPIRY);

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