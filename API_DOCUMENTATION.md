# 多渠道 CRM 系统 API 文档

## 概述

本系统提供完整的多渠道数据录入和管理功能，支持不同业务渠道独立接入，实现数据隔离和统一管理。

## 系统架构

- **后端服务**: http://localhost:3001/api
- **前端管理**: http://localhost:5173
- **数据库**: SQLite（开发环境）

## 认证方式

### 1. JWT Token 认证（管理后台）

用于 Web 管理界面的用户认证。

### 2. API Key 认证（第三方接入）

用于第三方系统的 API 访问认证。

**认证头部：**

```
x-api-key: YOUR_API_KEY
x-api-secret: YOUR_API_SECRET
```

## 管理员操作

### 登录管理后台

**默认管理员账号：**

- 用户名: `admin`
- 密码: `Admin123!`

**API 接口：**

```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

### 创建 API Key

**接口：** `POST /api/api-keys`

**示例：**

```bash
curl -X POST "http://localhost:3001/api/api-keys" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "官网渠道"
  }'
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "channelName": "官网渠道",
    "apiKey": "ak_f1cc7475377d057ec819d0dc66413d36",
    "isActive": true,
    "createdAt": "2025-07-28T08:58:45.198Z",
    "apiSecret": "fba7a40492b65a4e2ce7644fa244bce468ab23f2c4757e945506e2a6907c562b"
  },
  "message": "⚠️ 请妥善保存API Secret，系统不会再次显示"
}
```

### 管理 API Key

**查看列表：**

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/api-keys"
```

**禁用 API Key：**

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}' \
  "http://localhost:3001/api/api-keys/1"
```

**重新生成 Secret：**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/api-keys/1/regenerate-secret"
```

## 第三方接入 API

### 基础地址

```
http://localhost:3001/api/public
```

### 健康检查

**接口：** `GET /health`

```bash
curl -X GET "http://localhost:3001/api/public/health" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-api-secret: YOUR_API_SECRET"
```

### 创建带看记录

**接口：** `POST /viewing-records`

```bash
curl -X POST "http://localhost:3001/api/public/viewing-records" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-api-secret: YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "李先生",
    "primaryPhone": "13800138000",
    "primaryWechat": "li_wechat",
    "propertyName": "华润城润府",
    "roomAddress": "深圳市南山区深南大道华润城A座1101",
    "preferredViewingTime": "明天下午2-4点",
    "businessType": "focus",
    "viewingStatus": "pending",
    "requirementsJson": "{\"budget\":\"8000-12000\",\"roomType\":\"2室1厅\"}",
    "originalQuery": "想在华润城附近找个2室1厅，预算8-12k",
    "aiSummary": "客户需求：华润城2室1厅，预算8000-12000元",
    "remarks": "客户对地理位置很满意"
  }'
```

**字段说明：**

| 字段                 | 类型   | 必填   | 说明                                        |
| -------------------- | ------ | ------ | ------------------------------------------- |
| tenantName           | string | 可选\* | 租客姓名                                    |
| primaryPhone         | string | 可选\* | 主要联系电话                                |
| primaryWechat        | string | 可选   | 微信号                                      |
| propertyName         | string | 可选   | 房源名称                                    |
| roomAddress          | string | 可选   | 房间地址                                    |
| preferredViewingTime | string | 可选   | 偏好看房时间                                |
| businessType         | enum   | 可选   | 业务类型：focus/joint/whole                 |
| viewingStatus        | enum   | 可选   | 状态：pending/confirmed/completed/cancelled |
| requirementsJson     | string | 可选   | 需求 JSON 字符串                            |
| originalQuery        | string | 可选   | 原始查询                                    |
| aiSummary            | string | 可选   | AI 总结                                     |
| remarks              | string | 可选   | 备注信息                                    |

\*注：tenantName 和 primaryPhone 至少需要提供一个

### 查询带看记录列表

**接口：** `GET /viewing-records`

```bash
curl -X GET "http://localhost:3001/api/public/viewing-records?page=1&pageSize=10&status=pending" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-api-secret: YOUR_API_SECRET"
```

**查询参数：**

- `page`: 页码（默认：1）
- `pageSize`: 每页条数（默认：10）
- `status`: 状态筛选（可选）

### 查询单条记录

**接口：** `GET /viewing-records/:id`

```bash
curl -X GET "http://localhost:3001/api/public/viewing-records/5" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-api-secret: YOUR_API_SECRET"
```

### 更新记录状态

**接口：** `PATCH /viewing-records/:id/status`

```bash
curl -X PATCH "http://localhost:3001/api/public/viewing-records/5/status" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-api-secret: YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## 数据统计（管理员）

### 基础统计

**接口：** `GET /api/viewing-records/statistics`

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/viewing-records/statistics"
```

