#!/bin/bash

# 端口清理脚本 - 一劳永逸解决端口冲突
# 使用方法: ./script/cleanup-ports.sh

echo "🧹 开始清理端口冲突..."

# 定义要清理的端口
PORTS=(3001 4173 5173)

# 1. 停止PM2管理的进程
echo "📦 停止PM2进程..."
pm2 delete all 2>/dev/null || echo "PM2进程已停止"

# 2. 清理指定端口的进程
for PORT in "${PORTS[@]}"; do
    echo "🔍 检查端口 $PORT..."
    PIDS=$(lsof -ti :$PORT 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        echo "🚫 发现端口 $PORT 被占用，正在清理..."
        echo "$PIDS" | xargs kill -9 2>/dev/null
        echo "✅ 端口 $PORT 已清理"
    else
        echo "✅ 端口 $PORT 空闲"
    fi
done

# 3. 清理所有相关的Node.js进程
echo "🔍 清理遗留的Node.js进程..."

# 清理nest开发进程
pkill -f "nest start" 2>/dev/null && echo "✅ 清理了nest开发进程"

# 清理vite进程
pkill -f "vite" 2>/dev/null && echo "✅ 清理了vite进程"

# 清理后端main.js进程
pkill -f "dist/src/main.js" 2>/dev/null && echo "✅ 清理了后端main.js进程"

# 清理npm进程（小心处理，只清理项目相关的）
ps aux | grep "npm run" | grep -E "(dev|start:dev|preview)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null && echo "✅ 清理了npm进程"

# 强制清理剩余的端口占用进程
for PORT in "${PORTS[@]}"; do
    REMAINING_PIDS=$(lsof -ti :$PORT 2>/dev/null)
    if [ ! -z "$REMAINING_PIDS" ]; then
        echo "🔨 强制清理端口 $PORT 的剩余进程..."
        echo "$REMAINING_PIDS" | xargs kill -9 2>/dev/null
    fi
done

# 4. 等待端口完全释放
echo "⏳ 等待端口释放..."
sleep 3

# 5. 最终检查
echo "🔍 最终端口检查:"
for PORT in "${PORTS[@]}"; do
    if lsof -ti :$PORT >/dev/null 2>&1; then
        echo "❌ 端口 $PORT 仍被占用"
    else
        echo "✅ 端口 $PORT 已释放"
    fi
done

echo "🎉 端口清理完成！" 