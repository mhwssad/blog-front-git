# 外部博客迁移接口文档

> 本文档面向前端联调，覆盖外部博客 JSON 文件迁移的任务创建、预检、执行、查询与失败导出。

**基础信息**

- 基础路径：`/api/sys/migrations/blog`
- 内容类型：`application/json`（文件上传为 `multipart/form-data`）
- 统一响应格式：`Result<T>` 或 `Result<PageResult<T>>`
- 通用响应字段：`code`(业务码)、`message`(信息)、`timestamp`(时间)、`data`(数据)

**业务码约定**

| code | 说明 |
|-----|------|
| 200 | 成功 |
| 40011 | 参数/业务校验失败 |
| 40101 | 未登录 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 50001 | 系统异常 |

---

## 快速接口对照表

| 用途 | 方法 | 路径 | 权限 |
|---|---|---|---|
| 创建任务 | POST | `/api/sys/migrations/blog/tasks` | `content:migration:create` |
| 执行预检 | POST | `/api/sys/migrations/blog/tasks/{id}/precheck` | `content:migration:execute` |
| 执行导入 | POST | `/api/sys/migrations/blog/tasks/{id}/execute` | `content:migration:execute` |
| 分页查询任务 | GET | `/api/sys/migrations/blog/tasks` | `content:migration:query` |
| 查询任务详情 | GET | `/api/sys/migrations/blog/tasks/{id}` | `content:migration:query` |
| 分页查询记录 | GET | `/api/sys/migrations/blog/tasks/{id}/records` | `content:migration:query` |
| 导出失败记录 | GET | `/api/sys/migrations/blog/tasks/{id}/failures/export` | `content:migration:export` |

## 1. 能力范围

- 后台上传 JSON 迁移文件并创建任务
- 任务指定站内作者，所有导入文章归属该作者
- 分类和标签必须预先存在，不自动创建
- 外部附件下载入库后替换正文和封面 URL，再复用后台文章创建链路导入文章
- 支持预检、执行、任务/记录查询和失败记录 Excel 导出

## 2. 鉴权要求

接口统一前缀：`/api/sys/migrations/blog`，均要求后台登录。

| 权限标识 | 说明 |
|---|---|
| `content:migration:query` | 查询迁移任务、详情和记录 |
| `content:migration:create` | 创建迁移任务 |
| `content:migration:execute` | 执行预检和导入 |
| `content:migration:export` | 导出失败记录 |

## 3. JSON v1 格式

上传的迁移文件必须为以下格式：

```json
{
  "sourcePlatform": "wordpress",
  "posts": [
    {
      "externalPostId": "post-1",
      "title": "标题",
      "summary": "摘要",
      "content": "正文，支持 Markdown/HTML",
      "coverImageUrl": "https://example.com/a.jpg",
      "categoryCodes": ["tech"],
      "tagNames": ["Java"],
      "isOriginal": 1,
      "sourceUrl": null,
      "status": 0,
      "publishTime": "2026-05-05 10:00:00",
      "attachments": [
        {
          "url": "https://example.com/a.jpg",
          "originalName": "a.jpg"
        }
      ]
    }
  ]
}
```

**JSON 字段说明**：

