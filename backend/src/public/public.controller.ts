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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PublicService } from './public.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreatePublicViewingRecordDto, UpdateStatusDto } from './dto/create-public-viewing-record.dto';

@ApiTags('public')
@ApiSecurity('api-key')
@Controller('public')
@UseGuards(ApiKeyGuard)
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @ApiOperation({ 
    summary: '创建第三方线索记录', 
    description: '通过第三方API创建新的线索记录，需要API密钥认证' 
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建线索记录',
    example: {
      success: true,
      data: {
        id: 123,
        tenantName: '张三',
        primaryPhone: '13800138000',
        propertyName: '阳光小区',
        roomAddress: '1栋101室',
        viewingStatus: 'pending',
        createdAt: '2024-01-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: 'API密钥无效或缺失' })
  @ApiBody({ type: CreatePublicViewingRecordDto })
  @Post('viewing-records')
  async createViewingRecord(
    @Body(new ValidationPipe({ transform: true })) data: CreatePublicViewingRecordDto,
    @Request() req: any,
  ) {
    return this.publicService.createViewingRecord(data, req.apiKeyInfo);
  }

  @ApiOperation({ 
    summary: '获取第三方线索记录列表', 
    description: '分页获取第三方创建的线索记录，支持状态筛选' 
  })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: '记录状态', enum: ['pending', 'confirmed', 'completed', 'cancelled'] })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取记录列表',
    example: {
      success: true,
      data: {
        records: [
          {
            id: 123,
            tenantName: '张三',
            primaryPhone: '13800138000',
            propertyName: '阳光小区',
            viewingStatus: 'pending',
            createdAt: '2024-01-01T10:00:00.000Z'
          }
        ],
        total: 50,
        page: 1,
        pageSize: 10,
        totalPages: 5
      }
    }
  })
  @ApiResponse({ status: 401, description: 'API密钥无效或缺失' })
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

  @ApiOperation({ 
    summary: '获取第三方线索记录详情', 
    description: '根据ID获取第三方创建的线索记录详细信息' 
  })
  @ApiParam({ name: 'id', description: '线索记录ID', type: 'number', example: 123 })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取记录详情',
    example: {
      success: true,
      data: {
        id: 123,
        tenantName: '张三',
        sessionId: 'sess_abc123',
        requirementsJson: '{"budget": 3000, "area": "市中心"}',
        originalQuery: '我想在市中心租一个3000元的房子',
        aiSummary: '租客寻找市中心3000元预算的房源',
        primaryPhone: '13800138000',
        primaryWechat: 'zhangsan_wx',
        propertyName: '阳光小区',
        roomAddress: '1栋101室',
        preferredViewingTime: '周末上午',
        viewingStatus: 'pending',
        agentName: '李经理',
        agentPhone: '13900139000',
        remarks: '客户很着急',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @ApiResponse({ status: 401, description: 'API密钥无效或缺失' })
  @Get('viewing-records/:id')
  async getViewingRecord(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.publicService.getViewingRecord(id, req.apiKeyInfo);
  }

  @ApiOperation({ 
    summary: '更新第三方线索记录状态', 
    description: '更新第三方创建的线索记录的状态' 
  })
  @ApiParam({ name: 'id', description: '线索记录ID', type: 'number', example: 123 })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新状态',
    example: {
      success: true,
      data: {
        id: 123,
        viewingStatus: 'confirmed',
        updatedAt: '2024-01-01T11:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: '状态值无效' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @ApiResponse({ status: 401, description: 'API密钥无效或缺失' })
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

  @ApiOperation({ 
    summary: 'API健康检查', 
    description: '检查第三方API服务状态和连通性' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API服务正常',
    example: {
      success: true,
      data: {
        status: 'ok',
        timestamp: '2024-01-01T10:00:00.000Z',
        channel: '微信小程序',
        message: 'API服务正常运行'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'API密钥无效或缺失' })
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