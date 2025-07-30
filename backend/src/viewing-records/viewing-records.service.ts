import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateViewingRecordDto } from './dto/create-viewing-record.dto';
import { UpdateViewingRecordDto } from './dto/update-viewing-record.dto';
import { QueryViewingRecordsDto } from './dto/query-viewing-records.dto';

@Injectable()
export class ViewingRecordsService {
  constructor(private prisma: PrismaService) { }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string,
    viewingStatus?: string,
    // sourcePlatform?: string,
    user?: any,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      deletedAt: null,
    };

    // 权限控制：经纪人只能查看自己的记录
    if (user && user.role.name === 'agent') {
      where.agentId = user.id;
    }

    // 搜索条件
    if (search) {
      where.OR = [
        { tenantName: { contains: search } },
        { primaryPhone: { contains: search } },
        { agentName: { contains: search } },
        { propertyName: { contains: search } },
        { roomAddress: { contains: search } },
      ];
    }

    // 时间范围过滤
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // 状态过滤
    if (viewingStatus) {
      where.viewingStatus = viewingStatus;
    }

    // 线索来源平台过滤 - 暂时注释
    // if (sourcePlatform) {
    //   where.sourcePlatform = sourcePlatform;
    // }

    const [records, total] = await Promise.all([
      this.prisma.viewingRecord.findMany({
        skip,
        take: limit,
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.viewingRecord.count({ where }),
    ]);

    // 处理返回数据，添加渠道信息
    const processedRecords = records.map(record => ({
      ...record,
      channel: record.apiKey?.channelName || '手动录入',
      channelType: record.source === 'api' ? 'API' : '手动',
    }));

    return {
      data: processedRecords,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: any) {
    const record = await this.prisma.viewingRecord.findUnique({
      where: { id },
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

    if (!record) {
      throw new NotFoundException(`线索记录 ID ${id} 不存在`);
    }

    // 权限控制：经纪人只能查看自己的记录
    if (user.role.name === 'agent' && record.agentId !== user.id) {
      throw new ForbiddenException('您只能查看自己的线索记录');
    }

    // 添加渠道信息
    return {
      ...record,
      channel: record.apiKey?.channelName || '手动录入',
      channelType: record.source === 'api' ? 'API' : '手动',
    };
  }

  async create(createViewingRecordDto: CreateViewingRecordDto, user: any) {
    try {
      console.log('输入数据:', createViewingRecordDto);
      console.log('用户信息:', user);

      // 只使用基础字段创建记录
      const record = await this.prisma.viewingRecord.create({
        data: {
          tenantName: createViewingRecordDto.tenantName || '新客户',
          primaryPhone: createViewingRecordDto.primaryPhone,
          primaryWechat: createViewingRecordDto.primaryWechat,
          businessType: createViewingRecordDto.businessType,
          propertyName: createViewingRecordDto.propertyName,
          roomAddress: createViewingRecordDto.roomAddress,
          preferredViewingTime: createViewingRecordDto.preferredViewingTime,
          viewingStatus: 'pending',
          source: 'manual',
          agentId: user.id,
          agentName: user.fullName || user.username,
          remarks: createViewingRecordDto.remarks,
        },
      });

      console.log('创建成功:', record);
      return record;
    } catch (error) {
      console.error('创建记录错误详情:', error);
      throw new BadRequestException('创建记录失败: ' + error.message);
    }
  }

  async update(id: number, updateViewingRecordDto: UpdateViewingRecordDto, user: any) {
    const existingRecord = await this.findOne(id, user);

    // 权限控制：经纪人只能更新自己的记录
    if (user.role.name === 'agent' && existingRecord.agentId !== user.id) {
      throw new ForbiddenException('您只能修改自己的线索记录');
    }

    const data: any = { ...updateViewingRecordDto };

    // 处理日期字段转换
    if (data.viewingDate && typeof data.viewingDate === 'string') {
      const parsedDate = new Date(data.viewingDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('无效的日期格式');
      }
      data.viewingDate = parsedDate;
    }

    // 业务逻辑验证：状态流转检查
    const oldStatus = (existingRecord as any).customerStatus;
    const newStatus = data.customerStatus;

    // 如果客户状态改为"已约带看"，验证带看信息
    if (newStatus === '已约带看' && oldStatus !== '已约带看') {
      if (!data.leadViewingStatus) {
        throw new BadRequestException('客户状态变更为"已约带看"时，带看状态为必填项');
      }
      if (!data.agentId && !existingRecord.agentId && !data.agentName && !existingRecord.agentName) {
        throw new BadRequestException('客户状态变更为"已约带看"时，必须指定带看人');
      }
    }

    // 如果已经是"已约带看"状态，更新时也要检查带看信息
    if ((newStatus === '已约带看' || (!newStatus && oldStatus === '已约带看'))
      && data.hasOwnProperty('leadViewingStatus') && !data.leadViewingStatus) {
      throw new BadRequestException('客户状态为"已约带看"时，带看状态不能为空');
    }

    return this.prisma.viewingRecord.update({
      where: { id },
      data,
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
      },
    });
  }

  async remove(id: number, user: any) {
    const existingRecord = await this.findOne(id, user);

    // 权限控制：只有管理员能删除记录
    if (user.role.name !== 'admin') {
      throw new ForbiddenException('只有管理员才能删除线索记录');
    }

    await this.prisma.viewingRecord.delete({
      where: { id },
    });

    return { message: '线索记录删除成功' };
  }

  // 统计相关方法
  async getStatistics(user: any) {
    // 构建查询条件
    const where: any = {};

    // 权限控制：经纪人只能看自己的统计
    if (user.role.name === 'agent') {
      where.agentId = user.id;
    }

    const [
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    ] = await Promise.all([
      this.prisma.viewingRecord.count({ where }),
      this.prisma.viewingRecord.count({ where: { ...where, viewingStatus: 'pending' } }),
      this.prisma.viewingRecord.count({ where: { ...where, viewingStatus: 'confirmed' } }),
      this.prisma.viewingRecord.count({ where: { ...where, viewingStatus: 'completed' } }),
      this.prisma.viewingRecord.count({ where: { ...where, viewingStatus: 'cancelled' } }),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }

  async getChannelStatistics(user: any) {
    // 构建查询条件
    const where: any = {};

    // 权限控制：经纪人只能看自己的统计
    if (user.role.name === 'agent') {
      where.agentId = user.id;
    }

    // 获取所有记录的渠道统计
    const records = await this.prisma.viewingRecord.findMany({
      where,
      select: {
        source: true,
        viewingStatus: true,
        apiKey: {
          select: {
            channelName: true,
          },
        },
      },
    });

    // 统计各渠道数据
    const channelStats = new Map();

    records.forEach(record => {
      const channelName = record.apiKey?.channelName || '手动录入';
      const channelType = record.source === 'api' ? 'API' : '手动';

      if (!channelStats.has(channelName)) {
        channelStats.set(channelName, {
          channelName,
          channelType,
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        });
      }

      const stats = channelStats.get(channelName);
      stats.total += 1;
      stats[record.viewingStatus] += 1;
    });

    // 转换为数组并按总数排序
    const channelList = Array.from(channelStats.values())
      .sort((a, b) => b.total - a.total);

    return {
      channels: channelList,
      summary: {
        totalChannels: channelList.length,
        totalRecords: records.length,
        apiRecords: records.filter(r => r.source === 'api').length,
        manualRecords: records.filter(r => r.source === 'manual').length,
      },
    };
  }

  // 批量更新状态
  async batchUpdateStatus(ids: number[], status: string, remarks: string = '', user: any) {
    // 构建基础查询条件
    const whereCondition: any = {
      id: { in: ids },
    };

    // 权限控制：经纪人只能批量更新自己的记录
    if (user.role?.name === 'agent') {
      whereCondition.agentId = user.id;
    }

    try {
      // 使用事务确保数据一致性
      const result = await this.prisma.$transaction(async (tx) => {
        // 首先检查用户有权限访问的记录数量
        const accessibleCount = await tx.viewingRecord.count({
          where: whereCondition,
        });

        if (accessibleCount === 0) {
          throw new BadRequestException('没有找到可更新的记录');
        }

        if (accessibleCount < ids.length) {
          throw new BadRequestException('部分记录无权访问，无法批量更新');
        }

        // 获取要更新的记录详情（用于日志记录）
        const recordsToUpdate = await tx.viewingRecord.findMany({
          where: whereCondition,
          select: {
            id: true,
            tenantName: true,
            viewingStatus: true,
          },
        });

        // 执行批量更新
        const updateResult = await tx.viewingRecord.updateMany({
          where: whereCondition,
          data: {
            viewingStatus: status,
            ...(remarks && { remarks }),
            updatedAt: new Date(),
          },
        });

        return {
          updatedCount: updateResult.count,
          totalRequested: ids.length,
          updatedRecords: recordsToUpdate,
        };
      });

      return {
        updatedCount: result.updatedCount,
        totalRequested: result.totalRequested,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('批量更新失败: ' + error.message);
    }
  }
} 