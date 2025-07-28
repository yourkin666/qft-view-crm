export declare enum BatchViewingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class BatchUpdateStatusDto {
    ids: number[];
    status: BatchViewingStatus;
    remarks?: string;
}
