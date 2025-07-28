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
exports.CreateApiKeyDto = void 0;
const class_validator_1 = require("class-validator");
class CreateApiKeyDto {
}
exports.CreateApiKeyDto = CreateApiKeyDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: '渠道名称不能为空' }),
    (0, class_validator_1.IsString)({ message: '渠道名称必须是字符串' }),
    (0, class_validator_1.MaxLength)(100, { message: '渠道名称长度不能超过100个字符' }),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "channelName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '激活状态必须是布尔值' }),
    __metadata("design:type", Boolean)
], CreateApiKeyDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-api-key.dto.js.map