### 渠道统计

**接口：** `GET /api/viewing-records/channel-statistics`

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/viewing-records/channel-statistics"
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "channelName": "官网渠道",
        "channelType": "API",
        "total": 15,
        "pending": 5,
        "confirmed": 8,
        "completed": 2,
        "cancelled": 0
      },
      {
        "channelName": "微信小程序渠道",
        "channelType": "API",
        "total": 12,
        "pending": 3,
        "confirmed": 6,
        "completed": 3,
        "cancelled": 0
      }
    ],
    "summary": {
      "totalChannels": 3,
      "totalRecords": 30,
      "apiRecords": 27,
      "manualRecords": 3
    }
  }
}
```

## 权限和数据隔离

### 渠道数据隔离

- 每个 API Key 只能访问通过该 Key 创建的数据
- 不同渠道之间数据完全隔离
- 管理员可以查看所有渠道数据

### 用户角色权限

- **管理员 (admin)**: 所有权限
- **经纪人 (agent)**: 只能查看分配给自己的记录

## 集成示例

### JavaScript/Node.js

```javascript
const axios = require("axios");

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api/public",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "x-api-secret": "YOUR_API_SECRET",
    "Content-Type": "application/json",
  },
});

// 创建带看记录
async function createViewingRecord(data) {
  const response = await apiClient.post("/viewing-records", data);
  return response.data;
}

// 查询记录
async function getViewingRecords(page = 1, pageSize = 10) {
  const response = await apiClient.get(
    `/viewing-records?page=${page}&pageSize=${pageSize}`
  );
  return response.data;
}
```

### Python

```python
import requests

class ViewingRecordClient:
    def __init__(self, api_key, api_secret):
        self.base_url = 'http://localhost:3001/api/public'
        self.headers = {
            'x-api-key': api_key,
            'x-api-secret': api_secret,
            'Content-Type': 'application/json'
        }

    def create_record(self, data):
        response = requests.post(
            f'{self.base_url}/viewing-records',
            json=data,
            headers=self.headers
        )
        return response.json()

    def get_records(self, page=1, page_size=10):
        response = requests.get(
            f'{self.base_url}/viewing-records',
            params={'page': page, 'pageSize': page_size},
            headers=self.headers
        )
        return response.json()

# 使用示例
client = ViewingRecordClient('YOUR_API_KEY', 'YOUR_API_SECRET')
result = client.create_record({
    'tenantName': '张先生',
    'primaryPhone': '13800138000',
    'propertyName': '华润城润府'
})
```

### PHP

```php
<?php
class ViewingRecordClient {
    private $baseUrl = 'http://localhost:3001/api/public';
    private $headers;

    public function __construct($apiKey, $apiSecret) {
        $this->headers = [
            'x-api-key: ' . $apiKey,
            'x-api-secret: ' . $apiSecret,
            'Content-Type: application/json'
        ];
    }

    public function createRecord($data) {
        $ch = curl_init($this->baseUrl . '/viewing-records');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }
}

// 使用示例
$client = new ViewingRecordClient('YOUR_API_KEY', 'YOUR_API_SECRET');
$result = $client->createRecord([
    'tenantName' => '王女士',
    'primaryPhone' => '13900139000',
    'propertyName' => '前海时代广场'
]);
?>
```

## 错误处理

### 常见错误码

| 状态码 | 错误类型              | 说明           |
| ------ | --------------------- | -------------- |
| 400    | Bad Request           | 请求参数错误   |
| 401    | Unauthorized          | 认证失败       |
| 403    | Forbidden             | 权限不足       |
| 404    | Not Found             | 资源不存在     |
| 500    | Internal Server Error | 服务器内部错误 |

### 错误响应格式

```json
{
  "message": "错误描述",
  "error": "错误类型",
  "statusCode": 400
}
```

## 最佳实践

### 安全建议

1. **凭证管理**: API Secret 应存储在环境变量中，不要硬编码
2. **HTTPS**: 生产环境务必使用 HTTPS
3. **频率限制**: 根据需要实施 API 调用频率限制
4. **日志记录**: 记录所有 API 调用用于审计

### 数据质量

1. **必填验证**: 确保租客姓名或联系电话至少提供一个
2. **数据格式**: 保持数据格式的一致性
3. **及时更新**: 及时更新记录状态
4. **错误处理**: 妥善处理 API 调用失败的情况

### 性能优化

1. **分页查询**: 使用合适的分页参数
2. **批量操作**: 有需要时考虑批量处理
3. **缓存策略**: 对不常变化的数据进行缓存

## 联系支持

如有技术问题或需要协助，请联系开发团队。

---

_文档版本: v1.0_  
_最后更新: 2025-07-28_
