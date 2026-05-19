# AI 调用统计 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员查看 AI 使用统计和调用日志。

---

## 权限说明

| 权限标识 | 说明 |
|---|---|
| `ai:usage-stats:query` | 使用统计查询权限 |

---

## 1. 分页查询使用日志

**接口信息**
- 路径：`GET /api/sys/ai/usage-logs`
- 鉴权：`ai:usage-stats:query`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `20` |
| `userId` | Long | 否 | 用户ID |
| `channelConfigId` | Long | 否 | 渠道配置ID |
| `startTime` | DateTime | 否 | 开始时间 |
| `endTime` | DateTime | 否 | 结束时间 |
| `successStatus` | Integer | 否 | 成功状态：0-失败，1-成功 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 1,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1,
        "userId": 100,
        "channelConfigId": 1,
        "sessionId": 5,
        "requestSceneType": "general",
        "requestTokens": 10,
        "responseTokens": 20,
        "totalTokens": 30,
        "quotaCost": 1,
        "successStatus": 1,
        "errorCode": null,
        "ragEnabled": 1,
        "ragHitCount": 3,
        "ragDurationMs": 120,
        "ragReferences": [],
        "createdAt": "2026-04-15T14:05:00"
      }
    ]
  }
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | 日志ID |
| `records[].userId` | Long | 用户ID |
| `records[].channelConfigId` | Long | 渠道配置ID |
| `records[].sessionId` | Long | 会话ID |
| `records[].requestSceneType` | String | 请求场景类型 |
| `records[].requestTokens` | Integer | 请求 token 数 |
| `records[].responseTokens` | Integer | 响应 token 数 |
| `records[].totalTokens` | Integer | 总 token 数 |
| `records[].quotaCost` | Integer | 额度消耗 |
| `records[].successStatus` | Integer | 成功状态：0-失败，1-成功 |
| `records[].errorCode` | String | 错误码 |
| `records[].ragEnabled` | Integer | 是否启用 RAG：0-否，1-是 |
| `records[].ragHitCount` | Integer | RAG 命中数量 |
| `records[].ragDurationMs` | Long | RAG 检索耗时毫秒 |
| `records[].ragReferences` | Array | RAG 引用来源 |
| `records[].createdAt` | DateTime | 创建时间 |

---

## 2. 获取使用统计

**接口信息**
- 路径：`GET /api/sys/ai/usage-logs/stats`
- 鉴权：`ai:usage-stats:query`
- 说明：获取 AI 使用统计聚合数据

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `userId` | Long | 否 | 用户ID |
| `channelConfigId` | Long | 否 | 渠道配置ID |
| `startTime` | DateTime | 否 | 开始时间 |
| `endTime` | DateTime | 否 | 结束时间 |
| `successStatus` | Integer | 否 | 成功状态：0-失败，1-成功 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "totalCalls": 1000,
    "successCalls": 950,
    "failedCalls": 50,
    "totalTokens": 50000,
    "totalQuotaCost": 1000
  }
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `totalCalls` | long | 总调用次数 |
| `successCalls` | long | 成功调用次数 |
| `failedCalls` | long | 失败调用次数 |
| `totalTokens` | long | 总 token 数 |
| `totalQuotaCost` | long | 总额度消耗 |