import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  usersService, 
  CreateUserRequest, 
  UpdateUserRequest, 
  Role, 
  UserQueryParams,
  BatchUpdateRequest,
  BatchDeleteRequest
} from '@/services/users';
import type { 
  User, 
  Pagination 
} from '@/types';
import { message } from 'antd';

// 用户状态接口
interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  roles: Role[];
  rolesLoading: boolean;
  filters: {
    search?: string;
    roleId?: number;
    isActive?: boolean;
    orderBy?: string;
  };
  selectedUserIds: number[];
  batchLoading: boolean;
}

// 初始状态
const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  roles: [],
  rolesLoading: false,
  filters: {},
  selectedUserIds: [],
  batchLoading: false,
};

// 异步thunk: 获取用户列表
export const fetchUsersAsync = createAsyncThunk(
  'users/fetchUsers',
  async (params?: UserQueryParams) => {
    const response = await usersService.getUsers(params);
    return response;
  }
);

// 异步thunk: 获取单个用户详情
export const fetchUserAsync = createAsyncThunk(
  'users/fetchUser',
  async (id: number) => {
    const response = await usersService.getUser(id);
    return response.data;
  }
);

// 异步thunk: 获取用户统计信息
export const fetchUserStatisticsAsync = createAsyncThunk(
  'users/fetchUserStatistics',
  async (id: number) => {
    const response = await usersService.getUserStatistics(id);
    return response.data;
  }
);

// 异步thunk: 创建用户
export const createUserAsync = createAsyncThunk(
  'users/createUser',
  async (data: CreateUserRequest) => {
    const response = await usersService.createUser(data);
    return response.data;
  }
);

// 异步thunk: 更新用户
export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: number; data: UpdateUserRequest }) => {
    const response = await usersService.updateUser(id, data);
    return response.data;
  }
);

// 异步thunk: 批量更新用户
export const batchUpdateUsersAsync = createAsyncThunk(
  'users/batchUpdateUsers',
  async (request: BatchUpdateRequest) => {
    const response = await usersService.batchUpdateUsers(request);
    return { ...response.data, ids: request.ids };
  }
);

// 异步thunk: 重置用户密码
export const resetPasswordAsync = createAsyncThunk(
  'users/resetPassword',
  async (id: number) => {
    const response = await usersService.resetPassword(id);
    return { ...response.data, userId: id };
  }
);

// 异步thunk: 删除用户
export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (id: number) => {
    const response = await usersService.deleteUser(id);
    return id;
  }
);

// 异步thunk: 批量删除用户
export const batchDeleteUsersAsync = createAsyncThunk(
  'users/batchDeleteUsers',
  async (request: BatchDeleteRequest) => {
    const response = await usersService.batchDeleteUsers(request);
    return { ...response.data, ids: request.ids };
  }
);

// 异步thunk: 获取角色列表
export const fetchRolesAsync = createAsyncThunk(
  'users/fetchRoles',
  async () => {
    const response = await usersService.getRoles();
    return response.data || [];
  }
);

// 用户slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    // 清除当前用户
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    // 设置过滤条件
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // 清除过滤条件
    clearFilters: (state) => {
      state.filters = {};
    },
    // 设置选中的用户IDs
    setSelectedUserIds: (state, action) => {
      state.selectedUserIds = action.payload;
    },
    // 清除选中的用户IDs
    clearSelectedUserIds: (state) => {
      state.selectedUserIds = [];
    },
    // 重置状态
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取用户列表
      .addCase(fetchUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          const data = action.payload.data as any;
          state.users = data.data || [];
          state.pagination = data.pagination || state.pagination;
        }
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
        message.error('获取用户列表失败');
      })

      // 获取单个用户详情
      .addCase(fetchUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload || null;
      })
      .addCase(fetchUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
        message.error('获取用户详情失败');
      })

      // 获取用户统计信息
      .addCase(fetchUserStatisticsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStatisticsAsync.fulfilled, (state, action) => {
        state.loading = false;
        // 可以将统计信息存储到当前用户或单独的状态中
      })
      .addCase(fetchUserStatisticsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user statistics';
        message.error('获取用户统计失败');
      })

      // 创建用户
      .addCase(createUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.users.unshift(action.payload);
          state.currentUser = action.payload;
        }
        message.success('用户创建成功');
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
        message.error('创建用户失败');
      })

      // 更新用户
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.users.findIndex(user => user.id === action.payload!.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.currentUser?.id === action.payload.id) {
            state.currentUser = action.payload;
          }
        }
        message.success('用户更新成功');
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
        message.error('更新用户失败');
      })

      // 批量更新用户
      .addCase(batchUpdateUsersAsync.pending, (state) => {
        state.batchLoading = true;
        state.error = null;
      })
      .addCase(batchUpdateUsersAsync.fulfilled, (state, action) => {
        state.batchLoading = false;
        state.selectedUserIds = [];
        message.success(action.payload?.message || '批量更新成功');
      })
      .addCase(batchUpdateUsersAsync.rejected, (state, action) => {
        state.batchLoading = false;
        state.error = action.error.message || 'Failed to batch update users';
        message.error('批量更新失败');
      })

      // 重置密码
      .addCase(resetPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
        message.success(`密码重置成功，临时密码：${action.payload?.tempPassword}`);
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reset password';
        message.error('密码重置失败');
      })

      // 删除用户
      .addCase(deleteUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
        message.success('用户删除成功');
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete user';
        message.error('删除用户失败');
      })

      // 批量删除用户
      .addCase(batchDeleteUsersAsync.pending, (state) => {
        state.batchLoading = true;
        state.error = null;
      })
      .addCase(batchDeleteUsersAsync.fulfilled, (state, action) => {
        state.batchLoading = false;
        state.users = state.users.filter(user => !action.payload?.ids.includes(user.id));
        state.selectedUserIds = [];
        message.success(action.payload?.message || '批量删除成功');
      })
      .addCase(batchDeleteUsersAsync.rejected, (state, action) => {
        state.batchLoading = false;
        state.error = action.error.message || 'Failed to batch delete users';
        message.error('批量删除失败');
      })

      // 获取角色列表
      .addCase(fetchRolesAsync.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(fetchRolesAsync.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload || [];
      })
      .addCase(fetchRolesAsync.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.error.message || 'Failed to fetch roles';
        message.error('获取角色列表失败');
      });
  },
});

export const { 
  clearError, 
  clearCurrentUser, 
  setFilters, 
  clearFilters, 
  setSelectedUserIds, 
  clearSelectedUserIds, 
  resetState 
} = usersSlice.actions;
export default usersSlice.reducer; 