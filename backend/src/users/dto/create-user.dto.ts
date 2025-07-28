import { IsNotEmpty, IsString, IsOptional, IsInt, MinLength, IsPhoneNumber, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码长度不能少于8位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: '密码至少8位，必须包含大小写字母和数字'
  })
  password: string;

  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  phone?: string;

  @IsNotEmpty({ message: '角色ID不能为空' })
  @IsInt({ message: '角色ID必须是整数' })
  roleId: number;
} 