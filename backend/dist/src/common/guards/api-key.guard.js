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
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let ApiKeyGuard = class ApiKeyGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        const apiSecret = request.headers['x-api-secret'];
        if (!apiKey || !apiSecret) {
            throw new common_1.UnauthorizedException('API Key 和 Secret 是必需的');
        }
        const apiKeyRecord = await this.prisma.apiKey.findFirst({
            where: {
                apiKey: apiKey,
                isActive: true
            },
        });
        if (!apiKeyRecord) {
            throw new common_1.UnauthorizedException('无效的 API Key');
        }
        const isSecretValid = await bcrypt.compare(apiSecret, apiKeyRecord.apiSecretHash);
        if (!isSecretValid) {
            throw new common_1.UnauthorizedException('无效的 API Secret');
        }
        request.apiKeyInfo = {
            id: apiKeyRecord.id,
            channelName: apiKeyRecord.channelName,
            apiKey: apiKeyRecord.apiKey,
        };
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map