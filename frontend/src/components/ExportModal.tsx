import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  message,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/hooks/redux';
import { exportService, ExportParams } from '@/services/export';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface ExportModalProps {
  visible: boolean;
  onCancel: () => void;
  onExport?: (data: any) => Promise<void>;
  defaultFilters?: Partial<ExportParams>;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onCancel,
  onExport,
  defaultFilters = {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const { user } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        format: 'excel',
        ...defaultFilters,
      });
    }
  }, [visible, defaultFilters, form]);

  const handleExport = async (values: any) => {
    setLoading(true);
    try {
      if (onExport) {
        await onExport(values);
        onCancel();
        return;
      }
      
      const params: ExportParams = {
        format: values.format,
        status: values.status,
        agentId: values.agentId,
        source: values.source,
        businessType: values.businessType,
      };

      // 处理日期范围
      if (values.dateRange) {
        params.dateFrom = values.dateRange[0].startOf('day').toISOString();
        params.dateTo = values.dateRange[1].endOf('day').toISOString();
      }

      await exportService.exportViewingRecords(params);
      message.success('导出成功');
      onCancel();
    } catch (error: any) {
      console.error('Export failed:', error);
      message.error(error.response?.data?.error?.message || '导出失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="导出带看记录"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleExport}
        initialValues={{
          format: 'excel',
        }}
      >
        <Text type="secondary">
          选择导出条件和格式，系统将根据您的权限和筛选条件导出相应的数据。
        </Text>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="导出格式"
              name="format"
              rules={[{ required: true, message: '请选择导出格式' }]}
            >
              <Select>
                <Option value="excel">Excel (.xlsx)</Option>
                <Option value="pdf" disabled>PDF (即将支持)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="预约状态" name="status">
              <Select placeholder="全部状态" allowClear>
                <Option value="pending">待确认</Option>
                <Option value="confirmed">已确认</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="业务类型" name="businessType">
              <Select placeholder="全部类型" allowClear>
                <Option value="focus">专注</Option>
                <Option value="joint">联合</Option>
                <Option value="whole">整租</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="数据来源" name="source">
              <Select placeholder="全部来源" allowClear>
                <Option value="manual">手动录入</Option>
                <Option value="third_party">第三方录入</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 管理员可以选择经纪人 */}
        {user?.role?.name === 'admin' && (
          <Form.Item label="经纪人" name="agentId">
            <Select placeholder="全部经纪人" allowClear showSearch>
              {users
                .filter(u => u.role.name === 'agent')
                .map(agent => (
                  <Option key={agent.id} value={agent.id}>
                    {agent.fullName} ({agent.username})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item label="时间范围" name="dateRange">
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['开始日期', '结束日期']}
            showTime={false}
            format="YYYY-MM-DD"
            allowClear
          />
        </Form.Item>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<DownloadOutlined />}
              loading={loading}
            >
              开始导出
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default ExportModal; 