import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsInt, 
  IsEnum,
  IsPhoneNumber,
  MaxLength
} from 'class-validator';

export enum ViewingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum BusinessType {
  FOCUS = 'focus',
  JOINT = 'joint',
  WHOLE = 'whole'
}

export class CreateViewingRecordDto {
  @IsOptional()
  @IsString({ message: '租客姓名必须是字符串' })
  @MaxLength(100, { message: '租客姓名长度不能超过100个字符' })
  tenantName?: string;

  @IsOptional()
  @IsString({ message: '会话ID必须是字符串' })
  sessionId?: string;

  @IsOptional()
  @IsString({ message: '需求JSON必须是字符串' })
  requirementsJson?: string;

  @IsOptional()
  @IsString({ message: '原始查询必须是字符串' })
  originalQuery?: string;

  @IsOptional()
  @IsString({ message: 'AI总结必须是字符串' })
  aiSummary?: string;

  @IsOptional()
  @IsString({ message: '主要手机号必须是字符串' })
  @MaxLength(20, { message: '手机号长度不能超过20个字符' })
  primaryPhone?: string;

  @IsOptional()
  @IsString({ message: '主要微信号必须是字符串' })
  @MaxLength(100, { message: '微信号长度不能超过100个字符' })
  primaryWechat?: string;

  @IsOptional()
  @IsInt({ message: '房源ID必须是整数' })
  housingId?: number;

  @IsOptional()
  @IsInt({ message: '房间ID必须是整数' })
  roomId?: number;

  @IsOptional()
  @IsEnum(BusinessType, { message: '业务类型无效' })
  businessType?: BusinessType;

  @IsOptional()
  @IsString({ message: '物业名称必须是字符串' })
  @MaxLength(200, { message: '物业名称长度不能超过200个字符' })
  propertyName?: string;

  @IsOptional()
  @IsString({ message: '房间地址必须是字符串' })
  @MaxLength(500, { message: '房间地址长度不能超过500个字符' })
  roomAddress?: string;

  @IsOptional()
  @IsString({ message: '偏好看房时间必须是字符串' })
  @MaxLength(200, { message: '偏好看房时间长度不能超过200个字符' })
  preferredViewingTime?: string;

  @IsOptional()
  @IsString({ message: '带看时间必须是字符串格式' })
  viewingDate?: string;

  @IsOptional()
  @IsEnum(ViewingStatus, { message: '预约状态无效' })
  viewingStatus?: ViewingStatus;

  @IsOptional()
  @IsInt({ message: '经纪人ID必须是整数' })
  agentId?: number;

  @IsOptional()
  @IsString({ message: '经纪人姓名必须是字符串' })
  @MaxLength(100, { message: '经纪人姓名长度不能超过100个字符' })
  agentName?: string;

  @IsOptional()
  @IsString({ message: '经纪人电话必须是字符串' })
  @MaxLength(20, { message: '经纪人电话长度不能超过20个字符' })
  agentPhone?: string;

  @IsOptional()
  @IsString({ message: '来源标识必须是字符串' })
  @MaxLength(50, { message: '来源标识长度不能超过50个字符' })
  source?: string;

  @IsOptional()
  @IsString({ message: '备注信息必须是字符串' })
  remarks?: string;
} 