import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

export interface UserQueryParams {
  search?: string;
  roleId?: number;
  isActive?: boolean;
  orderBy?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(page: number = 1, pageSize: number = 10, params?: UserQueryParams) {
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (params?.search) {
      where.OR = [
        { username: { contains: params.search } },
        { fullName: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    if (params?.roleId !== undefined) {
      where.roleId = params.roleId;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    // 构建排序条件
    const orderBy: any = {};
    if (params?.orderBy) {
      switch (params.orderBy) {
        case 'username':
          orderBy.username = 'asc';
          break;
        case 'fullName':
          orderBy.fullName = 'asc';
          break;
        case 'role':
          orderBy.role = { name: 'asc' };
          break;
        case 'createdAt':
        default:
          orderBy.createdAt = 'desc';
          break;
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          role: true,
        },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPassword,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserStatistics(id: number) {
    await this.findById(id); // 确保用户存在

    const [viewingRecordsCount, apiKeysCount] = await Promise.all([
      this.prisma.viewingRecord.count({
        where: { agentId: id },
      }),
      this.prisma.apiKey.count({
        where: { createdBy: id },
      }),
    ]);

    return {
      viewingRecordsCount,
      apiKeysCount,
    };
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.prisma.user.findUnique({
        where: { username: createUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException(`用户名 "${createUserDto.username}" 已存在，请选择其他用户名`);
      }

      // 检查手机号是否已存在
      if (createUserDto.phone) {
        const existingPhone = await this.prisma.user.findUnique({
          where: { phone: createUserDto.phone },
        });

        if (existingPhone) {
          throw new ConflictException(`手机号 "${createUserDto.phone}" 已被其他用户使用`);
        }
      }

      // 检查角色是否存在
      const role = await this.prisma.role.findUnique({
        where: { id: createUserDto.roleId },
      });

      if (!role) {
        throw new BadRequestException(`指定的角色不存在，请选择有效的角色`);
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        include: {
          role: true,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      // 如果是已知的业务异常，直接抛出
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      // 处理数据库约束错误
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('username')) {
            throw new ConflictException(`用户名 "${createUserDto.username}" 已存在，请选择其他用户名`);
          }
          if (target.includes('phone')) {
            throw new ConflictException(`手机号 "${createUserDto.phone}" 已被其他用户使用`);
          }
        }
        throw new ConflictException('用户信息重复，请检查用户名或手机号');
      }

      // 处理外键约束错误
      if (error.code === 'P2003') {
        throw new BadRequestException('指定的角色不存在，请选择有效的角色');
      }

      // 处理其他数据库错误
      if (error.code?.startsWith('P')) {
        throw new BadRequestException('数据库操作失败，请检查输入数据的有效性');
      }

      // 记录未知错误
      console.error('创建用户时发生未知错误:', error);
      throw new InternalServerErrorException('创建用户失败，请稍后重试或联系管理员');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.findById(id);

    // 如果要更新用户名，检查是否已存在
    if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果要更新手机号，检查是否已存在
    if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: updateUserDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
    }

    const updateData: any = { ...updateUserDto };

    // 如果要更新密码，进行加密
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async batchUpdate(ids: number[], updateData: Partial<UpdateUserDto>) {
    return await this.prisma.$transaction(async (tx) => {
      // 验证所有用户是否存在
      const existingUsers = await tx.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, username: true },
      });

      if (existingUsers.length !== ids.length) {
        throw new NotFoundException('部分用户不存在');
      }

      // 如果要更新密码，进行加密
      const data: any = { ...updateData };
      if (updateData.password) {
        data.password = await bcrypt.hash(updateData.password, 10);
      }

      // 执行批量更新
      const result = await tx.user.updateMany({
        where: { id: { in: ids } },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return {
        message: `成功更新 ${result.count} 个用户`,
        updatedCount: result.count,
      };
    });
  }

  async resetPassword(id: number) {
    await this.findById(id); // 确保用户存在

    // 生成临时密码
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      message: '密码重置成功',
      tempPassword,
    };
  }

  async batchDelete(ids: number[]) {
    return await this.prisma.$transaction(async (tx) => {
      // 验证所有用户是否存在
      const existingUsers = await tx.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, username: true },
      });

      if (existingUsers.length !== ids.length) {
        throw new NotFoundException('部分用户不存在');
      }

      // 检查是否有关联的房源（目前系统中没有房源表，跳过此检查）
      // 如果将来添加房源表，可以在此处添加相关检查

      // 检查是否有关联的线索记录
      const relatedRecords = await tx.viewingRecord.count({ where: { agentId: { in: ids } } });
      if (relatedRecords > 0) {
        throw new BadRequestException(`无法删除用户，存在 ${relatedRecords} 条关联的线索记录`);
      }

      // 执行批量删除
      const result = await tx.user.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        message: `成功删除 ${result.count} 个用户`,
        deletedCount: result.count,
      };
    });
  }

  async remove(id: number) {
    await this.findById(id); // 确保用户存在

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: '用户删除成功' };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
} 