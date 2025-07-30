import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsInt, 
  IsEnum,
  IsPhoneNumber,
  MaxLength,
  IsNumber,
  IsDecimal,
  Min,
  IsDate
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

// 新增：线索来源平台枚举
export enum SourcePlatform {
  ENTERPRISE_WECHAT = '企业微信',
  PERSONAL_WECHAT = '个人微信',
  XIAOHONGSHU = '小红书',
  XIANYU = '闲鱼',
  DOUYIN = '抖音',
  VIDEOHAO = '视频号',
  BEIKE = '贝壳',
  WUBA = '58同城'
}

// 新增：客户需求房源类型枚举
export enum CustomerRoomType {
  SINGLE_ROOM = '单间',
  TWO_ROOM = '两房',
  THREE_ROOM = '三房'
}

// 新增：客户状态枚举
export enum CustomerStatus {
  CONTACTING = '接洽中',
  VIEWING_SCHEDULED = '已约带看',
  CUSTOMER_LOST = '客户丢失'
}

// 新增：带看状态枚举
export enum LeadViewingStatus {
  FIRST_VIEWING = '一次带看',
  SECOND_VIEWING = '二次带看',
  THIRD_VIEWING = '三次带看'
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
  @IsDate({ message: '带看日期格式不正确' })
  viewingDate?: Date;

  @IsOptional()
  @IsInt({ message: '房源ID必须是整数' })
  roomId?: number;

  @IsOptional()
  @IsString({ message: '业务类型必须是字符串' })
  businessType?: string;

  @IsOptional()
  @IsString({ message: '房源名称必须是字符串' })
  propertyName?: string;

  @IsOptional()
  @IsString({ message: '房源地址必须是字符串' })
  roomAddress?: string;

  @IsOptional()
  @IsString({ message: '首选看房时间必须是字符串' })
  preferredViewingTime?: string;

  @IsOptional()
  @IsString({ message: '带看状态必须是字符串' })
  viewingStatus?: string;

  @IsOptional()
  @IsInt({ message: '经纪人ID必须是整数' })
  agentId?: number;

  @IsOptional()
  @IsString({ message: '经纪人姓名必须是字符串' })
  agentName?: string;

  @IsOptional()
  @IsString({ message: '经纪人电话必须是字符串' })
  agentPhone?: string;

  @IsOptional()
  @IsString({ message: '来源必须是字符串' })
  source?: string;

  @IsOptional()
  @IsInt({ message: 'API密钥ID必须是整数' })
  apiKeyId?: number;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;

  // 新增字段 - 全部可选
  @IsOptional()
  @IsString()
  sourcePlatform?: string;

  @IsOptional()
  @IsString()
  customerRoomType?: string;

  @IsOptional()
  @IsNumber()
  sourcePropertyPrice?: number;

  @IsOptional()
  @IsString()
  followUpPlatform?: string;

  @IsOptional()
  @IsString()
  customerStatus?: string;

  @IsOptional()
  @IsString()
  leadViewingStatus?: string;

  @IsOptional()
  @IsString()
  viewingProperties?: string;

  @IsOptional()
  @IsString()
  customerFeedback?: string;
} 