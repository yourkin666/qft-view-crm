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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const public_service_1 = require("./public.service");
const api_key_guard_1 = require("../common/guards/api-key.guard");
const create_public_viewing_record_dto_1 = require("./dto/create-public-viewing-record.dto");
let PublicController = class PublicController {
    constructor(publicService) {
        this.publicService = publicService;
    }
    async createViewingRecord(data, req) {
        return this.publicService.createViewingRecord(data, req.apiKeyInfo);
    }
    async getViewingRecords(req, page = 1, pageSize = 10, status) {
        return this.publicService.getViewingRecords(req.apiKeyInfo, page, pageSize, status);
    }
    async getViewingRecord(id, req) {
        return this.publicService.getViewingRecord(id, req.apiKeyInfo);
    }
    async updateViewingRecordStatus(id, updateStatusDto, req) {
        return this.publicService.updateViewingRecordStatus(id, updateStatusDto.status, req.apiKeyInfo);
    }
    getHealth(req) {
        return {
            success: true,
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                channel: req.apiKeyInfo.channelName,
                message: 'API服务正常运行',
            },
        };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Post)('viewing-records'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_public_viewing_record_dto_1.CreatePublicViewingRecordDto, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "createViewingRecord", null);
__decorate([
    (0, common_1.Get)('viewing-records'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('pageSize', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getViewingRecords", null);
__decorate([
    (0, common_1.Get)('viewing-records/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getViewingRecord", null);
__decorate([
    (0, common_1.Patch)('viewing-records/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_public_viewing_record_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "updateViewingRecordStatus", null);
__decorate([
    (0, common_1.Get)('health'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getHealth", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map