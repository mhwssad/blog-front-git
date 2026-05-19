# 通知中心 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

[场景说明] 通知列表、通知详情、未读数量、标记已读、用户通知设置

---
## 通知中心

### 通知列表

**接口信息**
- 路径: `GET /api/user/notices`
- 鉴权: 是
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| current | integer | 否 | 当前页，默认1 | `1` |
| size | integer | 否 | 每页条数，默认10 | `10` |
| title | string | 否 | 标题（模糊搜索） | `系统` |
| isRead | integer | 否 | 已读状态：0-未读，1-已读 | `0` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 25,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "title": "系统通知",
        "content": "您的文章已审核通过",
        "type": 1,
        "level": "info",
        "publishTime": "2024-01-15T10:30:00",
        "isRead": 0,
        "readTime": null,
        "businessType": "article",
        "businessId": 123,
        "actionPath": "/article/123"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | long | 通知ID |
| title | string | 通知标题 |
| content | string | 通知内容 |
| type | integer | 通知类型 |
| level | string | 通知等级：`info`/`warning`/`error` |
| publishTime | string | 发布时间 |
| isRead | integer | 已读状态：0-未读，1-已读 |
| readTime | string | 阅读时间，未读为 null |
| businessType | string | 业务目标类型（如 article） |
| businessId | long | 业务目标ID |
| actionPath | string | 点击跳转路径 |

---

### 通知详情

**接口信息**
- 路径: `GET /api/user/notices/{id}`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "title": "系统通知",
    "content": "您的文章已审核通过",
    "type": 1,
    "level": "info",
    "publishTime": "2024-01-15T10:30:00",
    "isRead": 1,
    "readTime": "2024-01-15T11:00:00",
    "businessType": "article",
    "businessId": 123,
    "actionPath": "/article/123"
  }
}
```

---

### 未读数量

**接口信息**
- 路径: `GET /api/user/notices/unread-count`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": 5
}
```

---

### 标记已读

**单条已读**

**接口信息**
- 路径: `POST /api/user/notices/{id}/read`
- 鉴权: 是

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

**全部已读**

**接口信息**
- 路径: `POST /api/user/notices/read-all`
- 鉴权: 是

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

## 用户通知设置

### 查询我的通知设置

**接口信息**
- 路径: `GET /api/user/notification-settings`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "type": "system",
      "enabled": true
    },
    {
      "type": "comment",
      "enabled": true
    },
    {
      "type": "like",
      "enabled": false
    }
  ]
}
```

---

### 批量更新我的通知设置

**接口信息**
- 路径: `PUT /api/user/notification-settings`
- 鉴权: 是
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| settings | array | 是 | 通知设置列表 |
| settings[].type | string | 是 | 通知类型 |
| settings[].enabled | boolean | 是 | 是否启用 |

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

### 单独更新某类通知设置

**接口信息**
- 路径: `PUT /api/user/notification-settings/{type}`
- 鉴权: 是
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| type | 通知类型，如 `system`、`comment`、`like` |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| enabled | boolean | 是 | 是否启用 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
