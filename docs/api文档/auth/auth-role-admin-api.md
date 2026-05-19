# 后台角色管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 后台角色管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询角色

**接口信息**
- 路径: `GET /api/sys/roles`
- 鉴权: 后台（`sys:role:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| keyword | string | 否 | 搜索关键字 |
| status | integer | 否 | 状态筛选 |

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
        "name": "超级管理员",
        "code": "admin",
        "status": 1
      }
    ]
  }
}
```

---

### 查询角色详情

**接口信息**
- 路径: `GET /api/sys/roles/{id}`
- 鉴权: 后台（`sys:role:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 角色ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "name": "超级管理员",
    "code": "admin",
    "status": 1,
    "description": "拥有所有权限"
  }
}
```

---

### 新增角色

**接口信息**
- 路径: `POST /api/sys/roles`
- 鉴权: 后台（`sys:role:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | string | 是 | 角色名称 |
| code | string | 是 | 角色编码 |
| description | string | 否 | 描述 |
| status | integer | 否 | 状态 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 5,
    "name": "编辑",
    "code": "editor"
  }
}
```

---

### 修改角色

**接口信息**
- 路径: `PUT /api/sys/roles/{id}`
- 鉴权: 后台（`sys:role:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 角色ID |

**请求参数**：同新增角色（字段均可选）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 5,
    "name": "编辑",
    "code": "editor"
  }
}
```

---

### 修改角色状态

**接口信息**
- 路径: `PUT /api/sys/roles/{id}/status`
- 鉴权: 后台（`sys:role:update`）
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

### 删除角色

**接口信息**
- 路径: `DELETE /api/sys/roles/{id}`
- 鉴权: 后台（`sys:role:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 角色ID |

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

### 查询角色菜单

**接口信息**
- 路径: `GET /api/sys/roles/{id}/menus`
- 鉴权: 后台（`sys:role:query`）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [1, 2, 3, 4, 5]
}
```

---

### 分配角色菜单

**接口信息**
- 路径: `PUT /api/sys/roles/{id}/menus`
- 鉴权: 后台（`sys:role:assign-menu`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| menuIds | array\<long\> | 是 | 菜单 ID 列表 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
