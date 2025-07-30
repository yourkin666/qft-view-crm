#!/bin/bash

# =============================================================================
# QFT VIEW CRM 停止脚本
# =============================================================================
# 停止所有QFT CRM相关服务
# =============================================================================

echo "🛑 停止 QFT VIEW CRM 系统..."

# 停止PM2服务
echo "停止PM2服务..."
pm2 stop qft-crm-backend qft-crm-frontend 2>/dev/null || true

# 停止Nginx
echo "停止Nginx服务..."
systemctl stop nginx 2>/dev/null || true

# 清理可能的端口占用
echo "清理端口占用..."
lsof -ti :3001 2>/dev/null | xargs -r kill -9
lsof -ti :4173 2>/dev/null | xargs -r kill -9
lsof -ti :5173 2>/dev/null | xargs -r kill -9

# 显示最终状态
echo ""
echo "📊 PM2状态:"
pm2 list

echo ""
echo "🔌 端口状态:"
netstat -tulpn | grep -E "(3001|4173|8080)" || echo "所有相关端口已释放"

echo ""
echo "✅ 系统已停止！" 