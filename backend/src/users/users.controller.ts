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
  ParseIntPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '获取用户列表', description: '分页获取用户列表，支持搜索和状态筛选' })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @Get()
  @Roles('admin')
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 10));
    
    const result = await this.usersService.findAll(
      pageNum, 
      pageSizeNum,
      {
        search,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        orderBy: 'createdAt',
      }
    );
    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: '获取用户详情', description: '根据ID获取用户详细信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功获取用户详情' })
  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: '获取用户统计', description: '获取用户的带看记录统计数据' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功获取用户统计' })
  @Get(':id/statistics')
  @Roles('admin')
  async getUserStatistics(@Param('id', ParseIntPipe) id: number) {
    const statistics = await this.usersService.getUserStatistics(id);
    return {
      success: true,
      data: statistics,
    };
  }

  @ApiOperation({ summary: '创建用户', description: '创建新的系统用户' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: '批量更新用户', description: '批量更新多个用户的信息' })
  @ApiResponse({ status: 200, description: '批量更新成功' })
  @Post('batch-update')
  @Roles('admin')
  async batchUpdate(@Body() batchUpdateDto: { ids: number[]; data: Partial<UpdateUserDto> }) {
    const result = await this.usersService.batchUpdate(batchUpdateDto.ids, batchUpdateDto.data);
    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: '重置用户密码', description: '重置指定用户的密码' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @Post(':id/reset-password')
  @Roles('admin')
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.resetPassword(id);
    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: '更新用户', description: '更新指定用户的信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: '删除用户', description: '删除指定的用户' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.remove(id);
    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: '批量删除用户', description: '批量删除多个用户' })
  @ApiResponse({ status: 200, description: '批量删除成功' })
  @Delete('batch')
  @Roles('admin')
  async batchDelete(@Body() batchDeleteDto: { ids: number[] }) {
    const result = await this.usersService.batchDelete(batchDeleteDto.ids);
    return {
      success: true,
      data: result,
    };
  }
} 