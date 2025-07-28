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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewingRecordsController = void 0;
const common_1 = require("@nestjs/common");
const viewing_records_service_1 = require("./viewing-records.service");
const create_viewing_record_dto_1 = require("./dto/create-viewing-record.dto");
const update_viewing_record_dto_1 = require("./dto/update-viewing-record.dto");
const query_viewing_records_dto_1 = require("./dto/query-viewing-records.dto");
const batch_update_dto_1 = require("./dto/batch-update.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ViewingRecordsController = class ViewingRecordsController {
    constructor(viewingRecordsService) {
        this.viewingRecordsService = viewingRecordsService;
    }
    async findAll(query, req) {
        const result = await this.viewingRecordsService.findAll(query, req.user);
        return {
            success: true,
            data: result,
        };
    }
    async getStatistics(req) {
        const statistics = await this.viewingRecordsService.getStatistics(req.user);
        return {
            success: true,
            data: statistics,
        };
    }
    async getChannelStatistics(req) {
        const statistics = await this.viewingRecordsService.getChannelStatistics(req.user);
        return {
            success: true,
            data: statistics,
        };
    }
    async batchUpdateStatus(batchUpdateDto, req) {
        const result = await this.viewingRecordsService.batchUpdateStatus(batchUpdateDto.ids, batchUpdateDto.status, batchUpdateDto.remarks || '', req.user);
        return {
            success: true,
            data: result,
            message: `成功更新 ${result.updatedCount} 条记录`,
        };
    }
    async findOne(id, req) {
        const record = await this.viewingRecordsService.findOne(id, req.user);
        return {
            success: true,
            data: record,
        };
    }
    async create(createViewingRecordDto, req) {
        const record = await this.viewingRecordsService.create(createViewingRecordDto, req.user);
        return {
            success: true,
            data: record,
        };
    }
    async update(id, updateViewingRecordDto, req) {
        const record = await this.viewingRecordsService.update(id, updateViewingRecordDto, req.user);
        return {
            success: true,
            data: record,
        };
    }
    async remove(id, req) {
        const result = await this.viewingRecordsService.remove(id, req.user);
        return {
            success: true,
            data: result,
        };
    }
};
exports.ViewingRecordsController = ViewingRecordsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_viewing_records_dto_1.QueryViewingRecordsDto, Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('channel-statistics'),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "getChannelStatistics", null);
__decorate([
    (0, common_1.Patch)('batch-update'),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [batch_update_dto_1.BatchUpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "batchUpdateStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_viewing_record_dto_1.CreateViewingRecordDto, Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'agent'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_viewing_record_dto_1.UpdateViewingRecordDto, Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ViewingRecordsController.prototype, "remove", null);
exports.ViewingRecordsController = ViewingRecordsController = __decorate([
    (0, common_1.Controller)('viewing-records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [viewing_records_service_1.ViewingRecordsService])
], ViewingRecordsController);
//# sourceMappingURL=viewing-records.controller.js.map