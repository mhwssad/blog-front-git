# AI Agent 管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员配置和管理 AI Agent，包括 Agent 定义管理、Agent 任务管理。

---

## 权限说明

| 权限标识 | 说明 |
|---|---|
| `ai:agent:query` | Agent 查询权限 |
| `ai:agent:create` | Agent 创建权限 |
| `ai:agent:update` | Agent 更新权限 |
| `ai:agent:delete` | Agent 删除权限 |

---

## 1. Agent 定义管理

### 分页查询 Agent 定义

**接口信息**
- 路径：`GET /api/sys/ai/agents/definitions`
- 鉴权：`ai:agent:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `keyword` | String | 否 | 名称关键词 |
| `enabled` | Integer | 否 | 启用状态：0-停用，1-启用 |

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
        "name": "知识库助手",
        "description": "帮助用户检索知识库",
        "systemPrompt": "你是一个知识库助手...",
        "channelConfigId": 1,
        "dataScopeJson": "[\"public_article\"]",
        "enabled": 1,
        "maxTurns": 10,
        "extraConfigJson": "{}",
        "createdBy": 1,
        "updatedBy": null,
        "createdAt": "2026-04-15T10:00:00",
        "updatedAt": "2026-04-15T10:00:00"
      }
    ]
  }
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | Agent ID |
| `records[].name` | String | Agent 名称 |
| `records[].description` | String | Agent 描述 |
| `records[].systemPrompt` | String | 系统提示词 |
| `records[].channelConfigId` | Long | 关联 AI 渠道配置ID |
| `records[].dataScopeJson` | String | 数据读取范围配置 JSON |
| `records[].enabled` | Integer | 启用状态：0-停用，1-启用 |
| `records[].maxTurns` | Integer | 最大对话轮次 |

### 查询 Agent 定义详情

**接口信息**
- 路径：`GET /api/sys/ai/agents/definitions/{id}`
- 鉴权：`ai:agent:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | Agent 定义ID |

### 创建 Agent 定义

**接口信息**
- 路径：`POST /api/sys/ai/agents/definitions`
- 鉴权：`ai:agent:create`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | String | 是 | Agent 名称，最多64字符 |
| `description` | String | 否 | Agent 描述，最多512字符 |
| `systemPrompt` | String | 是 | 系统提示词 |
| `channelConfigId` | Long | 是 | 关联 AI 渠道配置ID |
| `dataScopeJson` | String | 否 | 数据读取范围配置 JSON |
| `maxTurns` | Integer | 否 | 最大对话轮次，默认1 |
| `extraConfigJson` | String | 否 | 扩展配置 JSON 对象 |

### 更新 Agent 定义

**接口信息**
- 路径：`PUT /api/sys/ai/agents/definitions/{id}`
- 鉴权：`ai:agent:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | Agent 定义ID |

**请求体**：同创建 Agent 定义

### 切换 Agent 启停状态

**接口信息**
- 路径：`PUT /api/sys/ai/agents/definitions/{id}/toggle`
- 鉴权：`ai:agent:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | Agent 定义ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `enabled` | Integer | 是 | 启用状态：0-停用，1-启用 |

### 删除 Agent 定义

**接口信息**
- 路径：`DELETE /api/sys/ai/agents/definitions/{id}`
- 鉴权：`ai:agent:delete`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | Agent 定义ID |

---

## 2. Agent 任务管理（后台）

### 分页查询 Agent 任务

**接口信息**
- 路径：`GET /api/sys/ai/agents/tasks`
- 鉴权：`ai:agent:query`
- 说明：后台分页查询所有 Agent 任务列表

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `agentId` | Long | 否 | Agent 定义ID |
| `status` | Integer | 否 | 状态：0-待执行，1-执行中，2-已完成，3-失败，4-已取消 |

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | 任务ID |
| `records[].userId` | Long | 发起用户ID |
| `records[].agentId` | Long | 关联 Agent 定义ID |
| `records[].agentName` | String | Agent 名称 |
| `records[].status` | Integer | 状态：0-待执行，1-执行中，2-已完成，3-失败，4-已取消 |
| `records[].inputContent` | String | 用户输入 |
| `records[].outputContent` | String | Agent 输出 |
| `records[].errorMessage` | String | 错误信息 |
| `records[].tokenCount` | Integer | 消耗 token 数 |
| `records[].startedAt` | DateTime | 开始时间 |
| `records[].completedAt` | DateTime | 完成时间 |
| `records[].createdAt` | DateTime | 创建时间 |

### 查询 Agent 任务详情（后台）

**接口信息**
- 路径：`GET /api/sys/ai/agents/tasks/{id}`
- 鉴权：`ai:agent:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 任务ID |

---

## 3. Agent 任务（用户侧）

### 发起 Agent 任务

**接口信息**
- 路径：`POST /api/user/ai/agents/tasks`
- 鉴权：是
- 说明：用户发起新的 Agent 任务

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `agentId` | Long | 是 | Agent 定义ID |
| `inputContent` | String | 是 | 用户输入内容 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1,
    "agentId": 1,
    "agentName": "知识库助手",
    "status": 0,
    "inputContent": "帮我查找关于 Java Stream 的知识",
    "outputContent": null,
    "errorMessage": null,
    "tokenCount": null,
    "createdAt": "2026-04-15T14:00:00",
    "completedAt": null
  }
}
```

### 分页查询我的 Agent 任务

**接口信息**
- 路径：`GET /api/user/ai/agents/tasks`
- 鉴权：是

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `status` | Integer | 否 | 状态：0-待执行，1-执行中，2-已完成，3-失败，4-已取消 |

### 查询 Agent 任务详情

**接口信息**
- 路径：`GET /api/user/ai/agents/tasks/{id}`
- 鉴权：是

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 任务ID |

### 取消 Agent 任务

**接口信息**
- 路径：`PUT /api/user/ai/agents/tasks/{id}/cancel`
- 鉴权：是
- 说明：取消进行中的 Agent 任务

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 任务ID |