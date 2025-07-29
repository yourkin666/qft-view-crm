# 房源带看管理系统使用文档

## 📋 目录

- [项目概述](#项目概述)
- [快速开始](#快速开始)
- [安装部署](#安装部署)
- [功能介绍](#功能介绍)
- [用户指南](#用户指南)
- [API文档](#api文档)
- [开发指南](#开发指南)
- [故障排除](#故障排除)

## 🏠 项目概述

房源带看管理系统是一个现代化的全栈web应用，专为房地产经纪公司设计，用于管理客户带看记录、用户权限和API集成。

### 主要特性

- 🔐 **权限管理**：基于角色的访问控制（管理员/经纪人）
- 📱 **响应式设计**：支持桌面和移动端访问
- 📊 **数据统计**：实时统计和可视化图表
- 🔑 **API集成**：支持第三方系统接入
- 📤 **数据导出**：Excel/PDF格式导出
- 🎯 **实时更新**：带看状态实时同步

### 技术栈

**前端：**
- React 19 + TypeScript
- Ant Design 5.26 (UI组件库)
- Redux Toolkit (状态管理)
- Vite (构建工具)

**后端：**
- NestJS + TypeScript
- Prisma ORM
- SQLite/MySQL 数据库
- JWT 身份认证
- Passport.js 认证策略

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### 一键启动

```bash
# 克隆项目
git clone https://github.com/yourkin666/qft-view-crm.git
cd qft-view-crm

# 安装依赖
npm run install:all

# 启动开发服务
npm run dev
```

启动成功后：
- 前端：http://localhost:5173
- 后端：http://localhost:3000/api
- API文档：http://localhost:3000/api/docs

### 默认账户

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | admin | Admin123! | 全部功能 |
| 经纪人 | agent001 | Agent123! | 带看记录管理 |

## 📦 安装部署

### 开发环境部署

#### 1. 环境准备

```bash
# 检查Node.js版本
node --version  # 应该 >= 18.0.0
npm --version   # 应该 >= 8.0.0
```

#### 2. 项目安装

```bash
# 克隆项目
git clone https://github.com/yourkin666/qft-view-crm.git
cd qft-view-crm

# 安装根目录依赖
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

#### 3. 数据库配置

```bash
# 进入后端目录
cd backend

# 创建环境配置文件
cp .env.backup .env

# 编辑配置文件
# DATABASE_URL="file:./dev.db"  # SQLite (开发环境)
# DATABASE_URL="mysql://user:password@localhost:3306/qft_view_crm"  # MySQL (生产环境)

# 运行数据库迁移
npx prisma db push

# 填充种子数据
npm run prisma:seed
```

#### 4. 启动服务

```bash
# 方式一：同时启动前后端
npm run dev

# 方式二：分别启动
# 后端
cd backend && npm run start:dev

# 前端 (新终端)
cd frontend && npm run dev
```

### 生产环境部署

#### 1. 环境变量配置

创建 `backend/.env` 文件：

```env
# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/qft_view_crm"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key-for-production"
JWT_EXPIRES_IN="7d"

# 服务配置
PORT=3000
NODE_ENV=production

# CORS配置
CORS_ORIGIN="https://yourdomain.com"
```

#### 2. 构建项目

```bash
# 构建全部
npm run build:all

# 单独构建
cd backend && npm run build      # 构建后端
cd frontend && npm run build     # 构建前端
```

#### 3. 生产服务启动

```bash
# 数据库迁移
cd backend && npx prisma migrate deploy

# 启动生产服务
npm start
```

#### 4. Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🎯 功能介绍

### 1. 用户管理

**管理员功能：**
- 创建/编辑/删除用户账户
- 分配用户角色（管理员/经纪人）
- 重置用户密码
- 查看用户统计信息

**经纪人功能：**
- 查看个人信息
- 修改个人密码

### 2. 带看记录管理

**核心功能：**
- 创建带看记录
- 编辑带看信息
- 状态跟踪（待确认/已确认/已完成/已取消）
- 批量操作
- 高级筛选和搜索

**记录字段：**
- 客户信息（姓名、电话、微信）
- 房源信息（物业名称、房间地址）
- 带看时间和状态
- 负责经纪人
- 业务类型（租赁/买卖）
- 备注信息

### 3. API密钥管理

**API功能：**
- 创建/管理API密钥
- 查看使用统计
- 启用/禁用密钥
- 重新生成密钥

### 4. 数据统计

**统计功能：**
- 带看记录统计
- 状态分布图表
- 渠道来源分析
- 经纪人绩效统计

### 5. 数据导出

**导出格式：**
- Excel (.xlsx)
- PDF 报告
- 支持筛选条件导出

## 👤 用户指南

### 登录系统

1. 访问系统地址
2. 输入用户名和密码
3. 点击"登录"按钮
4. 系统自动跳转到仪表板

### 管理带看记录

#### 创建新记录

1. 点击"带看记录"菜单
2. 点击"新增记录"按钮
3. 填写必要信息：
   - 客户姓名和联系方式
   - 房源信息
   - 预约带看时间
   - 选择负责经纪人
4. 点击"保存"提交

#### 编辑记录

1. 在记录列表中找到目标记录
2. 点击"编辑"按钮
3. 修改相关信息
4. 点击"保存"确认修改

#### 批量操作

1. 勾选需要操作的记录
2. 点击"批量操作"按钮
3. 选择操作类型（状态更新等）
4. 确认执行

### 用户管理（管理员）

#### 创建新用户

1. 进入"用户管理"页面
2. 点击"新增用户"
3. 填写用户信息：
   - 用户名（登录名）
   - 真实姓名
   - 手机号码
   - 选择角色
4. 保存创建

#### 重置密码

1. 找到需要重置密码的用户
2. 点击"重置密码"
3. 系统生成新密码
4. 通知用户新密码

### API密钥管理

#### 创建API密钥

1. 进入"API管理"页面
2. 点击"新增密钥"
3. 输入渠道名称
4. 保存并获取API密钥和密钥

#### 使用API密钥

第三方系统集成时使用：
- API Key: 在请求头中使用
- API Secret: 用于签名验证
- 请求格式: 参考API文档

## 📚 API文档

### 认证方式

#### JWT Token认证（内部API）

```http
Authorization: Bearer your-jwt-token
```

#### API Key认证（公开API）

```http
X-API-Key: your-api-key
X-API-Secret: your-api-secret
X-Timestamp: 1640995200
X-Nonce: random-string
```

### 主要端点

#### 1. 用户认证

**登录**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "fullName": "系统管理员",
      "role": {
        "name": "admin"
      }
    }
  }
}
```

#### 2. 带看记录

**获取记录列表**
```http
GET /api/viewing-records?page=1&pageSize=10&status=pending
Authorization: Bearer your-jwt-token
```

**创建记录**
```http
POST /api/viewing-records
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "tenantName": "张三",
  "primaryPhone": "13800138000",
  "propertyName": "华润城润府",
  "roomAddress": "A座1001室",
  "viewingDate": "2024-01-15T10:00:00Z",
  "businessType": "rent",
  "agentId": 1
}
```

#### 3. 公开API（第三方集成）

**创建带看记录**
```http
POST /api/public/viewing-records
X-API-Key: your-api-key
X-API-Secret: your-api-secret
X-Timestamp: 1640995200
X-Nonce: abc123
Content-Type: application/json

{
  "tenantName": "李四",
  "primaryPhone": "13900139000",
  "propertyName": "前海时代广场",
  "roomAddress": "B座2002室",
  "source": "官网预约"
}
```

### 错误处理

标准错误响应格式：
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据验证失败"
  },
  "statusCode": 400
}
```

常见错误码：
- `400` - 请求参数错误
- `401` - 未授权访问
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 🛠️ 开发指南

### 项目结构

```
qft-view-crm/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── users/          # 用户管理
│   │   ├── viewing-records/# 带看记录
│   │   ├── api-keys/       # API密钥管理
│   │   ├── common/         # 共享模块
│   │   └── main.ts         # 应用入口
│   ├── prisma/             # 数据库相关
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   └── types/          # 类型定义
│   └── package.json
└── package.json            # 根配置
```

### 开发命令

```bash
# 安装依赖
npm run install:all

# 开发服务
npm run dev                 # 同时启动前后端
npm run backend:dev         # 仅启动后端
npm run frontend:dev        # 仅启动前端

# 构建项目
npm run build:all           # 构建全部
npm run backend:build       # 构建后端
npm run frontend:build      # 构建前端

# 数据库操作
npm run prisma:migrate      # 运行迁移
npm run prisma:studio       # 打开数据库管理界面
npm run prisma:seed         # 填充种子数据
npm run db:reset            # 重置数据库

# 测试
npm run test                # 运行测试
npm run test:e2e            # 端到端测试

# 代码质量
npm run lint                # 代码检查
```

### 添加新功能

#### 1. 后端添加新模块

```bash
# 创建新模块
cd backend
nest generate module your-module
nest generate controller your-module
nest generate service your-module
```

#### 2. 前端添加新页面

```bash
# 创建页面组件
# frontend/src/pages/YourPage.tsx
# 添加路由配置
# frontend/src/App.tsx
# 创建对应的service和slice
```

#### 3. 数据库模型变更

```bash
# 修改 prisma/schema.prisma
# 创建迁移
npx prisma migrate dev --name your-change-name
# 更新客户端
npx prisma generate
```

### 代码规范

**TypeScript规范：**
- 使用严格类型检查
- 导出接口和类型定义
- 避免使用 `any` 类型

**React组件规范：**
- 使用函数组件和Hooks
- Props接口定义
- 组件文件命名使用PascalCase

**API设计规范：**
- RESTful API设计
- 统一响应格式
- 适当的HTTP状态码

## 🔧 故障排除

### 常见问题

#### 1. 无法启动服务

**问题**：`npm run dev` 报错
**解决**：
```bash
# 检查Node.js版本
node --version

# 清理依赖重新安装
rm -rf node_modules package-lock.json
npm install

# 检查端口占用
lsof -i :3000
lsof -i :5173
```

#### 2. 数据库连接失败

**问题**：`PrismaClientConstructorValidationError`
**解决**：
```bash
# 检查.env文件是否存在
ls backend/.env

# 创建环境配置
cd backend
cp .env.backup .env

# 重新初始化数据库
npx prisma db push
npm run prisma:seed
```

#### 3. 登录失败

**问题**：输入正确密码仍无法登录
**解决**：
```bash
# 检查后端服务状态
curl http://localhost:3000/api/auth/login

# 重置数据库用户数据
npm run db:reset

# 使用测试页面验证
# 访问 http://localhost:5173/test-login.html
```

#### 4. 前端编译错误

**问题**：TypeScript编译错误
**解决**：
```bash
# 跳过类型检查构建
cd frontend
npm run build

# 或修复类型错误
npm run type-check
```

#### 5. API调用失败

**问题**：前端无法调用后端API
**解决**：
```bash
# 检查代理配置
# frontend/vite.config.ts proxy设置

# 检查CORS配置
# backend/.env CORS_ORIGIN设置

# 验证API直接访问
curl http://localhost:3000/api/public/health
```

### 日志查看

**后端日志：**
```bash
cd backend
npm run start:dev
# 查看控制台输出
```

**前端日志：**
- 打开浏览器开发者工具
- 查看Console面板
- 查看Network面板的API请求

### 性能优化

**前端优化：**
- 启用代码分割
- 图片懒加载
- 适当的缓存策略

**后端优化：**
- 数据库查询优化
- 接口响应缓存
- 适当的分页策略

## 📞 技术支持

如遇到问题，请按以下方式获取帮助：

1. **查看文档**：首先查阅本使用文档
2. **检查日志**：查看控制台和服务器日志
3. **GitHub Issues**：https://github.com/yourkin666/qft-view-crm/issues
4. **开发团队**：联系项目维护人员

## 📄 更新日志

### v1.0.0 (2024-01-29)
- ✅ 初始版本发布
- ✅ 用户权限管理系统
- ✅ 带看记录CRUD功能
- ✅ API密钥管理
- ✅ 数据统计和导出
- ✅ 响应式移动端支持
- ✅ 第三方API集成支持

---

📝 **文档最后更新**：2024年1月29日  
🔗 **项目地址**：https://github.com/yourkin666/qft-view-crm  
👨‍💻 **维护团队**：QFT开发团队