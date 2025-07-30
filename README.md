# 房源带看CRM系统

一个现代化的房源带看管理系统，支持多渠道数据录入、权限管理和数据分析。

## 🎯 系统作用

专为房地产中介业务设计的CRM系统，解决以下核心问题：

- **📝 线索记录管理** - 统一管理客户看房预约，跟踪预约状态和进展
- **🔌 多渠道接入** - 支持人工录入、第三方API、微信小程序等多种数据来源  
- **👥 权限分级** - 管理员全局管理，经纪人只能查看自己的记录
- **📊 数据分析** - 实时统计、图表展示、Excel导出，支持业绩分析
- **🔐 安全可靠** - JWT认证、API密钥管理、数据权限隔离

## 🚀 快速开始

### 🔥 智能启动（推荐）
```bash
npm run install:all    # 安装所有依赖
npm start              # 智能启动，自动解决端口冲突
```

**新增命令**：
```bash
npm start              # 一键启动前后端（生产模式）
npm run stop           # 停止所有服务
npm restart            # 重启服务
npm run status         # 查看服务状态  
npm run logs           # 查看服务日志
npm run cleanup        # 清理端口冲突
```

### 开发模式
```bash
npm run dev            # 启动开发环境（前端5173，后端3001）
```

### 🛠️ 解决端口冲突
如果遇到"端口被占用"等问题：
```bash
npm run cleanup        # 一劳永逸清理端口冲突
npm start              # 重新启动
```

### 📍 访问地址
- **生产模式**: http://localhost:4173
- **开发模式**: http://localhost:5173
- **后端API**: http://localhost:3001

### 默认账号
- **管理员**: `admin` / `admin123` (全部权限)
- **经纪人**: `agent001` / `agent123` (个人记录)

## 📱 第三方API集成

系统提供完整的REST API供第三方系统接入：

```bash
# API文档地址
http://localhost:3001/api/docs

# 主要接口
POST /api/public/viewing-records     # 创建线索记录
GET  /api/public/viewing-records     # 获取记录列表  
GET  /api/public/viewing-records/:id # 获取记录详情
PATCH /api/public/viewing-records/:id/status # 更新状态
```

需要申请API密钥进行认证，支持多渠道隔离管理。

## 🛠 技术架构

**后端**: NestJS + Prisma + SQLite + JWT认证  
**前端**: React 19 + Ant Design + Redux Toolkit + Vite  
**特性**: 响应式设计、实时数据、批量操作、数据导出

## 📊 核心功能

- ✅ 线索记录全生命周期管理
- ✅ 多渠道数据统一录入  
- ✅ 基于角色的权限控制
- ✅ 实时统计和可视化图表
- ✅ Excel/PDF数据导出
- ✅ API密钥和渠道管理
- ✅ 移动端响应式适配

适用于房产中介公司、经纪人团队的日常业务管理和数据分析需求。