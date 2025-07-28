import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateViewingRecordDto } from './dto/create-viewing-record.dto';
import { UpdateViewingRecordDto } from './dto/update-viewing-record.dto';
import { QueryViewingRecordsDto } from './dto/query-viewing-records.dto';

@Injectable()
export class ViewingRecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryViewingRecordsDto, user: any) {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      agentId, 
      source, 
      search,
      businessType,
    } = query;

    const skip = (page - 1) * pageSize;
    
    // 构建查询条件
    const where: any = {};

    // 权限控制：经纪人只能看自己的记录
    if (user.role.name === 'agent') {
      where.agentId = user.id;
    } else if (agentId) {
      // 管理员可以指定查看某个经纪人的记录
      where.agentId = agentId;
    }

    // 筛选条件
    if (status) {
      where.viewingStatus = status;
    }

    if (source) {
      where.source = source;
    }

    if (businessType) {
      where.businessType = businessType;
    }

    // 搜索条件
    if (search) {
      where.OR = [
        { tenantName: { contains: search } },
        { primaryPhone: { contains: search } },
        { propertyName: { contains: search } },
        { roomAddress: { contains: search } },
        { agentName: { contains: search } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.viewingRecord.findMany({
        skip,
        take: pageSize,
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
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
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
      throw new NotFoundException(`带看记录 ID ${id} 不存在`);
    }

    // 权限控制：经纪人只能查看自己的记录
    if (user.role.name === 'agent' && record.agentId !== user.id) {
      throw new ForbiddenException('您只能查看自己的带看记录');
    }

    // 添加渠道信息
    return {
      ...record,
      channel: record.apiKey?.channelName || '手动录入',
      channelType: record.source === 'api' ? 'API' : '手动',
    };
  }

  async create(createViewingRecordDto: CreateViewingRecordDto, user: any) {
    const data: any = { ...createViewingRecordDto };

    // 处理日期字段转换
    if (data.viewingDate && typeof data.viewingDate === 'string') {
      const parsedDate = new Date(data.viewingDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('无效的日期格式');
      }
      data.viewingDate = parsedDate;
    }

    // 如果是经纪人创建，自动设置为当前用户
    if (user.role.name === 'agent') {
      data.agentId = user.id;
      data.agentName = user.fullName || user.username;
      data.agentPhone = user.phone;
    }

    return this.prisma.viewingRecord.create({
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

  async update(id: number, updateViewingRecordDto: UpdateViewingRecordDto, user: any) {
    const existingRecord = await this.findOne(id, user);

    // 权限控制：经纪人只能更新自己的记录
    if (user.role.name === 'agent' && existingRecord.agentId !== user.id) {
      throw new ForbiddenException('您只能修改自己的带看记录');
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
      throw new ForbiddenException('只有管理员才能删除带看记录');
    }

    await this.prisma.viewingRecord.delete({
      where: { id },
    });

    return { message: '带看记录删除成功' };
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
      byStatus: {
        pending,
        confirmed,
        completed,
        cancelled,
      },
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
      // 首先检查用户有权限访问的记录数量
      const accessibleCount = await this.prisma.viewingRecord.count({
        where: whereCondition,
      });

      if (accessibleCount === 0) {
        throw new BadRequestException('没有找到可更新的记录');
      }

      if (accessibleCount < ids.length) {
        throw new BadRequestException('部分记录无权访问，无法批量更新');
      }

      // 执行批量更新
      const result = await this.prisma.viewingRecord.updateMany({
        where: whereCondition,
        data: {
          viewingStatus: status,
          ...(remarks && { remarks }),
        },
      });

      return {
        updatedCount: result.count,
        totalRequested: ids.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('批量更新失败: ' + error.message);
    }
  }
} 