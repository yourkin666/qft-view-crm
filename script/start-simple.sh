#!/bin/bash

# =============================================================================
# QFT VIEW CRM 简化启动脚本
# =============================================================================
# 快速启动已配置好的QFT CRM系统
# =============================================================================

echo "🏠 启动 QFT VIEW CRM 系统..."

# 进入项目目录
cd /root/qft-view-crm

# 检查端口占用
check_ports() {
    log_info "检查端口占用情况..."
    
    # 检查3001端口（后端API）
    if lsof -i :3001 >/dev/null 2>&1; then
        log_warning "端口 3001 已被占用，将尝试停止相关进程"
        lsof -ti :3001 | xargs -r kill -9
    fi
    
    # 检查4173端口（前端预览）
    if lsof -i :4173 >/dev/null 2>&1; then
        log_warning "端口 4173 已被占用，将尝试停止相关进程"
        lsof -ti :4173 | xargs -r kill -9
    fi
    
    # 检查8080端口（Nginx）
    if lsof -i :8080 >/dev/null 2>&1; then
        log_warning "端口 8080 已被占用"
    fi
    
    log_success "端口检查完成"
}

# 启动PM2服务
echo "启动后端和前端服务..."
pm2 start ecosystem.config.js

# 启动Nginx
echo "启动Nginx服务..."
systemctl start nginx

# 等待服务启动
sleep 3

# 显示服务状态
echo ""
echo "📊 服务状态:"
pm2 list

echo ""
echo "🔌 端口状态:"
netstat -tulpn | grep -E "(3001|4173|8080)"

echo ""
echo "✅ 系统启动完成！"
echo "📱 访问地址: http://$(hostname -I | awk '{print $1}'):8080"
echo "📝 查看日志: pm2 logs" 