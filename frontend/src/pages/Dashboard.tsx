import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Button, Table, Tag, Typography } from 'antd';
import { 
  TeamOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchStatisticsAsync, fetchViewingRecordsAsync } from '../store/slices/viewingRecordsSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 480);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return isMobile;
};

// 移动端记录卡片组件
const MobileDashboardCard: React.FC<{ record: any; onView: (id: number) => void }> = ({ record, onView }) => {
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

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      {/* 头部：状态 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Tag color={getStatusColor(record.viewingStatus)}>
          {getStatusText(record.viewingStatus)}
        </Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(record.createdAt).format('MM-DD HH:mm')}
        </Text>
      </div>

      {/* 客户信息 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <UserOutlined style={{ color: '#52c41a', marginRight: 6 }} />
          <Text strong style={{ fontSize: 14 }}>
            {record.tenantName || '未填写'}
          </Text>
        </div>
        {record.primaryPhone && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <PhoneOutlined style={{ color: '#52c41a', marginRight: 6 }} />
            <Text style={{ fontSize: 13 }}>
              {record.primaryPhone}
            </Text>
          </div>
        )}
      </div>

      {/* 房源信息 */}
      {record.propertyName && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HomeOutlined style={{ color: '#1890ff', marginRight: 6 }} />
            <Text style={{ fontSize: 13 }}>
              {record.propertyName}
            </Text>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ 
        borderTop: '1px solid #f0f0f0',
        paddingTop: 8,
        marginTop: 8,
        textAlign: 'center'
      }}>
        <Button 
          type="text" 
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView(record.id)}
          style={{ fontSize: 12 }}
        >
          查看详情
        </Button>
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { user } = useAppSelector((state) => state.auth);
  const { statistics, records, loading } = useAppSelector((state) => state.viewingRecords);

  useEffect(() => {
    // 获取统计数据和最近的记录
    dispatch(fetchStatisticsAsync());
    dispatch(fetchViewingRecordsAsync({ page: 1, pageSize: 5 }));
  }, [dispatch]);

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

  // 最近记录表格列定义（桌面端）
  const columns = [
    {
      title: '租客姓名',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text: string) => text || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'primaryPhone',
      key: 'primaryPhone',
      render: (text: string) => text || '-',
    },
    {
      title: '房源',
      dataIndex: 'propertyName',
      key: 'propertyName',
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'viewingStatus',
      key: 'viewingStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="status-tag">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/records/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  // 获取当前时间的问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0 8px' }}>
      {/* 页面头部 */}
      <div style={{ 
        marginBottom: 24,
        padding: isMobile ? '16px' : '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <Title 
              level={2} 
              style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: isMobile ? 20 : 28,
                fontWeight: 600
              }}
            >
              {getGreeting()}，{user?.fullName || user?.username}！
            </Title>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.85)', 
              fontSize: isMobile ? 14 : 16,
              display: 'block',
              marginTop: 4
            }}>
              欢迎使用房源带看CRM系统
            </Text>
          </div>
          <div style={{ 
            textAlign: isMobile ? 'left' : 'right',
            fontSize: isMobile ? 12 : 14,
            color: 'rgba(255, 255, 255, 0.75)'
          }}>
            <div>{user?.role?.name === 'admin' ? '系统管理员' : '房产经纪人'}</div>
            <div>{dayjs().format('YYYY年MM月DD日')}</div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'} style={{ height: '100%' }}>
            <Statistic
              title="总记录数"
              value={statistics?.total || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ 
                color: '#1890ff',
                fontSize: isMobile ? 20 : 24
              }}
              titleStyle={{
                fontSize: isMobile ? 12 : 14
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'} style={{ height: '100%' }}>
            <Statistic
              title="待确认"
              value={statistics?.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ 
                color: '#faad14',
                fontSize: isMobile ? 20 : 24
              }}
              titleStyle={{
                fontSize: isMobile ? 12 : 14
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'} style={{ height: '100%' }}>
            <Statistic
              title="已确认"
              value={statistics?.confirmed || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ 
                color: '#1890ff',
                fontSize: isMobile ? 20 : 24
              }}
              titleStyle={{
                fontSize: isMobile ? 12 : 14
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'} style={{ height: '100%' }}>
            <Statistic
              title="已完成"
              value={statistics?.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ 
                color: '#52c41a',
                fontSize: isMobile ? 20 : 24
              }}
              titleStyle={{
                fontSize: isMobile ? 12 : 14
              }}
            />
          </Card>
        </Col>
      </Row>



      {/* 最近记录 */}
      <Card
        title={
          <span style={{ fontSize: isMobile ? 14 : 16 }}>
            最近记录
          </span>
        }
        extra={
          <Button 
            type="link" 
            onClick={() => navigate('/records')}
            size={isMobile ? 'small' : 'middle'}
            style={{ fontSize: isMobile ? 12 : 14 }}
          >
            查看全部
          </Button>
        }
        size={isMobile ? 'small' : 'default'}
      >
        {isMobile ? (
          // 移动端卡片视图
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Text type="secondary">加载中...</Text>
              </div>
            ) : records.length > 0 ? (
              records.map((record) => (
                <MobileDashboardCard
                  key={record.id}
                  record={record}
                  onView={(id) => navigate(`/records/${id}`)}
                />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px 0',
                color: '#999'
              }}>
                暂无数据
              </div>
            )}
          </div>
        ) : (
          // 桌面端表格视图
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
          locale={{
            emptyText: '暂无数据',
          }}
        />
        )}
      </Card>
    </div>
  );
};

export default Dashboard; 