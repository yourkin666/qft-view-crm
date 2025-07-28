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
exports.ViewingRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ViewingRecordsService = class ViewingRecordsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, user) {
        const { page = 1, pageSize = 10, status, agentId, source, search, businessType, } = query;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (user.role.name === 'agent') {
            where.agentId = user.id;
        }
        else if (agentId) {
            where.agentId = agentId;
        }
        if (status) {
            where.viewingStatus = status;
        }
        if (source) {
            where.source = source;
        }
        if (businessType) {
            where.businessType = businessType;
        }
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
    async findOne(id, user) {
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
            throw new common_1.NotFoundException(`带看记录 ID ${id} 不存在`);
        }
        if (user.role.name === 'agent' && record.agentId !== user.id) {
            throw new common_1.ForbiddenException('您只能查看自己的带看记录');
        }
        return {
            ...record,
            channel: record.apiKey?.channelName || '手动录入',
            channelType: record.source === 'api' ? 'API' : '手动',
        };
    }
    async create(createViewingRecordDto, user) {
        const data = { ...createViewingRecordDto };
        if (data.viewingDate && typeof data.viewingDate === 'string') {
            const parsedDate = new Date(data.viewingDate);
            if (isNaN(parsedDate.getTime())) {
                throw new common_1.BadRequestException('无效的日期格式');
            }
            data.viewingDate = parsedDate;
        }
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
    async update(id, updateViewingRecordDto, user) {
        const existingRecord = await this.findOne(id, user);
        if (user.role.name === 'agent' && existingRecord.agentId !== user.id) {
            throw new common_1.ForbiddenException('您只能修改自己的带看记录');
        }
        const data = { ...updateViewingRecordDto };
        if (data.viewingDate && typeof data.viewingDate === 'string') {
            const parsedDate = new Date(data.viewingDate);
            if (isNaN(parsedDate.getTime())) {
                throw new common_1.BadRequestException('无效的日期格式');
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
    async remove(id, user) {
        const existingRecord = await this.findOne(id, user);
        if (user.role.name !== 'admin') {
            throw new common_1.ForbiddenException('只有管理员才能删除带看记录');
        }
        await this.prisma.viewingRecord.delete({
            where: { id },
        });
        return { message: '带看记录删除成功' };
    }
    async getStatistics(user) {
        const where = {};
        if (user.role.name === 'agent') {
            where.agentId = user.id;
        }
        const [total, pending, confirmed, completed, cancelled,] = await Promise.all([
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
    async getChannelStatistics(user) {
        const where = {};
        if (user.role.name === 'agent') {
            where.agentId = user.id;
        }
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
    async batchUpdateStatus(ids, status, remarks = '', user) {
        const whereCondition = {
            id: { in: ids },
        };
        if (user.role?.name === 'agent') {
            whereCondition.agentId = user.id;
        }
        try {
            const accessibleCount = await this.prisma.viewingRecord.count({
                where: whereCondition,
            });
            if (accessibleCount === 0) {
                throw new common_1.BadRequestException('没有找到可更新的记录');
            }
            if (accessibleCount < ids.length) {
                throw new common_1.BadRequestException('部分记录无权访问，无法批量更新');
            }
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('批量更新失败: ' + error.message);
        }
    }
};
exports.ViewingRecordsService = ViewingRecordsService;
exports.ViewingRecordsService = ViewingRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ViewingRecordsService);
//# sourceMappingURL=viewing-records.service.js.map