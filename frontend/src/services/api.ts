import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // 处理BadRequestException - 显示具体的错误信息
          const badRequestMessage = data?.message || '请求参数错误';
          message.error(badRequestMessage);
          break;

        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          message.error('登录已过期，请重新登录');
          break;

        case 403:
          message.error('权限不足');
          break;

        case 404:
          message.error('请求的资源不存在');
          break;

        case 409:
          // 处理ConflictException - 显示具体的冲突信息
          const conflictMessage = data?.message || '数据冲突';
          message.error(conflictMessage);
          break;

        case 422:
          // 处理UnprocessableEntityException - 数据验证错误
          if (data?.message && Array.isArray(data.message)) {
            // 如果是数组，显示第一个错误
            message.error(data.message[0]);
          } else {
            const validationMessage = data?.message || '数据验证失败';
            message.error(validationMessage);
          }
          break;

        case 500:
          const serverErrorMessage = data?.message || '服务器内部错误';
          message.error(serverErrorMessage);
          break;

        default:
          // 优先显示后端返回的具体错误信息
          const errorMessage = data?.message || data?.error?.message || '请求失败';
          message.error(errorMessage);
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络设置');
    } else {
      message.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default api; 