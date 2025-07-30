# 🛠️ 服务管理脚本

这个目录包含了一套完整的脚本来解决端口冲突问题并管理前后端服务。

## 📁 脚本说明

### `cleanup-ports.sh` - 端口清理脚本
- **功能**: 一劳永逸地清理所有端口冲突
- **清理内容**:
  - 停止所有PM2进程
  - 清理3001, 4173, 5173端口
  - 清理遗留的Node.js进程
  - 清理nest和vite进程
- **使用**: `./script/cleanup-ports.sh` 或 `npm run cleanup`

### `start-services.sh` - 智能启动脚本  
- **功能**: 自动解决端口冲突并启动服务
- **流程**:
  1. 自动清理端口冲突
  2. 检查和构建必要文件
  3. 启动PM2服务
  4. 健康检查
- **使用**: `./script/start-services.sh` 或 `npm start`

## 🚀 快速使用

### 推荐的npm命令方式:

```bash
# 启动服务（推荐）
npm start

# 停止所有服务  
npm run stop

# 重启服务
npm restart

# 查看服务状态
npm run status

# 查看服务日志
npm run logs

# 清理端口冲突
npm run cleanup
```

### 直接使用脚本:

```bash
# 给脚本执行权限（首次使用）
chmod +x script/*.sh

# 清理端口冲突
./script/cleanup-ports.sh

# 启动服务
./script/start-services.sh
```

### PM2管理命令:

```bash
# PM2基础命令
npm run pm2:start    # 启动PM2服务
npm run pm2:stop     # 停止PM2服务  
npm run pm2:restart  # 重启PM2服务
npm run pm2:delete   # 删除PM2服务

# 或直接使用PM2
pm2 status           # 查看状态
pm2 logs            # 查看日志
pm2 restart all     # 重启所有
```

## 🔧 解决的问题

1. **端口冲突**: 自动检测和清理端口占用
2. **进程残留**: 清理所有相关的Node.js进程
3. **重复启动**: 防止重复启动造成的冲突
4. **服务依赖**: 自动检查和构建必要文件
5. **健康检查**: 启动后自动验证服务状态

## 📍 服务端口

- **后端API**: http://localhost:3001
- **前端页面**: http://localhost:4173  
- **开发模式前端**: http://localhost:5173 (仅在dev模式)

## ⚠️ 注意事项

1. 脚本会强制杀死占用相关端口的进程，请确保没有其他重要应用使用这些端口
2. 首次使用需要给脚本执行权限: `chmod +x script/*.sh`
3. 如果遇到权限问题，可能需要使用sudo运行
4. 建议使用npm命令而不是直接运行脚本，更安全可靠

## 🐛 故障排除

### 如果服务启动失败:
1. 运行 `npm run cleanup` 清理所有进程
2. 检查日志: `npm run logs`
3. 手动构建: `npm run build:all`
4. 重新启动: `npm start`

### 如果端口仍被占用:
1. 检查端口: `lsof -i :3001` 或 `lsof -i :4173`
2. 手动杀死进程: `kill -9 <PID>`
3. 运行清理脚本: `npm run cleanup` 