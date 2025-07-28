import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  Alert,
  Drawer,
  Affix,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import {
  fetchViewingRecordsAsync,
  setFilters,
  batchUpdateViewingRecordsAsync,
  deleteViewingRecordAsync,
  createViewingRecordAsync,
  updateViewingRecordAsync,
} from '../store/slices/viewingRecordsSlice';
import type { CreateViewingRecordRequest } from '../types';
import { fetchUsersAsync } from '../store/slices/usersSlice';
import ExportModal from '@/components/ExportModal';
import BatchOperationModal from '@/components/BatchOperationModal';
import MobileRecordCard from '@/components/MobileRecordCard';
import { exportService } from '@/services/export';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

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

const ViewingRecords: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { user } = useAppSelector((state) => state.auth);
  const { records, pagination, loading, filters, batchOperationLoading } = useAppSelector((state) => state.viewingRecords);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchViewingRecordsAsync(filters));
    dispatch(fetchUsersAsync()); // 为了导出功能获取用户列表
  }, [dispatch, filters]);

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

  const handleSearch = (value: string) => {
    dispatch(setFilters({ ...filters, search: value, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ ...filters, [key]: value, page: 1 }));
  };

  const handleTableChange = (paginationConfig: any) => {
    dispatch(setFilters({
      ...filters,
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const handleCreate = () => {
    setModalMode('create');
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setModalMode('edit');
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      preferredViewingTime: record.preferredViewingTime || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteViewingRecordAsync(id)).unwrap();
      message.success('删除成功');
      dispatch(fetchViewingRecordsAsync(filters));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateViewingRecordRequest = {
        ...values,
        source: values.source || 'manual',
      };

      if (modalMode === 'create') {
        await dispatch(createViewingRecordAsync(data)).unwrap();
        message.success('创建成功');
      } else {
        await dispatch(updateViewingRecordAsync({ id: currentRecord.id, data })).unwrap();
        message.success('更新成功');
      }

      setModalVisible(false);
      dispatch(fetchViewingRecordsAsync(filters));
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleExport = async (exportData: any) => {
    try {
      await exportService.exportViewingRecords(exportData);
      message.success('导出成功！');
    } catch (error: any) {
      console.error('导出失败:', error);
      message.error(error.message || '导出失败');
    }
  };

  // 批量操作相关
  const handleBatchUpdate = async (data: any) => {
    try {
      const requestData = {
        ids: selectedRowKeys,
        status: data.status,
        remarks: data.remarks,
      };
      await dispatch(batchUpdateViewingRecordsAsync(requestData)).unwrap();
      message.success('批量更新成功！');
      setSelectedRowKeys([]);
      setBatchModalVisible(false);
      // 刷新列表
      dispatch(fetchViewingRecordsAsync(filters));
    } catch (error: any) {
      console.error('批量更新失败:', error);
      message.error(error.message || '批量更新失败');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as number[]);
    },
    onSelectAll: (_selected: boolean, _selectedRows: any[], _changeRows: any[]) => {
      // 可以在这里添加全选逻辑
    },
  };

  const columns = [
    {
      title: '租客姓名',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text: string) => text || '-',
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: any, record: any) => (
        <div>
          {record.primaryPhone && <div>📱 {record.primaryPhone}</div>}
          {record.primaryWechat && <div>💬 {record.primaryWechat}</div>}
        </div>
      ),
    },
    {
      title: '房源信息',
      key: 'property',
      render: (_: any, record: any) => (
        <div>
          {record.propertyName && <div style={{ fontWeight: 500 }}>{record.propertyName}</div>}
          {record.roomAddress && <div style={{ fontSize: 12, color: '#666' }}>{record.roomAddress}</div>}
        </div>
      ),
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      key: 'businessType',
      render: (type: string) => {
        const typeMap = {
          focus: '专注',
          joint: '合作',
          whole: '整租',
        };
        return type ? <Tag>{typeMap[type as keyof typeof typeMap] || type}</Tag> : '-';
      },
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
      title: '经纪人',
      dataIndex: 'agentName',
      key: 'agentName',
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small" className="action-buttons">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/records/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {user?.role?.name === 'admin' && (
            <Popconfirm
              title="确定要删除这条记录吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div className="page-toolbar">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              带看记录管理
            </Title>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建记录
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchViewingRecordsAsync(filters))}
            >
              刷新
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              导出
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                type="primary"
                onClick={() => setBatchModalVisible(true)}
                loading={batchOperationLoading}
              >
                批量操作 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
          </div>

        {selectedRowKeys.length > 0 && (
          <Alert
            message={`已选择 ${selectedRowKeys.length} 条记录`}
            type="info"
            showIcon
            closable
            onClose={() => setSelectedRowKeys([])}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 筛选器 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索租客、电话、房源..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              value={filters.status}
            >
              <Select.Option value="pending">待确认</Select.Option>
              <Select.Option value="confirmed">已确认</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="业务类型"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('businessType', value)}
              value={filters.businessType}
            >
              <Select.Option value="focus">专注</Select.Option>
              <Select.Option value="joint">合作</Select.Option>
              <Select.Option value="whole">整租</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="数据来源"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('source', value)}
              value={filters.source}
            >
              <Select.Option value="manual">手动录入</Select.Option>
              <Select.Option value="third_party">第三方录入</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={modalMode === 'create' ? '新建带看记录' : '编辑带看记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            viewingStatus: 'pending',
            source: 'manual',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="租客姓名"
                name="tenantName"
                rules={[{ required: true, message: '请输入租客姓名' }]}
              >
                <Input placeholder="请输入租客姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="primaryPhone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="微信号" name="primaryWechat">
                <Input placeholder="请输入微信号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="业务类型"
                name="businessType"
              >
                <Select placeholder="请选择业务类型">
                  <Select.Option value="focus">专注</Select.Option>
                  <Select.Option value="joint">合作</Select.Option>
                  <Select.Option value="whole">整租</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="物业名称"
                name="propertyName"
                rules={[{ required: true, message: '请输入物业名称' }]}
              >
                <Input placeholder="请输入物业名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="房间地址"
                name="roomAddress"
              >
                <Input placeholder="请输入详细地址" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="预约状态"
                name="viewingStatus"
                rules={[{ required: true, message: '请选择预约状态' }]}
              >
                <Select>
                  <Select.Option value="pending">待确认</Select.Option>
                  <Select.Option value="confirmed">已确认</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="偏好看房时间" name="preferredViewingTime">
                <Input placeholder="如：明天下午2-4点" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="备注信息" name="remarks">
            <TextArea
              rows={3}
              placeholder="请输入备注信息"
            />
          </Form.Item>

          <Form.Item label="数据来源" name="source">
            <Select>
              <Select.Option value="manual">手动录入</Select.Option>
              <Select.Option value="third_party">第三方录入</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导出模态框 */}
      <ExportModal
        visible={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onExport={handleExport}
      />

      {/* 批量操作模态框 */}
      <BatchOperationModal
        visible={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        onConfirm={handleBatchUpdate}
        selectedCount={selectedRowKeys.length}
        loading={batchOperationLoading}
             />
    </div>
  );
};

export default ViewingRecords; 