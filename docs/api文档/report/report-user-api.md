# 举报模块 API - 用户端

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：本文档面向前端联调使用，提供举报提交、查询举报记录等用户端接口说明。

---

## 快速索引

| 前端页面 | 接口 |
|---|---|
| [举报提交页面](#1-举报提交页面) | 提交举报 |
| [我的举报记录页面](#2-我的举报记录页面) | 查询举报列表、举报详情 |

---

## 1. 举报提交页面

### 提交举报

**接口信息**
- 路径: `POST /api/user/reports`
- 鉴权: 必须（需要登录）
- 说明: 用户提交一个新的举报，支持文章、评论、聊天消息、论坛帖子、论坛回复等对象类型。

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `targetType` | String | 是 | 举报对象类型：`article` / `comment` / `chat_message` / `forum_post` / `forum_reply` |
| `targetId` | Long | 是 | 举报对象ID |
| `reasonCode` | String | 是 | 举报原因编码，最大4字符 |
| `reasonDetail` | String | 否 | 补充说明，最大12字符 |

**响应示例（成功）**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "targetType": "comment",
    "targetId": 501,
    "reasonCode": "spam",
    "reasonDetail": "该评论为垃圾广告内容，重复发布多次",
    "status": 0,
    "reportedAt": "2026-04-20T16:30:00",
    "handledAt": null,
    "resultType": null,
    "remark": null
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 举报记录ID |
| `targetType` | String | 举报对象类型：`article` / `comment` / `chat_message` / `forum_post` / `forum_reply` |
| `targetId` | Long | 被举报对象的ID |
| `reasonCode` | String | 举报原因编码 |
| `reasonDetail` | String | 用户补充的说明 |
| `status` | Integer | 举报状态：0-待处理/ 1-处理中/ 2-已处理/ 3-已驳回 |
| `reportedAt` | DateTime | 举报提交时间 |
| `handledAt` | DateTime | 处理时间，有值时表示已处理 |
| `resultType` | String | 处理结果类型，有值时表示已处理 |
| `remark` | String | 处理备注，有值时表示已处理 |

**错误码**

| code | 说明 |
|------|------|
| 401 | 未登录 |
| 400 | 参数校验失败（如缺少必填字段、targetType无效等） |
| 403 | 无权操作 |
| 500 | 服务器内部错误 |

**举报对象类型枚举（targetType）**

| 值 | 说明 | 示例场景 |
|------|------|---------|
| `article` | 文章 | 举报文章内容违规 |
| `comment` | 评论 | 举报评论包含不当信息 |
| `chat_message` | 聊天消息 | 举报聊天消息 |
| `forum_post` | 论坛帖子 | 举报论坛帖子违规 |
| `forum_reply` | 论坛回复 | 举报论坛回复违规 |

**举报原因编码枚举（reasonCode）**

| 值 | 说明 |
|------|------|
| `spam` | 垃圾广告 |
| `politics` | 政治敏感 |
| `porn` | 色情低俗 |
| `violence` | 血腥暴力 |
| `fraud` | 诈骗勒索 |
| `plagiarism` | 抄袭侵权 |
| `harassment` | 人身攻击 |
| `other` | 其他违规 |

---

## 2. 我的举报记录页面

### 查询我的举报列表

**接口信息**
- 路径: `GET /api/user/reports`
- 鉴权: 必须
- 说明: 分页查询当前用户的举报记录列表，支持按举报对象类型筛选。

**请求字段说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `targetType` | String | 否 | 举报对象类型筛选：`article` / `comment` / `chat_message` / `forum_post` / `forum_reply` |
| `current` | Long | 否 | 页码，默认`1`，最小值`1` |
| `size` | Long | 否 | 每页条数，默认`10`，最小值`1` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 2,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 2,
        "targetType": "article",
        "targetId": 100,
        "reasonCode": "plagiarism",
        "reasonDetail": "该文章疑似被他博主原创内容",
        "status": 1,
        "reportedAt": "2026-04-21T09:00:00",
        "handledAt": null,
        "resultType": null,
        "remark": null
      },
      {
        "id": 1,
        "targetType": "comment",
        "targetId": 501,
        "reasonCode": "spam",
        "reasonDetail": "该评论为垃圾广告内容",
        "status": 2,
        "reportedAt": "2026-04-20T16:30:00",
        "handledAt": "2026-04-21T10:00:00",
        "resultType": "delete_content",
        "remark": "已核实并删除违规评论"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | Long | 总记录数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页条数 |
| `records[]` | Array | 举报记录数组 |
| `records[].id` | Long | 举报ID |
| `records[].targetType` | String | 举报对象类型 |
| `records[].targetId` | Long | 举报对象ID |
| `records[].reasonCode` | String | 举报原因编码 |
| `records[].reasonDetail` | String | 补充说明 |
| `records[].status` | Integer | 状态：0-待处理/ 1-处理中/ 2-已处理/ 3-已驳回 |
| `records[].reportedAt` | DateTime | 举报时间 |
| `records[].handledAt` | DateTime | 处理时间 |
| `records[].resultType` | String | 处理结果类型 |
| `records[].remark` | String | 处理备注 |

**前端状态展示建议**

| status | 显示文案 | 显示样式 |
|--------|----------|---------|
| 0 | 待处理 | 灰色/橙色标签 |
| 1 | 处理中 | 蓝色标签 |
| 2 | 已处理 | 绿色标签 |
| 3 | 已驳回 | 灰色标签 |

---

### 查询举报详情

**接口信息**
- 路径: `GET /api/user/reports/{id}`
- 鉴权: 必须
- 说明: 查询单条举报记录的完整详情。仅允许查询本人提交的举报。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 举报记录ID（正整数） |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "targetType": "comment",
    "targetId": 501,
    "reasonCode": "spam",
    "reasonDetail": "该评论为垃圾广告内容，重复发布多次",
    "status": 2,
    "reportedAt": "2026-04-20T16:30:00",
    "handledAt": "2026-04-21T10:00:00",
    "resultType": "delete_content",
    "remark": "已核实并删除违规评论"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 举报ID |
| `targetType` | String | 举报对象类型 |
| `targetId` | Long | 举报对象ID |
| `reasonCode` | String | 举报原因编码 |
| `reasonDetail` | String | 用户补充的说明 |
| `status` | Integer | 举报状态：0-待处理/ 1-处理中/ 2-已处理/ 3-已驳回 |
| `reportedAt` | DateTime | 举报时间（有值时表示已处理/已驳回时才有值） |
| `handledAt` | DateTime | 处理时间（有值时表示已处理/已驳回时才有值） |
| `resultType` | String | 处理结果类型（有值时表示已处理/已驳回时才有值） |
| `remark` | String | 处理备注（有值时表示已处理/已驳回时才有值） |

**错误码**

| code | 说明 |
|------|------|
| 401 | 未登录 |
| 403 | 无权查看该举报 |
| 404 | 举报记录不存在 |

---