import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiKeysService } from '@/services/apiKeys';
import type { 
  ApiKey, 
  CreateApiKeyRequest, 
  UpdateApiKeyRequest, 
  ApiKeyStatistics,
  Pagination 
} from '@/types';
import { message } from 'antd';

// API密钥状态接口
interface ApiKeysState {
  apiKeys: ApiKey[];
  currentApiKey: ApiKey | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  statistics: ApiKeyStatistics | null;
}

// 初始状态
const initialState: ApiKeysState = {
  apiKeys: [],
  currentApiKey: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  statistics: null,
};

// 异步thunk: 获取API密钥列表
export const fetchApiKeysAsync = createAsyncThunk(
  'apiKeys/fetchApiKeys',
  async (params?: { page?: number; pageSize?: number }) => {
    const response = await apiKeysService.getApiKeys(params);
    return response;
  }
);

// 异步thunk: 获取单个API密钥详情
export const fetchApiKeyAsync = createAsyncThunk(
  'apiKeys/fetchApiKey',
  async (id: number) => {
    const response = await apiKeysService.getApiKey(id);
    return response;
  }
);

// 异步thunk: 创建API密钥
export const createApiKeyAsync = createAsyncThunk(
  'apiKeys/createApiKey',
  async (data: CreateApiKeyRequest) => {
    const response = await apiKeysService.createApiKey(data);
    message.success('API密钥创建成功');
    return response;
  }
);

// 异步thunk: 更新API密钥
export const updateApiKeyAsync = createAsyncThunk(
  'apiKeys/updateApiKey',
  async ({ id, data }: { id: number; data: UpdateApiKeyRequest }) => {
    const response = await apiKeysService.updateApiKey(id, data);
    message.success(response.message || 'API密钥更新成功');
    return response.data;
  }
);

// 异步thunk: 删除API密钥
export const deleteApiKeyAsync = createAsyncThunk(
  'apiKeys/deleteApiKey',
  async (id: number) => {
    const response = await apiKeysService.deleteApiKey(id);
    message.success(response.message || 'API密钥删除成功');
    return id;
  }
);

// 异步thunk: 重新生成Secret
export const regenerateSecretAsync = createAsyncThunk(
  'apiKeys/regenerateSecret',
  async (id: number) => {
    const response = await apiKeysService.regenerateSecret(id);
    message.success(response.message || 'Secret重新生成成功');
    return response.data;
  }
);

// 异步thunk: 获取统计信息
export const fetchApiKeyStatisticsAsync = createAsyncThunk(
  'apiKeys/fetchStatistics',
  async () => {
    const response = await apiKeysService.getStatistics();
    return response.data;
  }
);

// API密钥slice
const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    // 清除当前API密钥
    clearCurrentApiKey: (state) => {
      state.currentApiKey = null;
    },
    // 重置状态
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取API密钥列表
      .addCase(fetchApiKeysAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiKeysAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          const data = action.payload.data as any;
          state.apiKeys = data.apiKeys || [];
          state.pagination = data.pagination || state.pagination;
        }
      })
      .addCase(fetchApiKeysAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch API keys';
        message.error('获取API密钥列表失败');
      })

      // 获取单个API密钥详情
      .addCase(fetchApiKeyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiKeyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApiKey = action.payload || null;
      })
      .addCase(fetchApiKeyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch API key';
        message.error('获取API密钥详情失败');
      })

      // 创建API密钥
      .addCase(createApiKeyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApiKeyAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.apiKeys.unshift(action.payload);
          state.currentApiKey = action.payload;
        }
      })
      .addCase(createApiKeyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create API key';
        message.error('创建API密钥失败');
      })

      // 更新API密钥
      .addCase(updateApiKeyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApiKeyAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.apiKeys.findIndex(key => key.id === action.payload!.id);
          if (index !== -1) {
            state.apiKeys[index] = action.payload;
          }
          if (state.currentApiKey?.id === action.payload.id) {
            state.currentApiKey = action.payload;
          }
        }
      })
      .addCase(updateApiKeyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update API key';
        message.error('更新API密钥失败');
      })

      // 删除API密钥
      .addCase(deleteApiKeyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteApiKeyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.apiKeys = state.apiKeys.filter(key => key.id !== action.payload);
        if (state.currentApiKey?.id === action.payload) {
          state.currentApiKey = null;
        }
      })
      .addCase(deleteApiKeyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete API key';
        message.error('删除API密钥失败');
      })

      // 重新生成Secret
      .addCase(regenerateSecretAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(regenerateSecretAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.apiKeys.findIndex(key => key.id === action.payload!.id);
          if (index !== -1) {
            state.apiKeys[index] = action.payload;
          }
          state.currentApiKey = action.payload;
        }
      })
      .addCase(regenerateSecretAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to regenerate secret';
        message.error('重新生成Secret失败');
      })

      // 获取统计信息
      .addCase(fetchApiKeyStatisticsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchApiKeyStatisticsAsync.fulfilled, (state, action) => {
        state.statistics = action.payload || null;
      })
      .addCase(fetchApiKeyStatisticsAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch statistics';
        message.error('获取统计信息失败');
      });
  },
});

export const { clearError, clearCurrentApiKey, resetState } = apiKeysSlice.actions;
export default apiKeysSlice.reducer; 