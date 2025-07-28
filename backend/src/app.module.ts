import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    
    // 请求限流配置
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60 * 1000, // 1分钟时间窗口
        limit: 100, // 每分钟最多100次请求
      },
      {
        name: 'strict',
        ttl: 60 * 1000, // 1分钟时间窗口
        limit: 20, // 每分钟最多20次请求（用于敏感操作）
      },
    ]),
    
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
  providers: [
    // 全局请求限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {} 