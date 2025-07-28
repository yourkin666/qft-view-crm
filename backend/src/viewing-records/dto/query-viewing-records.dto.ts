import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ViewingStatus, BusinessType } from './create-viewing-record.dto';

export class QueryViewingRecordsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  pageSize?: number = 10;

  @IsOptional()
  @IsEnum(ViewingStatus, { message: '预约状态无效' })
  status?: ViewingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '经纪人ID必须是整数' })
  agentId?: number;

  @IsOptional()
  @IsString({ message: '来源必须是字符串' })
  source?: string;

  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @IsOptional()
  @IsEnum(BusinessType, { message: '业务类型无效' })
  businessType?: BusinessType;
} 