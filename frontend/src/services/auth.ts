import api from './api';
import type { LoginRequest, LoginResponse, User, ApiResponse } from '../types';

class AuthService {
  // 用户登录
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (!response.data.data) {
      throw new Error('登录响应数据无效');
    }
    return response.data.data;
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (!response.data.data) {
      throw new Error('用户信息响应数据无效');
    }
    return response.data.data;
  }

  // 用户登出
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  // 保存登录状态到本地存储
  saveAuthData(authData: LoginResponse): void {
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  // 清除登录状态
  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // 获取本地存储的用户信息
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 获取本地存储的token
  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export default new AuthService(); 