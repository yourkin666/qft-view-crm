module.exports = {
    apps: [
        {
            name: 'qft-crm-backend',
            script: './dist/src/main.js',
            cwd: '/root/qft-view-crm/backend',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                JWT_SECRET: 'qft-view-crm-super-secret-jwt-key-for-development-environment-2024',
                JWT_EXPIRES_IN: '604800',
                DATABASE_URL: 'file:/root/qft-view-crm/backend/dev.db'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001,
                JWT_SECRET: 'qft-view-crm-super-secret-jwt-key-for-development-environment-2024',
                JWT_EXPIRES_IN: '604800',
                DATABASE_URL: 'file:/root/qft-view-crm/backend/dev.db'
            },
            // 优化日志配置
            log_file: './logs/qft-crm-backend.log',
            out_file: './logs/qft-crm-backend-out.log',
            error_file: './logs/qft-crm-backend-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            
            // 优化重启策略
            watch: false,
            max_memory_restart: '1G',
            restart_delay: 5000,  // 增加重启延迟到5秒
            max_restarts: 5,      // 减少最大重启次数
            min_uptime: '30s',    // 增加最小运行时间到30秒
            
            // 添加端口冲突处理
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
            
            // 错误处理
            autorestart: true,
            crash_restart: true,
            ignore_watch: ["node_modules", "logs", "*.log"],
            
            // 添加预启动脚本清理端口（如果需要）
            post_update: ["npm run build"]
        },
        {
            name: 'qft-crm-frontend',
            script: 'npm',
            args: 'run preview',
            cwd: '/root/qft-view-crm/frontend',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 4173
            },
            
            // 优化日志配置  
            log_file: './logs/qft-crm-frontend.log',
            out_file: './logs/qft-crm-frontend-out.log',
            error_file: './logs/qft-crm-frontend-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            
            // 优化重启策略
            watch: false,
            max_memory_restart: '512M',
            restart_delay: 3000,
            max_restarts: 3,
            min_uptime: '20s',
            
            // 添加端口冲突处理
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 8000,
            
            // 错误处理
            autorestart: true,
            crash_restart: true,
            ignore_watch: ["node_modules", "logs", "*.log"]
        }
    ]
}; 