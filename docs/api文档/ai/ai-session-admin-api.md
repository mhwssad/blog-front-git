# AI 会话管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：后台管理员查看和管理用户 AI 会话，包括会话列表查询、会话详情查看等。

---

## 权限说明

所有接口都需要：
1. 登录状态
2. 对应权限

| 权限标识 | 说明 |
|---|---|
| `ai:session:query` | 会话查询权限 |

---

## 1. 分页查询用户会话

**接口信息**
- 路径：`GET /api/sys/ai/sessions`
- 鉴权：`ai:session:query`
- 说明：后台分页查询所有用户的 AI 会话列表

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `20` |
| `userId` | Long | 否 | 按用户ID筛选 |
| `status` | Integer | 否 | 会话状态：0-关闭，1-正常 |
| `channelConfigId` | Long | 否 | 按渠道配置ID筛选 |
| `startTime` | DateTime | 否 | 开始时间 |
| `endTime` | DateTime | 否 | 结束时间 |

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
        "username": "zhangsan",
        "nickname": "张三",
        "channelConfigId": 1,
        "channelName": "DeepSeek 对话渠道",
        "title": "Java 学习助手",
        "sceneType": "general",
        "status": 1,
        "lastMessageAt": "2026-04-15T14:05:00",
        "createdAt": "2026-04-15T14:00:00",
        "updatedAt": "2026-04-15T14:05:00"
      }
    ]
  }
}
```

**响应字段**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records[].id` | Long | 会话ID |
| `records[].userId` | Long | 用户ID |
| `records[].username` | String | 用户名 |
| `records[].nickname` | String | 用户昵称 |
| `records[].channelConfigId` | Long | 渠道配置ID |
| `records[].channelName` | String | 渠道名称 |
| `records[].title` | String | 会话标题 |
| `records[].sceneType` | String | 场景类型 |
| `records[].status` | Integer | 状态：0-关闭，1-正常 |
| `records[].lastMessageAt` | DateTime | 最后消息时间 |
| `records[].createdAt` | DateTime | 创建时间 |
| `records[].updatedAt` | DateTime | 更新时间 |

---

## 2. 查询会话详情

**接口信息**
- 路径：`GET /api/sys/ai/sessions/{id}`
- 鉴权：`ai:session:query`
- 说明：后台查询指定会话的详细信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|
| `id` | Long | 是 | 会话ID |

**响应字段**：同分页查询用户会话的单条记录