import { ViewingStatus, BusinessType } from './create-viewing-record.dto';
export declare class QueryViewingRecordsDto {
    page?: number;
    pageSize?: number;
    status?: ViewingStatus;
    agentId?: number;
    source?: string;
    search?: string;
    businessType?: BusinessType;
}
