import { ViewingRecordsService } from './viewing-records.service';
import { CreateViewingRecordDto } from './dto/create-viewing-record.dto';
import { UpdateViewingRecordDto } from './dto/update-viewing-record.dto';
import { QueryViewingRecordsDto } from './dto/query-viewing-records.dto';
import { BatchUpdateStatusDto } from './dto/batch-update.dto';
export declare class ViewingRecordsController {
    private readonly viewingRecordsService;
    constructor(viewingRecordsService: ViewingRecordsService);
    findAll(query: QueryViewingRecordsDto, req: any): Promise<{
        success: boolean;
        data: {
            data: {
                channel: string;
                channelType: string;
                agent: {
                    id: number;
                    username: string;
                    fullName: string;
                    phone: string;
                };
                property: import("@prisma/client/runtime").GetResult<{
                    id: number;
                    name: string;
                    address: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                }, unknown> & {};
                apiKey: {
                    id: number;
                    channelName: string;
                };
                id: number;
                tenantName: string;
                sessionId: string;
                requirementsJson: string;
                originalQuery: string;
                aiSummary: string;
                primaryPhone: string;
                primaryWechat: string;
                viewingDate: Date;
                roomId: number;
                businessType: string;
                propertyName: string;
                roomAddress: string;
                preferredViewingTime: string;
                viewingStatus: string;
                agentId: number;
                agentName: string;
                agentPhone: string;
                source: string;
                apiKeyId: number;
                remarks: string;
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
    getStatistics(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            byStatus: {
                pending: number;
                confirmed: number;
                completed: number;
                cancelled: number;
            };
        };
    }>;
    getChannelStatistics(req: any): Promise<{
        success: boolean;
        data: {
            channels: any[];
            summary: {
                totalChannels: number;
                totalRecords: number;
                apiRecords: number;
                manualRecords: number;
            };
        };
    }>;
    batchUpdateStatus(batchUpdateDto: BatchUpdateStatusDto, req: any): Promise<{
        success: boolean;
        data: {
            updatedCount: number;
            totalRequested: number;
        };
        message: string;
    }>;
    findOne(id: number, req: any): Promise<{
        success: boolean;
        data: {
            channel: string;
            channelType: string;
            agent: {
                id: number;
                username: string;
                fullName: string;
                phone: string;
            };
            property: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
            }, unknown> & {};
            apiKey: {
                id: number;
                channelName: string;
            };
            id: number;
            tenantName: string;
            sessionId: string;
            requirementsJson: string;
            originalQuery: string;
            aiSummary: string;
            primaryPhone: string;
            primaryWechat: string;
            viewingDate: Date;
            roomId: number;
            businessType: string;
            propertyName: string;
            roomAddress: string;
            preferredViewingTime: string;
            viewingStatus: string;
            agentId: number;
            agentName: string;
            agentPhone: string;
            source: string;
            apiKeyId: number;
            remarks: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    create(createViewingRecordDto: CreateViewingRecordDto, req: any): Promise<{
        success: boolean;
        data: {
            agent: {
                id: number;
                username: string;
                fullName: string;
                phone: string;
            };
            property: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
            }, unknown> & {};
        } & import("@prisma/client/runtime").GetResult<{
            id: number;
            tenantName: string | null;
            sessionId: string | null;
            requirementsJson: string | null;
            originalQuery: string | null;
            aiSummary: string | null;
            primaryPhone: string | null;
            primaryWechat: string | null;
            viewingDate: Date | null;
            roomId: number | null;
            businessType: string | null;
            propertyName: string | null;
            roomAddress: string | null;
            preferredViewingTime: string | null;
            viewingStatus: string;
            agentId: number | null;
            agentName: string | null;
            agentPhone: string | null;
            source: string;
            apiKeyId: number | null;
            remarks: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, unknown> & {};
    }>;
    update(id: number, updateViewingRecordDto: UpdateViewingRecordDto, req: any): Promise<{
        success: boolean;
        data: {
            agent: {
                id: number;
                username: string;
                fullName: string;
                phone: string;
            };
            property: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
            }, unknown> & {};
        } & import("@prisma/client/runtime").GetResult<{
            id: number;
            tenantName: string | null;
            sessionId: string | null;
            requirementsJson: string | null;
            originalQuery: string | null;
            aiSummary: string | null;
            primaryPhone: string | null;
            primaryWechat: string | null;
            viewingDate: Date | null;
            roomId: number | null;
            businessType: string | null;
            propertyName: string | null;
            roomAddress: string | null;
            preferredViewingTime: string | null;
            viewingStatus: string;
            agentId: number | null;
            agentName: string | null;
            agentPhone: string | null;
            source: string;
            apiKeyId: number | null;
            remarks: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, unknown> & {};
    }>;
    remove(id: number, req: any): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
