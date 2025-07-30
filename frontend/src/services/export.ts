import api from './api';
import { ExportParams } from '../types';

export type { ExportParams };

// 导出线索记录
export const exportDataAPI = async (params: ExportParams) => {
  const response = await api.get('/export', {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  let filename = `线索记录_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch.length > 1) {
      filename = filenameMatch[1];
    }
  }
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};