# 后台管理 - 版块管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

> 以下接口均要求后台登录账号，并校验 `content:forum:*` 权限

---

### 分页查询版块

**接口信息**

- 路径：`GET /api/sys/forum/sections`
- 鉴权：`content:forum:query`
- 说明：分页查询论坛版块列表，支持关键字筛选

**请求参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量，最大100 | 10 |
| `keyword` | String | 否 | 版块名称/简介关键字 | - |
| `status` | Integer | 否 | `0`禁用`1`启用 | - |
| `visibilityScope` | Integer | 否 | `0`公开`1`登录可见 | - |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 5,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "name": "技术交流",
        "description": "技术问题与经验分享",
        "sortOrder": 10,
        "visibilityScope": 0,
        "postLevelLimit": 1,
        "status": 1,
        "createdAt": "2025-01-01T00:00:00",
        "updatedAt": "2025-01-10T12:00:00"
      },
      {
        "id": 2,
        "name": "内部交流",
        "description": "仅登录用户可见",
        "sortOrder": 20,
        "visibilityScope": 1,
        "postLevelLimit": 5,
        "status": 1,
        "createdAt": "2025-01-02T00:00:00",
        "updatedAt": "2025-01-11T12:00:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `total` | Long | 总记录数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页数量 |
| `records[].id` | Long | 版块ID |
| `records[].name` | String | 版块名称 |
| `records[].description` | String | 版块简介 |
| `records[].sortOrder` | Integer | 排序值 |
| `records[].visibilityScope` | Integer | `0`公开`1`登录可见 |
| `records[].postLevelLimit` | Integer | 发帖最低等级 |
| `records[].status` | Integer | `0`禁用`1`启用 |
| `records[].createdAt` | DateTime | 创建时间 |
| `records[].updatedAt` | DateTime | 更新时间 |

**错误码**

| code | 说明 |
|-----|------|
| 40301 | 无查询权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 查询版块详情

**接口信息**

- 路径：`GET /api/sys/forum/sections/{id}`
- 鉴权：`content:forum:query`
- 说明：获取单个版块的完整信息

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 1,
    "name": "技术交流",
    "description": "技术问题与经验分享",
    "sortOrder": 10,
    "visibilityScope": 0,
    "postLevelLimit": 1,
    "status": 1,
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-10T12:00:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 版块不存在 |
| 40301 | 无查询权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 新增版块

**接口信息**

- 路径：`POST /api/sys/forum/sections`
- 鉴权：`content:forum:create`
- 说明：创建新的论坛版块

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `name` | String | 是 | 版块名称，最大64字符，唯一 |
| `description` | String | 否 | 版块简介，最大512字符 |
| `sortOrder` | Integer | 否 | 排序值，越小越靠前，默认0 |
| `visibilityScope` | Integer | 否 | `0`公开`1`登录可见，默认0 |
| `postLevelLimit` | Integer | 否 | 发帖最低等级，最小1，默认1 |
| `status` | Integer | 否 | `0`禁用`1`启用，默认1 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 3,
    "name": "技术交流",
    "description": "技术问题与经验分享",
    "sortOrder": 10,
    "visibilityScope": 0,
    "postLevelLimit": 1,
    "status": 1,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 参数校验失败 |
| 40011 | 版块名称已存在 |
| 40301 | 无创建权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 修改版块

**接口信息**

- 路径：`PUT /api/sys/forum/sections/{id}`
- 鉴权：`content:forum:update`
- 说明：修改指定版块的信息

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `name` | String | 是 | 版块名称，最大64字符，唯一 |
| `description` | String | 否 | 版块简介，最大512字符 |
| `sortOrder` | Integer | 否 | 排序值，越小越靠前 |
| `visibilityScope` | Integer | 否 | `0`公开`1`登录可见 |
| `postLevelLimit` | Integer | 否 | 发帖最低等级，最小1 |
| `status` | Integer | 否 | `0`禁用`1`启用 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:00:00",
  "data": {
    "id": 3,
    "name": "技术交流区",
    "description": "技术问题与经验分享平台",
    "sortOrder": 5,
    "visibilityScope": 0,
    "postLevelLimit": 2,
    "status": 1,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T11:00:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 参数校验失败 |
| 40011 | 版块名称已存在 |
| 40401 | 版块不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 修改版块状态

**接口信息**

- 路径：`PUT /api/sys/forum/sections/{id}/status`
- 鉴权：`content:forum:update`
- 说明：启用或禁用指定版块

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `status` | Integer | 是 | `0`禁用`1`启用 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 参数校验失败 |
| 40401 | 版块不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 删除版块

**接口信息**

- 路径：`DELETE /api/sys/forum/sections/{id}`
- 鉴权：`content:forum:delete`
- 说明：删除指定版块，仅允许删除无帖子的版块

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T12:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 版块已有帖子无法删除 |
| 40401 | 版块不存在 |
| 40301 | 无删除权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---