**BlogMigrationImportFile**（根对象）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sourcePlatform` | String | 是 | 来源平台，会标准化为小写 |
| `posts` | List\<BlogMigrationPostItem\> | 是 | 文章列表，不能为空 |

**BlogMigrationPostItem**（文章数据项）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `externalPostId` | String | 是 | 外部文章 ID，不能为空 |
| `title` | String | 是 | 文章标题，不能为空 |
| `summary` | String | 否 | 文章摘要 |
| `content` | String | 否 | 文章正文，支持 Markdown/HTML |
| `coverImageUrl` | String | 否 | 封面图片 URL |
| `categoryCodes` | List\<String\> | 否 | 分类编码列表 |
| `tagNames` | List\<String\> | 否 | 标签名称列表 |
| `isOriginal` | Integer | 否 | 是否原创 |
| `sourceUrl` | String | 否 | 原文链接 |
| `status` | Integer | 否 | 文章状态 |
| `publishTime` | String | 否 | 发布时间，格式 `yyyy-MM-dd HH:mm:ss` |
| `attachments` | List\<BlogMigrationAttachmentItem\> | 否 | 附件列表 |

**BlogMigrationAttachmentItem**（附件数据项）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `url` | String | 是 | 附件 URL，不能为空，仅支持 `http`/`https` |
| `originalName` | String | 否 | 附件原始文件名 |

**关键约束**：
- 幂等键为 `sourcePlatform + ":" + externalPostId`
- 同一任务内重复 `externalPostId` 预检失败
- 全局已成功导入的幂等键，执行时跳过并记录 `SKIPPED`
- 附件下载失败时，该文章导入失败，不创建部分文章

---

## 4. 接口详情

### 4.1 创建任务

**接口信息**

- 路径：`POST /api/sys/migrations/blog/tasks`
- Content-Type：`multipart/form-data`
- 鉴权：`content:migration:create`
- 说明：上传 JSON 迁移文件并创建迁移任务，导入文章归属指定作者

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `authorId` | Long | 是 | 导入文章归属作者 ID |
| `remark` | String | 否 | 备注，最多 256 字符 |
| `file` | File | 是 | JSON 迁移文件 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "sourcePlatform": "wordpress",
    "originalFileName": "wordpress-export.json",
    "fileMd5": "d41d8cd98f00b204e9800998ecf8427e",
    "fileSize": 20480,
    "authorId": 1,
    "status": 0,
    "totalCount": 10,
    "successCount": 0,
    "failCount": 0,
    "skipCount": 0,
    "errorSummary": null,
    "createdBy": 1,
    "updatedBy": null,
    "precheckedAt": null,
    "startedAt": null,
    "completedAt": null,
    "remark": "从 WordPress 迁移",
    "createdAt": "2026-05-05T10:00:00",
    "updatedAt": "2026-05-05T10:00:00"
  }
}
```

**响应字段说明**（`BlogMigrationTaskVO`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 任务 ID |
| `sourcePlatform` | String | 来源平台 |
| `originalFileName` | String | 原始文件名 |
| `fileMd5` | String | 文件 MD5 |
| `fileSize` | Long | 文件大小（字节） |
| `authorId` | Long | 作者 ID |
| `status` | Integer | 任务状态（见枚举表） |
| `totalCount` | Integer | 总文章数 |
| `successCount` | Integer | 成功数 |
| `failCount` | Integer | 失败数 |
| `skipCount` | Integer | 跳过数 |
| `errorSummary` | String | 错误摘要 |
| `createdBy` | Long | 创建人 ID |
| `updatedBy` | Long | 更新人 ID |
| `precheckedAt` | DateTime | 预检完成时间 |
| `startedAt` | DateTime | 开始执行时间 |
| `completedAt` | DateTime | 完成时间 |
| `remark` | String | 备注 |
| `createdAt` | DateTime | 创建时间 |
| `updatedAt` | DateTime | 更新时间 |

**错误码**

| code | 说明 |
|---|---|
| 75003 | 迁移文件无效 |

---

### 4.2 执行预检

**接口信息**

- 路径：`POST /api/sys/migrations/blog/tasks/{id}/precheck`
- 鉴权：`content:migration:execute`
- 说明：对指定任务执行预检，校验分类/标签是否存在、附件 URL 是否可达、幂等键是否冲突等

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | Long | 是 | 任务 ID（路径参数） |

**响应示例**（通过）

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "taskId": 1,
    "totalCount": 10,
    "passed": true,
    "errors": []
  }
}
```

**响应示例**（未通过）

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "taskId": 1,
    "totalCount": 10,
    "passed": false,
    "errors": [
      {
        "id": null,
        "taskId": 1,
        "sourcePlatform": "wordpress",
        "externalPostId": "post-3",
        "idempotentKey": "wordpress:post-3",
        "originalTitle": "第三篇文章",
        "status": 2,
        "targetArticleId": null,
        "errorMessage": "分类 tech 不存在",
        "createdAt": "2026-05-05T10:01:00",
        "updatedAt": "2026-05-05T10:01:00"
      }
    ]
  }
}
```

**响应字段说明**（`BlogMigrationPrecheckResultVO`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | Long | 任务 ID |
| `totalCount` | Integer | 总文章数 |
| `passed` | Boolean | 是否通过 |
| `errors` | Array\<BlogMigrationRecordVO\> | 失败明细列表 |

