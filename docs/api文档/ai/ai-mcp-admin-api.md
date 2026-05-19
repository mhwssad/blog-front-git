# AI MCP 服务管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员配置和管理 MCP（Model Context Protocol）服务，包括 MCP 服务配置、工具发现、健康检查等。

---

## 权限说明

| 权限标识 | 说明 |
|---|---|
| `ai:mcp:query` | MCP 服务查询权限 |
| `ai:mcp:create` | MCP 服务创建权限 |
| `ai:mcp:update` | MCP 服务更新权限 |
| `ai:mcp:delete` | MCP 服务删除权限 |
| `ai:mcp:discover` | MCP 工具发现权限 |

---

## 1. 分页查询 MCP 服务

**接口信息**
- 路径：`GET /api/sys/ai/mcp-servers`
- 鉴权：`ai:mcp:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `serverName` | String | 否 | 按服务名称筛选 |
| `transportType` | String | 否 | 按传输类型筛选：`stdio`/`http` |
| `enabled` | Integer | 否 | 按启用状态筛选 |

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
        "serverName": "文件系统 MCP",
        "transportType": "stdio",
        "connectionConfigJson": "{\"command\":\"node\",\"args\":[\"server.js\"]}",
        "timeoutSeconds": 30,
        "enabled": 1,
        "lastHealthStatus": "healthy",
        "lastDiscoveredAt": "2026-04-15T10:00:00",
        "lastErrorSummary": null,
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
| `records[].id` | Long | MCP 服务ID |
| `records[].serverName` | String | 服务名称 |
| `records[].transportType` | String | 传输类型：`stdio`/`http` |
| `records[].connectionConfigJson` | String | 连接配置 JSON |
| `records[].timeoutSeconds` | Integer | 超时时间（秒） |
| `records[].enabled` | Integer | 启用状态：0-停用，1-启用 |
| `records[].lastHealthStatus` | String | 最近健康状态 |
| `records[].lastDiscoveredAt` | DateTime | 最近发现时间 |
| `records[].lastErrorSummary` | String | 最近错误摘要 |

---

## 2. 查询 MCP 服务详情

**接口信息**
- 路径：`GET /api/sys/ai/mcp-servers/{id}`
- 鉴权：`ai:mcp:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

---

## 3. 创建 MCP 服务

**接口信息**
- 路径：`POST /api/sys/ai/mcp-servers`
- 鉴权：`ai:mcp:create`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `serverName` | String | 是 | 服务名称，最多128字符 |
| `transportType` | String | 是 | 传输类型：`stdio`/`http` |
| `connectionConfigJson` | String | 是 | 连接配置 JSON 对象 |
| `authConfigJson` | String | 否 | 鉴权配置 JSON 对象 |
| `timeoutSeconds` | Integer | 是 | 超时时间（秒），必须大于0 |
| `enabled` | Integer | 是 | 启用状态：0-停用，1-启用 |
| `mfaTicket` | String | 否 | MFA 票据 |

---

## 4. 更新 MCP 服务

**接口信息**
- 路径：`PUT /api/sys/ai/mcp-servers/{id}`
- 鉴权：`ai:mcp:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

**请求体**：同创建 MCP 服务

---

## 5. 更新 MCP 服务状态

**接口信息**
- 路径：`PUT /api/sys/ai/mcp-servers/{id}/status`
- 鉴权：`ai:mcp:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `enabled` | Integer | 是 | 启用状态：0-停用，1-启用 |

---

## 6. 删除 MCP 服务

**接口信息**
- 路径：`DELETE /api/sys/ai/mcp-servers/{id}`
- 鉴权：`ai:mcp:delete`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

---

## 7. 发现 MCP 工具

**接口信息**
- 路径：`POST /api/sys/ai/mcp-servers/{id}/discover`
- 鉴权：`ai:mcp:discover`
- 说明：发现并注册指定 MCP 服务提供的工具列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "discoveredCount": 5,
    "syncedCount": 5
  }
}
```

---

## 8. 查询 MCP 工具快照

**接口信息**
- 路径：`GET /api/sys/ai/mcp-servers/{id}/tools`
- 鉴权：`ai:mcp:query`
- 说明：查询指定 MCP 服务的工具快照列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data[].id` | Long | 快照ID |
| `data[].mcpServerId` | Long | MCP 服务ID |
| `data[].mcpToolName` | String | MCP 原始工具名 |
| `data[].toolCode` | String | 工具编码 |
| `data[].toolName` | String | 工具名称 |
| `data[].description` | String | 描述 |
| `data[].parametersSchema` | String | 参数 Schema |
| `data[].riskLevel` | String | 风险等级 |
| `data[].useScenarios` | String | 适用场景 |
| `data[].enabled` | Integer | 启用状态 |
| `data[].discoveredAt` | DateTime | 发现时间 |
| `data[].lastErrorSummary` | String | 错误摘要 |

---

## 9. 查询 MCP 连接状态

**接口信息**
- 路径：`GET /api/sys/ai/mcp-servers/{id}/health`
- 鉴权：`ai:mcp:query`
- 说明：检查指定 MCP 服务的连接健康状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | MCP 服务ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "healthy": true,
    "status": "healthy",
    "errorSummary": null
  }
}