# 房源带看管理系统

一个功能全面的房源带看管理系统，支持多渠道数据接入、权限管理、数据导出和统计分析。

## 🚀 项目概述

本系统旨在集中管理来自多个渠道（包括人工录入、第三方 API 等）的客户带看预约记录，实现精细化的权限控制和流程管理。系统支持 PC 和移动端访问，确保经纪人可以随时随地高效处理业务。

## ✅ 当前进度

### 已完成阶段：

- ✅ **第一阶段：后端核心搭建** - 完成框架搭建、数据库设计、用户认证和基础 CRUD API
- ✅ **第二阶段：PC 端核心功能开发** - 完成前端框架、用户界面、带看记录管理功能
- ✅ **第三阶段：高级功能与 API 完善** - 完成权限控制、公共 API、管理功能、批量操作、数据导出、高级统计

### 下一阶段：

- 🔄 **第四阶段：移动端适配与测试** - 响应式优化、端到端测试、部署准备

## 📁 项目结构

```
qft-view-crm/
├── backend/                 # 后端服务 (NestJS)
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── users/          # 用户管理
│   │   ├── viewing-records/ # 带看记录管理
│   │   ├── api-keys/       # API密钥管理
│   │   ├── roles/          # 角色管理
│   │   ├── export/         # 数据导出
│   │   ├── public/         # 公共API
│   │   └── common/         # 共用模块
│   ├── prisma/             # 数据库Schema和种子数据
│   └── README.md
├── frontend/               # 前端应用 (React)
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   └── types/          # TypeScript类型定义
│   └── README.md
└── 项目设计文档.md          # 详细设计文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.18.0
- MySQL 8.0
- pnpm (推荐的包管理器)

### 后端启动

```bash
cd backend
pnpm install
cp .env.example .env  # 配置数据库连接
npx prisma db push    # 创建数据库表
npx prisma db seed    # 插入初始数据
pnpm run start:dev    # 启动开发服务器
```

### 前端启动

```bash
cd frontend
pnpm install
pnpm run dev         # 启动开发服务器
```

访问 http://localhost:5173 查看应用

### 默认测试账号

| 角色   | 用户名   | 密码     | 权限         |
| ------ | -------- | -------- | ------------ |
| 管理员 | admin    | admin123 | 全部功能     |
| 经纪人 | agent001 | agent123 | 个人记录管理 |

## 🛠 技术栈

### 后端

- **框架**: NestJS (Node.js + TypeScript)
- **数据库**: MySQL 8.0 + Prisma ORM
- **认证**: JWT + Passport.js
- **权限**: RBAC (基于角色的访问控制)
- **文档**: 自动生成的 API 文档
- **导出**: ExcelJS (Excel 导出)

### 前端

- **框架**: React 19 (TypeScript)
- **构建工具**: Vite 7
- **UI 库**: Ant Design 5.26
- **状态管理**: Redux Toolkit
- **路由**: React Router Dom 7
- **HTTP 客户端**: Axios
- **图表**: @ant-design/plots
- **日期处理**: dayjs

### 部署 (计划中)

- **容器化**: Docker
- **Web 服务器**: Nginx
- **包管理**: pnpm

## 🎯 核心功能

### ✅ 已实现功能

#### 带看记录管理

- 📝 完整的 CRUD 操作（创建、查看、编辑、删除）
- 🔍 多维度筛选和搜索
- 📊 列表展示和详情查看
- 🔄 批量状态更新
- 📋 状态流转管理

#### 用户权限管理

- 👥 基于角色的访问控制(RBAC)
- 🔐 JWT 令牌认证
- 👤 用户管理（仅管理员）
- 🛡️ 接口级权限控制

#### 多渠道数据接入

- 🔌 RESTful API 接口
- 🔑 API 密钥管理
- 📱 第三方系统集成
- ✋ 手工录入支持

#### 数据导出与报表

- 📊 Excel/PDF 格式导出
- 📈 高级统计分析
- 📉 图表可视化
- 📅 趋势分析

#### 系统管理

- ⚙️ 系统配置管理
- 📊 使用统计监控
- 🗝️ API 密钥管理
- 👥 用户角色管理

### 🔄 开发中功能

- 📱 移动端界面优化
- 🧪 端到端测试
- 🚀 部署配置

## 📚 文档

- [项目设计文档](./项目设计文档.md) - 详细的系统设计说明
- [后端 API 文档](./backend/README.md) - 后端服务接口说明
- [前端开发指南](./frontend/README.md) - 前端开发说明

## 🎯 里程碑

- [x] **2024-07** 第一阶段：后端核心搭建 ✅
- [x] **2024-07** 第二阶段：PC 端核心功能开发 ✅
- [x] **2024-07** 第三阶段：高级功能与 API 完善 ✅
- [ ] **2024-07** 第四阶段：移动端适配与测试 🔄

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
