import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // 只有管理员可以访问角色信息
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * 获取角色列表
   * GET /api/roles
   */
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * 获取单个角色详情
   * GET /api/roles/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }
} 