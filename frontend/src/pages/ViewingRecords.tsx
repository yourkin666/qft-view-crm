import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
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
  Statistic,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
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
  fetchStatisticsAsync,
} from '../store/slices/viewingRecordsSlice';

import { fetchUsersAsync } from '../store/slices/usersSlice';
import ExportModal from '@/components/ExportModal';
import BatchOperationModal from '@/components/BatchOperationModal';
import MobileRecordCard from '@/components/MobileRecordCard';
import { exportDataAPI } from '@/services/export';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

// 枚举选项定义
const SOURCE_PLATFORM_OPTIONS = [
  { label: '企业微信', value: '企业微信' },
  { label: '个人微信', value: '个人微信' },
  { label: '小红书', value: '小红书' },
  { label: '闲鱼', value: '闲鱼' },
  { label: '抖音', value: '抖音' },
  { label: '视频号', value: '视频号' },
  { label: '贝壳', value: '贝壳' },
  { label: '58同城', value: '58同城' },
];

const CUSTOMER_ROOM_TYPE_OPTIONS = [
  { label: '单间', value: '单间' },
  { label: '两房', value: '两房' },
  { label: '三房', value: '三房' },
];

const CUSTOMER_STATUS_OPTIONS = [
  { label: '接洽中', value: '接洽中' },
  { label: '已约带看', value: '已约带看' },
  { label: '客户丢失', value: '客户丢失' },
];

const LEAD_VIEWING_STATUS_OPTIONS = [
  { label: '一次带看', value: '一次带看' },
  { label: '二次带看', value: '二次带看' },
  { label: '三次带看', value: '三次带看' },
];

import { useResponsive } from '../hooks/useResponsive';

