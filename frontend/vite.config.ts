import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React核心库
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Redux相关
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux';
          }
          
          // 路由
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // Ant Design按组件分组
          if (id.includes('antd/es/')) {
            // 基础组件
            if (id.includes('/button/') || id.includes('/input/') || id.includes('/select/') || 
                id.includes('/form/') || id.includes('/card/') || id.includes('/space/')) {
              return 'antd-basic';
            }
            // 表格和列表
            if (id.includes('/table/') || id.includes('/list/')) {
              return 'antd-table';
            }
            // 反馈组件
            if (id.includes('/modal/') || id.includes('/message/') || id.includes('/notification/') ||
                id.includes('/popconfirm/') || id.includes('/drawer/')) {
              return 'antd-feedback';
            }
            // 布局组件
            if (id.includes('/layout/') || id.includes('/grid/') || id.includes('/row/') || 
                id.includes('/col/') || id.includes('/affix/')) {
              return 'antd-layout';
            }
            // 其他antd组件
            return 'antd-others';
          }
          
          // Ant Design图标
          if (id.includes('@ant-design/icons')) {
            return 'antd-icons';
          }
          
          // 图表库
          if (id.includes('@ant-design/plots')) {
            return 'charts';
          }
          
          // 工具库
          if (id.includes('axios') || id.includes('dayjs')) {
            return 'utils';
          }
          
          // node_modules中的其他库
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          let extType = info[info.length - 1]
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name || '')) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name || '')) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name || '')) {
            extType = 'fonts'
          }
          return `${extType}/[name]-[hash][extname]`
        },
      },
    },
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/plots',
      'dayjs',
      'axios',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.platform': '"browser"',
    'process.version': '"v18.0.0"',
  },
})
