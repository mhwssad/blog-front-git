# 系统配置管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 系统配置管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询配置

**接口信息**
- 路径: `GET /api/sys/configs`
- 鉴权: 后台（`sys:config:query`）
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
    "total": 20,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "configKey": "site_name",
        "configValue": "我的博客",
        "description": "站点名称"
      }
    ]
  }
}
```

---

### 查询配置详情

**接口信息**
- 路径: `GET /api/sys/configs/{id}`
- 鉴权: 后台（`sys:config:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 配置ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "configKey": "site_name",
    "configValue": "我的博客",
    "description": "站点名称"
  }
}
```

---

### 新增配置

**接口信息**
- 路径: `POST /api/sys/configs`
- 鉴权: 后台（`sys:config:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| configKey | string | 是 | 配置键 |
| configValue | string | 是 | 配置值 |
| description | string | 否 | 描述 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "configKey": "site_description",
    "configValue": "一个技术博客"
  }
}
```

---

### 修改配置

**接口信息**
- 路径: `PUT /api/sys/configs/{id}`
- 鉴权: 后台（`sys:config:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 配置ID |

**请求参数**：同新增配置（字段均可选）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "configKey": "site_description",
    "configValue": "新的站点描述"
  }
}
```

---

### 删除配置

**接口信息**
- 路径: `DELETE /api/sys/configs/{id}`
- 鉴权: 后台（`sys:config:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 配置ID |

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

### 按配置键查询配置值

**接口信息**
- 路径: `GET /api/sys/configs/key/{configKey}`
- 鉴权: 后台（`sys:config:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| configKey | 配置键名 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": "我的博客"
}
```
