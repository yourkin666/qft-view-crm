import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

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
    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查手机号是否已存在
    if (createUserDto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: createUserDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
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
    // 验证所有用户是否存在
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    if (existingUsers.length !== ids.length) {
      throw new NotFoundException('部分用户不存在');
    }

    // 如果要更新密码，进行加密
    const data: any = { ...updateData };
    if (updateData.password) {
      data.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return { 
      message: `成功更新 ${ids.length} 个用户`,
      updatedCount: ids.length,
    };
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
    // 验证所有用户是否存在
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    if (existingUsers.length !== ids.length) {
      throw new NotFoundException('部分用户不存在');
    }

    await this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });

    return { 
      message: `成功删除 ${ids.length} 个用户`,
      deletedCount: ids.length,
    };
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