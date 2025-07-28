"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, pageSize = 10, params) {
        const skip = (page - 1) * pageSize;
        const where = {};
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
        const orderBy = {};
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
        }
        else {
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
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`用户 ID ${id} 不存在`);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async getUserStatistics(id) {
        await this.findById(id);
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
    async findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
            include: {
                role: true,
            },
        });
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { username: createUserDto.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('用户名已存在');
        }
        if (createUserDto.phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: createUserDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('手机号已存在');
            }
        }
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
    async update(id, updateUserDto) {
        const existingUser = await this.findById(id);
        if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
            const existingUsername = await this.prisma.user.findUnique({
                where: { username: updateUserDto.username },
            });
            if (existingUsername) {
                throw new common_1.ConflictException('用户名已存在');
            }
        }
        if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: updateUserDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('手机号已存在');
            }
        }
        const updateData = { ...updateUserDto };
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
    async batchUpdate(ids, updateData) {
        const existingUsers = await this.prisma.user.findMany({
            where: { id: { in: ids } },
        });
        if (existingUsers.length !== ids.length) {
            throw new common_1.NotFoundException('部分用户不存在');
        }
        const data = { ...updateData };
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
    async resetPassword(id) {
        await this.findById(id);
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
    async batchDelete(ids) {
        const existingUsers = await this.prisma.user.findMany({
            where: { id: { in: ids } },
        });
        if (existingUsers.length !== ids.length) {
            throw new common_1.NotFoundException('部分用户不存在');
        }
        await this.prisma.user.deleteMany({
            where: { id: { in: ids } },
        });
        return {
            message: `成功删除 ${ids.length} 个用户`,
            deletedCount: ids.length,
        };
    }
    async remove(id) {
        await this.findById(id);
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: '用户删除成功' };
    }
    generateTempPassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map