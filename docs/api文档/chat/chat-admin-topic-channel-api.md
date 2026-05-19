# 后台主题频道管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

以下接口路径前缀为 `/api/sys/chats/topic-channels`。

---

### 创建主题频道

**接口信息**
- 路径: `POST /api/sys/chats/topic-channels`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台创建主题频道

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| name | String | 是 | 频道名称 |
| avatar | String | 否 | 频道头像URL |
| description | String | 否 | 频道描述 |
| categoryCode | String | 否 | 分类编码 |
| visibilityScope | String | 否 | 可见范围 |
| joinRule | String | 否 | 加入规则 |
| speakLevelLimit | Integer | 否 | 发言等级限制 |
| memberLimit | Integer | 否 | 成员上限 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2001,
    "conversationType": "group",
    "sceneType": "public_channel",
    "name": "技术讨论频道",
    "status": 0,
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 编辑主题频道

**接口信息**
- 路径: `PUT /api/sys/chats/topic-channels/{conversationId}`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台编辑指定主题频道的信息

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| name | String | 否 | 频道名称 |
| avatar | String | 否 | 频道头像URL |
| description | String | 否 | 频道描述 |
| categoryCode | String | 否 | 分类编码 |
| visibilityScope | String | 否 | 可见范围 |
| joinRule | String | 否 | 加入规则 |
| speakLevelLimit | Integer | 否 | 发言等级限制 |
| memberLimit | Integer | 否 | 成员上限 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2001,
    "conversationType": "group",
    "sceneType": "public_channel",
    "name": "技术讨论频道V2",
    "status": 0,
    "updatedAt": "2025-01-15T12:30:00"
  }
}
```

---
