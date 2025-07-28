import { PublicService } from './public.service';
import { CreatePublicViewingRecordDto, UpdateStatusDto } from './dto/create-public-viewing-record.dto';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    createViewingRecord(data: CreatePublicViewingRecordDto, req: any): Promise<{
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
    getViewingRecords(req: any, page?: number, pageSize?: number, status?: string): Promise<{
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
    getViewingRecord(id: number, req: any): Promise<{
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
    updateViewingRecordStatus(id: number, updateStatusDto: UpdateStatusDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getHealth(req: any): {
        success: boolean;
        data: {
            status: string;
            timestamp: string;
            channel: any;
            message: string;
        };
    };
}
