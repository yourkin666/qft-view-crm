export declare enum PublicViewingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum PublicBusinessType {
    FOCUS = "focus",
    JOINT = "joint",
    WHOLE = "whole"
}
export declare class CreatePublicViewingRecordDto {
    tenantName?: string;
    sessionId?: string;
    requirementsJson?: string;
    originalQuery?: string;
    aiSummary?: string;
    primaryPhone?: string;
    primaryWechat?: string;
    housingId?: number;
    roomId?: number;
    businessType?: PublicBusinessType;
    propertyName?: string;
    roomAddress?: string;
    preferredViewingTime?: string;
    viewingStatus?: PublicViewingStatus;
    agentId?: number;
    agentName?: string;
    agentPhone?: string;
    remarks?: string;
}
export declare class UpdateStatusDto {
    status: PublicViewingStatus;
}
