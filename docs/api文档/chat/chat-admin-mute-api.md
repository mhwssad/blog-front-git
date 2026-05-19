# 后台禁言管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

以下接口路径前缀为 `/api/sys/chats/mutes`。

---

### 创建禁言

**接口信息**
- 路径: `POST /api/sys/chats/mutes`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台创建禁言记录

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| userId | Long | 是 | 被禁言用户ID |
| scope | String | 否 | 禁言范围 |
| reason | String | 否 | 禁言理由 |
| muteUntil | LocalDateTime | 否 | 禁言截止时间 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "userId": 103,
    "scope": "global",
    "reason": "发布违规内容",
    "status": "active",
    "muteUntil": "2025-01-20T12:00:00",
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 分页查询禁言记录

**接口信息**
- 路径: `GET /api/sys/chats/mutes`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台分页查询禁言记录

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|-----|
| current | Long | 否 | 1 | 页码 |
| size | Long | 否 | 10 | 每页条数 |
| userId | Long | 否 | - | 被禁言用户ID |
| scope | String | 否 | - | 禁言范围 |
| status | String | 否 | - | 禁言状态 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 5,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 103,
        "scope": "global",
        "reason": "发布违规内容",
        "status": "active",
        "muteUntil": "2025-01-20T12:00:00",
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

### 解除禁言

**接口信息**
- 路径: `PUT /api/sys/chats/mutes/{id}/release`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台解除指定的禁言记录

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

---