**errors 元素字段说明**（`BlogMigrationRecordVO`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 记录 ID |
| `taskId` | Long | 所属任务 ID |
| `sourcePlatform` | String | 来源平台 |
| `externalPostId` | String | 外部文章 ID |
| `idempotentKey` | String | 幂等键 |
| `originalTitle` | String | 原始标题 |
| `status` | Integer | 记录状态（见枚举表） |
| `targetArticleId` | Long | 导入后的站内文章 ID |
| `errorMessage` | String | 错误信息 |
| `createdAt` | DateTime | 创建时间 |
| `updatedAt` | DateTime | 更新时间 |

> 预检失败不会抛业务异常，响应中 `passed=false` 并返回错误明细。

**错误码**

| code | 说明 |
|---|---|
| 75001 | 迁移任务不存在 |
| 75002 | 任务状态不允许当前操作 |

---

### 4.3 执行导入

**接口信息**

- 路径：`POST /api/sys/migrations/blog/tasks/{id}/execute`
- 鉴权：`content:migration:execute`
- 说明：对已预检通过的任务执行导入，将文章入库

**前置条件**：任务状态必须为 `PRECHECKED`（1）

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | Long | 是 | 任务 ID（路径参数） |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "sourcePlatform": "wordpress",
    "originalFileName": "wordpress-export.json",
    "fileMd5": "d41d8cd98f00b204e9800998ecf8427e",
    "fileSize": 20480,
    "authorId": 1,
    "status": 3,
    "totalCount": 10,
    "successCount": 8,
    "failCount": 1,
    "skipCount": 1,
    "errorSummary": "1 篇导入失败",
    "createdBy": 1,
    "updatedBy": 1,
    "precheckedAt": "2026-05-05T10:01:00",
    "startedAt": "2026-05-05T10:02:00",
    "completedAt": "2026-05-05T10:05:00",
    "remark": "从 WordPress 迁移",
    "createdAt": "2026-05-05T10:00:00",
    "updatedAt": "2026-05-05T10:05:00"
  }
}
```

**响应字段说明**（`BlogMigrationTaskVO`）：同 [4.1 创建任务](#41-创建任务) 响应字段说明

**错误码**

| code | 说明 |
|---|---|
| 75001 | 迁移任务不存在 |
| 75002 | 任务状态不允许当前操作（如未预检就执行） |
| 75004 | 迁移预检未通过 |
| 75005 | 附件下载失败 |

---

### 4.4 分页查询任务

**接口信息**

- 路径：`GET /api/sys/migrations/blog/tasks`
- 鉴权：`content:migration:query`
- 说明：按条件分页查询迁移任务列表

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `status` | Integer | 否 | 任务状态（见枚举表），需为合法枚举值 |
| `sourcePlatform` | String | 否 | 来源平台 |
| `authorId` | Long | 否 | 作者 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 5,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "sourcePlatform": "wordpress",
        "originalFileName": "wordpress-export.json",
        "fileMd5": "d41d8cd98f00b204e9800998ecf8427e",
        "fileSize": 20480,
        "authorId": 1,
        "status": 3,
        "totalCount": 10,
        "successCount": 8,
        "failCount": 1,
        "skipCount": 1,
        "errorSummary": "1 篇导入失败",
        "createdBy": 1,
        "updatedBy": 1,
        "precheckedAt": "2026-05-05T10:01:00",
        "startedAt": "2026-05-05T10:02:00",
        "completedAt": "2026-05-05T10:05:00",
        "remark": "从 WordPress 迁移",
        "createdAt": "2026-05-05T10:00:00",
        "updatedAt": "2026-05-05T10:05:00"
      }
    ]
  }
}
```

