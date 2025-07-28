import { PrismaService } from '../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
export interface ExportQuery {
    status?: string;
    agentId?: number;
    source?: string;
    businessType?: string;
    dateFrom?: string;
    dateTo?: string;
    format: 'excel' | 'pdf';
}
export declare class ExportService {
    private prisma;
    constructor(prisma: PrismaService);
    exportViewingRecords(query: ExportQuery, user: any): Promise<{
        buffer: ExcelJS.Buffer;
        filename: string;
        mimeType: string;
    }>;
    private generateExcel;
    private getBusinessTypeText;
    private getStatusText;
    private getSourceText;
    private formatDate;
}
