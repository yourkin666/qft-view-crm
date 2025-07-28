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

  useEffect(() => {
    if (id) {
      dispatch(fetchViewingRecordAsync(Number(id)));
    }
    return () => {
      dispatch(clearCurrentRecord());
    };
  }, [dispatch, id]);

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
    if (currentRecord) {
      setEditModalVisible(true);
    } else {
      message.error('无法加载记录数据，请刷新页面重试');
    }
  };

  const handleEditModalAfterOpen = (open: boolean) => {
    if (open && currentRecord) {
      // 模态框打开后设置表单值
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

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentRecord) {
    return (
      <div className="empty-container">
        <p>记录不存在或已被删除</p>
        <Button onClick={() => navigate('/records')}>返回列表</Button>
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
            带看记录详情
          </Title>
        </div>
        
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            disabled={!currentRecord}
            loading={loading}
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
        title="编辑带看记录"
        open={editModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setEditModalVisible(false)}
        afterOpenChange={handleEditModalAfterOpen}
        confirmLoading={editLoading}
        width={800}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          onFinishFailed={() => {
            message.error('请检查表单填写是否正确');
          }}
          preserve={false}
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
        onCancel={() => setStatusModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
          initialValues={{
            viewingStatus: currentRecord.viewingStatus,
            remarks: currentRecord.remarks,
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