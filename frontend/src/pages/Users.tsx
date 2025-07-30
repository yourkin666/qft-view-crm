import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
  Select,
  Affix,
  Drawer,
  Dropdown,
  MenuProps,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  FilterOutlined,
  DownOutlined,
  EyeOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchUsersAsync,
  fetchRolesAsync,
  createUserAsync,
  updateUserAsync,
  deleteUserAsync,
  batchUpdateUsersAsync,
  batchDeleteUsersAsync,
  resetPasswordAsync,
  fetchUserStatisticsAsync,
  setFilters,
  clearFilters,
  setSelectedUserIds,
  clearSelectedUserIds,
} from '@/store/slices/usersSlice';
import type { User } from '@/types';
import type { CreateUserRequest, UpdateUserRequest } from '@/services/users';
import dayjs from 'dayjs';
import MobileUserCard from '@/components/MobileUserCard';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

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

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const {
    users,
    loading,
    pagination,
    roles,
    rolesLoading,
    filters,
    selectedUserIds,
    batchLoading
  } = useAppSelector((state) => state.users);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchOperation, setBatchOperation] = useState<'activate' | 'deactivate' | 'delete' | 'changeRole'>('activate');
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  useEffect(() => {
    loadUsers();
    dispatch(fetchRolesAsync());
  }, [dispatch]);

  // 加载用户列表
  const loadUsers = (params?: any) => {
    dispatch(fetchUsersAsync({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      ...params,
    }));
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value }));
    dispatch(fetchUsersAsync({
      page: 1,
      pageSize: pagination.pageSize,
      ...filters,
      search: value,
    }));
  };

  // 处理角色过滤
  const handleRoleFilter = (roleId: number | undefined) => {
    dispatch(setFilters({ roleId }));
    dispatch(fetchUsersAsync({
      page: 1,
      pageSize: pagination.pageSize,
      ...filters,
      roleId,
    }));
  };

  // 处理状态过滤
  const handleStatusFilter = (isActive: boolean | undefined) => {
    dispatch(setFilters({ isActive }));
    dispatch(fetchUsersAsync({
      page: 1,
      pageSize: pagination.pageSize,
      ...filters,
      isActive,
    }));
  };

  // 清除过滤条件
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchUsersAsync({
      page: 1,
      pageSize: pagination.pageSize,
    }));
  };

  // 处理创建/更新用户
  const handleSave = async (values: any) => {
    try {
      if (editingUser) {
        // 编辑用户，包含所有字段
        await dispatch(updateUserAsync({
          id: editingUser.id,
          data: values as UpdateUserRequest
        })).unwrap();
      } else {
        // 创建用户，过滤掉isActive字段
        const { isActive, ...createData } = values;
        await dispatch(createUserAsync(createData as CreateUserRequest)).unwrap();
      }
      // 成功后关闭模态框并重置表单
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      // 错误信息已经由API拦截器处理并显示
      // 这里不需要额外的错误处理，只需要记录错误用于调试
      console.error('Save operation failed:', error);
      // 不关闭模态框，让用户可以修改后重试
    }
  };

  // 处理删除用户
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteUserAsync(id)).unwrap();
      loadUsers();
    } catch (error: any) {
      console.error('Delete failed:', error);
    }
  };

  // 处理密码重置
  const handleResetPassword = async (id: number) => {
    try {
      await dispatch(resetPasswordAsync(id)).unwrap();
    } catch (error: any) {
      console.error('Reset password failed:', error);
    }
  };

  // 处理批量操作
  const handleBatchOperation = async (values: any) => {
    try {
      switch (batchOperation) {
        case 'activate':
          await dispatch(batchUpdateUsersAsync({
            ids: selectedUserIds,
            data: { isActive: true }
          })).unwrap();
          break;
        case 'deactivate':
          await dispatch(batchUpdateUsersAsync({
            ids: selectedUserIds,
            data: { isActive: false }
          })).unwrap();
          break;
        case 'changeRole':
          await dispatch(batchUpdateUsersAsync({
            ids: selectedUserIds,
            data: { roleId: values.roleId }
          })).unwrap();
          break;
        case 'delete':
          await dispatch(batchDeleteUsersAsync({
            ids: selectedUserIds
          })).unwrap();
          break;
      }
      setBatchModalVisible(false);
      batchForm.resetFields();
      dispatch(clearSelectedUserIds());
      loadUsers();
    } catch (error: any) {
      console.error('Batch operation failed:', error);
    }
  };

  // 打开编辑模态框
  const openEditModal = (record?: User) => {
    if (record) {
      setEditingUser(record);
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleUserModalAfterOpen = (open: boolean) => {
    if (open && editingUser) {
      // 模态框打开后设置表单值
      form.setFieldsValue({
        username: editingUser.username,
        fullName: editingUser.fullName,
        phone: editingUser.phone,
        roleId: editingUser.role.id,
        isActive: editingUser.isActive,
      });
    }
  };

  // 批量操作菜单
  const batchMenuItems: MenuProps['items'] = [
    {
      key: 'activate',
      label: '批量激活',
      onClick: () => {
        setBatchOperation('activate');
        setBatchModalVisible(true);
      },
    },
    {
      key: 'deactivate',
      label: '批量禁用',
      onClick: () => {
        setBatchOperation('deactivate');
        setBatchModalVisible(true);
      },
    },
    {
      key: 'changeRole',
      label: '批量修改角色',
      onClick: () => {
        setBatchOperation('changeRole');
        setBatchModalVisible(true);
      },
    },
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: () => {
        setBatchOperation('delete');
        setBatchModalVisible(true);
      },
    },
  ];

  // 表格行选择配置
  const rowSelection: TableRowSelection<User> = {
    selectedRowKeys: selectedUserIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      dispatch(setSelectedUserIds(selectedRowKeys as number[]));
    },
    onSelectAll: (selected: boolean, _selectedRows: User[], _changeRows: User[]) => {
      if (selected) {
        const allIds = users.map(user => user.id);
        dispatch(setSelectedUserIds(allIds));
      } else {
        dispatch(clearSelectedUserIds());
      }
    },
  };

  // 计算统计信息
  const statistics = {
    total: users.length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
    admin: users.filter(user => user.role.name === 'admin').length,
    agent: users.filter(user => user.role.name === 'agent').length,
  };

  // 桌面端表格列配置
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '姓名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: { name: string; description?: string }) => (
        <Tag color={role.name === 'admin' ? 'red' : 'blue'}>
          {role.name === 'admin' ? '管理员' : '经纪人'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '激活' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: User) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="查看统计">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                dispatch(fetchUserStatisticsAsync(record.id)).then((result) => {
                  if (result.payload) {
                    const stats = result.payload as { viewingRecordsCount: number; apiKeysCount: number };
                    Modal.info({
                      title: `用户统计 - ${record.fullName}`,
                      content: (
                        <div style={{ padding: '16px 0' }}>
                          <p>线索记录数量: {stats.viewingRecordsCount}</p>
                          <p>API Key数量: {stats.apiKeysCount}</p>
                        </div>
                      ),
                      width: 400,
                    });
                  }
                });
              }}
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Popconfirm
              title="确定要重置这个用户的密码吗？"
              description="系统将生成临时密码"
              onConfirm={() => handleResetPassword(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" icon={<KeyOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个用户吗？"
              description="删除后无法恢复，请确认操作"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 移动端过滤器内容
  const renderMobileFilters = () => (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Search
          placeholder="搜索用户名、姓名、手机号"
          onSearch={handleSearch}
          style={{ width: '100%' }}
        />
        <Row gutter={8}>
          <Col span={12}>
            <Select
              placeholder="选择角色"
              style={{ width: '100%' }}
              allowClear
              onChange={handleRoleFilter}
              value={filters.roleId}
            >
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name === 'admin' ? '管理员' : '经纪人'}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Select
              placeholder="选择状态"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusFilter}
              value={filters.isActive}
            >
              <Option value={true}>激活</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Col>
        </Row>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={handleClearFilters}>
            清除过滤
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadUsers()}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openEditModal()}
          >
            创建用户
          </Button>
        </Space>
      </Space>
    </div>
  );

  return (
    <div className="users-page">
      <div className="page-header">
        <Title level={2} style={{ fontSize: isMobile ? 18 : 24, marginBottom: 8 }}>
          用户管理
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
          管理系统用户账号和权限，包括管理员和经纪人
        </Text>
      </div>

      {/* 移动端过滤器抽屉 */}
      {isMobile && (
        <Drawer
          title="操作面板"
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
                操作
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => openEditModal()}
              >
                创建用户
              </Button>
            </Space>
          </Card>
        </Affix>
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="总用户数"
              value={statistics.total}
              valueStyle={{
                color: '#1890ff',
                fontSize: isMobile ? 20 : 24
              }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="激活用户"
              value={statistics.active}
              valueStyle={{
                color: '#52c41a',
                fontSize: isMobile ? 20 : 24
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="管理员"
              value={statistics.admin}
              valueStyle={{
                color: '#ff4d4f',
                fontSize: isMobile ? 20 : 24
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="经纪人"
              value={statistics.agent}
              valueStyle={{
                color: '#722ed1',
                fontSize: isMobile ? 20 : 24
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        {!isMobile && (
          <>
            {/* 搜索和过滤区域 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Search
                    placeholder="搜索用户名、姓名、手机号"
                    onSearch={handleSearch}
                    enterButton
                    allowClear
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="选择角色"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={handleRoleFilter}
                    value={filters.roleId}
                  >
                    {roles.map(role => (
                      <Option key={role.id} value={role.id}>
                        {role.name === 'admin' ? '管理员' : '经纪人'}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="选择状态"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={handleStatusFilter}
                    value={filters.isActive}
                  >
                    <Option value={true}>激活</Option>
                    <Option value={false}>禁用</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Space>
                    <Button onClick={handleClearFilters}>
                      清除过滤
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => loadUsers()}
                    >
                      刷新
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* 工具栏 */}
            <div className="page-toolbar" style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openEditModal()}
                >
                  创建用户
                </Button>
                {selectedUserIds.length > 0 && (
                  <Dropdown menu={{ items: batchMenuItems }}>
                    <Button>
                      批量操作 ({selectedUserIds.length}) <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
              </Space>
            </div>
          </>
        )}

        {isMobile ? (
          /* 移动端卡片视图 */
          <div>
            {users.length > 0 ? (
              <div>
                {users.map((user) => (
                  <MobileUserCard
                    key={user.id}
                    user={user}
                    onEdit={openEditModal}
                    onResetPassword={handleResetPassword}
                    onViewStatistics={(id) => {
                      // 显示用户统计信息
                      dispatch(fetchUserStatisticsAsync(id)).then((result) => {
                        if (result.payload) {
                          const stats = result.payload as { viewingRecordsCount: number; apiKeysCount: number };
                          Modal.info({
                            title: `用户统计 - ${users.find(u => u.id === id)?.fullName}`,
                            content: (
                              <div style={{ padding: '16px 0' }}>
                                <p>线索记录数量: {stats.viewingRecordsCount}</p>
                                <p>API Key数量: {stats.apiKeysCount}</p>
                              </div>
                            ),
                            width: 400,
                          });
                        }
                      });
                    }}
                    onDelete={(id) => {
                      Modal.confirm({
                        title: '确定要删除这个用户吗？',
                        content: '删除后无法恢复，请确认操作',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => handleDelete(id),
                      });
                    }}
                  />
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
                        onClick={() => loadUsers({ page: pagination.page - 1, pageSize: pagination.pageSize })}
                      >
                        上一页
                      </Button>
                      <span style={{ fontSize: 12, color: '#666' }}>
                        {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                      </span>
                      <Button
                        size="small"
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                        onClick={() => loadUsers({ page: pagination.page + 1, pageSize: pagination.pageSize })}
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
            dataSource={users}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => {
                loadUsers({ page, pageSize });
              },
            }}
          />
        )}
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        afterOpenChange={handleUserModalAfterOpen}
        footer={null}
        width={isMobile ? '90%' : 600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ roleId: 2 }} // 默认为经纪人角色
        >
          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 50, message: '用户名不能超过50个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
                ]}
              >
                <Input placeholder="输入用户名" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="姓名"
                name="fullName"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { max: 100, message: '姓名不能超过100个字符' },
                ]}
              >
                <Input placeholder="输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              label="密码"
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
              <Input.Password placeholder="输入登录密码" />
            </Form.Item>
          )}

          <Row gutter={isMobile ? 0 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="输入手机号（可选）" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                label="角色"
                name="roleId"
                rules={[
                  { required: true, message: '请选择角色' },
                ]}
              >
                <Select placeholder="选择用户角色" loading={rolesLoading}>
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>
                      {role.name === 'admin' ? '管理员' : '经纪人'}
                      {role.description && ` - ${role.description}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {editingUser && (
            <Form.Item
              label="账号状态"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="激活" unCheckedChildren="禁用" />
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingUser(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量操作模态框 */}
      <Modal
        title={`批量操作 (${selectedUserIds.length} 个用户)`}
        open={batchModalVisible}
        onCancel={() => {
          setBatchModalVisible(false);
          batchForm.resetFields();
        }}
        footer={null}
        width={400}
        destroyOnHidden
      >
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchOperation}
        >
          {batchOperation === 'activate' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>确定要激活选中的 {selectedUserIds.length} 个用户吗？</p>
            </div>
          )}

          {batchOperation === 'deactivate' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>确定要禁用选中的 {selectedUserIds.length} 个用户吗？</p>
            </div>
          )}

          {batchOperation === 'changeRole' && (
            <Form.Item
              label="新角色"
              name="roleId"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="选择新角色">
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name === 'admin' ? '管理员' : '经纪人'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {batchOperation === 'delete' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#ff4d4f' }}>
                确定要删除选中的 {selectedUserIds.length} 个用户吗？
              </p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                此操作不可恢复，请谨慎操作
              </p>
            </div>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={batchLoading}
                danger={batchOperation === 'delete'}
              >
                确定
              </Button>
              <Button
                onClick={() => {
                  setBatchModalVisible(false);
                  batchForm.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 