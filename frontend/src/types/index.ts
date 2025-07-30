// 用户相关类型
export interface User {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    role: {
      id: number;
      name: string;
      description?: string;
    };
  };
}

// 新增：平台枚举类型
export type SourcePlatform = '企业微信' | '个人微信' | '小红书' | '闲鱼' | '抖音' | '视频号' | '贝壳' | '58同城';
export type CustomerRoomType = '单间' | '两房' | '三房';
export type CustomerStatus = '接洽中' | '已约带看' | '客户丢失';
export type LeadViewingStatus = '一次带看' | '二次带看' | '三次带看';

// 线索记录相关类型
export interface ViewingRecord {
  id: number;
  tenantName?: string;
  sessionId?: string;
  requirementsJson?: string;
  originalQuery?: string;
  aiSummary?: string;
  primaryPhone?: string;
  primaryWechat?: string;
  housingId?: number;
  roomId?: number;
  businessType?: 'rent' | 'sale';
  propertyName?: string;
  roomAddress?: string;
  preferredViewingTime?: string;
  viewingDate?: string;
  viewingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  agentId?: number;
  agentName?: string;
  agentPhone?: string;
  source: string;
  channel?: string;
  channelType?: 'API' | 'MANUAL';
  remarks?: string;
  
  // 新增字段 - 基础信息
  sourcePlatform?: SourcePlatform;
  customerRoomType?: CustomerRoomType;
  sourcePropertyPrice?: number;
  followUpPlatform?: SourcePlatform;
  customerStatus?: CustomerStatus;
  
  // 新增字段 - 带看信息
  leadViewingStatus?: LeadViewingStatus;
  viewingProperties?: string;
  customerFeedback?: string;
  
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: number;
    username: string;
    fullName: string;
    phone?: string;
  };
  property?: {
    id: number;
    name: string;
    address?: string;
  };
}

export interface CreateViewingRecordRequest {
  tenantName?: string;
  sessionId?: string;
  requirementsJson?: string;
  originalQuery?: string;
  aiSummary?: string;
  primaryPhone?: string;
  primaryWechat?: string;
  housingId?: number;
  roomId?: number;
  businessType?: 'focus' | 'joint' | 'whole';
  propertyName?: string;
  roomAddress?: string;
  preferredViewingTime?: string;
  viewingDate?: string;
  viewingStatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  agentId?: number;
  agentName?: string;
  agentPhone?: string;
  source?: string;
  remarks?: string;
  
  // 新增字段 - 基础信息
  sourcePlatform?: SourcePlatform;
  customerRoomType?: CustomerRoomType;
  sourcePropertyPrice?: number;
  followUpPlatform?: SourcePlatform;
  customerStatus?: CustomerStatus;
  
  // 新增字段 - 带看信息
  leadViewingStatus?: LeadViewingStatus;
  viewingProperties?: string;
  customerFeedback?: string;
}

export interface QueryViewingRecordsParams {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  agentId?: number;
  source?: string;
  search?: string;
  businessType?: 'focus' | 'joint' | 'whole';
  
  // 新增查询字段
  sourcePlatform?: SourcePlatform;
  customerRoomType?: CustomerRoomType;
  customerStatus?: CustomerStatus;
  followUpPlatform?: SourcePlatform;
}

// 分页相关类型
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// 统计数据类型
export interface Statistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

// 表单状态类型
export interface FormState {
  loading: boolean;
  error?: string;
}

// API密钥相关类型
export interface ApiKey {
  id: number;
  channelName: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  apiSecret?: string; // 只在创建/重新生成时返回
  // 扩展字段
  name?: string; // 别名，对应 channelName
  description?: string; // 描述信息
  usageCount?: number; // 使用次数
  lastUsed?: string; // 最后使用时间
  expiresAt?: string; // 过期时间
}

export interface CreateApiKeyRequest {
  channelName: string;
  isActive?: boolean;
}

export interface UpdateApiKeyRequest {
  channelName?: string;
  isActive?: boolean;
}

export interface ApiKeyStatistics {
  total: number;
  active: number;
  inactive: number;
}

// 扩展现有的AppState类型
export interface AppState {
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  };
  viewingRecords: {
    records: ViewingRecord[];
    currentRecord: ViewingRecord | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination;
    statistics: Statistics | null;
    filters: {
      status?: string;
      businessType?: string;
      source?: string;
      search?: string;
      agentId?: number;
    };
  };
  apiKeys: {
    apiKeys: ApiKey[];
    currentApiKey: ApiKey | null;
    loading: boolean;
    error: string | null;
    pagination: Pagination;
    statistics: ApiKeyStatistics | null;
  };
}

export interface BatchUpdateRequest {
  ids: number[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  remarks?: string;
}

// 导出相关类型
export interface ExportParams {
  format?: 'excel' | 'pdf';
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  agentId?: number;
  source?: string;
  businessType?: 'focus' | 'joint' | 'whole';
  dateFrom?: string;
  dateTo?: string;
  sourcePlatform?: SourcePlatform;
  customerRoomType?: CustomerRoomType;
  customerStatus?: CustomerStatus;
  followUpPlatform?: SourcePlatform;
} 