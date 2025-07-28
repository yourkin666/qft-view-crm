import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ViewingRecords from './pages/ViewingRecords';
import ViewingRecordDetail from './pages/ViewingRecordDetail';
import Users from './pages/Users';
import ApiKeys from './pages/ApiKeys';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/records" element={<ViewingRecords />} />
                        <Route path="/records/:id" element={<ViewingRecordDetail />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/api-keys" element={<ApiKeys />} />
              
                      </Routes>
                    </Layout>
                  </AuthGuard>
                }
              />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
