import { IsArray, IsNotEmpty, IsString, IsEnum, ArrayMinSize } from 'class-validator';

export enum BatchViewingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class BatchUpdateStatusDto {
  @IsArray({ message: '记录ID必须是数组' })
  @ArrayMinSize(1, { message: '至少选择一条记录' })
  @IsNotEmpty({ each: true, message: '记录ID不能为空' })
  ids: number[];

  @IsNotEmpty({ message: '状态不能为空' })
  @IsEnum(BatchViewingStatus, { message: '无效的状态值' })
  status: BatchViewingStatus;

  @IsString({ message: '备注必须是字符串' })
  remarks?: string;
} 