import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Alert, message } from 'antd';
import type { BatchUpdateRequest } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface BatchOperationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (data: BatchUpdateRequest) => Promise<void>;
  selectedCount: number;
  loading?: boolean;
}

const BatchOperationModal: React.FC<BatchOperationModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  selectedCount,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onConfirm(values);
      form.resetFields();
      message.success('批量操作成功');
      onCancel();
    } catch (error: any) {
      console.error('批量操作失败:', error);
      message.error(error.message || '批量操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="批量操作"
      open={visible}
      onCancel={handleCancel}
      width={500}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting || loading}
          onClick={handleSubmit}
        >
          确认批量更新
        </Button>,
      ]}
    >
      <Alert
        message={`已选择 ${selectedCount} 条记录`}
        type="info"
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'confirmed',
        }}
      >
        <Form.Item
          name="status"
          label="更新状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择要更新的状态">
            <Option value="pending">待确认</Option>
            <Option value="confirmed">已确认</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="remarks"
          label="更新备注"
        >
          <TextArea
            rows={3}
            placeholder="可选：为批量更新添加备注信息"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BatchOperationModal; 