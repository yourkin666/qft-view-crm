export declare enum ViewingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum BusinessType {
    FOCUS = "focus",
    JOINT = "joint",
    WHOLE = "whole"
}
export declare class CreateViewingRecordDto {
    tenantName?: string;
    sessionId?: string;
    requirementsJson?: string;
    originalQuery?: string;
    aiSummary?: string;
    primaryPhone?: string;
    primaryWechat?: string;
    housingId?: number;
    roomId?: number;
    businessType?: BusinessType;
    propertyName?: string;
    roomAddress?: string;
    preferredViewingTime?: string;
    viewingDate?: string;
    viewingStatus?: ViewingStatus;
    agentId?: number;
    agentName?: string;
    agentPhone?: string;
    source?: string;
    remarks?: string;
}
