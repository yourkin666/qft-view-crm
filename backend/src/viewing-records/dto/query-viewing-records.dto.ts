import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
// import { ViewingStatus, BusinessType, SourcePlatform, CustomerStatus, CustomerRoomType } from './create-viewing-record.dto';
import { ViewingStatus, BusinessType } from './create-viewing-record.dto';

export class QueryViewingRecordsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 1;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 1 : parsed;
  })
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 10;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 10 : parsed;
  })
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  pageSize?: number = 10;

  @IsOptional()
  @IsEnum(ViewingStatus, { message: '预约状态无效' })
  status?: ViewingStatus;

  @IsOptional()
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

  // 暂时注释新增字段的查询
  // @IsOptional()
  // @IsEnum(SourcePlatform, { message: '线索来源平台无效' })
  // sourcePlatform?: SourcePlatform;

  // @IsOptional()
  // @IsEnum(CustomerRoomType, { message: '客户需求房源类型无效' })
  // customerRoomType?: CustomerRoomType;

  // @IsOptional()
  // @IsEnum(CustomerStatus, { message: '客户状态无效' })
  // customerStatus?: CustomerStatus;

  // @IsOptional()
  // @IsEnum(SourcePlatform, { message: '当前跟进平台无效' })
  // followUpPlatform?: SourcePlatform;
} 