**响应字段说明**：`data` 为 `PageResult<BlogMigrationTaskVO>`，其中 `records` 元素字段同 [4.1 创建任务](#41-创建任务) 响应字段说明

**错误码**

| code | 说明 |
|---|---|
| 40011 | 参数校验失败（如 status 非法枚举值） |

---

### 4.5 查询任务详情

**接口信息**

- 路径：`GET /api/sys/migrations/blog/tasks/{id}`
- 鉴权：`content:migration:query`
- 说明：查询单个迁移任务详情

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | Long | 是 | 任务 ID（路径参数） |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "sourcePlatform": "wordpress",
    "originalFileName": "wordpress-export.json",
    "fileMd5": "d41d8cd98f00b204e9800998ecf8427e",
    "fileSize": 20480,
    "authorId": 1,
    "status": 3,
    "totalCount": 10,
    "successCount": 8,
    "failCount": 1,
    "skipCount": 1,
    "errorSummary": "1 篇导入失败",
    "createdBy": 1,
    "updatedBy": 1,
    "precheckedAt": "2026-05-05T10:01:00",
    "startedAt": "2026-05-05T10:02:00",
    "completedAt": "2026-05-05T10:05:00",
    "remark": "从 WordPress 迁移",
    "createdAt": "2026-05-05T10:00:00",
    "updatedAt": "2026-05-05T10:05:00"
  }
}
```

**响应字段说明**（`BlogMigrationTaskVO`）：同 [4.1 创建任务](#41-创建任务) 响应字段说明

**错误码**

| code | 说明 |
|---|---|
| 75001 | 迁移任务不存在 |

---

### 4.6 分页查询记录

**接口信息**

- 路径：`GET /api/sys/migrations/blog/tasks/{id}/records`
- 鉴权：`content:migration:query`
- 说明：分页查询指定任务下的文章迁移记录

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | Long | 是 | 任务 ID（路径参数，自动填充到查询条件） |
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `status` | Integer | 否 | 记录状态（见枚举表），需为合法枚举值 |

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
        "taskId": 1,
        "sourcePlatform": "wordpress",
        "externalPostId": "post-3",
        "idempotentKey": "wordpress:post-3",
        "originalTitle": "第三篇文章",
        "status": 2,
        "targetArticleId": null,
        "errorMessage": "分类 tech 不存在",
        "createdAt": "2026-05-05T10:01:00",
        "updatedAt": "2026-05-05T10:01:00"
      }
    ]
  }
}
```

**响应字段说明**：`data` 为 `PageResult<BlogMigrationRecordVO>`，其中 `records` 元素字段同 [4.2 执行预检](#42-执行预检) 中 errors 元素字段说明

**错误码**

| code | 说明 |
|---|---|
| 40011 | 参数校验失败（如 status 非法枚举值） |
| 75001 | 迁移任务不存在 |

---

### 4.7 导出失败记录

**接口信息**

- 路径：`GET /api/sys/migrations/blog/tasks/{id}/failures/export`
- 鉴权：`content:migration:export`
- 说明：导出指定任务的失败记录为 Excel 文件

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | Long | 是 | 任务 ID（路径参数） |

**响应**：Excel 文件流（`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`）

| 响应头 | 说明 |
|---|---|
| `Content-Disposition` | `attachment; filename=blog-migration-failures-{id}.xlsx` |

**错误码**

| code | 说明 |
|---|---|
| 75001 | 迁移任务不存在 |

---

## 5. 枚举与错误码

### 任务状态（`BlogMigrationTaskStatusEnum`）

| 值 | 枚举名 | 说明 |
|---|---|---|
| `0` | CREATED | 已创建 |
| `1` | PRECHECKED | 预检通过 |
| `2` | RUNNING | 执行中 |
| `3` | COMPLETED | 已完成 |
| `4` | FAILED | 失败 |
| `5` | CANCELLED | 已取消 |

### 记录状态（`BlogMigrationRecordStatusEnum`）

| 值 | 枚举名 | 说明 |
|---|---|---|
| `0` | PENDING | 待处理 |
| `1` | SUCCESS | 成功 |
| `2` | FAILED | 失败 |
| `3` | SKIPPED | 已跳过 |

### 附件下载状态（`BlogMigrationAttachmentStatusEnum`）

| 值 | 枚举名 | 说明 |
|---|---|---|
| `0` | PENDING | 待下载 |
| `1` | SUCCESS | 成功 |
| `2` | FAILED | 失败 |
| `3` | SKIPPED | 已跳过 |

### 模块错误码

| code | 枚举名 | 说明 |
|---|---|---|
| 75001 | MIGRATION_TASK_NOT_FOUND | 迁移任务不存在 |
| 75002 | MIGRATION_TASK_STATUS_INVALID | 任务状态不允许此操作 |
| 75003 | MIGRATION_FILE_INVALID | 迁移文件无效 |
| 75004 | MIGRATION_PRECHECK_FAILED | 迁移预检未通过 |
| 75005 | MIGRATION_ATTACHMENT_DOWNLOAD_FAILED | 迁移附件下载失败 |
