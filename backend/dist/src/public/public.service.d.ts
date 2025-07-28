import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePublicViewingRecordDto } from './dto/create-public-viewing-record.dto';
export declare class PublicService {
    private prisma;
    constructor(prisma: PrismaService);
    createViewingRecord(data: CreatePublicViewingRecordDto, apiKeyInfo: any): Promise<{
        success: boolean;
        data: {
            id: number;
            tenantName: string;
            primaryPhone: string;
            propertyName: string;
            viewingStatus: string;
            source: string;
            channel: string;
            createdAt: Date;
        };
        message: string;
    }>;
    getViewingRecords(apiKeyInfo: any, page?: number, pageSize?: number, status?: string): Promise<{
        success: boolean;
        data: {
            records: {
                channel: string;
                apiKey: any;
                id: number;
                tenantName: string;
                primaryPhone: string;
                primaryWechat: string;
                propertyName: string;
                roomAddress: string;
                viewingStatus: string;
                source: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getViewingRecord(id: number, apiKeyInfo: any): Promise<{
        success: boolean;
        data: {
            channel: string;
            apiKey: any;
            id: number;
            tenantName: string;
            primaryPhone: string;
            primaryWechat: string;
            propertyName: string;
            roomAddress: string;
            preferredViewingTime: string;
            viewingStatus: string;
            source: string;
            remarks: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateViewingRecordStatus(id: number, status: string, apiKeyInfo: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
