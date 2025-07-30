import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Spin,
  Typography,
  Row,
  Col,
  DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  WechatOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import {
  fetchViewingRecordAsync,
  updateViewingRecordAsync,
  deleteViewingRecordAsync,
  clearCurrentRecord,
} from '../store/slices/viewingRecordsSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ViewingRecordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentRecord, loading } = useAppSelector((state) => state.viewingRecords);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 确保表单实例在组件卸载时被正确清理
  useEffect(() => {
    return () => {
      form.resetFields();
      editForm.resetFields();
    };
  }, [form, editForm]);

  useEffect(() => {
    if (id) {
      dispatch(fetchViewingRecordAsync(Number(id)));
    }
    return () => {
      dispatch(clearCurrentRecord());
      // 清理表单实例
      form.resetFields();
      editForm.resetFields();
    };
  }, [dispatch, id, form, editForm]);

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

  const handleStatusUpdate = async (values: any) => {
    try {
      await dispatch(updateViewingRecordAsync({
        id: Number(id),
        data: values,
      })).unwrap();
      message.success('状态更新成功');
      setStatusModalVisible(false);
      dispatch(fetchViewingRecordAsync(Number(id)));
    } catch (error: any) {
      console.error('Status update failed:', error);
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('状态更新失败，请重试');
      }
    }
  };

  const handleEdit = () => {
    if (loading) {
      message.warning('正在加载数据，请稍候...');
      return;
    }

    if (!currentRecord) {
      console.error('No currentRecord available for editing');
      message.error('无法加载记录数据，请刷新页面重试');
      return;
    }

    console.log('Opening edit modal with record:', currentRecord);

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
    };

    // 设置表单值并打开模态框
    editForm.setFieldsValue(formValues);
    console.log('Form values set:', formValues);
    setEditModalVisible(true);
  };

  // 移除原来的useEffect，因为我们现在在handleEdit中直接设置表单值
  // useEffect(() => {
  //   if (editModalVisible && currentRecord) {
  //     console.log('Setting form values:', currentRecord);
  //     const formValues = {
  //       tenantName: currentRecord.tenantName || '',
  //       primaryPhone: currentRecord.primaryPhone || '',
  //       primaryWechat: currentRecord.primaryWechat || '',
  //       roomAddress: currentRecord.roomAddress || '',
  //       propertyName: currentRecord.propertyName || '',
  //       businessType: currentRecord.businessType || undefined,
  //       viewingStatus: currentRecord.viewingStatus || 'pending',
  //       viewingDate: currentRecord.viewingDate ? dayjs(currentRecord.viewingDate) : undefined,
  //       remarks: currentRecord.remarks || '',
  //       source: currentRecord.source || 'manual',
  //     };

  //     // 使用 setTimeout 确保在下一个事件循环中设置表单值
  //     setTimeout(() => {
  //       editForm.setFieldsValue(formValues);
  //       console.log('Form values set successfully:', formValues);
  //     }, 100); // 增加延迟时间，确保模态框完全打开
  //   }
  // }, [editModalVisible, currentRecord, editForm]);

  // 额外的数据验证
  useEffect(() => {
    if (currentRecord) {
      console.log('Current record updated:', {
        id: currentRecord.id,
        tenantName: currentRecord.tenantName,
        primaryPhone: currentRecord.primaryPhone,
        viewingStatus: currentRecord.viewingStatus,
        hasData: !!currentRecord.tenantName
      });
    }
  }, [currentRecord]);

  const handleEditModalAfterOpen = (open: boolean) => {
    // 简化这个方法，只用于调试
    if (open && currentRecord) {
      console.log('Modal opened, currentRecord:', currentRecord);
      console.log('Edit modal visible:', editModalVisible);

      // 确保表单有数据，如果没有则重新设置
      const currentFormValues = editForm.getFieldsValue();
      console.log('Current form values after modal open:', currentFormValues);

      if (!currentFormValues.tenantName && currentRecord.tenantName) {
        console.log('Form values missing, setting again...');
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
        };
        editForm.setFieldsValue(formValues);
      }
    }
  };

  const handleEditSubmit = async (values: any) => {
    setEditLoading(true);

    try {
      // 表单验证
      await editForm.validateFields();

      const requestData = {
        tenantName: values.tenantName,
        primaryPhone: values.primaryPhone,
        primaryWechat: values.primaryWechat,
        roomAddress: values.roomAddress,
        propertyName: values.propertyName,
        businessType: values.businessType,
        viewingStatus: values.viewingStatus,
        viewingDate: values.viewingDate ? values.viewingDate.toISOString() : null,
        remarks: values.remarks,
        source: values.source,
      };

      await dispatch(updateViewingRecordAsync({
        id: Number(id),
        data: requestData,
      })).unwrap();

      message.success('记录更新成功');
      setEditModalVisible(false);
      editForm.resetFields();
      dispatch(fetchViewingRecordAsync(Number(id)));
    } catch (error: any) {
      console.error('Edit failed:', error);
      if (typeof error === 'string') {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('记录更新失败，请重试');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteViewingRecordAsync(Number(id))).unwrap();
      message.success('删除成功');
      navigate('/records');
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

  // 渲染加载状态
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        {/* 隐藏的表单，确保表单实例被正确连接 */}
        <div style={{ display: 'none' }}>
          <Form form={form} />
          <Form form={editForm} />
        </div>
      </div>
    );
  }

  // 渲染空状态
  if (!currentRecord) {
    return (
      <div className="empty-container">
        <p>记录不存在或已被删除</p>
        <Button onClick={() => navigate('/records')}>返回列表</Button>
        {/* 隐藏的表单，确保表单实例被正确连接 */}
        <div style={{ display: 'none' }}>
          <Form form={form} />
          <Form form={editForm} />
        </div>
      </div>
    );
  }

  const businessTypeMap = {
    focus: '专注',
    joint: '合作',
    whole: '整租',
  };

  const sourceMap = {
    manual: '手动录入',
    third_party: '第三方录入',
  };

  return (
    <div>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/records')}
            style={{ marginRight: 16 }}
          >
            返回列表
          </Button>
          <Title level={3} style={{ margin: 0, display: 'inline' }}>
            线索记录详情
          </Title>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            disabled={!currentRecord || loading}
            loading={loading}
            title={!currentRecord ? '记录数据加载中...' : '编辑记录'}
          >
            编辑记录
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => setStatusModalVisible(true)}
          >
            更新状态
          </Button>
          {user?.role?.name === 'admin' && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确定要删除这条记录吗？此操作不可恢复。',
                  onOk: handleDelete,
                });
              }}
            >
              删除记录
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* 基本信息 */}
        <Col xs={24} lg={16}>
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="记录ID" span={1}>
                {currentRecord.id}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态" span={1}>
                <Tag color={getStatusColor(currentRecord.viewingStatus)} className="status-tag">
                  {getStatusText(currentRecord.viewingStatus)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="租客姓名" span={1}>
                <Space>
                  <UserOutlined />
                  {currentRecord.tenantName || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="联系电话" span={1}>
                <Space>
                  <PhoneOutlined />
                  {currentRecord.primaryPhone || '-'}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="微信号" span={1}>
                <Space>
                  <WechatOutlined />
                  {currentRecord.primaryWechat || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="业务类型" span={1}>
                {currentRecord.businessType ? (
                  <Tag>{businessTypeMap[currentRecord.businessType as keyof typeof businessTypeMap]}</Tag>
                ) : '-'}
              </Descriptions.Item>

              <Descriptions.Item label="线索来源平台" span={1}>
                {currentRecord.sourcePlatform ? (
                  <Tag color="blue">{currentRecord.sourcePlatform}</Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="客户需求房源" span={1}>
                {currentRecord.customerRoomType ? (
                  <Tag color="green">{currentRecord.customerRoomType}</Tag>
                ) : '-'}
              </Descriptions.Item>

              <Descriptions.Item label="客户来源房源价格" span={1}>
                {currentRecord.sourcePropertyPrice ?
                  `¥${currentRecord.sourcePropertyPrice.toLocaleString()}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="当前跟进平台" span={1}>
                {currentRecord.followUpPlatform ? (
                  <Tag color="purple">{currentRecord.followUpPlatform}</Tag>
                ) : '-'}
              </Descriptions.Item>

              <Descriptions.Item label="客户状态" span={1}>
                {currentRecord.customerStatus ? (
                  <Tag color={
                    currentRecord.customerStatus === '接洽中' ? 'orange' :
                      currentRecord.customerStatus === '已约带看' ? 'blue' :
                        currentRecord.customerStatus === '客户丢失' ? 'red' : 'default'
                  }>
                    {currentRecord.customerStatus}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              {currentRecord.leadViewingStatus && (
                <Descriptions.Item label="带看状态" span={1}>
                  <Tag color="cyan">{currentRecord.leadViewingStatus}</Tag>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="物业名称" span={2}>
                <Space>
                  <HomeOutlined />
                  {currentRecord.propertyName || '-'}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="房间地址" span={2}>
                {currentRecord.roomAddress || '-'}
              </Descriptions.Item>

              <Descriptions.Item label="偏好看房时间" span={2}>
                <Space>
                  <ClockCircleOutlined />
                  {currentRecord.preferredViewingTime || '-'}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="数据来源" span={1}>
                <Tag>{sourceMap[currentRecord.source as keyof typeof sourceMap] || currentRecord.source}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={1}>
                {dayjs(currentRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>

              <Descriptions.Item label="更新时间" span={2}>
                {dayjs(currentRecord.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>

              {currentRecord.remarks && (
                <Descriptions.Item label="备注信息" span={2}>
                  <Text>{currentRecord.remarks}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* 带看信息 */}
          {(currentRecord.customerStatus === '已约带看' || currentRecord.viewingProperties || currentRecord.customerFeedback) && (
            <Card title="带看信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered>
                {currentRecord.viewingProperties && (
                  <Descriptions.Item label="带看房源">
                    <Text>{currentRecord.viewingProperties}</Text>
                  </Descriptions.Item>
                )}

                {currentRecord.viewingDate && (
                  <Descriptions.Item label="带看日期">
                    <Space>
                      <ClockCircleOutlined />
                      {dayjs(currentRecord.viewingDate).format('YYYY-MM-DD HH:mm')}
                    </Space>
                  </Descriptions.Item>
                )}

                {currentRecord.customerFeedback && (
                  <Descriptions.Item label="客户反馈">
                    <Text>{currentRecord.customerFeedback}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* AI相关信息 */}
          {(currentRecord.originalQuery || currentRecord.aiSummary || currentRecord.requirementsJson) && (
            <Card title="AI分析信息">
              <Descriptions column={1} bordered>
                {currentRecord.originalQuery && (
                  <Descriptions.Item label="原始查询">
                    <Text>{currentRecord.originalQuery}</Text>
                  </Descriptions.Item>
                )}

                {currentRecord.aiSummary && (
                  <Descriptions.Item label="AI总结">
                    <Text>{currentRecord.aiSummary}</Text>
                  </Descriptions.Item>
                )}

                {currentRecord.requirementsJson && (
                  <Descriptions.Item label="需求详情">
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(JSON.parse(currentRecord.requirementsJson), null, 2)}
                    </pre>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* 侧边栏信息 */}
        <Col xs={24} lg={8}>
          {/* 经纪人信息 */}
          <Card title="经纪人信息" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="姓名">
                {currentRecord.agentName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="电话">
                {currentRecord.agentPhone || '-'}
              </Descriptions.Item>
              {currentRecord.agent && (
                <Descriptions.Item label="用户名">
                  {currentRecord.agent.username}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* 房源信息 */}
          {currentRecord.property && (
            <Card title="关联房源">
              <Descriptions column={1}>
                <Descriptions.Item label="房源名称">
                  {currentRecord.property.name}
                </Descriptions.Item>
                <Descriptions.Item label="房源地址">
                  {currentRecord.property.address || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      {/* 编辑记录模态框 */}
      <Modal
        title="编辑线索记录"
        open={editModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => {
          console.log('Edit modal cancelled');
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        afterClose={() => {
          console.log('Edit modal closed');
          editForm.resetFields();
        }}
        afterOpenChange={handleEditModalAfterOpen}
        confirmLoading={editLoading}
        width={800}
        destroyOnClose={false}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          onFinishFailed={() => {
            message.error('请检查表单填写是否正确');
          }}
          preserve={true}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="客户姓名"
                name="tenantName"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input placeholder="请输入客户姓名" />
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
              <Form.Item label="业务类型" name="businessType">
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
                label="房源地址"
                name="roomAddress"
                rules={[{ required: true, message: '请输入房源地址' }]}
              >
                <Input placeholder="请输入房源地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="房源类型" name="propertyName">
                <Input placeholder="如：两室一厅" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item label="数据来源" name="source">
            <Select>
              <Select.Option value="manual">手动录入</Select.Option>
              <Select.Option value="third_party">第三方录入</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 状态更新模态框 */}
      <Modal
        title="更新状态"
        open={statusModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setStatusModalVisible(false);
          form.resetFields();
        }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
          initialValues={{
            viewingStatus: currentRecord?.viewingStatus || 'pending',
            remarks: currentRecord?.remarks || '',
          }}
        >
          <Form.Item
            label="预约状态"
            name="viewingStatus"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="pending">待确认</Select.Option>
              <Select.Option value="confirmed">已确认</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="备注信息" name="remarks">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewingRecordDetail; 