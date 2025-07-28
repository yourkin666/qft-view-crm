import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';

// 懒加载页面组件
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ViewingRecords = lazy(() => import('./pages/ViewingRecords'));
const ViewingRecordDetail = lazy(() => import('./pages/ViewingRecordDetail'));
const Users = lazy(() => import('./pages/Users'));
const ApiKeys = lazy(() => import('./pages/ApiKeys'));

import './App.css';

// 加载动画组件
const PageSpin = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          <Router>
            <div className="App">
              <Suspense fallback={<PageSpin />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/*"
                    element={
                      <AuthGuard>
                        <Layout>
                          <ErrorBoundary>
                            <Suspense fallback={<PageSpin />}>
                              <Routes>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/records" element={<ViewingRecords />} />
                                <Route path="/records/:id" element={<ViewingRecordDetail />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/api-keys" element={<ApiKeys />} />
                              </Routes>
                            </Suspense>
                          </ErrorBoundary>
                        </Layout>
                      </AuthGuard>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
