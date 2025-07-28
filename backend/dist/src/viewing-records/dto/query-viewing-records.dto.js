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
exports.QueryViewingRecordsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_viewing_record_dto_1 = require("./create-viewing-record.dto");
class QueryViewingRecordsDto {
    constructor() {
        this.page = 1;
        this.pageSize = 10;
    }
}
exports.QueryViewingRecordsDto = QueryViewingRecordsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '页码必须是整数' }),
    (0, class_validator_1.Min)(1, { message: '页码最小为1' }),
    __metadata("design:type", Number)
], QueryViewingRecordsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '每页数量必须是整数' }),
    (0, class_validator_1.Min)(1, { message: '每页数量最小为1' }),
    (0, class_validator_1.Max)(100, { message: '每页数量最大为100' }),
    __metadata("design:type", Number)
], QueryViewingRecordsDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(create_viewing_record_dto_1.ViewingStatus, { message: '预约状态无效' }),
    __metadata("design:type", String)
], QueryViewingRecordsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '经纪人ID必须是整数' }),
    __metadata("design:type", Number)
], QueryViewingRecordsDto.prototype, "agentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '来源必须是字符串' }),
    __metadata("design:type", String)
], QueryViewingRecordsDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '搜索关键词必须是字符串' }),
    __metadata("design:type", String)
], QueryViewingRecordsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(create_viewing_record_dto_1.BusinessType, { message: '业务类型无效' }),
    __metadata("design:type", String)
], QueryViewingRecordsDto.prototype, "businessType", void 0);
//# sourceMappingURL=query-viewing-records.dto.js.map