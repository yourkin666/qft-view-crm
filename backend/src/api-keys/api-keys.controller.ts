import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // 只有管理员可以管理API密钥
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  /**
   * 获取API密钥列表
   * GET /api/api-keys
   */
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 10));
    return this.apiKeysService.findAll(pageNum, pageSizeNum);
  }

  /**
   * 获取API密钥使用统计
   * GET /api/api-keys/statistics
   */
  @Get('statistics')
  getStatistics() {
    return this.apiKeysService.getUsageStatistics();
  }

  /**
   * 获取单个API密钥详情
   * GET /api/api-keys/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.apiKeysService.findOne(id);
  }

  /**
   * 创建新的API密钥
   * POST /api/api-keys
   */
  @Post()
  create(
    @Body(new ValidationPipe({ transform: true })) createApiKeyDto: CreateApiKeyDto,
    @Request() req: any,
  ) {
    return this.apiKeysService.create(createApiKeyDto, req.user.id);
  }

  /**
   * 更新API密钥
   * PATCH /api/api-keys/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateApiKeyDto: UpdateApiKeyDto,
  ) {
    return this.apiKeysService.update(id, updateApiKeyDto);
  }

  /**
   * 重新生成API Secret
   * POST /api/api-keys/:id/regenerate-secret
   */
  @Post(':id/regenerate-secret')
  regenerateSecret(@Param('id', ParseIntPipe) id: number) {
    return this.apiKeysService.regenerateSecret(id);
  }

  /**
   * 删除API密钥
   * DELETE /api/api-keys/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.apiKeysService.remove(id);
  }
} 