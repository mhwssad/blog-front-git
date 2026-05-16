# 后台数据看板接口文档

> 本文档面向前端联调，覆盖后台数据看板的核心概览、内容统计、社区统计、AI 统计、治理统计与 Excel 导出。

**基础信息**

- 基础路径：`/api/sys/dashboard`
- 内容类型：`application/json`
- 统一响应格式：`Result<T>`
- 通用响应字段：`code`(业务码)、`message`(信息)、`timestamp`(时间戳)、`data`(数据)

**业务码约定**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 解析 data |
| 40001 | 参数校验失败 | 提示 message |
| 40011 | 非法参数 | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |

## 快速接口对照表

| 用途 | 方法 | 路径 |
|---|---|---|
| 核心概览 | GET | `/api/sys/dashboard/overview` |
| 内容统计 | GET | `/api/sys/dashboard/content` |
| 社区统计 | GET | `/api/sys/dashboard/community` |
| AI 调用统计 | GET | `/api/sys/dashboard/ai` |
| 治理统计 | GET | `/api/sys/dashboard/governance` |
| 导出 Excel | GET | `/api/sys/dashboard/export` |

---

## 1. 鉴权要求

所有看板接口要求：

```http
Authorization: Bearer <accessToken>
权限：sys:dashboard:query
```

## 2. 公共查询参数

所有看板接口共享以下查询参数（`DashboardRangeQuery`）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围：`today` / `week` / `month` / `all` / `custom`，默认 `today` |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填，ISO 8601 格式（如 `2026-05-01T00:00:00`） |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填，ISO 8601 格式（如 `2026-05-16T23:59:59`） |

**rangeType 含义**：

| 值 | 说明 |
|---|---|
| `today` | 今日（当天 00:00 ~ 次日 00:00） |
| `week` | 本周（本周一 00:00 ~ 下周一 00:00） |
| `month` | 本月（本月 1 日 00:00 ~ 下月 1 日 00:00） |
| `all` | 全部（startTime / endTime 为空） |
| `custom` | 自定义，必须同时传 startTime 和 endTime |

**边界说明**：
- `rangeType` 传入非法值时返回 `40011 / 非法参数`（仅支持 `today`/`week`/`month`/`all`/`custom`）
- `rangeType=custom` 时，`startTime` 和 `endTime` 必须同时传入，否则返回参数校验失败
- `startTime` 必须早于 `endTime`，否则返回参数校验失败
- 自定义时间范围不能超过 366 天，超出返回参数校验失败
- 不传 `rangeType` 时默认按 `today` 统计

## 3. 当前能力范围

- 核心概览指标（用户、文章、评论、消息、AI 调用、举报）
- 内容统计（文章、评论、点赞、收藏）
- 社区统计（私信消息、大厅消息、群组数量、论坛发帖/回复、热门版块）
- AI 调用统计（总调用、成功、失败、RAG 调用、Agent 任务）
- 治理统计（举报各状态数量、处理耗时、处罚分布）
- 当前时间范围运营统计 Excel 导出

---

## 4. 接口详情

### 4.1 核心概览

**接口信息**

- 路径：`GET /api/sys/dashboard/overview`
- 鉴权：是（`sys:dashboard:query`）
- 说明：获取看板核心概览指标，包括用户、文章、评论、消息、AI 调用、举报等汇总数据

**请求示例**

```javascript
// axios
axios.get('/api/sys/dashboard/overview', {
  params: { rangeType: 'today' },
  headers: { Authorization: 'Bearer xxx' }
})
```

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围，默认 `today`，详见公共查询参数 |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填 |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "range": {
      "rangeType": "today",
      "startTime": "2026-05-16T00:00:00",
      "endTime": "2026-05-17T00:00:00"
    },
    "registeredUserCount": 1024,
    "activeUserCount": 86,
    "authorCount": 52,
    "articleCount": 15,
    "pendingArticleReviewCount": 3,
    "commentCount": 47,
    "chatMessageCount": 230,
    "aiCallCount": 68,
    "reportCount": 2,
    "pendingReportCount": 1
  }
}
```

**响应字段说明** `DashboardOverviewVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | Object | 时间范围 |
| `range.rangeType` | String | 时间范围类型 |
| `range.startTime` | DateTime | 统计开始时间，`all` 时为 `null` |
| `range.endTime` | DateTime | 统计结束时间，`all` 时为 `null` |
| `registeredUserCount` | Long | 注册用户数 |
| `activeUserCount` | Long | 活跃用户数 |
| `authorCount` | Long | 作者数量 |
| `articleCount` | Long | 文章总数 |
| `pendingArticleReviewCount` | Long | 待审核文章数 |
| `commentCount` | Long | 评论数 |
| `chatMessageCount` | Long | 私信消息数 |
| `aiCallCount` | Long | AI 调用次数 |
| `reportCount` | Long | 举报总数 |
| `pendingReportCount` | Long | 待处理举报数（全局，不受时间范围限制） |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败（时间范围不合法等） | 提示 message |
| 40011 | 非法参数（rangeType 不合法） | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |

