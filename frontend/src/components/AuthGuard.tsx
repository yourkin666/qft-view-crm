import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { getCurrentUserAsync } from '../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    // 如果有token但没有用户信息，尝试获取用户信息
    if (token && !isAuthenticated && !loading) {
      dispatch(getCurrentUserAsync());
    }
  }, [token, isAuthenticated, loading, dispatch]);

  // 正在加载用户信息
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // 未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已认证，渲染子组件
  return <>{children}</>;
};

export default AuthGuard; 