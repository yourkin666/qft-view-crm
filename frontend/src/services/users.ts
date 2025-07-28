import api from './api';
import type { 
  User, 
  PaginatedResponse, 
  ApiResponse 
} from '@/types';

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId: number;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: number;
  isActive?: boolean;
  orderBy?: string;
}

export interface UserStatistics {
  viewingRecordsCount: number;
  apiKeysCount: number;
}

export interface BatchUpdateRequest {
  ids: number[];
  data: Partial<UpdateUserRequest>;
}

export interface BatchDeleteRequest {
  ids: number[];
}

export interface ResetPasswordResponse {
  message: string;
  tempPassword: string;
}

export const usersService = {
  // 获取用户列表
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.roleId) queryParams.append('roleId', params.roleId.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.orderBy) queryParams.append('orderBy', params.orderBy);
    
    const response = await api.get<PaginatedResponse<User>>(
      `/users?${queryParams.toString()}`
    );
    return response.data;
  },

  // 获取单个用户详情
  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // 获取用户统计信息
  async getUserStatistics(id: number): Promise<ApiResponse<UserStatistics>> {
    const response = await api.get<ApiResponse<UserStatistics>>(`/users/${id}/statistics`);
    return response.data;
  },

  // 创建用户
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  // 更新用户
  async updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  // 批量更新用户
  async batchUpdateUsers(request: BatchUpdateRequest): Promise<ApiResponse<{ message: string; updatedCount: number }>> {
    const response = await api.post<ApiResponse<{ message: string; updatedCount: number }>>('/users/batch-update', request);
    return response.data;
  },

  // 重置用户密码
  async resetPassword(id: number): Promise<ApiResponse<ResetPasswordResponse>> {
    const response = await api.post<ApiResponse<ResetPasswordResponse>>(`/users/${id}/reset-password`);
    return response.data;
  },

  // 删除用户
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },

  // 批量删除用户
  async batchDeleteUsers(request: BatchDeleteRequest): Promise<ApiResponse<{ message: string; deletedCount: number }>> {
    const response = await api.delete<ApiResponse<{ message: string; deletedCount: number }>>('/users/batch', {
      data: request
    });
    return response.data;
  },

  // 获取角色列表
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data;
  },
}; 