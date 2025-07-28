import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  // 生成API Key和Secret
  private generateApiCredentials() {
    const apiKey = 'ak_' + crypto.randomBytes(16).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');
    return { apiKey, apiSecret };
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    
    const [apiKeys, total] = await Promise.all([
      this.prisma.apiKey.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          channelName: true,
          apiKey: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.apiKey.count(),
    ]);

    return {
      success: true,
      data: {
        apiKeys,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async findOne(id: number) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        channelName: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API密钥不存在');
    }

    return {
      success: true,
      data: apiKey,
    };
  }

  async create(createApiKeyDto: CreateApiKeyDto, userId: number) {
    // 检查渠道名称是否已存在
    const existingApiKey = await this.prisma.apiKey.findFirst({
      where: { channelName: createApiKeyDto.channelName },
    });

    if (existingApiKey) {
      throw new BadRequestException('该渠道名称已存在');
    }

    // 生成API凭证
    const { apiKey, apiSecret } = this.generateApiCredentials();
    
    // 哈希API Secret
    const saltRounds = 10;
    const apiSecretHash = await bcrypt.hash(apiSecret, saltRounds);

    try {
      const newApiKey = await this.prisma.apiKey.create({
        data: {
          channelName: createApiKeyDto.channelName,
          apiKey: apiKey,
          apiSecretHash: apiSecretHash,
          isActive: createApiKeyDto.isActive ?? true,
          createdBy: userId,
        },
        select: {
          id: true,
          channelName: true,
          apiKey: true,
          isActive: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        data: {
          ...newApiKey,
          apiSecret: apiSecret, // 只在创建时返回明文Secret
        },
        message: '⚠️ 请妥善保存API Secret，系统不会再次显示',
      };
    } catch (error) {
      throw new BadRequestException('创建API密钥失败: ' + error.message);
    }
  }

  async update(id: number, updateApiKeyDto: UpdateApiKeyDto) {
    // 检查API密钥是否存在
    const existingApiKey = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      throw new NotFoundException('API密钥不存在');
    }

    // 如果更新渠道名称，检查是否重复
    if (updateApiKeyDto.channelName && updateApiKeyDto.channelName !== existingApiKey.channelName) {
      const duplicateChannel = await this.prisma.apiKey.findFirst({
        where: { 
          channelName: updateApiKeyDto.channelName,
          id: { not: id }
        },
      });

      if (duplicateChannel) {
        throw new BadRequestException('该渠道名称已存在');
      }
    }

    try {
      const updatedApiKey = await this.prisma.apiKey.update({
        where: { id },
        data: updateApiKeyDto,
        select: {
          id: true,
          channelName: true,
          apiKey: true,
          isActive: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        data: updatedApiKey,
        message: 'API密钥更新成功',
      };
    } catch (error) {
      throw new BadRequestException('更新API密钥失败: ' + error.message);
    }
  }

  async remove(id: number) {
    // 检查API密钥是否存在
    const existingApiKey = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      throw new NotFoundException('API密钥不存在');
    }

    try {
      await this.prisma.apiKey.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'API密钥删除成功',
      };
    } catch (error) {
      throw new BadRequestException('删除API密钥失败: ' + error.message);
    }
  }

  async regenerateSecret(id: number) {
    // 检查API密钥是否存在
    const existingApiKey = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      throw new NotFoundException('API密钥不存在');
    }

    // 生成新的Secret
    const apiSecret = crypto.randomBytes(32).toString('hex');
    const saltRounds = 10;
    const apiSecretHash = await bcrypt.hash(apiSecret, saltRounds);

    try {
      const updatedApiKey = await this.prisma.apiKey.update({
        where: { id },
        data: { apiSecretHash },
        select: {
          id: true,
          channelName: true,
          apiKey: true,
          isActive: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        data: {
          ...updatedApiKey,
          apiSecret: apiSecret, // 返回新的明文Secret
        },
        message: '⚠️ 新的API Secret已生成，请妥善保存',
      };
    } catch (error) {
      throw new BadRequestException('重新生成Secret失败: ' + error.message);
    }
  }

  async getUsageStatistics() {
    const total = await this.prisma.apiKey.count();
    const active = await this.prisma.apiKey.count({
      where: { isActive: true },
    });
    const inactive = total - active;

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
      },
    };
  }
} 