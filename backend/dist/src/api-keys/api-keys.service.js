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
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
let ApiKeysService = class ApiKeysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateApiCredentials() {
        const apiKey = 'ak_' + crypto.randomBytes(16).toString('hex');
        const apiSecret = crypto.randomBytes(32).toString('hex');
        return { apiKey, apiSecret };
    }
    async findAll(page = 1, pageSize = 10) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('API密钥不存在');
        }
        return {
            success: true,
            data: apiKey,
        };
    }
    async create(createApiKeyDto, userId) {
        const existingApiKey = await this.prisma.apiKey.findFirst({
            where: { channelName: createApiKeyDto.channelName },
        });
        if (existingApiKey) {
            throw new common_1.BadRequestException('该渠道名称已存在');
        }
        const { apiKey, apiSecret } = this.generateApiCredentials();
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
                    apiSecret: apiSecret,
                },
                message: '⚠️ 请妥善保存API Secret，系统不会再次显示',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('创建API密钥失败: ' + error.message);
        }
    }
    async update(id, updateApiKeyDto) {
        const existingApiKey = await this.prisma.apiKey.findUnique({
            where: { id },
        });
        if (!existingApiKey) {
            throw new common_1.NotFoundException('API密钥不存在');
        }
        if (updateApiKeyDto.channelName && updateApiKeyDto.channelName !== existingApiKey.channelName) {
            const duplicateChannel = await this.prisma.apiKey.findFirst({
                where: {
                    channelName: updateApiKeyDto.channelName,
                    id: { not: id }
                },
            });
            if (duplicateChannel) {
                throw new common_1.BadRequestException('该渠道名称已存在');
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
        }
        catch (error) {
            throw new common_1.BadRequestException('更新API密钥失败: ' + error.message);
        }
    }
    async remove(id) {
        const existingApiKey = await this.prisma.apiKey.findUnique({
            where: { id },
        });
        if (!existingApiKey) {
            throw new common_1.NotFoundException('API密钥不存在');
        }
        try {
            await this.prisma.apiKey.delete({
                where: { id },
            });
            return {
                success: true,
                message: 'API密钥删除成功',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('删除API密钥失败: ' + error.message);
        }
    }
    async regenerateSecret(id) {
        const existingApiKey = await this.prisma.apiKey.findUnique({
            where: { id },
        });
        if (!existingApiKey) {
            throw new common_1.NotFoundException('API密钥不存在');
        }
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
                    apiSecret: apiSecret,
                },
                message: '⚠️ 新的API Secret已生成，请妥善保存',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('重新生成Secret失败: ' + error.message);
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
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map