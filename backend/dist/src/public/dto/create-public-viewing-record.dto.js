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
exports.UpdateStatusDto = exports.CreatePublicViewingRecordDto = exports.PublicBusinessType = exports.PublicViewingStatus = void 0;
const class_validator_1 = require("class-validator");
var PublicViewingStatus;
(function (PublicViewingStatus) {
    PublicViewingStatus["PENDING"] = "pending";
    PublicViewingStatus["CONFIRMED"] = "confirmed";
    PublicViewingStatus["COMPLETED"] = "completed";
    PublicViewingStatus["CANCELLED"] = "cancelled";
})(PublicViewingStatus || (exports.PublicViewingStatus = PublicViewingStatus = {}));
var PublicBusinessType;
(function (PublicBusinessType) {
    PublicBusinessType["FOCUS"] = "focus";
    PublicBusinessType["JOINT"] = "joint";
    PublicBusinessType["WHOLE"] = "whole";
})(PublicBusinessType || (exports.PublicBusinessType = PublicBusinessType = {}));
class CreatePublicViewingRecordDto {
}
exports.CreatePublicViewingRecordDto = CreatePublicViewingRecordDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '租客姓名必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '租客姓名长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "tenantName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '会话ID必须是字符串' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '需求JSON必须是字符串' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "requirementsJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '原始查询必须是字符串' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "originalQuery", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'AI总结必须是字符串' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "aiSummary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '主要手机号必须是字符串' }),
    (0, class_validator_1.MaxLength)(20, { message: '手机号长度不能超过20个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "primaryPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '主要微信号必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '微信号长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "primaryWechat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '房源ID必须是整数' }),
    __metadata("design:type", Number)
], CreatePublicViewingRecordDto.prototype, "housingId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '房间ID必须是整数' }),
    __metadata("design:type", Number)
], CreatePublicViewingRecordDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PublicBusinessType, { message: '业务类型无效' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "businessType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '物业名称必须是字符串' }),
    (0, class_validator_1.MaxLength)(200, { message: '物业名称长度不能超过200个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "propertyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '房间地址必须是字符串' }),
    (0, class_validator_1.MaxLength)(500, { message: '房间地址长度不能超过500个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "roomAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '偏好看房时间必须是字符串' }),
    (0, class_validator_1.MaxLength)(200, { message: '偏好看房时间长度不能超过200个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "preferredViewingTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PublicViewingStatus, { message: '预约状态无效' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "viewingStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '经纪人ID必须是整数' }),
    __metadata("design:type", Number)
], CreatePublicViewingRecordDto.prototype, "agentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '经纪人姓名必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '经纪人姓名长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "agentName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '经纪人电话必须是字符串' }),
    (0, class_validator_1.MaxLength)(20, { message: '经纪人电话长度不能超过20个字符' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "agentPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '备注信息必须是字符串' }),
    __metadata("design:type", String)
], CreatePublicViewingRecordDto.prototype, "remarks", void 0);
class UpdateStatusDto {
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: '状态不能为空' }),
    (0, class_validator_1.IsEnum)(PublicViewingStatus, { message: '无效的状态值' }),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
//# sourceMappingURL=create-public-viewing-record.dto.js.map