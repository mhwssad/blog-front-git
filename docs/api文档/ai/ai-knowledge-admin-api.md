# AI 知识库管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员配置和管理 AI 知识源，包括知识源配置、知识条目管理、知识同步等。

---

## 权限说明

| 权限标识 | 说明 |
|---|---|
| `ai:knowledge:query` | 知识库查询权限 |
| `ai:knowledge:update` | 知识库更新权限 |
| `ai:knowledge:sync` | 知识同步权限 |

---

## 1. 知识源配置

### 查询所有知识源配置

**接口信息**
- 路径：`GET /api/sys/ai/knowledge/source-config`
- 鉴权：`ai:knowledge:query`

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "sourceType": "public_article",
      "enabled": 1,
      "syncInterval": 3600,
      "lastSyncedAt": "2026-04-15T10:00:00",
      "lastSyncStatus": "completed",
      "configJson": "{}",
      "updatedBy": 1,
      "remark": "公开文章知识源",
      "createdAt": "2026-04-10T10:00:00",
      "updatedAt": "2026-04-15T10:00:00"
    }
  ]
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data[].id` | Long | 配置ID |
| `data[].sourceType` | String | 知识源类型编码 |
| `data[].enabled` | Integer | 是否启用：0-禁用，1-启用 |
| `data[].syncInterval` | Integer | 同步间隔（秒） |
| `data[].lastSyncedAt` | DateTime | 最近同步完成时间 |
| `data[].lastSyncStatus` | String | 最近同步状态 |
| `data[].configJson` | String | 扩展配置 JSON |
| `data[].remark` | String | 备注 |

### 查询知识源配置详情

**接口信息**
- 路径：`GET /api/sys/ai/knowledge/source-config/{id}`
- 鉴权：`ai:knowledge:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 知识源配置ID |

### 更新知识源配置

**接口信息**
- 路径：`PUT /api/sys/ai/knowledge/source-config/{id}`
- 鉴权：`ai:knowledge:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 知识源配置ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `syncInterval` | Integer | 是 | 同步间隔（秒），必须大于0 |
| `configJson` | String | 否 | 扩展配置 JSON 对象 |
| `remark` | String | 否 | 备注 |

### 切换知识源启停状态

**接口信息**
- 路径：`PUT /api/sys/ai/knowledge/source-config/{id}/toggle`
- 鉴权：`ai:knowledge:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 知识源配置ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `enabled` | Integer | 是 | 启用状态：0-禁用，1-启用 |

---

## 2. 知识条目管理

### 分页查询知识条目

**接口信息**
- 路径：`GET /api/sys/ai/knowledge/entries`
- 鉴权：`ai:knowledge:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `sourceType` | String | 否 | 来源类型 |
| `status` | Integer | 否 | 状态：0-禁用，1-正常，2-过期，3-已删除 |
| `keyword` | String | 否 | 标题关键词 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 1,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "sourceType": "public_article",
        "sourceId": 1001,
        "title": "Java Stream API 入门",
        "summary": "本文介绍 Java Stream API 的基本用法...",
        "sourceUrl": "/articles/1001",
        "authorId": 100,
        "status": 1,
        "version": 2,
        "chunkCount": 5,
        "sourceUpdatedAt": "2026-04-14T08:00:00",
        "syncedAt": "2026-04-15T10:00:00",
        "tagJson": "[\"java\",\"stream\"]",
        "createdAt": "2026-04-10T10:00:00",
        "updatedAt": "2026-04-15T10:00:00"
      }
    ]
  }
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | 条目ID |
| `records[].sourceType` | String | 来源类型 |
| `records[].sourceId` | Long | 来源对象ID |
| `records[].title` | String | 标题 |
| `records[].summary` | String | 摘要 |
| `records[].sourceUrl` | String | 来源页面URL |
| `records[].status` | Integer | 状态：0-禁用，1-正常，2-过期，3-已删除 |
| `records[].version` | Integer | 版本号 |
| `records[].chunkCount` | Integer | 分块数量 |
| `records[].sourceUpdatedAt` | DateTime | 源内容最后更新时间 |
| `records[].syncedAt` | DateTime | 最近同步时间 |
| `records[].tagJson` | String | 标签 JSON |

### 查询知识条目详情

**接口信息**
- 路径：`GET /api/sys/ai/knowledge/entries/{id}`
- 鉴权：`ai:knowledge:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 知识条目ID |

### 更新知识条目状态

**接口信息**
- 路径：`PUT /api/sys/ai/knowledge/entries/{id}/status`
- 鉴权：`ai:knowledge:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 知识条目ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `status` | Integer | 是 | 目标状态值 |

---

## 3. 知识同步任务

### 触发知识同步任务

**接口信息**
- 路径：`POST /api/sys/ai/knowledge/entries/sync`
- 鉴权：`ai:knowledge:sync`
- 说明：触发知识同步任务，将知识条目同步到向量存储

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sourceType` | String | 是 | 知识源类型 |
| `taskType` | String | 否 | 任务类型：`full_sync`/`incremental`/`single_entry` |
| `sourceId` | Long | 否 | 来源对象ID，`single_entry` 时必填 |
| `remark` | String | 否 | 备注，最多512字符 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 10,
    "taskType": "full_sync",
    "sourceType": "public_article",
    "status": 0,
    "totalCount": null,
    "successCount": null,
    "failCount": null,
    "errorMessage": null,
    "retryCount": 0,
    "startedAt": null,
    "completedAt": null,
    "triggeredBy": "manual",
    "operatorId": 1,
    "createdAt": "2026-04-15T14:00:00"
  }
}
```

### 分页查询同步任务

**接口信息**
- 路径：`GET /api/sys/ai/knowledge/entries/sync/tasks`
- 鉴权：`ai:knowledge:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `sourceType` | String | 否 | 知识源类型 |
| `status` | Integer | 否 | 状态：0-待执行，1-执行中，2-已完成，3-失败 |

### 查询同步任务详情

**接口信息**
- 路径：`GET /api/sys/ai/knowledge/entries/sync/tasks/{taskId}`
- 鉴权：`ai:knowledge:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `taskId` | Long | 是 | 同步任务ID |

### 重试失败的同步任务

**接口信息**
- 路径：`POST /api/sys/ai/knowledge/entries/sync/tasks/{taskId}/retry`
- 鉴权：`ai:knowledge:sync`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `taskId` | Long | 是 | 同步任务ID |