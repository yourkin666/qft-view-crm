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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { ViewingRecordsService } from './viewing-records.service';
import { CreateViewingRecordDto } from './dto/create-viewing-record.dto';
import { UpdateViewingRecordDto } from './dto/update-viewing-record.dto';
import { QueryViewingRecordsDto } from './dto/query-viewing-records.dto';
import { BatchUpdateStatusDto } from './dto/batch-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('viewing-records')
@ApiBearerAuth('JWT-auth')
@Controller('viewing-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ViewingRecordsController {
  constructor(private readonly viewingRecordsService: ViewingRecordsService) {}

  @ApiOperation({ summary: '获取线索记录列表', description: '分页获取线索记录，支持筛选和搜索' })
  @ApiResponse({ status: 200, description: '成功获取线索记录列表' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Get()
  @Roles('admin', 'agent')
  async findAll(@Query() query: QueryViewingRecordsDto, @Request() req) {
    // 提取基础查询参数
    const { page, pageSize, search, status } = query;
    
    const result = await this.viewingRecordsService.findAll(
      page || 1,
      pageSize || 10,
      search,
      undefined, // startDate
      undefined, // endDate  
      status,
      req.user
    );
    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: '获取线索记录统计', description: '获取按状态分组的线索记录统计数据' })
  @ApiResponse({ status: 200, description: '成功获取统计数据' })
  @Get('statistics')
  @Roles('admin', 'agent')
  async getStatistics(@Request() req) {
    const statistics = await this.viewingRecordsService.getStatistics(req.user);
    return {
      success: true,
      data: statistics,
    };
  }

  @ApiOperation({ summary: '获取渠道统计', description: '获取各渠道的线索记录统计数据' })
  @ApiResponse({ status: 200, description: '成功获取渠道统计数据' })
  @Get('channel-statistics')
  @Roles('admin', 'agent')
  async getChannelStatistics(@Request() req) {
    const statistics = await this.viewingRecordsService.getChannelStatistics(req.user);
    return {
      success: true,
      data: statistics,
    };
  }

  @ApiOperation({ summary: '批量更新线索记录状态', description: '批量更新多条线索记录的状态和备注' })
  @ApiResponse({ status: 200, description: '批量更新成功' })
  @ApiBody({ type: BatchUpdateStatusDto })
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

  @ApiOperation({ summary: '获取单条线索记录', description: '根据ID获取线索记录详情' })
  @ApiResponse({ status: 200, description: '成功获取记录详情' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @ApiParam({ name: 'id', description: '线索记录ID', type: 'number' })
  @Get(':id')
  @Roles('admin', 'agent')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const record = await this.viewingRecordsService.findOne(id, req.user);
    return {
      success: true,
      data: record,
    };
  }

  @ApiOperation({ summary: '创建线索记录', description: '创建新的线索记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiBody({ type: CreateViewingRecordDto })
  @Post()
  @Roles('admin', 'agent')
  async create(@Body() createViewingRecordDto: CreateViewingRecordDto, @Request() req) {
    const record = await this.viewingRecordsService.create(createViewingRecordDto, req.user);
    return {
      success: true,
      data: record,
    };
  }

  @ApiOperation({ summary: '更新线索记录', description: '更新指定的线索记录信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @ApiParam({ name: 'id', description: '线索记录ID', type: 'number' })
  @ApiBody({ type: UpdateViewingRecordDto })
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

  @ApiOperation({ summary: '删除线索记录', description: '删除指定的线索记录（仅管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @ApiParam({ name: 'id', description: '线索记录ID', type: 'number' })
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