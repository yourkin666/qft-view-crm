import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty({ message: '渠道名称不能为空' })
  @IsString({ message: '渠道名称必须是字符串' })
  @MaxLength(100, { message: '渠道名称长度不能超过100个字符' })
  channelName: string;

  @IsOptional()
  @IsBoolean({ message: '激活状态必须是布尔值' })
  isActive?: boolean;
} 