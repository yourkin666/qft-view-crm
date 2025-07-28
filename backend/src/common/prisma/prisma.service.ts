import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // 添加查询性能监控中间件
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      
      // 记录慢查询（超过100ms）
      if (after - before > 100) {
        console.log(`🐌 Slow Query: ${params.model}.${params.action} took ${after - before}ms`);
      }
      
      return result;
    });
  }
  
  async onModuleInit() {
    await this.$connect();
    console.log('📊 Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📊 Database disconnected');
  }
} 