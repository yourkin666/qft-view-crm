import api from './api';
import type { 
  ApiKey, 
  CreateApiKeyRequest, 
  UpdateApiKeyRequest, 
  ApiKeyStatistics,
  PaginatedResponse, 
  ApiResponse 
} from '@/types';

export const apiKeysService = {
  // 获取API密钥列表
  async getApiKeys(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<ApiKey>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    
    const response = await api.get<PaginatedResponse<ApiKey>>(
      `/api-keys?${queryParams.toString()}`
    );
    return response.data;
  },

  // 获取单个API密钥详情
  async getApiKey(id: number): Promise<ApiKey> {
    const response = await api.get<ApiResponse<ApiKey>>(`/api-keys/${id}`);
    if (!response.data.data) {
      throw new Error('API密钥详情响应数据无效');
    }
    return response.data.data;
  },

  // 创建API密钥
  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await api.post<ApiResponse<ApiKey>>('/api-keys', data);
    if (!response.data.data) {
      throw new Error('创建API密钥响应数据无效');
    }
    return response.data.data;
  },

  // 更新API密钥
  async updateApiKey(id: number, data: UpdateApiKeyRequest): Promise<ApiResponse<ApiKey>> {
    const response = await api.patch<ApiResponse<ApiKey>>(`/api-keys/${id}`, data);
    return response.data;
  },

  // 删除API密钥
  async deleteApiKey(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api-keys/${id}`);
    return response.data;
  },

  // 重新生成API Secret
  async regenerateSecret(id: number): Promise<ApiResponse<ApiKey>> {
    const response = await api.post<ApiResponse<ApiKey>>(`/api-keys/${id}/regenerate-secret`);
    return response.data;
  },

  // 获取API密钥统计信息
  async getStatistics(): Promise<ApiResponse<ApiKeyStatistics>> {
    const response = await api.get<ApiResponse<ApiKeyStatistics>>('/api-keys/statistics');
    return response.data;
  },
}; 