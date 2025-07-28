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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
    @Query('isActive') isActive?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const result = await this.usersService.findAll(
      page, 
      pageSize,
      {
        search,
        roleId: roleId ? parseInt(roleId) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        orderBy: orderBy || 'createdAt',
      }
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
    };
  }

  @Get(':id/statistics')
  @Roles('admin')
  async getUserStatistics(@Param('id', ParseIntPipe) id: number) {
    const statistics = await this.usersService.getUserStatistics(id);
    return {
      success: true,
      data: statistics,
    };
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
    };
  }

  @Post('batch-update')
  @Roles('admin')
  async batchUpdate(@Body() batchUpdateDto: { ids: number[]; data: Partial<UpdateUserDto> }) {
    const result = await this.usersService.batchUpdate(batchUpdateDto.ids, batchUpdateDto.data);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/reset-password')
  @Roles('admin')
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.resetPassword(id);
    return {
      success: true,
      data: result,
    };
  }

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

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.remove(id);
    return {
      success: true,
      data: result,
    };
  }

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