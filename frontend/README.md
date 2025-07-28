# 房源带看管理系统 - 前端应用

基于 React + TypeScript + Ant Design 的现代化前端应用。

## 🔧 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Ant Design 5.26
- **状态管理**: Redux Toolkit
- **路由管理**: React Router Dom 7
- **HTTP 客户端**: Axios
- **日期处理**: dayjs
- **图标**: Ant Design Icons

## 🏗️ 项目结构

```
src/
├── components/          # 公共组件
│   ├── AuthGuard.tsx   # 路由认证守卫
│   └── Layout.tsx      # 主布局组件
├── pages/              # 页面组件
│   ├── Login.tsx       # 登录页面
│   ├── Dashboard.tsx   # 工作台
│   ├── ViewingRecords.tsx        # 带看记录列表
│   └── ViewingRecordDetail.tsx   # 记录详情页
├── store/              # Redux状态管理
│   ├── index.ts        # Store配置
│   └── slices/         # Redux切片
│       ├── authSlice.ts           # 认证状态
│       └── viewingRecordsSlice.ts # 记录状态
├── services/           # API服务
│   ├── api.ts          # HTTP客户端配置
│   ├── auth.ts         # 认证API
│   └── viewingRecords.ts # 记录管理API
├── types/              # TypeScript类型定义
│   └── index.ts        # 全局类型
├── hooks/              # 自定义Hook
│   └── redux.ts        # Redux Hook封装
├── utils/              # 工具函数
├── App.tsx             # 应用根组件
├── App.css             # 全局样式
└── main.tsx            # 应用入口
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

## 🎨 主要功能

### 🔐 用户认证

- **登录页面**: 美观的登录界面，支持表单验证
- **自动认证**: Token 自动管理和刷新
- **权限守卫**: 路由级别的权限控制
- **角色管理**: 管理员和经纪人角色区分

### 📊 工作台

- **统计概览**: 实时显示各状态记录统计
- **快捷操作**: 常用功能快速入口
- **最近记录**: 显示最新的带看记录
- **响应式布局**: 完美适配各种屏幕尺寸

### 📋 记录管理

- **列表展示**: 分页表格展示所有记录
- **高级筛选**: 多维度筛选和关键词搜索
- **CRUD 操作**: 完整的创建、编辑、查看、删除功能
- **状态管理**: 实时更新记录状态
- **权限控制**: 基于用户角色的操作权限

### 📱 响应式设计

- **移动端适配**: 完美支持手机和平板访问
- **自适应布局**: 根据屏幕大小自动调整
- **触摸友好**: 优化移动端交互体验

## 🔧 配置说明

### API 代理配置

项目通过 Vite 代理配置将 API 请求转发到后端：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 路径别名

配置了`@`别名指向`src`目录：

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(process.cwd(), 'src'),
  },
}
```

## 📦 主要依赖说明

### 核心依赖

- `react` & `react-dom`: React 框架
- `typescript`: TypeScript 支持
- `antd`: UI 组件库
- `@reduxjs/toolkit`: 现代 Redux 状态管理
- `react-router-dom`: 路由管理
- `axios`: HTTP 客户端

### 开发依赖

- `vite`: 构建工具
- `@vitejs/plugin-react`: React 支持
- `eslint`: 代码检查
- `@types/*`: TypeScript 类型定义

## 🎯 开发规范

### 文件命名

- 组件文件使用 PascalCase: `MyComponent.tsx`
- 工具文件使用 camelCase: `apiUtils.ts`
- 类型文件使用 index.ts 导出

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置规则
- 使用 Prettier 格式化代码

### 状态管理

- 使用 Redux Toolkit 进行状态管理
- 异步操作使用 createAsyncThunk
- 类型安全的 Hook 调用

### API 调用

- 统一的错误处理
- 自动 Token 管理
- 请求/响应拦截器

## 🐛 常见问题

### 1. 开发服务器无法启动

- 检查 Node.js 版本 (推荐 16.17+)
- 确保端口 3000 未被占用
- 重新安装依赖: `rm -rf node_modules && pnpm install`

### 2. API 请求失败

- 确保后端服务在 3001 端口运行
- 检查网络连接和 CORS 配置
- 查看浏览器开发者工具 Network 面板

### 3. TypeScript 错误

- 运行类型检查: `npm run type-check`
- 确保所有依赖类型定义完整
- 检查 tsconfig.json 配置

## 📖 相关文档

- [React 官方文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)
- [Redux Toolkit 文档](https://redux-toolkit.js.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 构建工具](https://vitejs.dev/)

---

> 本项目采用现代化前端技术栈，提供优秀的开发体验和用户体验！
