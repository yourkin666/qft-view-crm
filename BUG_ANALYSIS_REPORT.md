# 项目 Bug 分析报告

## 🔍 系统性问题分析

基于对整个项目的全面审视，以下是发现的主要问题和潜在风险：

---

## 🚨 高优先级问题 (Critical)

### 1. 环境配置缺失

**问题描述：**

- 后端缺少 `.env` 文件，但代码中使用了 `JWT_SECRET` 等环境变量
- 可能导致生产环境部署失败

**影响：**

- JWT token 签名失败
- 应用无法正常启动

**解决方案：**

```bash
# 在 backend/ 目录下创建 .env 文件
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### 2. CORS 配置问题

**问题描述：**

- 后端默认 CORS 配置为 `localhost:3000`，但前端运行在 `5173` 端口
- 会导致跨域请求失败

**影响：**

- 前端无法正常调用后端 API
- 用户无法登录和使用系统

**解决方案：**

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // 修改为5173
  credentials: true,
});
```

### 3. 数据库配置不一致

**问题描述：**

- README.md 文档说明使用 MySQL，但 `schema.prisma` 配置为 SQLite
- 可能误导开发者配置

**影响：**

- 部署环境不一致
- 性能和功能差异

**解决方案：**
统一数据库选择，建议使用 SQLite（适合演示）或更新文档说明。

---

## ⚠️ 中优先级问题 (High)

### 4. 安全性问题

#### 4.1 Token 存储安全

**问题描述：**

- 使用 `localStorage` 存储 JWT token，存在 XSS 攻击风险

**解决方案：**

```typescript
// 考虑使用 httpOnly cookie 或 sessionStorage
// 或添加 XSS 防护措施
const token = sessionStorage.getItem("access_token"); // 相对更安全
```

#### 4.2 密码复杂度要求不足

**问题描述：**

- 前后端密码验证只要求 6 位长度，缺少复杂度要求

**解决方案：**

```typescript
// 前端增强验证
{
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  message: '密码至少8位，包含大小写字母和数字'
}

// 后端DTO增强
@MinLength(8, { message: '密码长度不能少于8位' })
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: '密码必须包含大小写字母和数字'
})
password: string;
```

#### 4.3 缺少速率限制

**问题描述：**

- 登录接口和敏感操作缺少速率限制，容易遭受暴力破解

**解决方案：**

```typescript
// 安装并配置 @nestjs/throttler
npm install @nestjs/throttler

// app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
}),
```

### 5. 字段映射问题 ✅ (已修复)

**问题描述：**

- 前端表格列使用 `customerName/customerPhone`，但后端返回 `tenantName/primaryPhone`

**状态：** 已修复

---

## 📊 性能优化问题 (Medium)

### 6. 数据库查询优化

**问题描述：**

- 分页查询缺少合适的索引，大数据量时性能较差
- 搜索功能使用 `contains` 查询，性能不佳

**解决方案：**

```prisma
// schema.prisma 添加索引
model ViewingRecord {
  // 现有字段...

  @@index([viewingStatus, createdAt])
  @@index([agentId, createdAt])
  @@index([source, createdAt])
  @@fulltext([tenantName, primaryPhone, propertyName])
}
```

### 7. 前端状态管理优化

**问题描述：**

- Redux slice 中存在重复的错误处理逻辑
- 缺少统一的 loading 状态管理

**解决方案：**
创建通用的异步状态处理函数和错误边界组件。

---

## 🔧 代码质量问题 (Low)

### 8. 类型安全性

**问题描述：**

- 部分地方使用 `any` 类型，降低类型安全性

**解决方案：**

```typescript
// 替换 any 为具体类型
interface ApiKeyInfo {
  id: number;
  channelName: string;
  apiKey: string;
}

request.apiKeyInfo: ApiKeyInfo; // 而不是 any
```

### 9. 错误处理不完整

**问题描述：**

- 前端缺少全局错误边界组件
- 某些异步操作缺少错误处理

**解决方案：**

```typescript
// 创建 ErrorBoundary 组件
class ErrorBoundary extends React.Component {
  // 实现错误捕获逻辑
}

// 包装应用
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

### 10. 移动端兼容性

**问题描述：**

- 虽然有响应式设计，但某些组件在极小屏幕上可能显示异常
- 触摸事件处理不够完善

**解决方案：**

- 增加更多断点测试
- 优化触摸交互体验

---

## 🎯 用户体验问题

### 11. 加载状态优化

**问题描述：**

- 某些长时间操作缺少 loading 提示
- 用户可能不知道操作是否正在进行

**解决方案：**
增加全局 loading 组件和 skeleton 屏幕。

### 12. 表单验证体验

**问题描述：**

- 表单验证消息可能不够友好
- 缺少实时验证反馈

**解决方案：**
优化验证消息文案，增加实时验证。

---

## ✅ 修复优先级建议

### 立即修复 (今天)

1. ✅ 字段映射问题 (已修复)
2. 🔧 创建 .env 文件
3. 🔧 修复 CORS 配置

### 本周修复

4. 增强密码安全性
5. 添加速率限制
6. 优化数据库索引

### 下周修复

7. 改进错误处理
8. 优化移动端体验
9. 完善类型定义

---

## 📝 结论

整体项目架构良好，主要问题集中在：

1. **配置管理** - 需要完善环境变量配置
2. **安全性** - 需要增强认证和授权机制
3. **性能优化** - 需要优化数据库查询和前端状态管理
4. **用户体验** - 需要完善错误处理和 loading 状态

大部分问题为常见的开发疏漏，不影响核心功能，可以逐步修复完善。
