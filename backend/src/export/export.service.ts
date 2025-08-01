import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

export interface ExportQuery {
  status?: string;
  agentId?: number;
  source?: string;
  businessType?: string;
  dateFrom?: string;
  dateTo?: string;
  format: 'excel' | 'pdf';
}

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportViewingRecords(query: ExportQuery, user: any) {
    try {
      // 构建查询条件
      const where: any = {};

      // 权限控制：经纪人只能导出自己的记录
      if (user.role?.name === 'agent') {
        where.agentId = user.id;
      }

      if (query.status) {
        where.viewingStatus = query.status;
      }

      if (query.agentId && user.role?.name === 'admin') {
        where.agentId = query.agentId;
      }

      if (query.source) {
        where.source = query.source;
      }

      if (query.businessType) {
        where.businessType = query.businessType;
      }

      if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) {
          where.createdAt.gte = new Date(query.dateFrom);
        }
        if (query.dateTo) {
          where.createdAt.lte = new Date(query.dateTo);
        }
      }

      // 获取数据
      const records = await this.prisma.viewingRecord.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          property: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (query.format === 'excel') {
        return this.generateExcel(records);
      } else {
        throw new BadRequestException('PDF导出功能暂未实现');
      }
    } catch (error) {
      throw new BadRequestException('导出失败: ' + error.message);
    }
  }

  private async generateExcel(records: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('线索记录');

    // 设置表头
    const headers = [
      'ID',
      '租客姓名',
      '联系电话',
      '微信号',
      '物业名称',
      '房间地址',
      '偏好看房时间',
      '业务类型',
      '预约状态',
      '数据来源',
      '经纪人',
      '创建时间',
      '更新时间',
      '备注',
    ];

    worksheet.addRow(headers);

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366EF7' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 添加数据行
    records.forEach((record) => {
      const row = [
        record.id,
        record.tenantName || '-',
        record.primaryPhone || '-',
        record.primaryWechat || '-',
        record.propertyName || '-',
        record.roomAddress || '-',
        record.preferredViewingTime || '-',
        this.getBusinessTypeText(record.businessType),
        this.getStatusText(record.viewingStatus),
        this.getSourceText(record.source),
        record.agent?.fullName || record.agentName || '-',
        this.formatDate(record.createdAt),
        this.formatDate(record.updatedAt),
        record.remarks || '-',
      ];
      
      const addedRow = worksheet.addRow(row);
      
      // 设置数据行样式
      addedRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        
        // 状态列特殊颜色
        if (colNumber === 9) { // 预约状态列
          switch (record.viewingStatus) {
            case 'pending':
              cell.font = { color: { argb: 'FF8C00' } };
              break;
            case 'confirmed':
              cell.font = { color: { argb: '1890FF' } };
              break;
            case 'completed':
              cell.font = { color: { argb: '52C41A' } };
              break;
            case 'cancelled':
              cell.font = { color: { argb: 'FF4D4F' } };
              break;
          }
        }
      });
    });

    // 自动调整列宽
    worksheet.columns.forEach((column) => {
      let maxWidth = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxWidth) {
          maxWidth = cellLength;
        }
      });
      column.width = Math.min(maxWidth + 2, 50);
    });

    // 添加统计信息
    const statsRow = worksheet.addRow([]);
    statsRow.getCell(1).value = `总记录数: ${records.length}`;
    statsRow.getCell(1).font = { bold: true };

    const statusStats = records.reduce((acc, record) => {
      acc[record.viewingStatus] = (acc[record.viewingStatus] || 0) + 1;
      return acc;
    }, {});

    let col = 3;
    Object.entries(statusStats).forEach(([status, count]) => {
      const cell = statsRow.getCell(col);
      cell.value = `${this.getStatusText(status)}: ${count}`;
      cell.font = { bold: true };
      col++;
    });

    // 生成Excel缓冲区
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      buffer,
      filename: `线索记录_${this.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private getBusinessTypeText(type: string): string {
    const typeMap = {
      focus: '专注',
      joint: '联合',
      whole: '整租',
    };
    return typeMap[type] || type;
  }

  private getStatusText(status: string): string {
    const statusMap = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消',
    };
    return statusMap[status] || status;
  }

  private getSourceText(source: string): string {
    const sourceMap = {
      manual: '手动录入',
      third_party: '第三方录入',
    };
    return sourceMap[source] || source;
  }

  private formatDate(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    if (format === 'YYYYMMDD_HHmmss') {
      return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
} 