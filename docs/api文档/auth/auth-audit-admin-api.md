# 系统日志管理 / 审计日志管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 系统日志管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询日志

**接口信息**
- 路径: `GET /api/sys/logs`
- 鉴权: 后台（`sys:log:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 100,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "action": "LOGIN",
        "operator": "admin",
        "ip": "127.0.0.1",
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 查询日志详情

**接口信息**
- 路径: `GET /api/sys/logs/{id}`
- 鉴权: 后台（`sys:log:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 日志ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "action": "LOGIN",
    "operator": "admin",
    "ip": "127.0.0.1",
    "detail": "登录成功",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

### 删除日志

**接口信息**
- 路径: `DELETE /api/sys/logs/{id}`
- 鉴权: 后台（`sys:log:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 日志ID |

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

### 按条件清理日志

**接口信息**
- 路径: `POST /api/sys/logs/clean`
- 鉴权: 后台（`sys:log:clean`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| beforeDate | string | 否 | 清理此日期之前的日志 |
| action | string | 否 | 按操作类型清理 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": 150
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| data | long | 清理的日志数量 |

---

## 审计日志管理

> 以下接口仅超级管理员可访问，通过 `@PreAuthorize` + `superAdminVerifier` 双重校验。

### 分页查询审计日志

**接口信息**
- 路径: `GET /api/sys/audit-logs`
- 鉴权: 超管（`sys:audit:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 50,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "action": "BAN_USER",
        "operatorId": 1,
        "targetUserId": 10,
        "ip": "127.0.0.1",
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 查询审计日志详情

**接口信息**
- 路径: `GET /api/sys/audit-logs/{id}`
- 鉴权: 超管（`sys:audit:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 审计日志ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "action": "BAN_USER",
    "operatorId": 1,
    "targetUserId": 10,
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "detail": "封禁用户",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```
