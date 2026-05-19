# 后台用户管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 后台用户管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询用户

**接口信息**
- 路径: `GET /api/sys/users`
- 鉴权: 后台（`sys:user:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| keyword | string | 否 | 搜索关键字（用户名/昵称/邮箱） |
| status | integer | 否 | 状态筛选 |

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
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@example.com",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

---

### 查询用户详情

**接口信息**
- 路径: `GET /api/sys/users/{id}`
- 鉴权: 后台（`sys:user:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": 1,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

---

### 新增用户

**接口信息**
- 路径: `POST /api/sys/users`
- 鉴权: 后台（`sys:user:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| nickname | string | 否 | 昵称 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| status | integer | 否 | 状态 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 10,
    "username": "new_user",
    "nickname": "新用户"
  }
}
```

---

### 修改用户

**接口信息**
- 路径: `PUT /api/sys/users/{id}`
- 鉴权: 后台（`sys:user:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 用户ID |

**请求参数**：同新增用户（字段均可选）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 10,
    "username": "new_user",
    "nickname": "修改后的昵称"
  }
}
```

---

### 修改用户状态

**接口信息**
- 路径: `PUT /api/sys/users/{id}/status`
- 鉴权: 后台（`sys:user:update`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| status | integer | 是 | 状态值（1-启用，0-禁用） |

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

### 重置用户密码

**接口信息**
- 路径: `PUT /api/sys/users/{id}/password/reset`
- 鉴权: 后台（`sys:user:reset-password`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| password | string | 是 | 新密码 |

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

### 删除用户

**接口信息**
- 路径: `DELETE /api/sys/users/{id}`
- 鉴权: 后台（`sys:user:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 用户ID |

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

### 查询用户角色

**接口信息**
- 路径: `GET /api/sys/users/{id}/roles`
- 鉴权: 后台（`sys:user:query`）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [1, 2]
}
```

---

### 分配用户角色

**接口信息**
- 路径: `PUT /api/sys/users/{id}/roles`
- 鉴权: 后台（`sys:user:assign-role`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| roleIds | array\<long\> | 是 | 角色 ID 列表 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
