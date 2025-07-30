#!/bin/bash

# 智能启动脚本 - 自动解决端口冲突并启动服务
# 使用方法: ./script/start-services.sh

echo "🚀 智能启动房源带看CRM系统..."

# 获取脚本所在目录的上级目录作为项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. 首先清理端口
echo "🧹 步骤1: 清理端口冲突..."
chmod +x script/cleanup-ports.sh
./script/cleanup-ports.sh

# 2. 检查必要文件
echo "🔍 步骤2: 检查项目文件..."

if [ ! -f "ecosystem.config.js" ]; then
    echo "❌ 找不到 ecosystem.config.js 文件"
    exit 1
fi

if [ ! -d "backend/dist" ]; then
    echo "⚠️  后端未构建，正在构建..."
    cd backend && npm run build && cd ..
    echo "✅ 后端构建完成"
fi

if [ ! -d "frontend/dist" ]; then
    echo "⚠️  前端未构建，正在构建..."
    cd frontend && npm run build && cd ..
    echo "✅ 前端构建完成"
fi

# 3. 启动服务
echo "🚀 步骤3: 启动服务..."

# 启动PM2服务
pm2 start ecosystem.config.js

# 4. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 8

# 5. 检查服务状态
echo "🔍 步骤4: 检查服务状态..."
pm2 status

# 6. 健康检查
echo "🏥 步骤5: 服务健康检查..."

# 检查后端
echo "检查后端 (http://localhost:3001)..."
if curl -s http://localhost:3001 >/dev/null; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务异常"
fi

# 检查前端
echo "检查前端 (http://localhost:4173)..."
if curl -s http://localhost:4173 >/dev/null; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
fi

echo ""
echo "🎉 启动完成！"
echo "📱 前端访问地址: http://localhost:4173"
echo "🔗 后端API地址: http://localhost:3001"
echo ""
echo "💡 常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs"
echo "  重启服务: pm2 restart all"
echo "  停止服务: pm2 stop all"
echo "  完全清理: ./script/cleanup-ports.sh" 