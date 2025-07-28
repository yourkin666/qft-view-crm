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
  DatePicker,
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
    dispatch(fetchUsersAsync());
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

  const handleRefresh = () => {
    dispatch(fetchViewingRecordsAsync(filters));
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
      viewingDate: record.viewingDate ? dayjs(record.viewingDate) : null,
    });
    setModalVisible(true);
  };

  const handleView = (record: any) => {
    navigate(`/records/${record.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteViewingRecordAsync(id)).unwrap();
      message.success('删除成功');
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

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const requestData: CreateViewingRecordRequest = {
        tenantName: values.tenantName,
        primaryPhone: values.primaryPhone,
        primaryWechat: values.primaryWechat,
        roomAddress: values.roomAddress,
        propertyName: values.propertyName,
        businessType: values.businessType,
        viewingStatus: values.viewingStatus,
        viewingDate: values.viewingDate?.toISOString(),
        remarks: values.remarks,
        source: values.source,
      };

      if (modalMode === 'create') {
        await dispatch(createViewingRecordAsync(requestData)).unwrap();
        message.success('创建成功');
      } else {
        await dispatch(updateViewingRecordAsync({ 
          id: currentRecord.id, 
          data: requestData 
        })).unwrap();
        message.success('更新成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      // 刷新数据
      dispatch(fetchViewingRecordsAsync(filters));
    } catch (error: any) {
      console.error('Operation failed:', error);
      // 显示具体的错误信息
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error(modalMode === 'create' ? '创建失败，请重试' : '更新失败，请重试');
      }
    }
  };

  const handleExport = async (data: any) => {
    try {
      await exportService.exportViewingRecords(data);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const handleBatchUpdate = async (data: { status: string; remarks?: string }) => {
    try {
      await dispatch(batchUpdateViewingRecordsAsync({
        ids: selectedRowKeys,
        status: data.status as any,
        remarks: data.remarks,
      })).unwrap();
      setSelectedRowKeys([]);
      setBatchModalVisible(false);
      message.success('批量更新成功');
      // 刷新数据
      dispatch(fetchViewingRecordsAsync(filters));
    } catch (error: any) {
      console.error('Batch update failed:', error);
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('批量更新失败，请重试');
      }
    }
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys as number[]);
    },
  };

  // 桌面端表格列配置
  const columns = [
    {
      title: '租客信息',
      key: 'tenant',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.tenantName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.primaryPhone}</div>
        </div>
      ),
    },
    {
      title: '房源信息',
      key: 'property',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.roomAddress}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.propertyName}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'viewingStatus',
      key: 'viewingStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '来源渠道',
      key: 'channel',
      render: (record: any) => (
        <div>
          <Tag color={record.channelType === 'API' ? 'blue' : 'green'}>
            {record.channel || '手动录入'}
          </Tag>
          <div style={{ fontSize: 11, color: '#999' }}>
            {record.channelType || '手动'}
          </div>
        </div>
      ),
    },
    {
      title: '带看时间',
      dataIndex: 'viewingDate',
      key: 'viewingDate',
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 移动端过滤器内容
  const renderMobileFilters = () => (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索租客、电话、房源..."
          allowClear
          onSearch={handleSearch}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
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
      </div>
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="业务类型"
          allowClear
          style={{ width: '100%' }}
          onChange={(value) => handleFilterChange('businessType', value)}
          value={filters.businessType}
        >
          <Select.Option value="sale">买卖</Select.Option>
          <Select.Option value="rent">租赁</Select.Option>
        </Select>
      </div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          style={{ flex: 1 }}
        >
          刷新
        </Button>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          style={{ flex: 1, marginLeft: 8 }}
        >
          新增记录
        </Button>
      </Space>
    </div>
  );

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={2} style={{ margin: 0, fontSize: isMobile ? 18 : 24 }}>
          带看记录管理
        </Title>
        
        {!isMobile && (
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新增记录
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </Space>
        )}
      </div>

      {/* 移动端过滤器抽屉 */}
      {isMobile && (
        <Drawer
          title="筛选条件"
          placement="bottom"
          onClose={() => setMobileFiltersVisible(false)}
          open={mobileFiltersVisible}
          height={400}
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
                筛选
              </Button>
              <Space size="small">
                <Button 
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => setExportModalVisible(true)}
                >
                  导出
                </Button>
                <Button 
                  type="primary"
                  size="small" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreate}
                >
                  新增
                </Button>
              </Space>
            </Space>
          </Card>
        </Affix>
      )}

      <Card>
        {!isMobile && (
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
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
        )}

        {selectedRowKeys.length > 0 && !isMobile && (
          <Alert
            message={`已选择 ${selectedRowKeys.length} 条记录`}
            type="info"
            showIcon
            closable
            onClose={() => setSelectedRowKeys([])}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 桌面端筛选器 */}
        {!isMobile && (
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
                <Select.Option value="sale">买卖</Select.Option>
                <Select.Option value="rent">租赁</Select.Option>
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
        )}

        {isMobile ? (
          /* 移动端卡片视图 */
          <div>
            {selectedRowKeys.length > 0 && (
              <div style={{ 
                padding: '12px 16px', 
                background: '#f0f2ff',
                marginBottom: 12,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: 13, color: '#1890ff' }}>
                  已选择 {selectedRowKeys.length} 项
                </span>
                <Space size="small">
                  <Button 
                    size="small"
                    onClick={() => setSelectedRowKeys([])}
                  >
                    取消选择
                  </Button>
                  <Button 
                    size="small"
                    type="primary"
                    onClick={() => setBatchModalVisible(true)}
                    loading={batchOperationLoading}
                  >
                    批量操作
                  </Button>
                </Space>
              </div>
            )}
            
            {records.length > 0 ? (
              <div>
                {records.map((record) => (
                  <div key={record.id} style={{ position: 'relative' }}>
                    <input
                      type="checkbox"
                      checked={selectedRowKeys.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRowKeys([...selectedRowKeys, record.id]);
                        } else {
                          setSelectedRowKeys(selectedRowKeys.filter(id => id !== record.id));
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        transform: 'scale(1.2)'
                      }}
                    />
                    <MobileRecordCard
                      record={record}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>
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
                        onClick={() => handleTableChange({ current: pagination.page - 1, pageSize: pagination.pageSize })}
                      >
                        上一页
                      </Button>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                      </span>
                      <Button 
                        size="small"
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                        onClick={() => handleTableChange({ current: pagination.page + 1, pageSize: pagination.pageSize })}
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
        )}
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={modalMode === 'create' ? '新建带看记录' : '编辑带看记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={isMobile ? '90%' : 800}
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
          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="客户姓名"
                name="tenantName"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input placeholder="请输入客户姓名" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
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

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item label="微信号" name="primaryWechat">
                <Input placeholder="请输入微信号" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
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

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="房源地址"
                name="roomAddress"
                rules={[{ required: true, message: '请输入房源地址' }]}
              >
                <Input placeholder="请输入房源地址" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="房源类型"
                name="propertyName"
              >
                <Input placeholder="如：两室一厅" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="带看状态"
                name="viewingStatus"
                rules={[{ required: true, message: '请选择带看状态' }]}
              >
                <Select>
                  <Select.Option value="pending">待确认</Select.Option>
                  <Select.Option value="confirmed">已确认</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item label="带看时间" name="viewingDate">
                <DatePicker 
                  style={{ width: '100%' }}
                  showTime 
                  placeholder="选择带看时间"
                />
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