import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsInt, 
  IsEnum,
  MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PublicViewingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PublicBusinessType {
  FOCUS = 'focus',
  JOINT = 'joint',
  WHOLE = 'whole'
}

export class CreatePublicViewingRecordDto {
  @ApiPropertyOptional({ description: '租客姓名', maxLength: 100, example: '张三' })
  @IsOptional()
  @IsString({ message: '租客姓名必须是字符串' })
  @MaxLength(100, { message: '租客姓名长度不能超过100个字符' })
  tenantName?: string;

  @ApiPropertyOptional({ description: '会话ID，用于追踪用户会话', example: 'sess_abc123def456' })
  @IsOptional()
  @IsString({ message: '会话ID必须是字符串' })
  sessionId?: string;

  @ApiPropertyOptional({ description: '需求JSON数据', example: '{"budget": 3000, "area": "市中心", "rooms": 2}' })
  @IsOptional()
  @IsString({ message: '需求JSON必须是字符串' })
  requirementsJson?: string;

  @ApiPropertyOptional({ description: '原始查询内容', example: '我想在市中心租一个3000元的两室一厅' })
  @IsOptional()
  @IsString({ message: '原始查询必须是字符串' })
  originalQuery?: string;

  @ApiPropertyOptional({ description: 'AI总结的需求摘要', example: '租客寻找市中心3000元预算的两室一厅房源' })
  @IsOptional()
  @IsString({ message: 'AI总结必须是字符串' })
  aiSummary?: string;

  @ApiPropertyOptional({ description: '主要联系手机号', maxLength: 20, example: '13800138000' })
  @IsOptional()
  @IsString({ message: '主要手机号必须是字符串' })
  @MaxLength(20, { message: '手机号长度不能超过20个字符' })
  primaryPhone?: string;

  @ApiPropertyOptional({ description: '主要联系微信号', maxLength: 100, example: 'zhangsan_wx' })
  @IsOptional()
  @IsString({ message: '主要微信号必须是字符串' })
  @MaxLength(100, { message: '微信号长度不能超过100个字符' })
  primaryWechat?: string;

  @ApiPropertyOptional({ description: '房源ID', example: 12345 })
  @IsOptional()
  @IsInt({ message: '房源ID必须是整数' })
  housingId?: number;

  @ApiPropertyOptional({ description: '房间ID', example: 67890 })
  @IsOptional()
  @IsInt({ message: '房间ID必须是整数' })
  roomId?: number;

  @ApiPropertyOptional({ description: '业务类型', enum: PublicBusinessType, example: PublicBusinessType.FOCUS })
  @IsOptional()
  @IsEnum(PublicBusinessType, { message: '业务类型无效' })
  businessType?: PublicBusinessType;

  @ApiPropertyOptional({ description: '物业名称', maxLength: 200, example: '阳光小区' })
  @IsOptional()
  @IsString({ message: '物业名称必须是字符串' })
  @MaxLength(200, { message: '物业名称长度不能超过200个字符' })
  propertyName?: string;

  @ApiPropertyOptional({ description: '房间详细地址', maxLength: 500, example: '阳光小区1栋101室' })
  @IsOptional()
  @IsString({ message: '房间地址必须是字符串' })
  @MaxLength(500, { message: '房间地址长度不能超过500个字符' })
  roomAddress?: string;

  @ApiPropertyOptional({ description: '偏好看房时间', maxLength: 200, example: '周末上午9-12点' })
  @IsOptional()
  @IsString({ message: '偏好看房时间必须是字符串' })
  @MaxLength(200, { message: '偏好看房时间长度不能超过200个字符' })
  preferredViewingTime?: string;

  @ApiPropertyOptional({ description: '预约状态', enum: PublicViewingStatus, example: PublicViewingStatus.PENDING })
  @IsOptional()
  @IsEnum(PublicViewingStatus, { message: '预约状态无效' })
  viewingStatus?: PublicViewingStatus;

  @ApiPropertyOptional({ description: '指定经纪人ID', example: 100 })
  @IsOptional()
  @IsInt({ message: '经纪人ID必须是整数' })
  agentId?: number;

  @ApiPropertyOptional({ description: '经纪人姓名', maxLength: 100, example: '李经理' })
  @IsOptional()
  @IsString({ message: '经纪人姓名必须是字符串' })
  @MaxLength(100, { message: '经纪人姓名长度不能超过100个字符' })
  agentName?: string;

  @ApiPropertyOptional({ description: '经纪人联系电话', maxLength: 20, example: '13900139000' })
  @IsOptional()
  @IsString({ message: '经纪人电话必须是字符串' })
  @MaxLength(20, { message: '经纪人电话长度不能超过20个字符' })
  agentPhone?: string;

  @ApiPropertyOptional({ description: '备注信息', example: '客户很着急，需要尽快安排' })
  @IsOptional()
  @IsString({ message: '备注信息必须是字符串' })
  remarks?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: '更新的状态值', enum: PublicViewingStatus, example: PublicViewingStatus.CONFIRMED })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsEnum(PublicViewingStatus, { message: '无效的状态值' })
  status: PublicViewingStatus;
} 