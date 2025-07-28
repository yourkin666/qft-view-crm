import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ViewingRecord,
  CreateViewingRecordRequest,
  QueryViewingRecordsParams,
  PaginatedResponse,
  Statistics,
  BatchUpdateRequest,
} from '../../types';
import viewingRecordsService from '../../services/viewingRecords';

interface ViewingRecordsState {
  records: ViewingRecord[];
  currentRecord: ViewingRecord | null;
  statistics: Statistics | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  batchOperationLoading: boolean;
  error: string | null;
  filters: QueryViewingRecordsParams;
}

const initialState: ViewingRecordsState = {
  records: [],
  currentRecord: null,
  statistics: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  batchOperationLoading: false,
  error: null,
  filters: {
    page: 1,
    pageSize: 10,
  },
};

// 获取带看记录列表
export const fetchViewingRecordsAsync = createAsyncThunk(
  'viewingRecords/fetchRecords',
  async (params: QueryViewingRecordsParams = {}, { rejectWithValue }) => {
    try {
      return await viewingRecordsService.getViewingRecords(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '获取记录失败');
    }
  }
);

// 获取单个记录详情
export const fetchViewingRecordAsync = createAsyncThunk(
  'viewingRecords/fetchRecord',
  async (id: number, { rejectWithValue }) => {
    try {
      return await viewingRecordsService.getViewingRecord(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '获取记录详情失败');
    }
  }
);

// 创建新记录
export const createViewingRecordAsync = createAsyncThunk(
  'viewingRecords/createRecord',
  async (data: CreateViewingRecordRequest, { rejectWithValue }) => {
    try {
      return await viewingRecordsService.createViewingRecord(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '创建记录失败');
    }
  }
);

// 更新记录
export const updateViewingRecordAsync = createAsyncThunk(
  'viewingRecords/updateRecord',
  async ({ id, data }: { id: number; data: Partial<CreateViewingRecordRequest> }, { rejectWithValue }) => {
    try {
      return await viewingRecordsService.updateViewingRecord(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '更新记录失败');
    }
  }
);

// 删除记录
export const deleteViewingRecordAsync = createAsyncThunk(
  'viewingRecords/deleteRecord',
  async (id: number, { rejectWithValue }) => {
    try {
      await viewingRecordsService.deleteViewingRecord(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '删除记录失败');
    }
  }
);

// 获取统计数据
export const fetchStatisticsAsync = createAsyncThunk(
  'viewingRecords/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      return await viewingRecordsService.getStatistics();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '获取统计数据失败');
    }
  }
);

// 批量更新记录
export const batchUpdateViewingRecordsAsync = createAsyncThunk(
  'viewingRecords/batchUpdate',
  async (data: BatchUpdateRequest, { rejectWithValue }) => {
    try {
      return await viewingRecordsService.batchUpdateViewingRecords(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '批量更新失败');
    }
  }
);

const viewingRecordsSlice = createSlice({
  name: 'viewingRecords',
  initialState,
  reducers: {
    // 设置筛选条件
    setFilters: (state, action: PayloadAction<QueryViewingRecordsParams>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // 清除错误信息
    clearError: (state) => {
      state.error = null;
    },
    // 清除当前记录
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
    // 重置状态
    resetState: (state) => {
      state.records = [];
      state.currentRecord = null;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取记录列表
      .addCase(fetchViewingRecordsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchViewingRecordsAsync.fulfilled, (state, action: PayloadAction<PaginatedResponse<ViewingRecord>>) => {
        state.loading = false;
        state.records = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchViewingRecordsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 获取记录详情
      .addCase(fetchViewingRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchViewingRecordAsync.fulfilled, (state, action: PayloadAction<ViewingRecord>) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchViewingRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 创建记录
      .addCase(createViewingRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createViewingRecordAsync.fulfilled, (state, action: PayloadAction<ViewingRecord>) => {
        state.loading = false;
        state.records.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createViewingRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 更新记录
      .addCase(updateViewingRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateViewingRecordAsync.fulfilled, (state, action: PayloadAction<ViewingRecord>) => {
        state.loading = false;
        const index = state.records.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.currentRecord?.id === action.payload.id) {
          state.currentRecord = action.payload;
        }
      })
      .addCase(updateViewingRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 删除记录
      .addCase(deleteViewingRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteViewingRecordAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.records = state.records.filter(record => record.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentRecord?.id === action.payload) {
          state.currentRecord = null;
        }
      })
      .addCase(deleteViewingRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 获取统计数据
      .addCase(fetchStatisticsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStatisticsAsync.fulfilled, (state, action: PayloadAction<Statistics>) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatisticsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 批量更新记录
      .addCase(batchUpdateViewingRecordsAsync.pending, (state) => {
        state.batchOperationLoading = true;
        state.error = null;
      })
      .addCase(batchUpdateViewingRecordsAsync.fulfilled, (state) => {
        state.batchOperationLoading = false;
        // 批量操作成功后，可以选择刷新列表数据
      })
      .addCase(batchUpdateViewingRecordsAsync.rejected, (state, action) => {
        state.batchOperationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, clearCurrentRecord, resetState } = viewingRecordsSlice.actions;
export default viewingRecordsSlice.reducer; 