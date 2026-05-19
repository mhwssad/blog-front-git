# 通知后台管理、作者申请后台管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 通知后台管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询通知

**接口信息**
- 路径: `GET /api/sys/notices`
- 鉴权: 后台（`sys:notice:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| title | string | 否 | 标题筛选 |
| status | integer | 否 | 状态筛选 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 10,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "title": "系统维护通知",
        "content": "...",
        "status": "published",
        "createdAt": "2026-05-01T10:00:00"
      }
    ]
  }
}
```

---

### 查询通知详情

**接口信息**
- 路径: `GET /api/sys/notices/{id}`
- 鉴权: 后台（`sys:notice:query`）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "title": "系统维护通知",
    "content": "系统将于今晚进行维护",
    "type": 1,
    "level": "info",
    "status": "published",
    "createdAt": "2026-05-01T10:00:00"
  }
}
```

---

### 新增通知

**接口信息**
- 路径: `POST /api/sys/notices`
- 鉴权: 后台（`sys:notice:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| title | string | 是 | 通知标题 |
| content | string | 是 | 通知内容 |
| type | integer | 否 | 通知类型 |
| level | string | 否 | 通知等级：info/warning/error |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "title": "新通知",
    "status": "draft"
  }
}
```

---

### 修改通知

**接口信息**
- 路径: `PUT /api/sys/notices/{id}`
- 鉴权: 后台（`sys:notice:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

**请求参数**：同新增通知（字段均可选）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "title": "修改后的标题"
  }
}
```

---

### 发布通知

**接口信息**
- 路径: `POST /api/sys/notices/{id}/publish`
- 鉴权: 后台（`sys:notice:publish`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

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

### 撤回通知

**接口信息**
- 路径: `POST /api/sys/notices/{id}/revoke`
- 鉴权: 后台（`sys:notice:revoke`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

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

### 删除通知

**接口信息**
- 路径: `DELETE /api/sys/notices/{id}`
- 鉴权: 后台（`sys:notice:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

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

## 作者申请后台管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询作者申请

**接口信息**
- 路径: `GET /api/sys/author-applications`
- 鉴权: 后台（`sys:author-application:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| status | string | 否 | 状态筛选（pending/approved/rejected） |

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
        "userId": 10,
        "status": "pending",
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 查询作者申请详情

**接口信息**
- 路径: `GET /api/sys/author-applications/{id}`
- 鉴权: 后台（`sys:author-application:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 申请ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "userId": 10,
    "status": "pending",
    "penName": "笔名",
    "introduction": "自我介绍",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

### 审核作者申请

**接口信息**
- 路径: `PUT /api/sys/author-applications/{id}/review`
- 鉴权: 后台（`sys:author-application:review`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 申请ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| approved | boolean | 是 | 是否通过 |
| reason | string | 否 | 驳回原因 |

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

### 修正作者申请状态

**接口信息**
- 路径: `PUT /api/sys/author-applications/{id}/repair`
- 鉴权: 后台（`sys:author-application:repair`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 申请ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| status | string | 是 | 目标状态 |
| reason | string | 否 | 修正原因 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
