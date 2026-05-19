# 经验体系管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 经验体系管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 查看用户经验来源汇总

**接口信息**
- 路径: `GET /api/sys/experience/users/{userId}/summary`
- 鉴权: 后台（`sys:experience:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| userId | 用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "userId": 1,
    "level": 5,
    "experiencePoints": 15000,
    "sources": [
      { "source": "article_publish", "total": 5000 },
      { "source": "comment", "total": 3000 }
    ]
  }
}
```

---

### 经验流水分页查询

**接口信息**
- 路径: `GET /api/sys/experience/logs`
- 鉴权: 后台（`sys:experience:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| userId | long | 否 | 用户ID筛选 |
| source | string | 否 | 经验来源筛选 |

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
        "userId": 1,
        "source": "article_publish",
        "points": 50,
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 手动调整等级或经验

**接口信息**
- 路径: `POST /api/sys/experience/users/{userId}/adjust`
- 鉴权: 后台（`sys:experience:adjust`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| userId | 用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| level | integer | 否 | 目标等级（与 experience 二选一或同时传） |
| experience | integer | 否 | 增减的经验值 |
| reason | string | 否 | 调整原因 |

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

### 查看经验来源配置

**接口信息**
- 路径: `GET /api/sys/experience/config`
- 鉴权: 后台（`sys:experience:config`）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "configKey": "exp_article_publish",
      "configValue": "50",
      "description": "发布文章获得经验"
    }
  ]
}
```

---

### 更新经验来源配置

**接口信息**
- 路径: `PUT /api/sys/experience/config`
- 鉴权: 后台（`sys:experience:config`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| configKey | string | 是 | 配置键 |
| configValue | string | 是 | 配置值 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
