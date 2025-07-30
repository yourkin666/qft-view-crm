import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService, ExportQuery } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/**
 * 导出模块，用于生成和下载数据文件
 * @remarks
 * 目前支持导出:
 * - 导出线索记录
 */
@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'agent')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * 导出带看记录
   * GET /api/export/viewing-records
   */
  @Get('viewing-records')
  async exportViewingRecords(
    @Query(new ValidationPipe({ transform: true })) query: ExportQuery,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.exportService.exportViewingRecords(query, req.user);
      
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      
      res.send(result.buffer);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: error.message,
        },
      });
    }
  }
} 