const ViewingRecords: React.FC = memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isMobile } = useResponsive();
  const { user } = useAppSelector((state) => state.auth);
  const { records, pagination, loading, filters, batchOperationLoading, statistics } = useAppSelector((state) => state.viewingRecords);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [form] = Form.useForm();
  const [customerStatus, setCustomerStatus] = useState<string>('接洽中');

  useEffect(() => {
    dispatch(fetchViewingRecordsAsync(filters));
    dispatch(fetchStatisticsAsync());
    // 只有管理员需要获取用户列表（用于导出功能的经纪人选择器）
    if (user?.role?.name === 'admin') {
      dispatch(fetchUsersAsync());
    }
  }, [dispatch, filters, user?.role?.name]);

  // 处理编辑模式时填充表单数据
  useEffect(() => {
    if (modalVisible && modalMode === 'edit' && currentRecord) {
      console.log('Setting form values for edit mode:', currentRecord);
      console.log('关键字段检查:', {
        sourcePlatform: currentRecord.sourcePlatform,
        customerRoomType: currentRecord.customerRoomType,
        sourcePropertyPrice: currentRecord.sourcePropertyPrice,
        followUpPlatform: currentRecord.followUpPlatform
      });

      // 准备表单数据
      const formValues = {
        tenantName: currentRecord.tenantName || '',
        primaryPhone: currentRecord.primaryPhone || '',
        primaryWechat: currentRecord.primaryWechat || '',
        roomAddress: currentRecord.roomAddress || '',
        propertyName: currentRecord.propertyName || '',
        businessType: currentRecord.businessType || undefined,
        viewingStatus: currentRecord.viewingStatus || 'pending',
        viewingDate: currentRecord.viewingDate ? dayjs(currentRecord.viewingDate) : undefined,
        remarks: currentRecord.remarks || '',
        source: currentRecord.source || 'manual',
        customerStatus: currentRecord.customerStatus || '接洽中',
        customerRoomType: currentRecord.customerRoomType || '',
        leadViewingStatus: currentRecord.leadViewingStatus || undefined,
        viewingProperties: currentRecord.viewingProperties || [],
        customerFeedback: currentRecord.customerFeedback || '',
        // 添加缺失的四个关键字段
        sourcePlatform: currentRecord.sourcePlatform || undefined,
        sourcePropertyPrice: currentRecord.sourcePropertyPrice || undefined,
        followUpPlatform: currentRecord.followUpPlatform || undefined,
        // 添加更多字段
        budget: currentRecord.budget || '',
        preferredLocation: currentRecord.preferredLocation || '',
        requirements: currentRecord.requirements || '',
        contactMethod: currentRecord.contactMethod || '',
        followUpDate: currentRecord.followUpDate ? dayjs(currentRecord.followUpDate) : undefined,
      };

      // 设置表单值
      form.setFieldsValue(formValues);

      // 同步客户状态
      if (currentRecord.customerStatus) {
        setCustomerStatus(currentRecord.customerStatus);
      }

      console.log('Form values set successfully:', formValues);
      console.log('关键字段在表单中的值:', {
        sourcePlatform: formValues.sourcePlatform,
        customerRoomType: formValues.customerRoomType,
        sourcePropertyPrice: formValues.sourcePropertyPrice,
        followUpPlatform: formValues.followUpPlatform
      });
    } else if (modalVisible && modalMode === 'create') {
      // 创建模式时重置表单
      form.resetFields();
      setCustomerStatus('接洽中');
    }
  }, [modalVisible, modalMode, currentRecord, form]);

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

  const handleFilterChange = useCallback((key: string, value: any) => {
    dispatch(setFilters({ ...filters, [key]: value, page: 1 }));
  }, [dispatch, filters]);

  const handleTableChange = useCallback((paginationConfig: any) => {
    dispatch(setFilters({
      ...filters,
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  }, [dispatch, filters]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchViewingRecordsAsync(filters));
  }, [dispatch, filters]);

  const handleCreate = useCallback(() => {
    setModalMode('create');
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback((record: any) => {
    setModalMode('edit');
    setCurrentRecord(record);
    setModalVisible(true);
  }, []);



  const handleView = useCallback((record: any) => {
    navigate(`/records/${record.id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (id: number) => {
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
  }, [dispatch]);

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      console.log('表单数据:', values);

      const recordData = {
        ...values,
        viewingDate: values.viewingDate ? values.viewingDate.toISOString() : null,
      };

      let result;
      if (modalMode === 'create') {
        result = await dispatch(createViewingRecordAsync(recordData));
      } else if (currentRecord) {
        result = await dispatch(updateViewingRecordAsync({
          id: currentRecord.id,
          data: recordData
        }));
      }

      if (result && result.type.endsWith('/fulfilled')) {
        message.success(modalMode === 'create' ? '创建成功!' : '更新成功!');
        setModalVisible(false);
        form.resetFields();
        setCustomerStatus('接洽中');
        // 刷新列表
        dispatch(fetchViewingRecordsAsync(filters));
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('Operation failed:', error);
      message.error(modalMode === 'create' ? '创建记录失败' : '更新记录失败');
    }
  }, [dispatch, form, modalMode, currentRecord, filters]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
    setCurrentRecord(null);
    setCustomerStatus('接洽中');
  }, [form]);

  const handleExport = async (data: any) => {
    try {
      await exportDataAPI(data);
      message.success('导出成功');
    } catch (error: any) {
      console.error('Export failed:', error);
      message.error(error.response?.data?.error?.message || '导出失败');
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
  const columns = useMemo(() => [
    {
      title: '租客信息',
      key: 'tenant',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.tenantName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.primaryPhone}</div>
          {record.customerRoomType && (
            <Tag color="blue">{record.customerRoomType}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '客户状态',
      key: 'customerStatus',
      render: (record: any) => (
        <div>
          <Tag color={
            record.customerStatus === '接洽中' ? 'orange' :
              record.customerStatus === '已约带看' ? 'blue' :
                record.customerStatus === '客户丢失' ? 'red' : 'default'
          }>
            {record.customerStatus || '未设置'}
          </Tag>
          {record.leadViewingStatus && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              {record.leadViewingStatus}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '平台信息',
      key: 'platform',
      render: (record: any) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            来源：{record.sourcePlatform || '-'}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>
            跟进：{record.followUpPlatform || '-'}
          </div>
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
          {record.sourcePropertyPrice && (
            <div style={{ fontSize: 11, color: '#999' }}>
              ¥{record.sourcePropertyPrice.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '系统状态',
      dataIndex: 'viewingStatus',
      key: 'viewingStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
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
  ], [handleView, handleEdit, handleDelete]);

  // 移动端过滤器内容
  const renderMobileFilters = useCallback(() => (
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
  ), [handleSearch, handleFilterChange, filters, handleCreate]);

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={2} style={{ margin: 0, fontSize: isMobile ? 18 : 24 }}>
          线索记录管理
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
            />
          </Card>
        </Col>
      </Row>

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
        title={modalMode === 'create' ? '新建线索记录' : '编辑线索记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={isMobile ? '90%' : 800}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleModalOk}>
            {modalMode === 'create' ? '创建' : '保存'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalOk}
          initialValues={{
            viewingStatus: 'pending',
            source: 'manual',
            customerStatus: '接洽中',
          }}
          onValuesChange={(changedValues) => {
            if (changedValues.customerStatus) {
              setCustomerStatus(changedValues.customerStatus);
            }
          }}
        >
          {/* 基础信息部分 */}
          <Divider orientation="left">基础信息</Divider>

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="客户姓名"
                name="tenantName"
                tooltip="客户的真实姓名或称呼"
              >
                <Input placeholder="请输入客户姓名" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="联系电话"
                name="primaryPhone"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
                tooltip="客户的主要联系方式"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="线索来源平台"
                name="sourcePlatform"
                rules={[{ required: true, message: '请选择线索来源平台' }]}
                tooltip="记录客户首次接触的平台渠道"
              >
                <Select placeholder="请选择线索来源平台">
                  {SOURCE_PLATFORM_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="客户需求房源"
                name="customerRoomType"
                rules={[{ required: true, message: '请选择客户需求房源类型' }]}
                tooltip="客户表达的房屋类型需求"
              >
                <Select placeholder="请选择客户需求房源类型">
                  {CUSTOMER_ROOM_TYPE_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="客户来源房源价格"
                name="sourcePropertyPrice"
                rules={[
                  { required: true, message: '请输入客户来源房源价格' },
                  {
                    type: 'number',
                    min: 100,
                    max: 100000,
                    message: '价格应在100-100000元之间'
                  },
                ]}
              >
                <InputNumber
                  placeholder="请输入价格"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="当前跟进平台"
                name="followUpPlatform"
                rules={[{ required: true, message: '请选择当前跟进平台' }]}
                tooltip="选择主要使用的沟通平台"
              >
                <Select placeholder="请选择当前跟进平台">
                  {SOURCE_PLATFORM_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="客户状态"
                name="customerStatus"
                rules={[{ required: true, message: '请选择客户状态' }]}
                tooltip="根据沟通进展选择合适的状态，状态变更将影响后续表单显示"
              >
                <Select
                  placeholder="请选择客户状态"
                  onChange={(value) => {
                    setCustomerStatus(value);
                    // 当状态不是"已约带看"时，清空带看相关字段
                    if (value !== '已约带看') {
                      form.setFieldsValue({
                        leadViewingStatus: undefined,
                        viewingProperties: undefined,
                        customerFeedback: undefined
                      });
                    }
                  }}
                >
                  {CUSTOMER_STATUS_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item label="微信号" name="primaryWechat">
                <Input placeholder="请输入微信号" />
              </Form.Item>
            </Col>
          </Row>

          {/* 带看信息部分 - 仅在客户状态为"已约带看"时显示 */}
          {(customerStatus === '已约带看' || form.getFieldValue('customerStatus') === '已约带看') && (
            <>
              <Divider orientation="left">带看信息</Divider>

              <Row gutter={isMobile ? 0 : 16}>
                <Col span={isMobile ? 24 : 12}>
                  <Form.Item
                    label="带看状态"
                    name="leadViewingStatus"
                    rules={[{ required: true, message: '请选择带看状态' }]}
                  >
                    <Select placeholder="请选择带看状态">
                      {LEAD_VIEWING_STATUS_OPTIONS.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={isMobile ? 24 : 12}>
                  <Form.Item
                    label="带看日期"
                    name="viewingDate"
                    rules={[{ required: true, message: '请选择带看日期' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      showTime
                      placeholder="选择带看时间"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="带看房源"
                name="viewingProperties"
                extra="支持多个房源，用逗号分隔"
              >
                <TextArea
                  rows={2}
                  placeholder="请输入带看房源信息，如：阳光小区101室，绿地花园203室"
                />
              </Form.Item>

              <Form.Item
                label="客户反馈"
                name="customerFeedback"
              >
                <TextArea
                  rows={3}
                  placeholder="请输入客户对带看的反馈"
                />
              </Form.Item>
            </>
          )}

          {/* 其他信息部分 */}
          <Divider orientation="left">其他信息</Divider>

          <Row gutter={isMobile ? 0 : 16}>
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
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="系统带看状态"
                name="viewingStatus"
                rules={[{ required: true, message: '请选择系统带看状态' }]}
              >
                <Select>
                  <Select.Option value="pending">待确认</Select.Option>
                  <Select.Option value="confirmed">已确认</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="房源地址"
                name="roomAddress"
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
});

export default ViewingRecords; 