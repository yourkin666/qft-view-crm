import api from './api';

export interface ExportParams {
  status?: string;
  agentId?: number;
  source?: string;
  businessType?: string;
  dateFrom?: string;
  dateTo?: string;
  format: 'excel' | 'pdf';
}

export const exportService = {
  // 导出带看记录
  async exportViewingRecords(params: ExportParams) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/export/viewing-records?${queryParams.toString()}`, {
      responseType: 'blob',
    });

    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition'];
    let filename = `带看记录_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
      }
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // 清理
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: '导出成功',
    };
  },
}; 