---

### 4.2 内容统计

**接口信息**

- 路径：`GET /api/sys/dashboard/content`
- 鉴权：是（`sys:dashboard:query`）
- 说明：获取内容统计指标，包括文章、评论、点赞、收藏等数据

**请求示例**

```javascript
// axios
axios.get('/api/sys/dashboard/content', {
  params: { rangeType: 'week' },
  headers: { Authorization: 'Bearer xxx' }
})
```

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围，默认 `today`，详见公共查询参数 |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填 |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "range": {
      "rangeType": "week",
      "startTime": "2026-05-11T00:00:00",
      "endTime": "2026-05-18T00:00:00"
    },
    "articleCount": 42,
    "pendingArticleReviewCount": 3,
    "commentCount": 128,
    "likeCount": 356,
    "collectCount": 89
  }
}
```

**响应字段说明** `DashboardContentVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | Object | 时间范围 |
| `range.rangeType` | String | 时间范围类型 |
| `range.startTime` | DateTime | 统计开始时间，`all` 时为 `null` |
| `range.endTime` | DateTime | 统计结束时间，`all` 时为 `null` |
| `articleCount` | Long | 文章总数 |
| `pendingArticleReviewCount` | Long | 待审核文章数 |
| `commentCount` | Long | 评论数 |
| `likeCount` | Long | 点赞数 |
| `collectCount` | Long | 收藏数 |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败（时间范围不合法等） | 提示 message |
| 40011 | 非法参数（rangeType 不合法） | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |

---

### 4.3 社区统计

**接口信息**

- 路径：`GET /api/sys/dashboard/community`
- 鉴权：是（`sys:dashboard:query`）
- 说明：获取社区统计指标，包括私信、大厅消息、群组、论坛发帖/回复和热门版块

**请求示例**

```javascript
// axios
axios.get('/api/sys/dashboard/community', {
  params: { rangeType: 'month' },
  headers: { Authorization: 'Bearer xxx' }
})
```

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围，默认 `today`，详见公共查询参数 |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填 |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "range": {
      "rangeType": "month",
      "startTime": "2026-05-01T00:00:00",
      "endTime": "2026-06-01T00:00:00"
    },
    "chatMessageCount": 1560,
    "lobbyMessageCount": 432,
    "groupCount": 28,
    "forumPostCount": 86,
    "forumReplyCount": 214,
    "hotSections": [
      {
        "sectionId": 3,
        "sectionName": "综合讨论",
        "postCount": 32,
        "replyCount": 98,
        "hotValue": 130
      },
      {
        "sectionId": 1,
        "sectionName": "技术交流",
        "postCount": 20,
        "replyCount": 67,
        "hotValue": 87
      }
    ]
  }
}
```

**响应字段说明** `DashboardCommunityVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | Object | 时间范围 |
| `range.rangeType` | String | 时间范围类型 |
| `range.startTime` | DateTime | 统计开始时间，`all` 时为 `null` |
| `range.endTime` | DateTime | 统计结束时间，`all` 时为 `null` |
| `chatMessageCount` | Long | 私信消息数 |
| `lobbyMessageCount` | Long | 大厅消息数 |
| `groupCount` | Long | 群组数量 |
| `forumPostCount` | Long | 论坛发帖数 |
| `forumReplyCount` | Long | 论坛回复数 |
| `hotSections` | Array | 热门版块 Top 5 |
| `hotSections[].sectionId` | Long | 版块 ID |
| `hotSections[].sectionName` | String | 版块名称 |
| `hotSections[].postCount` | Long | 版块发帖数 |
| `hotSections[].replyCount` | Long | 版块回复数 |
| `hotSections[].hotValue` | Long | 热度值（发帖数 + 回复数） |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败（时间范围不合法等） | 提示 message |
| 40011 | 非法参数（rangeType 不合法） | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |

---

### 4.4 AI 调用统计

**接口信息**

- 路径：`GET /api/sys/dashboard/ai`
- 鉴权：是（`sys:dashboard:query`）
- 说明：获取 AI 调用统计指标，包括总调用、成功、失败、RAG 调用和 Agent 任务数据

**请求示例**

