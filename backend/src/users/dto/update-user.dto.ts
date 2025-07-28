import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean, IsString, IsInt, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  username?: string;

  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password?: string;

  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  phone?: string;

  @IsOptional()
  @IsInt({ message: '角色ID必须是整数' })
  roleId?: number;

  @IsOptional()
  @IsBoolean({ message: '激活状态必须是布尔值' })
  isActive?: boolean;
} 