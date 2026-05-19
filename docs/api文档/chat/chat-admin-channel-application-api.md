# 后台频道创建申请管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

以下接口路径前缀为 `/api/sys/chats/channel-applications`。

---

### 分页查询频道创建申请

**接口信息**
- 路径: `GET /api/sys/chats/channel-applications`
- 鉴权: 是（需要 `content:channel-application:query` 权限）
- 说明: 后台分页查询所有频道创建申请

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|-----|
| current | Long | 否 | 1 | 页码 |
| size | Long | 否 | 20 | 每页条数 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 10,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1,
        "userId": 101,
        "name": "前端技术频道",
        "status": "pending",
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

### 查询频道创建申请详情

**接口信息**
- 路径: `GET /api/sys/chats/channel-applications/{id}`
- 鉴权: 是（需要 `content:channel-application:query` 权限）
- 说明: 后台查询指定频道创建申请的详细信息

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "userId": 101,
    "name": "前端技术频道",
    "description": "前端开发者交流频道",
    "status": "pending",
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 审核频道创建申请

**接口信息**
- 路径: `PUT /api/sys/chats/channel-applications/{id}/review`
- 鉴权: 是（需要 `content:channel-application:review` 权限）
- 说明: 后台审核频道创建申请

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| approved | Boolean | 是 | 是否通过 |
| reason | String | 否 | 审核理由 |

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
