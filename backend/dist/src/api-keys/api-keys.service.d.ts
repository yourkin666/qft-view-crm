import { PrismaService } from '../common/prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
export declare class ApiKeysService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateApiCredentials;
    findAll(page?: number, pageSize?: number): Promise<{
        success: boolean;
        data: {
            apiKeys: {
                id: number;
                channelName: string;
                apiKey: string;
                isActive: boolean;
                createdAt: Date;
            }[];
            pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            id: number;
            channelName: string;
            apiKey: string;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    create(createApiKeyDto: CreateApiKeyDto, userId: number): Promise<{
        success: boolean;
        data: {
            apiSecret: string;
            id: number;
            channelName: string;
            apiKey: string;
            isActive: boolean;
            createdAt: Date;
        };
        message: string;
    }>;
    update(id: number, updateApiKeyDto: UpdateApiKeyDto): Promise<{
        success: boolean;
        data: {
            id: number;
            channelName: string;
            apiKey: string;
            isActive: boolean;
            createdAt: Date;
        };
        message: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    regenerateSecret(id: number): Promise<{
        success: boolean;
        data: {
            apiSecret: string;
            id: number;
            channelName: string;
            apiKey: string;
            isActive: boolean;
            createdAt: Date;
        };
        message: string;
    }>;
    getUsageStatistics(): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            inactive: number;
        };
    }>;
}
