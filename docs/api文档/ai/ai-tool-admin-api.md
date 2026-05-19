# AI 工具管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员配置和管理 AI 工具，包括工具定义、工具授权、工具调用日志等。

---

## 权限说明

| 权限标识 | 说明 |
|---|---|
| `ai:tool:query` | 工具查询权限 |
| `ai:tool:create` | 工具创建权限 |
| `ai:tool:update` | 工具更新权限 |
| `ai:tool:delete` | 工具删除权限 |
| `ai:tool:execute` | 工具执行权限 |

---

## 1. 分页查询工具定义

**接口信息**
- 路径：`GET /api/sys/ai/tools`
- 鉴权：`ai:tool:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |

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
        "toolCode": "web_search",
        "toolName": "网页搜索",
        "sourceType": "builtin",
        "mcpServerId": null,
        "mcpToolName": null,
        "description": "搜索互联网获取信息",
        "parametersSchema": "{}",
        "resultSchema": "{}",
        "riskLevel": "low",
        "useScenarios": "[\"general\",\"research\"]",
        "enabled": 1,
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
| `records[].id` | Long | 工具ID |
| `records[].toolCode` | String | 工具编码 |
| `records[].toolName` | String | 工具名称 |
| `records[].sourceType` | String | 来源类型：`builtin`/`mcp` |
| `records[].mcpServerId` | Long | MCP 服务 ID |
| `records[].description` | String | 描述 |
| `records[].riskLevel` | String | 风险等级：`low`/`medium`/`high` |
| `records[].useScenarios` | String | 适用场景 JSON 数组 |
| `records[].enabled` | Integer | 启用状态：0-停用，1-启用 |

---

## 2. 查询工具详情

**接口信息**
- 路径：`GET /api/sys/ai/tools/{id}`
- 鉴权：`ai:tool:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 工具ID |

---

## 3. 创建工具定义

**接口信息**
- 路径：`POST /api/sys/ai/tools`
- 鉴权：`ai:tool:create`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `toolCode` | String | 是 | 工具编码，最多64字符 |
| `toolName` | String | 是 | 工具名称，最多128字符 |
| `sourceType` | String | 是 | 来源类型：`builtin`/`mcp` |
| `mcpServerId` | Long | 否 | MCP 服务 ID |
| `mcpToolName` | String | 否 | MCP 原始工具名 |
| `description` | String | 否 | 工具描述 |
| `parametersSchema` | String | 否 | 参数 Schema JSON 对象 |
| `resultSchema` | String | 否 | 返回 Schema JSON 对象 |
| `riskLevel` | String | 是 | 风险等级：`low`/`medium`/`high` |
| `useScenarios` | String | 否 | 适用场景 JSON 数组 |
| `enabled` | Integer | 是 | 启用状态：0-停用，1-启用 |

---

## 4. 更新工具定义

**接口信息**
- 路径：`PUT /api/sys/ai/tools/{id}`
- 鉴权：`ai:tool:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 工具ID |

**请求体**：同创建工具定义

---

## 5. 更新工具状态

**接口信息**
- 路径：`PUT /api/sys/ai/tools/{id}/status`
- 鉴权：`ai:tool:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 工具ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `enabled` | Integer | 是 | 启用状态：0-停用，1-启用 |

---

## 6. 删除工具定义

**接口信息**
- 路径：`DELETE /api/sys/ai/tools/{id}`
- 鉴权：`ai:tool:delete`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 工具ID |

---

## 7. 后台测试执行工具

**接口信息**
- 路径：`POST /api/sys/ai/tools/{id}/execute`
- 鉴权：`ai:tool:execute`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 工具ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `toolCode` | String | 是 | 工具编码 |
| `arguments` | String | 是 | 工具参数 JSON 对象 |
| `agentId` | Long | 否 | Agent ID |
| `sessionId` | Long | 否 | 会话 ID |
| `taskId` | Long | 否 | 任务 ID |
| `sceneType` | String | 否 | 场景类型 |
| `dataScope` | String | 否 | 数据范围 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "success": true,
    "resultText": "搜索结果...",
    "errorMessage": null,
    "elapsedMs": 350,
    "callLogId": 1001
  }
}
```

---

## 8. 分页查询工具调用日志

**接口信息**
- 路径：`GET /api/sys/ai/tools/call-logs`
- 鉴权：`ai:tool:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | 日志ID |
| `records[].userId` | Long | 用户ID |
| `records[].toolId` | Long | 工具ID |
| `records[].toolCode` | String | 工具编码 |
| `records[].toolName` | String | 工具名称 |
| `records[].requestSummary` | String | 入参摘要 |
| `records[].responseSummary` | String | 结果摘要 |
| `records[].successStatus` | Integer | 成功状态 |
| `records[].elapsedMs` | Long | 耗时毫秒 |
| `records[].errorMessage` | String | 错误信息 |
| `records[].createdAt` | DateTime | 创建时间 |

---

## 9. 工具授权管理

### 分页查询工具授权

**接口信息**
- 路径：`GET /api/sys/ai/tools/authorizations`
- 鉴权：`ai:tool:query`

### 创建工具授权

**接口信息**
- 路径：`POST /api/sys/ai/tools/authorizations`
- 鉴权：`ai:tool:update`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `toolId` | Long | 是 | 工具ID |
| `authorizationType` | String | 是 | 授权类型：`agent`/`scene`/`permission`/`data_scope` |
| `authorizationKey` | String | 是 | 授权键，最多128字符 |
| `dataScope` | String | 否 | 数据范围 |
| `enabled` | Integer | 是 | 启用状态：0-停用，1-启用 |

### 更新工具授权

**接口信息**
- 路径：`PUT /api/sys/ai/tools/authorizations/{id}`
- 鉴权：`ai:tool:update`

### 删除工具授权

**接口信息**
- 路径：`DELETE /api/sys/ai/tools/authorizations/{id}`
- 鉴权：`ai:tool:update`