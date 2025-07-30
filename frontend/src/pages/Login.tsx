import React, { useEffect } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { loginAsync, clearError } from '../store/slices/authSlice';
import type { LoginRequest } from '../types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [form] = Form.useForm();

  // 获取重定向地址
  const from = (location.state as any)?.from?.pathname || '/records';

  useEffect(() => {
    // 清除之前的错误信息
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // 如果已登录，重定向到目标页面
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (values: LoginRequest) => {
    dispatch(loginAsync(values));
  };

  const handleFormChange = () => {
    // 输入时清除错误信息
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <Title level={2} className="login-title">
          房源带看管理系统
        </Title>
        
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          请输入您的账号密码登录系统
        </Text>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleSubmit}
          onChange={handleFormChange}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8个字符' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                message: '密码至少8位，必须包含大小写字母和数字'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: 48 }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            测试账户：
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            管理员: admin / Admin123! | 经纪人: agent001 / Agent123!
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login; 