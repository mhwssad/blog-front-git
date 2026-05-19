# AI 渠道配置管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员配置 AI 渠道参数，包括渠道列表、详情、新增、更新、启停、删除等管理操作。

---

## 权限说明

所有接口都需要：
1. 登录状态
2. 对应权限

| 权限标识 | 说明 |
|---|---|
| `ai:channel-config:query` | 渠道配置查询权限 |
| `ai:channel-config:create` | 渠道配置创建权限 |
| `ai:channel-config:update` | 渠道配置更新权限 |
| `ai:channel-config:delete` | 渠道配置删除权限 |

---

## 1. 分页查询渠道配置

**接口信息**
- 路径：`GET /api/sys/ai/channels`
- 鉴权：`ai:channel-config:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 2,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "channelCode": "deepseek-chat",
        "channelName": "DeepSeek 对话渠道",
        "provider": "deepseek",
        "modelName": "deepseek-chat",
        "apiBaseUrl": "https://api.deepseek.com/v1",
        "apiKeyEncrypted": "******",
        "dailyQuota": 5000,
        "userDailyQuota": 50,
        "maxContextTokens": 64000,
        "dataScopeJson": "[\"public_article\",\"forum_post\"]",
        "systemPromptTemplate": "你是一个有帮助的AI助手。",
        "status": 1,
        "isDefault": 1,
        "createdBy": 1,
        "updatedBy": 1,
        "createdAt": "2026-04-15T10:00:00",
        "updatedAt": "2026-04-15T10:00:00"
      }
    ]
  }
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | 渠道配置ID |
| `records[].channelCode` | String | 渠道编码 |
| `records[].channelName` | String | 渠道名称 |
| `records[].provider` | String | 提供方 |
| `records[].modelName` | String | 模型名称 |
| `records[].apiBaseUrl` | String | 接口基础地址 |
| `records[].apiKeyEncrypted` | String | API Key（脱敏） |
| `records[].dailyQuota` | Integer | 全局每日额度，0表示不限制 |
| `records[].userDailyQuota` | Integer | 单用户每日额度，0表示不限制 |
| `records[].maxContextTokens` | Integer | 上下文长度上限 |
| `records[].dataScopeJson` | String | 可读取数据范围配置 JSON |
| `records[].systemPromptTemplate` | String | 系统提示词模板 |
| `records[].status` | Integer | 状态：0-停用，1-启用 |
| `records[].isDefault` | Integer | 是否默认渠道：0-否，1-是 |

---

## 2. 查询渠道配置详情

**接口信息**
- 路径：`GET /api/sys/ai/channels/{id}`
- 鉴权：`ai:channel-config:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 渠道配置ID |

**错误码**

| code | 说明 |
|---|---|
| 404 | 渠道配置不存在 |

---

## 3. 创建渠道配置

**接口信息**
- 路径：`POST /api/sys/ai/channels`
- 鉴权：`ai:channel-config:create`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `channelCode` | String | 是 | 渠道编码 |
| `channelName` | String | 是 | 渠道名称 |
| `provider` | String | 是 | 提供方 |
| `modelName` | String | 是 | 模型名称 |
| `apiBaseUrl` | String | 否 | 接口基础地址 |
| `apiKeyEncrypted` | String | 否 | API Key（加密存储） |
| `dailyQuota` | Integer | 否 | 全局每日额度，0表示不限制 |
| `userDailyQuota` | Integer | 否 | 单用户每日额度，0表示不限制 |
| `maxContextTokens` | Integer | 否 | 上下文长度上限，0表示不限制 |
| `dataScopeJson` | String | 否 | 可读取数据范围配置 JSON |
| `systemPromptTemplate` | String | 否 | 系统提示词模板 |
| `status` | Integer | 否 | 状态：0-停用，1-启用 |
| `isDefault` | Integer | 否 | 是否默认渠道：0-否，1-是 |
| `mfaTicket` | String | 否 | 二次验证票据（修改高风险字段时必填） |

**错误码**

| code | 说明 |
|---|---|
| 409 | 渠道编码已存在 |

---

## 4. 更新渠道配置

**接口信息**
- 路径：`PUT /api/sys/ai/channels/{id}`
- 鉴权：`ai:channel-config:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 渠道配置ID |

**请求体**：同创建渠道配置

---

## 5. 更新渠道状态

**接口信息**
- 路径：`PUT /api/sys/ai/channels/{id}/status`
- 鉴权：`ai:channel-config:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 渠道配置ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `status` | Integer | 是 | 状态：0-停用，1-启用 |

---

## 6. 删除渠道配置

**接口信息**
- 路径：`DELETE /api/sys/ai/channels/{id}`
- 鉴权：`ai:channel-config:delete`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 渠道配置ID |

**错误码**

| code | 说明 |
|---|---|
| 409 | 渠道正在使用中，无法删除 |