```javascript
// axios
axios.get('/api/sys/dashboard/ai', {
  params: { rangeType: 'today' },
  headers: { Authorization: 'Bearer xxx' }
})
```

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围，默认 `today`，详见公共查询参数 |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填 |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "range": {
      "rangeType": "today",
      "startTime": "2026-05-16T00:00:00",
      "endTime": "2026-05-17T00:00:00"
    },
    "aiCallCount": 68,
    "aiSuccessCallCount": 65,
    "aiFailedCallCount": 3,
    "ragCallCount": 5,
    "agentTaskCount": 12,
    "agentSuccessTaskCount": 9,
    "agentFailedTaskCount": 2
  }
}
```

**响应字段说明** `DashboardAiVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | Object | 时间范围 |
| `range.rangeType` | String | 时间范围类型 |
| `range.startTime` | DateTime | 统计开始时间，`all` 时为 `null` |
| `range.endTime` | DateTime | 统计结束时间，`all` 时为 `null` |
| `aiCallCount` | Long | AI 调用总次数 |
| `aiSuccessCallCount` | Long | AI 成功调用次数 |
| `aiFailedCallCount` | Long | AI 失败调用次数 |
| `ragCallCount` | Long | RAG 调用次数 |
| `agentTaskCount` | Long | Agent 任务总数 |
| `agentSuccessTaskCount` | Long | Agent 成功任务数 |
| `agentFailedTaskCount` | Long | Agent 失败任务数 |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败（时间范围不合法等） | 提示 message |
| 40011 | 非法参数（rangeType 不合法） | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |

---

### 4.5 治理统计

**接口信息**

- 路径：`GET /api/sys/dashboard/governance`
- 鉴权：是（`sys:dashboard:query`）
- 说明：获取治理统计指标，包括举报各状态数量、平均处理耗时和处罚类型分布

**请求示例**

```javascript
// axios
axios.get('/api/sys/dashboard/governance', {
  params: { rangeType: 'all' },
  headers: { Authorization: 'Bearer xxx' }
})
```

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围，默认 `today`，详见公共查询参数 |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填 |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "range": {
      "rangeType": "all",
      "startTime": null,
      "endTime": null
    },
    "reportCount": 35,
    "pendingReportCount": 1,
    "processingReportCount": 2,
    "handledReportCount": 28,
    "rejectedReportCount": 4,
    "averageHandleDurationMinutes": 18.75,
    "punishmentDistributions": [
      { "punishmentType": "mute", "count": 10 },
      { "punishmentType": "none", "count": 6 }
    ]
  }
}
```

**响应字段说明** `DashboardGovernanceVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | Object | 时间范围 |
| `range.rangeType` | String | 时间范围类型 |
| `range.startTime` | DateTime | 统计开始时间，`all` 时为 `null` |
| `range.endTime` | DateTime | 统计结束时间，`all` 时为 `null` |
| `reportCount` | Long | 举报总数（时间范围内） |
| `pendingReportCount` | Long | 待处理举报数（全局，不受时间范围限制） |
| `processingReportCount` | Long | 处理中举报数（时间范围内） |
| `handledReportCount` | Long | 已处理举报数（时间范围内） |
| `rejectedReportCount` | Long | 已驳回举报数（时间范围内） |
| `averageHandleDurationMinutes` | BigDecimal | 平均举报处理耗时（分钟） |
| `punishmentDistributions` | Array | 举报处罚类型分布 |
| `punishmentDistributions[].punishmentType` | String | 处罚类型，空值归为 `none` |
| `punishmentDistributions[].count` | Long | 数量 |

> 说明：`pendingReportCount` 始终为全局待处理数量，不受时间范围筛选。其余字段均按请求中的时间范围统计。

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败（时间范围不合法等） | 提示 message |
| 40011 | 非法参数（rangeType 不合法） | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |

---

### 4.6 导出运营看板统计

**接口信息**

- 路径：`GET /api/sys/dashboard/export`
- 鉴权：是（`sys:dashboard:query`）
- 说明：导出当前时间范围的运营看板统计数据为 Excel 文件

**请求示例**

```javascript
// axios
axios.get('/api/sys/dashboard/export', {
  params: { rangeType: 'month' },
  responseType: 'blob',
  headers: { Authorization: 'Bearer xxx' }
})
```

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rangeType` | String | 否 | 时间范围，默认 `today`，详见公共查询参数 |
| `startTime` | DateTime | 条件必填 | 自定义开始时间，`rangeType=custom` 时必填 |
| `endTime` | DateTime | 条件必填 | 自定义结束时间，`rangeType=custom` 时必填 |

**响应说明**

响应为 Excel 文件流，非 JSON 格式。

| 响应头 | 值 | 说明 |
|---|---|---|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Excel MIME 类型 |
| `Content-Disposition` | `attachment; filename="dashboard-2026-05-16.xlsx"` | 附件下载，文件名格式 `dashboard-yyyy-MM-dd.xlsx` |
| `Content-Length` | 文件字节数 | 文件大小 |

**导出内容**

- `概览`、`内容`、`社区`、`AI`、`治理` 汇总 sheet
- `热门版块` 明细 sheet
- `处罚分布` 明细 sheet

> 说明：时间范围校验规则与其他看板接口一致，导出统计口径与对应 JSON 看板接口一致。

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败（时间范围不合法等） | 提示 message |
| 40011 | 非法参数（rangeType 不合法） | 提示 message |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示无权限 |
| 50000 | 系统异常 | 提示稍后重试 |
