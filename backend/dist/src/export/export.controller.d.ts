import { Response } from 'express';
import { ExportService, ExportQuery } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportViewingRecords(query: ExportQuery, req: any, res: Response): Promise<void>;
}
