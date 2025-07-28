import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ViewingRecordsService } from './viewing-records.service';
import { CreateViewingRecordDto } from './dto/create-viewing-record.dto';
import { UpdateViewingRecordDto } from './dto/update-viewing-record.dto';
import { QueryViewingRecordsDto } from './dto/query-viewing-records.dto';
import { BatchUpdateStatusDto } from './dto/batch-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('viewing-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ViewingRecordsController {
  constructor(private readonly viewingRecordsService: ViewingRecordsService) {}

  @Get()
  @Roles('admin', 'agent')
  async findAll(@Query() query: QueryViewingRecordsDto, @Request() req) {
    const result = await this.viewingRecordsService.findAll(query, req.user);
    return {
      success: true,
      data: result,
    };
  }

  @Get('statistics')
  @Roles('admin', 'agent')
  async getStatistics(@Request() req) {
    const statistics = await this.viewingRecordsService.getStatistics(req.user);
    return {
      success: true,
      data: statistics,
    };
  }

  @Get('channel-statistics')
  @Roles('admin', 'agent')
  async getChannelStatistics(@Request() req) {
    const statistics = await this.viewingRecordsService.getChannelStatistics(req.user);
    return {
      success: true,
      data: statistics,
    };
  }

  @Patch('batch-update')
  @Roles('admin', 'agent')
  async batchUpdateStatus(@Body() batchUpdateDto: BatchUpdateStatusDto, @Request() req) {
    const result = await this.viewingRecordsService.batchUpdateStatus(
      batchUpdateDto.ids,
      batchUpdateDto.status,
      batchUpdateDto.remarks || '',
      req.user
    );
    return {
      success: true,
      data: result,
      message: `成功更新 ${result.updatedCount} 条记录`,
    };
  }

  @Get(':id')
  @Roles('admin', 'agent')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const record = await this.viewingRecordsService.findOne(id, req.user);
    return {
      success: true,
      data: record,
    };
  }

  @Post()
  @Roles('admin', 'agent')
  async create(@Body() createViewingRecordDto: CreateViewingRecordDto, @Request() req) {
    const record = await this.viewingRecordsService.create(createViewingRecordDto, req.user);
    return {
      success: true,
      data: record,
    };
  }

  @Patch(':id')
  @Roles('admin', 'agent')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateViewingRecordDto: UpdateViewingRecordDto,
    @Request() req,
  ) {
    const record = await this.viewingRecordsService.update(id, updateViewingRecordDto, req.user);
    return {
      success: true,
      data: record,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const result = await this.viewingRecordsService.remove(id, req.user);
    return {
      success: true,
      data: result,
    };
  }
} 