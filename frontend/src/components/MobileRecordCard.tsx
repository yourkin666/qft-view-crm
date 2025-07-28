import React from 'react';
import { Card, Tag, Button, Space, Typography, Divider } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface MobileRecordCardProps {
  record: any;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
  onView: (record: any) => void;
  showActions?: boolean;
}

const MobileRecordCard: React.FC<MobileRecordCardProps> = ({
  record,
  onEdit,
  onDelete,
  onView,
  showActions = true
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getBusinessTypeText = (type: string) => {
    const types = {
      rent: '租赁',
      sale: '买卖',
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      {/* 头部：状态和业务类型 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Tag color={getStatusColor(record.viewingStatus)}>
          {getStatusText(record.viewingStatus)}
        </Tag>
          {record.businessType && (
        <Tag color="geekblue">
          {getBusinessTypeText(record.businessType)}
        </Tag>
          )}
          <Tag color={record.channelType === 'API' ? 'blue' : 'green'} style={{ fontSize: 10 }}>
            {record.channel || '手动录入'}
          </Tag>
        </div>
      </div>

      {/* 房源信息 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <HomeOutlined style={{ color: '#1890ff', marginRight: 6 }} />
          <Text strong style={{ fontSize: 14 }}>
            {record.roomAddress}
          </Text>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.propertyName}
        </Text>
      </div>

      {/* 客户信息 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <UserOutlined style={{ color: '#52c41a', marginRight: 6 }} />
          <Text style={{ fontSize: 13 }}>
            {record.tenantName}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PhoneOutlined style={{ color: '#52c41a', marginRight: 6 }} />
          <Text style={{ fontSize: 13 }}>
            {record.primaryPhone}
          </Text>
        </div>
      </div>

      {/* 时间信息 */}
      <div style={{ marginBottom: showActions ? 8 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ color: '#fa8c16', marginRight: 6 }} />
          <Text style={{ fontSize: 12 }} type="secondary">
            {dayjs(record.viewingDate).format('MM-DD HH:mm')}
          </Text>
          {record.agent && (
            <>
              <Divider type="vertical" style={{ margin: '0 8px' }} />
              <Text style={{ fontSize: 12 }} type="secondary">
                {record.agent.fullName}
              </Text>
            </>
          )}
        </div>
      </div>

      {/* 备注 */}
      {record.remarks && (
        <div style={{ marginBottom: showActions ? 8 : 0 }}>
          <Paragraph 
            ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
            style={{ 
              fontSize: 12, 
              color: '#666',
              margin: 0,
              lineHeight: '16px'
            }}
          >
            {record.remarks}
          </Paragraph>
        </div>
      )}

      {/* 操作按钮 */}
      {showActions && (
        <div style={{ 
          borderTop: '1px solid #f0f0f0',
          paddingTop: 8,
          marginTop: 8
        }}>
          <Space size="small" style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            >
              查看
            </Button>
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
            <Button 
              type="text" 
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id)}
            >
              删除
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default MobileRecordCard; 