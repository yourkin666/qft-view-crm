# 房源带看管理系统 - 后端 API

基于 NestJS + Prisma + MySQL 的房源带看管理系统后端服务。

## 🚀 快速开始

### 环境要求

- Node.js >= 16.17.0
- MySQL >= 8.0
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 环境配置

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的配置：

```env
# 数据库连接
DATABASE_URL="mysql://root:password@localhost:3306/qft_crm"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# 服务器配置
PORT=3001
NODE_ENV=development

# CORS配置
CORS_ORIGIN="http://localhost:3000"
```

### 数据库初始化

1. 确保 MySQL 服务正在运行
2. 创建数据库：

```sql
CREATE DATABASE qft_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

3. 运行数据库迁移：

```bash
npx prisma migrate dev --name init
```

4. 生成 Prisma 客户端：

```bash
npx prisma generate
```

5. 导入种子数据：

```bash
npm run prisma:seed
```

### 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后，API 将在 `http://localhost:3001/api` 可用。

## 📊 默认账户

种子数据会创建以下测试账户：

| 角色   | 用户名   | 密码     | 描述                     |
| ------ | -------- | -------- | ------------------------ |
| 管理员 | admin    | admin123 | 系统管理员，拥有所有权限 |
| 经纪人 | agent001 | agent123 | 示例经纪人账户           |

## 🔗 主要 API 接口

### 认证接口

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 用户管理 (需要管理员权限)

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PATCH /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 带看记录管理

- `GET /api/viewing-records` - 获取带看记录列表
- `POST /api/viewing-records` - 创建带看记录
- `GET /api/viewing-records/:id` - 获取记录详情
- `PATCH /api/viewing-records/:id` - 更新记录
- `DELETE /api/viewing-records/:id` - 删除记录 (仅管理员)
- `GET /api/viewing-records/statistics` - 获取统计数据

## 🛠️ 开发工具

```bash
# 查看数据库
npx prisma studio

# 重置数据库
npm run db:reset

# 代码检查
npm run lint

# 运行测试
npm run test
```

## 📝 权限说明

### 管理员 (admin)

- 查看所有用户和带看记录
- 创建、编辑、删除用户
- 删除带看记录
- 查看系统统计数据

### 经纪人 (agent)

- 查看和管理自己的带看记录
- 创建新的带看记录
- 更新自己的带看记录状态
- 查看自己的统计数据

## 🏗️ 项目结构

```
src/
├── auth/              # 认证模块
├── users/             # 用户管理模块
├── viewing-records/   # 带看记录模块
├── common/           # 公共模块
│   ├── guards/       # 守卫 (权限控制)
│   ├── decorators/   # 装饰器
│   └── prisma/       # 数据库连接
└── main.ts           # 应用入口

prisma/
├── schema.prisma     # 数据库模式
└── seed.ts          # 种子数据
```

## 🔧 技术栈

- **框架**: NestJS
- **数据库**: MySQL 8.0
- **ORM**: Prisma
- **认证**: JWT + Passport
- **验证**: class-validator
- **语言**: TypeScript
