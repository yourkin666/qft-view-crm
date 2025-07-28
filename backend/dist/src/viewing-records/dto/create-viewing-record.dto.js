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
exports.CreateViewingRecordDto = exports.BusinessType = exports.ViewingStatus = void 0;
const class_validator_1 = require("class-validator");
var ViewingStatus;
(function (ViewingStatus) {
    ViewingStatus["PENDING"] = "pending";
    ViewingStatus["CONFIRMED"] = "confirmed";
    ViewingStatus["COMPLETED"] = "completed";
    ViewingStatus["CANCELLED"] = "cancelled";
})(ViewingStatus || (exports.ViewingStatus = ViewingStatus = {}));
var BusinessType;
(function (BusinessType) {
    BusinessType["FOCUS"] = "focus";
    BusinessType["JOINT"] = "joint";
    BusinessType["WHOLE"] = "whole";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
class CreateViewingRecordDto {
}
exports.CreateViewingRecordDto = CreateViewingRecordDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '租客姓名必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '租客姓名长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "tenantName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '会话ID必须是字符串' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '需求JSON必须是字符串' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "requirementsJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '原始查询必须是字符串' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "originalQuery", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'AI总结必须是字符串' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "aiSummary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '主要手机号必须是字符串' }),
    (0, class_validator_1.MaxLength)(20, { message: '手机号长度不能超过20个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "primaryPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '主要微信号必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '微信号长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "primaryWechat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '房源ID必须是整数' }),
    __metadata("design:type", Number)
], CreateViewingRecordDto.prototype, "housingId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '房间ID必须是整数' }),
    __metadata("design:type", Number)
], CreateViewingRecordDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BusinessType, { message: '业务类型无效' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "businessType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '物业名称必须是字符串' }),
    (0, class_validator_1.MaxLength)(200, { message: '物业名称长度不能超过200个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "propertyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '房间地址必须是字符串' }),
    (0, class_validator_1.MaxLength)(500, { message: '房间地址长度不能超过500个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "roomAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '偏好看房时间必须是字符串' }),
    (0, class_validator_1.MaxLength)(200, { message: '偏好看房时间长度不能超过200个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "preferredViewingTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '带看时间必须是字符串格式' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "viewingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ViewingStatus, { message: '预约状态无效' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "viewingStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '经纪人ID必须是整数' }),
    __metadata("design:type", Number)
], CreateViewingRecordDto.prototype, "agentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '经纪人姓名必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '经纪人姓名长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "agentName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '经纪人电话必须是字符串' }),
    (0, class_validator_1.MaxLength)(20, { message: '经纪人电话长度不能超过20个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "agentPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '来源标识必须是字符串' }),
    (0, class_validator_1.MaxLength)(50, { message: '来源标识长度不能超过50个字符' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '备注信息必须是字符串' }),
    __metadata("design:type", String)
], CreateViewingRecordDto.prototype, "remarks", void 0);
//# sourceMappingURL=create-viewing-record.dto.js.map