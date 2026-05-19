# 举报模块 API - 后台管理

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：本文档面向后台管理员，提供举报列表、举报处理、处理日志等后台管理功能说明。

---

## 快速索引

| 前端页面 | 接口 |
|---|---|
| [后台举报列表页面](#3-后台举报列表页面) | 分页筛选举报、处理举报详情 |
| [后台举报处理平台](#4-后台举报处理平台) | 接手、处理、驳回、超级接管接口 |
| [后台处理日志页面](#5-后台处理日志页面) | 处理日志查询 |

---

## 3. 后台举报列表页面

### 分页筛选举报

**接口信息**
- 路径: `GET /api/sys/reports`
- 鉴权: 必须（需 `sys:report:query` 权限）
- 说明: 管理员分页查询举报列表，支持按状态、对象类型、举报人ID、时间范围等条件筛选。

**请求字段说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | Integer | 否 | 状态筛选：0-待处理/ 1-处理中/ 2-已处理/ 3-已驳回 |
| `reportTargetType` | String | 否 | 举报对象类型筛选：`article` / `comment` / `chat_message` / `forum_post` / `forum_reply` |
| `reporterUserId` | Long | 否 | 举报人ID精确筛选 |
| `reportedStart` | LocalDateTime | 否 | 举报时间范围起点（含） |
| `reportedEnd` | LocalDateTime | 否 | 举报时间范围终点（含） |
| `current` | Long | 否 | 页码，默认`1` |
| `size` | Long | 否 | 每页条数，默认`20`，上限`100` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 1,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1,
        "reportTargetType": "comment",
        "reportTargetId": 501,
        "reporterUserId": 5,
        "reporterUsername": "wangwu",
        "reasonCode": "spam",
        "reasonDetail": "该评论为垃圾广告内容",
        "status": 1,
        "handlerUserId": 1,
        "handlerUsername": "admin",
        "resultType": null,
        "punishmentType": null,
        "reportedAt": "2026-04-20T16:30:00",
        "handledAt": null,
        "remark": null,
        "createdAt": "2026-04-20T16:30:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | Long | 符合条件的总记录数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页条数 |
| `records[].id` | Long | 举报记录ID |
| `records[].reportTargetType` | String | 被举报对象类型 |
| `records[].reportTargetId` | Long | 被举报对象ID |
| `records[].reporterUserId` | Long | 举报人用户ID |
| `records[].reporterUsername` | String | 举报人用户名 |
| `records[].reasonCode` | String | 举报原因编码 |
| `records[].reasonDetail` | String | 举报补充说明 |
| `records[].status` | Integer | 状态：0-待处理/ 1-处理中/ 2-已处理/ 3-已驳回 |
| `records[].handlerUserId` | Long | 当前处理人ID（处理中/已处理/已驳回时有值） |
| `records[].handlerUsername` | String | 处理人用户名 |
| `records[].resultType` | String | 处理结果类型（已处理时有值） |
| `records[].punishmentType` | String | 处罚类型（已处理时有值） |
| `records[].reportedAt` | DateTime | 举报时间 |
| `records[].handledAt` | DateTime | 处理时间（已处理/已驳回时有值） |
| `records[].remark` | String | 处理备注（已处理/已驳回时有值） |
| `records[].createdAt` | DateTime | 记录创建时间 |

---

### 举报详情（后台）

**接口信息**
- 路径: `GET /api/sys/reports/{id}`
- 鉴权: 必须（需 `sys:report:query` 权限）
- 说明: 查询单条举报记录的完整详情，包含处理人、被举报对象信息。

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
    "reportTargetType": "comment",
    "reportTargetId": 501,
    "reporterUserId": 5,
    "reporterUsername": "wangwu",
    "reasonCode": "spam",
    "reasonDetail": "该评论为垃圾广告内容",
    "status": 2,
    "handlerUserId": 1,
    "handlerUsername": "admin",
    "resultType": "delete_content",
    "punishmentType": "content_delete",
    "reportedAt": "2026-04-20T16:30:00",
    "handledAt": "2026-04-21T10:00:00",
    "remark": "已核实并删除违规评论",
    "createdAt": "2026-04-20T16:30:00"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 举报ID |
| `reportTargetType` | String | 被举报对象类型 |
| `reportTargetId` | Long | 被举报对象ID |
| `reporterUserId` | Long | 举报人ID |
| `reporterUsername` | String | 举报人用户名 |
| `reasonCode` | String | 举报原因编码 |
| `reasonDetail` | String | 补充说明 |
| `status` | Integer | 举报状态：0-待处理/ 1-处理中/ 2-已处理/ 3-已驳回 |
| `handlerUserId` | Long | 处理人ID |
| `handlerUsername` | String | 处理人用户名 |
| `resultType` | String | 处理结果类型 |
| `punishmentType` | String | 处罚类型 |
| `reportedAt` | DateTime | 举报时间 |
| `handledAt` | DateTime | 处理时间 |
| `remark` | String | 处理备注 |
| `createdAt` | DateTime | 创建时间 |

**错误码**

| code | 说明 |
|------|------|
| 401 | 未登录 |
| 403 | 无`sys:report:query`权限 |
| 404 | 举报记录不存在 |

---

## 4. 后台举报处理平台

### 接手举报

**接口信息**
- 路径: `PUT /api/sys/reports/{id}/take`
- 鉴权: 必须（需 `sys:report:handle` 权限）
- 说明: 将待处理状态的举报标记为处理中，记录当前操作人为处理人。只能在举报状态为待处理（status=0）时操作。

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
  "data": null
}
```

**错误码**

| code | 说明 |
|------|------|
| 400 | 举报状态不是待处理 |
| 403 | 无`sys:report:handle`权限 |
| 404 | 举报记录不存在 |

**前端操作前提检查**
- 接手前需确认举报状态为 `0-待处理`
- 接手后状态变为 `1-处理中`，处理人变为当前管理员

---

### 处理举报

**接口信息**
- 路径: `PUT /api/sys/reports/{id}/handle`
- 鉴权: 必须（需 `sys:report:handle` 权限）
- 说明: 对举报进行处理并执行对应治理动作（删除内容、撤回消息、禁言、封禁等）。处理后将状态改为已处理，记录处理日志，并自动向举报人发送站内通知。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 举报记录ID（正整数） |

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `resultType` | String | 是 | 处理结果类型：`delete_content` / `revoke_message` / `mute_user` / `ban_user` / `record_only` |
| `punishmentType` | String | 否 | 处罚类型：`content_delete` / `message_revoke` / `mute` / `ban` / `none` |
| `remark` | String | 否 | 处理备注，最大512字符 |
| `conversationId` | Long | 否 | 会话ID，`resultType=revoke_message` 或 `muteScope` 为 `topic_channel`/`group` 时作为关联会话 |
| `muteScope` | String | 否 | 禁言范围，`resultType=mute_user` 时使用：`global` / `lobby` / `topic_channel` / `group` |
| `muteUntil` | DateTime | 否 | 禁言截止时间，`resultType=mute_user` 时使用；默认禁言1天；传入 `null` 表示永久禁言 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**resultType 枚举值**

| 值 | 说明 | 触发动作 |
|------|------|---------|
| `delete_content` | 删除内容 | 删除被举报的文章/评论/论坛帖子/论坛回复 |
| `revoke_message` | 撤回消息 | 撤回被举报的聊天消息（需`conversationId`） |
| `mute_user` | 禁言用户 | 调用禁言服务创建禁言记录 |
| `ban_user` | 封禁用户 | 封禁被举报用户 |
| `record_only` | 仅记录 | 不执行处置，仅记录处理结果 |

**punishmentType 枚举值**

| 值 | 说明 |
|------|------|
| `content_delete` | 内容删除 |
| `message_revoke` | 消息撤回 |
| `mute` | 禁言 |
| `ban` | 封禁 |
| `none` | 无处置 |

**禁言参数说明**

当`resultType = mute_user`时，系统会自动调用统一禁言服务：

| 参数组合 | 效果 |
|----------|------|
| 不传 `muteScope` | 默认全站禁言（`global`） |
| 不传 `muteUntil` | 默认禁言1天 |
| `muteScope=global` | 隔离所有聊天场景 |
| `muteScope=lobby` | 隔离大厅和全站频道 |
| `muteScope=topic_channel` + `conversationId` | 仅在指定主题频道禁言 |
| `muteScope=group` + `conversationId` | 仅在指定群组禁言 |
| `muteUntil=null` | 永久禁言 |

禁言记录来源标记为`report`，并关联原举报ID。

**处理结果通知**

处理完成后，系统会自动向举报人发站内通知（受用户 `report_result` 通知偏好控制）：

| 处理场景 | 通知标题 | 通知内容示例 |
|----------|----------|-------------|
| `delete_content` | 你的举报已处理 | 你举报的评论已被删除 |
| `revoke_message` | 你的举报已处理 | 你举报的消息已被撤回 |
| `mute_user` | 你的举报已处理 | 相关用户已被禁言 |
| `ban_user` | 你的举报已处理 | 相关用户已被封禁 |
| `record_only` | 你的举报已处理 | 你举报的内容已经审核处理 |
| 驳回（reject） | 你的举报已驳回 | 你举报的内容经审核未违规（附驳回原因） |

**错误码**

| code | 说明 |
|------|------|
| 400 | 举报状态不是待处理或处理中 |
| 400 | 缺少 resultType |
| 400 | resultType 无效 |
| 403 | 无`sys:report:handle`权限 |
| 404 | 举报记录不存在 |

---

### 驳回举报

**接口信息**
- 路径: `PUT /api/sys/reports/{id}/reject`
- 鉴权: 必须（需 `sys:report:handle` 权限）
- 说明: 驳回无效举报，将状态标记为已驳回并记录驳回备注。驳回后会向举报人发站内通知。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 举报记录ID（正整数） |

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `remark` | String | 否 | 驳回原因备注，最大512字符 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**驳回结果通知**

驳回后系统自动向举报人发站内通知：
- 通知类型：`REPORT_RESULT`
- 通知标题：你的举报已驳回
- 通知内容：你举报的对象类型}经审核未违规（附驳回原因，截取前100字符）

**错误码**

| code | 说明 |
|------|------|
| 400 | 举报状态不是待处理或处理中 |
| 403 | 无`sys:report:handle`权限 |
| 404 | 举报记录不存在 |

---

### 超级接管举报

**接口信息**
- 路径: `PUT /api/sys/reports/{id}/override`
- 鉴权: 必须（需 `sys:report:handle` 权限，仅超级管理员可操作）
- 说明: 超级管理员强接正在处理中的举报，重新指定并记录原处理人。仅处理中或已驳回的举报可再接管。

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
  "data": null
}
```

**前置条件**
- 仅超级管理员可操作
- 举报状态必须不是已处理（status=2）或已驳回（status=3）
- 接管后状态变为 `1-处理中`，处理人变为当前超级管理员

**错误码**

| code | 说明 |
|------|------|
| 400 | 举报已处理或已驳回，不可再接管 |
| 403 | 无`sys:report:handle`权限或非超级 |
| 404 | 举报记录不存在 |

---

## 5. 后台处理日志页面

### 处理日志查询

**接口信息**
- 路径: `GET /api/sys/reports/{id}/logs`
- 鉴权: 必须（需 `sys:report:query` 权限）
- 说明: 查询某条举报记录的所有处理操作日志，包含接手、处理、驳回、超级接管等操作记录。按时间倒序排列。

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
  "data": [
    {
      "id": 4,
      "fromStatus": 1,
      "toStatus": 2,
      "actionType": "approve",
      "actionResult": "delete_content",
      "operatorUserId": 1,
      "operatorUsername": "admin",
      "actionRemark": "已核实并删除违规评论",
      "createdAt": "2026-04-21T10:00:00"
    },
    {
      "id": 3,
      "fromStatus": 0,
      "toStatus": 1,
      "actionType": "claim",
      "actionResult": null,
      "operatorUserId": 1,
      "operatorUsername": "admin",
      "actionRemark": null,
      "createdAt": "2026-04-21T09:30:00"
    },
    {
      "id": 2,
      "fromStatus": 1,
      "toStatus": 1,
      "actionType": "reassign",
      "actionResult": null,
      "operatorUserId": 2,
      "operatorUsername": "superadmin",
      "actionRemark": "超级接管，原处理人 1",
      "createdAt": "2026-04-21T09:45:00"
    },
    {
      "id": 1,
      "fromStatus": null,
      "toStatus": 0,
      "actionType": "create",
      "actionResult": null,
      "operatorUserId": 5,
      "operatorUsername": "wangwu",
      "actionRemark": null,
      "createdAt": "2026-04-20T16:30:00"
    }
  ]
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 日志记录ID |
| `fromStatus` | Integer | 变更前状态（null 表示初始创建） |
| `toStatus` | Integer | 变更后状态 |
| `actionType` | String | 操作类型 |
| `actionResult` | String | 处理结果（仅 approve 操作时有值） |
| `operatorUserId` | Long | 操作人用户ID |
| `operatorUsername` | String | 操作人用户名 |
| `actionRemark` | String | 操作备注 |
| `createdAt` | DateTime | 操作时间 |

**actionType 操作类型枚举**

| 值 | 说明 | fromStatus | toStatus |
|------|------|------------|----------|
| `create` | 举报提交 | null | 0 |
| `claim` | 管理员接手 | 0 | 1 |
| `approve` | 管理员处理通过 | 1 | 2 |
| `reject` | 管理员驳回 | 1 | 3 |
| `reassign` | 超级接管 | 1 | 1 |
| `close` | 关闭流程 | - | - |

**fromStatus / toStatus 状态枚举**

| 值 | 说明 |
|------|------|
| 0 | 待处理 |
| 1 | 处理中 |
| 2 | 已处理 |
| 3 | 已驳回 |

**错误码**

| code | 说明 |
|------|------|
| 401 | 未登录 |
| 403 | 无`sys:report:query`权限 |
| 404 | 举报记录不存在 |

---