import React, { memo, useCallback, useMemo } from 'react';
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
import { ViewingRecord } from '../types';

const { Text, Paragraph } = Typography;

interface MobileRecordCardProps {
  record: ViewingRecord;
  onEdit: (record: ViewingRecord) => void;
  onDelete: (id: number) => void;
  onView: (record: ViewingRecord) => void;
  showActions?: boolean;
}

const MobileRecordCard: React.FC<MobileRecordCardProps> = memo(({
  record,
  onEdit,
  onDelete,
  onView,
  showActions = true
}) => {
  const getStatusColor = useCallback((status: string) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  }, []);

  const getStatusText = useCallback((status: string) => {
    const texts = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消',
    };
    return texts[status as keyof typeof texts] || status;
  }, []);

  const getBusinessTypeText = useCallback((type: string) => {
    const types = {
      rent: '租赁',
      sale: '买卖',
    };
    return types[type as keyof typeof types] || type;
  }, []);

  const handleEdit = useCallback(() => onEdit(record), [record, onEdit]);
  const handleDelete = useCallback(() => onDelete(record.id), [record.id, onDelete]);
  const handleView = useCallback(() => onView(record), [record, onView]);

  const formattedDate = useMemo(() => {
    return dayjs(record.viewingDate).format('MM-DD HH:mm');
  }, [record.viewingDate]);

  const statusColor = useMemo(() => getStatusColor(record.viewingStatus), [record.viewingStatus, getStatusColor]);
  const statusText = useMemo(() => getStatusText(record.viewingStatus), [record.viewingStatus, getStatusText]);
  const businessTypeText = useMemo(() =>
    record.businessType ? getBusinessTypeText(record.businessType) : null,
    [record.businessType, getBusinessTypeText]
  );

  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      styles={{ body: { padding: '12px 16px' } }}
    >
      {/* 头部：状态和业务类型 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* 客户状态 */}
          {record.customerStatus && (
            <Tag color={
              record.customerStatus === '接洽中' ? 'orange' :
                record.customerStatus === '已约带看' ? 'blue' :
                  record.customerStatus === '客户丢失' ? 'red' : 'default'
            }>
              {record.customerStatus}
            </Tag>
          )}

          {/* 系统状态 */}
          <Tag color={statusColor} style={{ fontSize: 10 }}>
            系统:{statusText}
          </Tag>

          {/* 业务类型 */}
          {businessTypeText && (
            <Tag color="geekblue" style={{ fontSize: 10 }}>
              {businessTypeText}
            </Tag>
          )}

          {/* 房源类型 */}
          {record.customerRoomType && (
            <Tag color="green" style={{ fontSize: 10 }}>
              {record.customerRoomType}
            </Tag>
          )}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.propertyName}
          </Text>
          {record.sourcePropertyPrice && (
            <Text style={{ fontSize: 12, color: '#fa8c16', fontWeight: 500 }}>
              ¥{record.sourcePropertyPrice.toLocaleString()}
            </Text>
          )}
        </div>
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

      {/* 平台信息 */}
      {(record.sourcePlatform || record.followUpPlatform) && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
            {record.sourcePlatform && (
              <Text type="secondary">
                来源: {record.sourcePlatform}
              </Text>
            )}
            {record.followUpPlatform && (
              <Text type="secondary">
                跟进: {record.followUpPlatform}
              </Text>
            )}
          </div>
          {record.leadViewingStatus && (
            <Text style={{ fontSize: 11, color: '#1890ff' }}>
              {record.leadViewingStatus}
            </Text>
          )}
        </div>
      )}

      {/* 时间信息 */}
      <div style={{ marginBottom: showActions ? 8 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ color: '#fa8c16', marginRight: 6 }} />
          <Text style={{ fontSize: 12 }} type="secondary">
            {formattedDate}
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
              onClick={handleView}
            >
              查看
            </Button>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              编辑
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
});

export default MobileRecordCard; 