import React from 'react';
import { Card, Tag, Button, Space, Typography, Divider } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ApiKey } from '@/types';

const { Text } = Typography;

interface MobileApiKeyCardProps {
  apiKey: ApiKey;
  onEdit: (apiKey: ApiKey) => void;
  onDelete: (id: number) => void;
  onRegenerateSecret: (id: number) => void;
  showActions?: boolean;
}

const MobileApiKeyCard: React.FC<MobileApiKeyCardProps> = ({
  apiKey,
  onEdit,
  onDelete,
  onRegenerateSecret,
  showActions = true
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 这里可以添加复制成功的提示
    });
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
      styles={{ body: { padding: '12px 16px' } }}
    >
      {/* 头部：状态和ID */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tag 
            color={apiKey.isActive ? 'success' : 'default'}
            icon={apiKey.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {apiKey.isActive ? '启用' : '禁用'}
          </Tag>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          ID: {apiKey.id}
        </Text>
      </div>

      {/* API密钥基本信息 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <KeyOutlined style={{ color: '#1890ff', marginRight: 6 }} />
          <Text strong style={{ fontSize: 14 }}>
            {apiKey.channelName}
          </Text>
        </div>
      </div>

      {/* API Key 显示 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '8px 12px', 
          borderRadius: 4,
          border: '1px solid #d9d9d9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text 
              code 
              style={{ 
                fontSize: 11, 
                fontFamily: 'monospace',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {apiKey.apiKey}
            </Text>
            <Button 
              type="text" 
              size="small"
              onClick={() => copyToClipboard(apiKey.apiKey)}
              style={{ fontSize: 10, padding: '2px 6px' }}
            >
              复制
            </Button>
          </div>
        </div>
      </div>

      {/* 使用统计 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text style={{ fontSize: 12 }} type="secondary">
              使用次数: 
            </Text>
            <Text strong style={{ fontSize: 12, marginLeft: 4 }}>
              {apiKey.usageCount || 0}
            </Text>
          </div>
          <div>
            <Text style={{ fontSize: 12 }} type="secondary">
              最后使用: 
            </Text>
            <Text style={{ fontSize: 12, marginLeft: 4 }}>
              {apiKey.lastUsed ? dayjs(apiKey.lastUsed).format('MM-DD HH:mm') : '从未使用'}
            </Text>
          </div>
        </div>
      </div>

      {/* 时间信息 */}
      <div style={{ marginBottom: showActions ? 8 : 0 }}>
        <Text style={{ fontSize: 12 }} type="secondary">
          创建时间: {dayjs(apiKey.createdAt).format('MM-DD HH:mm')}
        </Text>
        {apiKey.expiresAt && (
          <>
            <Divider type="vertical" style={{ margin: '0 8px' }} />
            <Text style={{ fontSize: 12 }} type="secondary">
              过期时间: {dayjs(apiKey.expiresAt).format('MM-DD HH:mm')}
            </Text>
          </>
        )}
      </div>

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
              icon={<EditOutlined />}
              onClick={() => onEdit(apiKey)}
            >
              编辑
            </Button>
            <Button 
              type="text" 
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => onRegenerateSecret(apiKey.id)}
            >
              重新生成
            </Button>
            <Button 
              type="text" 
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(apiKey.id)}
            >
              删除
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default MobileApiKeyCard; 