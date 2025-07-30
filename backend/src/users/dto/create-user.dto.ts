import { IsNotEmpty, IsString, IsOptional, IsInt, MinLength, IsPhoneNumber, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名至少需要3个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线，不能包含特殊字符'
  })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码长度至少需要8位字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: '密码必须至少8位，并且包含至少一个大写字母、一个小写字母和一个数字'
  })
  password: string;

  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  @MinLength(1, { message: '姓名不能为空' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, {
    message: '请输入有效的手机号码（以1开头的11位数字）'
  })
  phone?: string;

  @IsNotEmpty({ message: '必须选择用户角色' })
  @IsInt({ message: '角色ID必须是有效的数字' })
  roleId: number;
} 