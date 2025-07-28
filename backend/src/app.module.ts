import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ViewingRecordsModule } from './viewing-records/viewing-records.module';
import { PublicModule } from './public/public.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { RolesModule } from './roles/roles.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    // 环境变量配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 数据库模块
    PrismaModule,
    
    // 功能模块
    AuthModule,
    UsersModule,
    ViewingRecordsModule,
    ApiKeysModule,
    RolesModule,
    ExportModule,
    
    // 公共API模块
    PublicModule,
  ],
})
export class AppModule {} 