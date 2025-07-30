import api from './api';
import type { 
  ViewingRecord, 
  CreateViewingRecordRequest, 
  QueryViewingRecordsParams, 
  PaginatedResponse, 
  ApiResponse,
  Statistics,
  BatchUpdateRequest
} from '../types';

class ViewingRecordsService {
  // 获取线索记录列表
  async getViewingRecords(params: QueryViewingRecordsParams): Promise<PaginatedResponse<ViewingRecord>> {
    // 确保数字参数被正确转换
    const processedParams = {
      ...params,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 10,
      agentId: params.agentId ? Number(params.agentId) : undefined,
    };
    
    const response = await api.get<ApiResponse<PaginatedResponse<ViewingRecord>>>('/viewing-records', {
      params: processedParams
    });
    return response.data.data!;
  }

  // 获取单个线索记录
  async getViewingRecord(id: number): Promise<ViewingRecord> {
    const response = await api.get<ApiResponse<ViewingRecord>>(`/viewing-records/${id}`);
    return response.data.data!;
  }

  // 创建线索记录
  async createViewingRecord(data: CreateViewingRecordRequest): Promise<ViewingRecord> {
    const response = await api.post<ApiResponse<ViewingRecord>>('/viewing-records', data);
    return response.data.data!;
  }

  // 更新线索记录
  async updateViewingRecord(id: number, data: Partial<CreateViewingRecordRequest>): Promise<ViewingRecord> {
    const response = await api.patch<ApiResponse<ViewingRecord>>(`/viewing-records/${id}`, data);
    return response.data.data!;
  }

  // 删除线索记录
  async deleteViewingRecord(id: number): Promise<void> {
    await api.delete(`/viewing-records/${id}`);
  }

  // 获取统计数据
  async getStatistics(): Promise<Statistics> {
    const response = await api.get<ApiResponse<Statistics>>('/viewing-records/statistics');
    return response.data.data!;
  }

  // 批量更新记录
  async batchUpdateViewingRecords(data: BatchUpdateRequest): Promise<{ updated: number }> {
    const response = await api.patch<ApiResponse<{ updated: number }>>('/viewing-records/batch-update', data);
    return response.data.data!;
  }
}

export default new ViewingRecordsService(); 