# 房源带看管理系统 - 部署指南

## 📋 环境要求

### 基础环境

- **Node.js**: >= 18.18.0 (推荐 22.17.1 LTS)
- **MySQL**: >= 8.0
- **Redis**: >= 6.0 (可选，用于缓存)
- **Nginx**: >= 1.20 (生产环境)

### 开发工具

- **pnpm**: >= 8.0 (包管理器)
- **Docker**: >= 20.10 (容器化部署)
- **Git**: >= 2.30

## 🚀 快速部署

### 1. 后端部署

#### 环境配置

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/qft_view_crm"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# 服务配置
PORT=3001
NODE_ENV=production

# CORS配置
CORS_ORIGIN="https://your-domain.com"

# 文件上传
UPLOAD_MAX_SIZE=10485760

# Redis配置 (可选)
REDIS_URL="redis://localhost:6379"

# 日志配置
LOG_LEVEL=info
```

#### 安装依赖和构建

```bash
pnpm install
pnpm run build
```

#### 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE qft_view_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 运行迁移
npx prisma migrate deploy
npx prisma generate

# 初始化数据
pnpm run seed
```

#### 启动服务

```bash
# 开发环境
pnpm run start:dev

# 生产环境
pnpm run start:prod
```

### 2. 前端部署

#### 环境配置

```bash
cd frontend
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# API配置
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=房源带看CRM系统

# 环境标识
VITE_NODE_ENV=production

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_PWA=true
```

#### 构建和部署

```bash
pnpm install
pnpm run build

# 构建产物在 dist/ 目录
```

## 🐳 Docker 容器化部署

### 后端 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package*.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成 Prisma client
RUN npx prisma generate

# 构建应用
RUN pnpm run build

# 生产环境
FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
```

### 前端 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package*.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# Nginx 服务
FROM nginx:alpine AS runner

# 复制构建产物
COPY --from=base /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose 配置

```yaml
version: "3.8"

services:
  # 数据库
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: qft_view_crm
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    networks:
      - crm-network

  # Redis (可选)
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - crm-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@mysql:3306/qft_view_crm
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mysql
      - redis
    ports:
      - "3001:3001"
    networks:
      - crm-network
    volumes:
      - ./uploads:/app/uploads

  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - crm-network
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx

volumes:
  mysql_data:
  redis_data:

networks:
  crm-network:
    driver: bridge
```

## 🌐 Nginx 配置

### 生产环境配置 (nginx.conf)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 安全头
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 上游后端服务
    upstream backend {
        server backend:3001;
        keepalive 16;
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 主配置
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;

        # 根目录
        root /usr/share/nginx/html;
        index index.html;

        # 移动端优化
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # API 代理
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # 超时配置
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;

            # 移动端检测
            set $mobile_request "";
            if ($http_user_agent ~* "(Mobile|Android|iPhone|iPad)") {
                set $mobile_request "mobile";
            }

            # PWA 支持
            location = /manifest.json {
                add_header Cache-Control "no-cache";
            }

            location = /sw.js {
                add_header Cache-Control "no-cache";
            }
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 📊 监控和日志

### PM2 进程管理

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "qft-crm-backend",
      script: "dist/main.js",
      cwd: "./backend",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
    },
  ],
};
```

启动命令：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 性能监控

#### 1. 前端性能监控

```typescript
// frontend/src/utils/performance.ts
export class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0];
      console.log("页面加载时间:", perfData.loadEventEnd - perfData.fetchStart);
    });
  }

  static measureFirstContentfulPaint() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          console.log("首次内容绘制:", entry.startTime);
        }
      }
    }).observe({ entryTypes: ["paint"] });
  }
}
```

#### 2. 后端性能监控

```typescript
// backend/src/common/performance.interceptor.ts
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        const request = context.switchToHttp().getRequest();
        console.log(`${request.method} ${request.url} - ${end - start}ms`);
      })
    );
  }
}
```

## 🔒 安全配置

### 1. 环境变量

```bash
# 生产环境必须修改的安全配置
JWT_SECRET="your-256-bit-secret-key-here"
DATABASE_PASSWORD="strong-database-password"
ADMIN_PASSWORD="strong-admin-password"

# API 限流
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# 文件上传限制
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf
```

### 2. 数据库安全

```sql
-- 创建专用数据库用户
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON qft_view_crm.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;

-- 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

## 🔧 故障排除

### 常见问题

#### 1. Node.js 版本问题

```bash
# 检查版本
node --version
npm --version

# 升级 Node.js (使用 nvm)
nvm install 18
nvm use 18
nvm alias default 18
```

#### 2. 数据库连接问题

```bash
# 检查数据库连接
mysql -h localhost -u root -p

# 检查 Prisma 连接
npx prisma db pull
```

#### 3. 前端构建问题

```bash
# 清理缓存
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 类型检查
pnpm run type-check
```

#### 4. 移动端兼容性问题

- 检查 CSS 前缀
- 验证 touch 事件
- 测试不同设备分辨率

### 日志查看

```bash
# 后端日志
tail -f backend/logs/app.log

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 日志
pm2 logs
```

### 性能优化检查清单

#### 前端优化

- [x] 代码分割和懒加载
- [x] 图片优化和压缩
- [x] CSS 和 JS 压缩
- [x] Gzip 压缩
- [x] CDN 配置
- [x] 移动端适配
- [x] PWA 支持

#### 后端优化

- [x] 数据库索引优化
- [x] API 响应缓存
- [x] 连接池配置
- [x] 内存使用监控
- [x] 错误日志监控

#### 部署优化

- [x] Docker 多阶段构建
- [x] Nginx 配置优化
- [x] SSL/TLS 配置
- [x] 负载均衡配置
- [x] 监控告警配置

## 📞 技术支持

如有部署问题，请检查：

1. 系统环境是否满足要求
2. 配置文件是否正确
3. 网络连接是否正常
4. 日志文件中的错误信息

技术文档：[项目 Wiki](https://github.com/your-org/qft-view-crm/wiki)
问题反馈：[GitHub Issues](https://github.com/your-org/qft-view-crm/issues)
