import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
  Affix,
  Drawer,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchApiKeysAsync,
  fetchApiKeyStatisticsAsync,
  createApiKeyAsync,
  updateApiKeyAsync,
  deleteApiKeyAsync,
  regenerateSecretAsync,
  clearCurrentApiKey,
} from '@/store/slices/apiKeysSlice';
import type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/types';
import dayjs from 'dayjs';
import MobileApiKeyCard from '@/components/MobileApiKeyCard';

const { Title, Text, Paragraph } = Typography;

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

const ApiKeys: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { 
    apiKeys, 
    currentApiKey, 
    loading, 
    pagination, 
    statistics 
  } = useAppSelector((state) => state.apiKeys);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchApiKeysAsync());
    dispatch(fetchApiKeyStatisticsAsync());
  }, [dispatch]);

  // 处理创建/更新API密钥
  const handleSave = async (values: CreateApiKeyRequest | UpdateApiKeyRequest) => {
    try {
      if (editingKey) {
        await dispatch(updateApiKeyAsync({ 
          id: editingKey.id, 
          data: values as UpdateApiKeyRequest 
        })).unwrap();
        message.success('更新成功');
      } else {
        const result = await dispatch(createApiKeyAsync(values as CreateApiKeyRequest)).unwrap();
        message.success('创建成功');
        // 如果是创建操作，显示Secret
        if (result && result.apiSecret) {
          setSecretModalVisible(true);
        }
      }
      setModalVisible(false);
      setEditingKey(null);
      form.resetFields();
      dispatch(fetchApiKeysAsync());
      dispatch(fetchApiKeyStatisticsAsync());
    } catch (error: any) {
      console.error('Save failed:', error);
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error(editingKey ? '更新失败，请重试' : '创建失败，请重试');
      }
    }
  };

  // 处理删除API密钥
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteApiKeyAsync(id)).unwrap();
      message.success('删除成功');
      dispatch(fetchApiKeysAsync());
      dispatch(fetchApiKeyStatisticsAsync());
    } catch (error: any) {
      console.error('Delete failed:', error);
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('删除失败，请重试');
      }
    }
  };

  // 处理重新生成Secret
  const handleRegenerateSecret = async (id: number) => {
    try {
      await dispatch(regenerateSecretAsync(id)).unwrap();
      message.success('重新生成成功');
      setSecretModalVisible(true);
      dispatch(fetchApiKeysAsync());
    } catch (error: any) {
      console.error('Regenerate failed:', error);
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('重新生成失败，请重试');
      }
    }
  };

  // 打开编辑模态框
  const openEditModal = (record?: ApiKey) => {
    if (record) {
      setEditingKey(record);
      form.setFieldsValue({
        channelName: record.channelName,
        isActive: record.isActive,
      });
    } else {
      setEditingKey(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 移动端过滤器内容
  const renderMobileFilters = () => (
    <div style={{ padding: '16px' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => {
            dispatch(fetchApiKeysAsync());
            dispatch(fetchApiKeyStatisticsAsync());
          }}
          style={{ flex: 1 }}
        >
          刷新
        </Button>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openEditModal()}
          style={{ flex: 1, marginLeft: 8 }}
        >
          创建API密钥
        </Button>
      </Space>
    </div>
  );

  // 桌面端表格列配置
  const columns: ColumnsType<ApiKey> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '渠道名称',
      dataIndex: 'channelName',
      key: 'channelName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (text: string) => (
        <Space>
          <Text code copyable={{ text }}>{text.substring(0, 20)}...</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '激活' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: ApiKey) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="重新生成Secret">
            <Popconfirm
              title="确定要重新生成Secret吗？"
              description="旧的Secret将失效，请确保更新所有使用该密钥的系统"
              onConfirm={() => handleRegenerateSecret(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" icon={<KeyOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个API密钥吗？"
              description="删除后无法恢复，请确保没有系统正在使用该密钥"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="api-keys-page">
      <div className="page-header">
        <Title level={2} style={{ fontSize: isMobile ? 18 : 24, marginBottom: 8 }}>
          API密钥管理
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
          管理第三方系统接入的API密钥，确保数据安全传输
        </Text>
      </div>

      {/* 移动端过滤器抽屉 */}
      {isMobile && (
        <Drawer
          title="操作面板"
          placement="bottom"
          onClose={() => setMobileFiltersVisible(false)}
          open={mobileFiltersVisible}
          height={200}
        >
          {renderMobileFilters()}
        </Drawer>
      )}

      {/* 移动端顶部操作栏 */}
      {isMobile && (
        <Affix offsetTop={0}>
          <Card 
            size="small" 
            style={{ 
              marginBottom: 12, 
              borderRadius: 0,
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setMobileFiltersVisible(true)}
                size="small"
              >
                操作
              </Button>
              <Button 
                type="primary"
                size="small" 
                icon={<PlusOutlined />} 
                onClick={() => openEditModal()}
              >
                创建密钥
              </Button>
            </Space>
          </Card>
        </Affix>
      )}

      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Col xs={8} sm={8} md={8} lg={8}>
            <Card size={isMobile ? 'small' : 'default'}>
              <Statistic
                title="总计"
                value={statistics.total}
                valueStyle={{ 
                  color: '#1890ff',
                  fontSize: isMobile ? 16 : 24
                }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8}>
            <Card size={isMobile ? 'small' : 'default'}>
              <Statistic
                title="激活中"
                value={statistics.active}
                valueStyle={{ 
                  color: '#52c41a',
                  fontSize: isMobile ? 16 : 24
                }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8}>
            <Card size={isMobile ? 'small' : 'default'}>
              <Statistic
                title="已禁用"
                value={statistics.inactive}
                valueStyle={{ 
                  color: '#ff4d4f',
                  fontSize: isMobile ? 16 : 24
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 主要内容 */}
      <Card>
        {!isMobile && (
        <div className="page-toolbar">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openEditModal()}
            >
              创建API密钥
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                dispatch(fetchApiKeysAsync());
                dispatch(fetchApiKeyStatisticsAsync());
              }}
            >
              刷新
            </Button>
          </Space>
        </div>
        )}

        {isMobile ? (
          /* 移动端卡片视图 */
          <div>
            {apiKeys.length > 0 ? (
              <div>
                {apiKeys.map((apiKey) => (
                  <MobileApiKeyCard
                    key={apiKey.id}
                    apiKey={apiKey}
                    onEdit={openEditModal}
                    onDelete={(id) => {
                      Modal.confirm({
                        title: '确定要删除这个API密钥吗？',
                        content: '删除后无法恢复，请确保没有系统正在使用该密钥',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => handleDelete(id),
                      });
                    }}
                    onRegenerateSecret={(id) => {
                      Modal.confirm({
                        title: '确定要重新生成Secret吗？',
                        content: '旧的Secret将失效，请确保更新所有使用该密钥的系统',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => handleRegenerateSecret(id),
                      });
                    }}
                  />
                ))}
                
                {/* 移动端分页 */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: 16,
                  padding: '12px 0',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Space direction="vertical" size="small">
                    <div style={{ fontSize: 12, color: '#666' }}>
                      第 {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
                    </div>
                    <Space size="small">
                      <Button 
                        size="small"
                        disabled={pagination.page <= 1}
                        onClick={() => dispatch(fetchApiKeysAsync({ page: pagination.page - 1, pageSize: pagination.pageSize }))}
                      >
                        上一页
                      </Button>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                      </span>
                      <Button 
                        size="small"
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                        onClick={() => dispatch(fetchApiKeysAsync({ page: pagination.page + 1, pageSize: pagination.pageSize }))}
                      >
                        下一页
                      </Button>
                    </Space>
                  </Space>
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 0',
                color: '#999'
              }}>
                暂无数据
              </div>
            )}
          </div>
        ) : (
          /* 桌面端表格视图 */
        <Table
          columns={columns}
          dataSource={apiKeys}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              dispatch(fetchApiKeysAsync({ page, pageSize }));
            },
          }}
        />
        )}
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingKey ? '编辑API密钥' : '创建API密钥'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? '90%' : 600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="渠道名称"
            name="channelName"
            rules={[
              { required: true, message: '请输入渠道名称' },
              { max: 100, message: '渠道名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="例如：官网、微信小程序、APP等" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="激活" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingKey ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingKey(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Secret显示模态框 */}
      <Modal
        title="API密钥信息"
        open={secretModalVisible}
        onCancel={() => {
          setSecretModalVisible(false);
          dispatch(clearCurrentApiKey());
        }}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setSecretModalVisible(false);
              dispatch(clearCurrentApiKey());
            }}
          >
            我已保存
          </Button>
        }
        width={isMobile ? '90%' : 600}
      >
        {currentApiKey && (
          <div>
            <Text type="warning" strong>
              ⚠️ 请妥善保存以下信息，API Secret只会显示一次
            </Text>
            
            <div style={{ marginTop: 16 }}>
              <Text strong>渠道名称：</Text>
              <Text>{currentApiKey.channelName}</Text>
            </div>

            <div style={{ marginTop: 12 }}>
              <Text strong>API Key：</Text>
              <Paragraph copyable={{ text: currentApiKey.apiKey }}>
                <Text code style={{ fontSize: isMobile ? 10 : 12 }}>
                  {currentApiKey.apiKey}
                </Text>
              </Paragraph>
            </div>

            {currentApiKey.apiSecret && (
              <div style={{ marginTop: 12 }}>
                <Text strong>API Secret：</Text>
                <Paragraph copyable={{ text: currentApiKey.apiSecret }}>
                  <Text code style={{ fontSize: isMobile ? 10 : 12 }}>
                    {currentApiKey.apiSecret}
                  </Text>
                </Paragraph>
              </div>
            )}

            <div style={{ 
              marginTop: 16, 
              padding: isMobile ? 12 : 16, 
              backgroundColor: '#f6f8fa', 
              borderRadius: 6 
            }}>
              <Text strong>使用说明：</Text>
              <br />
              <Text style={{ fontSize: isMobile ? 12 : 14 }}>
                在请求头中添加以下字段：
              </Text>
              <ul style={{ marginTop: 8 }}>
                <li>
                  <Text code style={{ fontSize: isMobile ? 10 : 12 }}>
                    X-API-Key: {currentApiKey.apiKey}
                  </Text>
                </li>
                <li>
                  <Text code style={{ fontSize: isMobile ? 10 : 12 }}>
                    X-API-Secret: {currentApiKey.apiSecret || '[您的Secret]'}
                  </Text>
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApiKeys; 