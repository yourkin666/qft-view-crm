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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let PublicService = class PublicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createViewingRecord(data, apiKeyInfo) {
        if (!data.tenantName && !data.primaryPhone) {
            throw new common_1.BadRequestException('租客姓名或联系电话至少需要提供一个');
        }
        const recordData = {
            ...data,
            source: 'api',
            apiKeyId: apiKeyInfo.id,
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
                message: '带看记录创建成功',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('创建带看记录失败: ' + error.message);
        }
    }
    async getViewingRecords(apiKeyInfo, page = 1, pageSize = 10, status) {
        const skip = (page - 1) * pageSize;
        const where = {
            apiKeyId: apiKeyInfo.id,
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
                    apiKey: undefined,
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
    async getViewingRecord(id, apiKeyInfo) {
        const record = await this.prisma.viewingRecord.findFirst({
            where: {
                id,
                apiKeyId: apiKeyInfo.id,
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
            throw new common_1.BadRequestException('记录不存在或无权访问');
        }
        return {
            success: true,
            data: {
                ...record,
                channel: record.apiKey?.channelName,
                apiKey: undefined,
            },
        };
    }
    async updateViewingRecordStatus(id, status, apiKeyInfo) {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException('无效的状态值');
        }
        try {
            const record = await this.prisma.viewingRecord.updateMany({
                where: {
                    id,
                    apiKeyId: apiKeyInfo.id,
                },
                data: {
                    viewingStatus: status,
                },
            });
            if (record.count === 0) {
                throw new common_1.BadRequestException('记录不存在或无权访问');
            }
            return {
                success: true,
                message: '状态更新成功',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('更新失败: ' + error.message);
        }
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map