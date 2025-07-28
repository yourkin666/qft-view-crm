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
exports.BatchUpdateStatusDto = exports.BatchViewingStatus = void 0;
const class_validator_1 = require("class-validator");
var BatchViewingStatus;
(function (BatchViewingStatus) {
    BatchViewingStatus["PENDING"] = "pending";
    BatchViewingStatus["CONFIRMED"] = "confirmed";
    BatchViewingStatus["COMPLETED"] = "completed";
    BatchViewingStatus["CANCELLED"] = "cancelled";
})(BatchViewingStatus || (exports.BatchViewingStatus = BatchViewingStatus = {}));
class BatchUpdateStatusDto {
}
exports.BatchUpdateStatusDto = BatchUpdateStatusDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: '记录ID必须是数组' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: '至少选择一条记录' }),
    (0, class_validator_1.IsNotEmpty)({ each: true, message: '记录ID不能为空' }),
    __metadata("design:type", Array)
], BatchUpdateStatusDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: '状态不能为空' }),
    (0, class_validator_1.IsEnum)(BatchViewingStatus, { message: '无效的状态值' }),
    __metadata("design:type", String)
], BatchUpdateStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: '备注必须是字符串' }),
    __metadata("design:type", String)
], BatchUpdateStatusDto.prototype, "remarks", void 0);
//# sourceMappingURL=batch-update.dto.js.map