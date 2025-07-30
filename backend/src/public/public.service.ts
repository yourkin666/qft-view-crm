import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePublicViewingRecordDto } from './dto/create-public-viewing-record.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async createViewingRecord(
    data: CreatePublicViewingRecordDto,
    apiKeyInfo: any,
  ) {
    // 验证必要字段
    if (!data.tenantName && !data.primaryPhone) {
      throw new BadRequestException('租客姓名或联系电话至少需要提供一个');
    }

    // 设置数据来源为第三方录入，并关联API Key
    const recordData = {
      ...data,
      source: 'api',
      apiKeyId: apiKeyInfo.id,  // 关联当前API Key
      // 可以根据API Key信息设置特定的标识
      sessionId: data.sessionId || `api_${apiKeyInfo.channelName}_${Date.now()}`,
    };

    try {
      const record = await this.prisma.viewingRecord.create({
        data: recordData,
        include: {
          agent: {
            select: {
              id: true,
              username: true,
              fullName: true,
              phone: true,
            },
          },
          property: true,
          apiKey: {
            select: {
              id: true,
              channelName: true,
            },
          },
        },
      });

      return {
        success: true,
        data: {
          id: record.id,
          tenantName: record.tenantName,
          primaryPhone: record.primaryPhone,
          propertyName: record.propertyName,
          viewingStatus: record.viewingStatus,
          source: record.source,
          channel: record.apiKey?.channelName,
          createdAt: record.createdAt,
        },
        message: '线索记录创建成功',
      };
    } catch (error) {
      throw new BadRequestException('创建线索记录失败: ' + error.message);
    }
  }

  async getViewingRecords(
    apiKeyInfo: any,
    page: number = 1,
    pageSize: number = 10,
    status?: string,
  ) {
    const skip = (page - 1) * pageSize;
    
    // 构建查询条件 - 只返回当前API Key创建的记录
    const where: any = {
      apiKeyId: apiKeyInfo.id,  // 只查询当前API Key的数据
    };

    if (status) {
      where.viewingStatus = status;
    }

    const [records, total] = await Promise.all([
      this.prisma.viewingRecord.findMany({
        skip,
        take: pageSize,
        where,
        select: {
          id: true,
          tenantName: true,
          primaryPhone: true,
          primaryWechat: true,
          propertyName: true,
          roomAddress: true,
          viewingStatus: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          apiKey: {
            select: {
              channelName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.viewingRecord.count({ where }),
    ]);

    return {
      success: true,
      data: {
        records: records.map(record => ({
          ...record,
          channel: record.apiKey?.channelName,
          apiKey: undefined, // 移除apiKey字段，避免暴露敏感信息
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getViewingRecord(id: number, apiKeyInfo: any) {
    const record = await this.prisma.viewingRecord.findFirst({
      where: {
        id,
        apiKeyId: apiKeyInfo.id, // 只能查询当前API Key的记录
      },
      select: {
        id: true,
        tenantName: true,
        primaryPhone: true,
        primaryWechat: true,
        propertyName: true,
        roomAddress: true,
        preferredViewingTime: true,
        viewingStatus: true,
        source: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        apiKey: {
          select: {
            channelName: true,
          },
        },
      },
    });

    if (!record) {
      throw new BadRequestException('记录不存在或无权访问');
    }

    return {
      success: true,
      data: {
        ...record,
        channel: record.apiKey?.channelName,
        apiKey: undefined, // 移除apiKey字段
      },
    };
  }

  async updateViewingRecordStatus(
    id: number,
    status: string,
    apiKeyInfo: any,
  ) {
    // 验证状态值
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('无效的状态值');
    }

    try {
      const record = await this.prisma.viewingRecord.updateMany({
        where: {
          id,
          apiKeyId: apiKeyInfo.id, // 只能更新当前API Key的记录
        },
        data: {
          viewingStatus: status,
        },
      });

      if (record.count === 0) {
        throw new BadRequestException('记录不存在或无权访问');
      }

      return {
        success: true,
        message: '状态更新成功',
      };
    } catch (error) {
      throw new BadRequestException('更新失败: ' + error.message);
    }
  }
} 