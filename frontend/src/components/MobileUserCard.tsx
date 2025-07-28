import React, { useState } from 'react';
import { 
  Card, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Dropdown,
  MenuProps,
  Modal,
  Descriptions,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  UserOutlined,
  KeyOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import type { User } from '@/types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface MobileUserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onResetPassword?: (id: number) => void;
  onViewStatistics?: (id: number) => void;
}

const MobileUserCard: React.FC<MobileUserCardProps> = ({ 
  user, 
  onEdit, 
  onDelete, 
  onResetPassword,
  onViewStatistics 
}) => {
  const [detailVisible, setDetailVisible] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => onEdit(user),
    },
    ...(onResetPassword ? [{
      key: 'resetPassword',
      label: '重置密码',
      icon: <KeyOutlined />,
      onClick: () => {
        Modal.confirm({
          title: '确定要重置密码吗？',
          content: '系统将生成临时密码',
          onOk: () => onResetPassword(user.id),
        });
      },
    }] : []),
    ...(onViewStatistics ? [{
      key: 'viewStats',
      label: '查看统计',
      icon: <EyeOutlined />,
      onClick: () => onViewStatistics(user.id),
    }] : []),
    {
      key: 'viewDetail',
      label: '查看详情',
      icon: <EyeOutlined />,
      onClick: () => setDetailVisible(true),
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(user.id),
    },
  ];

  return (
    <>
      <Card
        size="small"
        style={{ marginBottom: 12 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>
                {user.username}
              </Text>
            </Space>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">姓名:</Text>
            <Text>{user.fullName || '-'}</Text>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">手机号:</Text>
            <Text>{user.phone || '-'}</Text>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">角色:</Text>
            <Tag color={user.role.name === 'admin' ? 'red' : 'blue'}>
              {user.role.name === 'admin' ? '管理员' : '经纪人'}
            </Tag>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">状态:</Text>
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? '激活' : '禁用'}
            </Tag>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">创建时间:</Text>
            <Text style={{ fontSize: 12 }}>
              {dayjs(user.createdAt).format('YYYY-MM-DD')}
            </Text>
          </div>
        </Space>
      </Card>

      {/* 用户详情模态框 */}
      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width="90%"
      >
        <Descriptions 
          column={1} 
          size="small" 
          bordered
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user.fullName || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={user.role.name === 'admin' ? 'red' : 'blue'}>
              {user.role.name === 'admin' ? '管理员' : '经纪人'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? '激活' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {dayjs(user.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>

        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        </Space>
      </Modal>
    </>
  );
};

export default MobileUserCard; 