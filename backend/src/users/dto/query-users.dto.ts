import { IsOptional, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryUsersDto {
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @Max(100, { message: '每页数量最大为100' })
  pageSize?: number;

  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: '活跃状态必须是布尔值' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: '角色必须是字符串' })
  role?: string;
}