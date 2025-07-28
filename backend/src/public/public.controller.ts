import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreatePublicViewingRecordDto, UpdateStatusDto } from './dto/create-public-viewing-record.dto';

@Controller('public')
@UseGuards(ApiKeyGuard)
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * 创建带看记录
   * POST /api/public/viewing-records
   */
  @Post('viewing-records')
  async createViewingRecord(
    @Body(new ValidationPipe({ transform: true })) data: CreatePublicViewingRecordDto,
    @Request() req: any,
  ) {
    return this.publicService.createViewingRecord(data, req.apiKeyInfo);
  }

  /**
   * 获取带看记录列表
   * GET /api/public/viewing-records
   */
  @Get('viewing-records')
  async getViewingRecords(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number = 10,
    @Query('status') status?: string,
  ) {
    return this.publicService.getViewingRecords(
      req.apiKeyInfo,
      page,
      pageSize,
      status,
    );
  }

  /**
   * 获取单个带看记录详情
   * GET /api/public/viewing-records/:id
   */
  @Get('viewing-records/:id')
  async getViewingRecord(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.publicService.getViewingRecord(id, req.apiKeyInfo);
  }

  /**
   * 更新带看记录状态
   * PATCH /api/public/viewing-records/:id/status
   */
  @Patch('viewing-records/:id/status')
  async updateViewingRecordStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateStatusDto: UpdateStatusDto,
    @Request() req: any,
  ) {
    return this.publicService.updateViewingRecordStatus(
      id,
      updateStatusDto.status,
      req.apiKeyInfo,
    );
  }

  /**
   * API健康检查
   * GET /api/public/health
   */
  @Get('health')
  getHealth(@Request() req: any) {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        channel: req.apiKeyInfo.channelName,
        message: 'API服务正常运行',
      },
    };
  }
} 