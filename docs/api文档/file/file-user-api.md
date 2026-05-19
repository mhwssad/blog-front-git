# 文件与上传 API - 用户端

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：本文档面向前端联调，覆盖用户上传流程、文件查询、公开文件访问全场景。

---

## 快捷接口对照表

### 用户上传

| 用途 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 初始化上传任务 | POST | `/api/user/files/upload-tasks/init` | 上传流程入口，支持秒传检测 |
| 秒传检测 | POST | `/api/user/files/upload-tasks/{uploadId}/quick-check` | 静态触发秒传判断 |
| 普通上传 | POST | `/api/user/files/upload-tasks/{uploadId}/file` | 全文文件上传 |
| 上传分片 | POST | `/api/user/files/upload-tasks/{uploadId}/chunks/{chunkNumber}` | 分片上传 |
| 完成上传 | POST | `/api/user/files/upload-tasks/{uploadId}/complete` | 触发分片合并 |

### 用户文件

| 用途 | 方法 | 路径 |
|---|---|---|
| 查询我的文件 | GET | `/api/user/files` |
| 查询我的上传任务 | GET | `/api/user/files/upload-tasks` |
| 删除我的文件引用 | DELETE | `/api/user/files/{businessId}` |

### 公开文件访问

| 用途 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 代理访问文件 | GET | `/api/public/files/{fileId}` | 无需鉴权，流式返回文件内容 |

### 后台管理

| 用途 | 方法 | 路径 | 权限 |
|---|---|---|---|
| 分页查询文件 | GET | `/api/sys/files` | `content:file:query` |
| 查询文件详情 | GET | `/api/sys/files/{id}` | `content:file:query` |
| 分页查询上传任务 | GET | `/api/sys/files/upload-tasks` | `content:file:query` |
| 更新文件状态 | PUT | `/api/sys/files/{id}/status` | `content:file:update` |
| 删除文件 | DELETE | `/api/sys/files/{id}` | `content:file:delete` |

---

## 1. 统一说明

### 1.1 路由分组

| 路由前缀 | 面向场景 | 鉴权要求 |
|---|---|---|
| `/api/public/files/**` | 公开文件访问（代理下载，含访问控制校区） | 无需登录 |
| `/api/user/files/**` | 登录用户上传、查我的文件、查上传任务 | 需要登录 |
| `/api/sys/files/**` | 后台文件库、后台上传任务管理 | 需要登录 + 对应权限 |

### 1.4 上传场景选型

| 场景 | 推荐流程 |
|---|---|
| 小文件直接上传（头像、评论图片等） | 初始化任务 → 普通上传 |
| 已计算 MD5，想先测试秒传 | 初始化任务 → 秒传检测 |
| 大文件分片上传 | 初始化任务 → 多次上传分片 → 完成上传 |
| 展示上传历史 / 失败原因 | 查询上传任务列表 |
| 展示"我的资源库 | 查询我的文件列表 |
| 展示"我的资源库 | 查询我的文件列表 |

---

## 2. 用户上传接入流程

### 2.1 流程概述

所有用户上传接口都需要持有登录 Token：

```http
Authorization: Bearer <accessToken>
```

**上传流程有两种分流：**

```
分支一（常规+秒传）：
初始化任务
    ↓
返回 completed=true，🎉则秒传 流程结束（秒传命中）
    ↓否
返回 uploadMode=1，🎉则秒传检测 → 成功，🎉则秒传 流程结束
    ↓否                              ↓否
普通上传 → 流程结束               普通上传 → 流程结束

分支二（分片上传）：
初始化任务（含 totalChunks）
    ↓
循环上传分片（chunks/{chunkNumber}）
    ↓
完成上传（complete）
    ↓
流程结束
```

### 2.2 初始化上传任务

**接口信息**
- 路径：`POST /api/user/files/upload-tasks/init`
- 鉴权：是
- 说明：任何上传流程的第一步，用于创建上传任务并返回上传模式判断

**请求字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `originalName` | String | 是 | 原始文件名，不允许双击扩展名和非法的字符 |
| `fileSize` | Long | 是 | 文件大小（字节），必须大于 0 |
| `fileMd5` | String | 是 | 文件 MD5，用于秒传检测和完整性校验 |
| `mimeType` | String | 否 | MIME 类型 |
| `referenceType` | String | 否 | 引用类型：`avatar`、`chat_message`、`article_attachment`、`temp` |
| `referenceId` | Long | 否 | 引用对象 ID |
| `category` | String | 否 | 业务分类：`avatar`、`attachment`、`comment`、`chat_attachment`、`temp` |
| `isPublic` | Integer | 否 | `0` 私有，`1` 公开 |
| `totalChunks` | Integer | 否 | 分片上传时传入总分片数 |
| `chunkSize` | Long | 否 | 分片大小，必须大于 0 |
| `remark` | String | 否 | 备注 |

**响应示例（秒传命中）**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "taskId": 102,
    "uploadId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "uploadMode": 1,
    "quickUploadAvailable": true,
    "completed": true,
    "totalChunks": 0,
    "chunkSize": 0,
    "taskStatus": 3,
    "fileId": 501,
    "fileUrl": "https://example.com/files/avatar_1.png",
    "businessId": 301
  }
}
```

**响应示例（需要普通上传）**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "taskId": 101,
    "uploadId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "uploadMode": 3,
    "quickUploadAvailable": true,
    "completed": false,
    "totalChunks": 0,
    "chunkSize": 0,
    "taskStatus": 0,
    "fileId": null,
    "fileUrl": null,
    "businessId": null
  }
}
```

**响应示例（需要分片上传）**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "taskId": 103,
    "uploadId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "uploadMode": 2,
    "quickUploadAvailable": false,
    "completed": false,
    "totalChunks": 4,
    "chunkSize": 5242880,
    "taskStatus": 0,
    "fileId": null,
    "fileUrl": null,
    "businessId": null
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | Long | 上传任务 ID |
| `uploadId` | String | 上传标识，后续所有上传接口都依赖此标识 |
| `uploadMode` | Integer | `1` 秒传，`2` 分片上传，`3` 全文上传 |
| `quickUploadAvailable` | Boolean | 是否具备秒传条件（传入 MD5 则为 true） |
| `completed` | Boolean | 是否已在初始化阶段直接完成（秒传锻命中） |
| `totalChunks` | Integer | 总分片数（分片上传时有效） |
| `chunkSize` | Long | 分片大小（分片上传时有效） |
| `taskStatus` | Integer | 任务状态：`0` 初始化，`1` 上传中，`2` 合并中，`3` 已完成，`4` 失败，`5` 已取消 |
| `fileId` | Long | 已关联文件的 ID（秒传成功时才有意义） |
| `fileUrl` | String | 文件访问地址（秒传成功时才有意义） |
| `businessId` | Long | 业务引用 ID（秒传成功时才有意义） |

**错误码说明**

| code | 说明 |
|---|---|
| `ILLEGAL_ARGUMENT` | 参数校验失败 |

### 2.3 秒传检测

**接口信息**
- 路径：`POST /api/user/files/upload-tasks/{uploadId}/quick-check`
- 鉴权：是
- 说明：在初始化后静态执行秒传判断，适用于客户端已计算 MD5 想先评测是否可以复用

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |

**响应示例（秒传成功）**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "uploadId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "taskId": 101,
    "fileId": 501,
    "businessId": 301,
    "quickUpload": true,
    "taskStatus": 3,
    "fileUrl": "https://example.com/files/avatar_1.png",
    "referenceCount": 2
  }
}
```

**响应示例（秒传未命中）*

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "uploadId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "taskId": 101,
    "fileId": null,
    "businessId": null,
    "quickUpload": false,
    "taskStatus": 0,
    "fileUrl": null,
    "referenceCount": null
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |
| `taskId` | Long | 任务 ID |
| `fileId` | Long | 文件 ID（秒传成功时有意义） |
| `businessId` | Long | 业务引用 ID（秒传成功时有意义） |
| `quickUpload` | Boolean | 是否通过秒传完成 |
| `taskStatus` | Integer | 任务状态 |
| `fileUrl` | String | 文件访问地址（秒传成功时有意义） |
| `referenceCount` | Integer | 当前引用数（秒传成功时有意义） |

**错误码说明**

| code | 说明 |
|---|---|
| `UPLOAD_TASK_EXPIRED` | 任务已过期 |
| `UPLOAD_TASK_STATUS_INVALID` | 任务状态不允许此操作 |

### 2.4 普通上传

**接口信息**
- 路径：`POST /api/user/files/upload-tasks/{uploadId}/file`
- 鉴权：是
- 说明：全文上传一个完整文件，适用于小文件或初始化时未传入分片参数的场景
- Content-Type：`multipart/form-data`

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |

**请求表单字段**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | File | 是 | 待上传的文件对象 |

**响应示例（上传成功）**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "uploadId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "taskId": 101,
    "fileId": 502,
    "businessId": 302,
    "quickUpload": false,
    "taskStatus": 3,
    "fileUrl": "https://example.com/files/report_2026.pdf",
    "referenceCount": 1
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |
| `taskId` | Long | 任务 ID |
| `fileId` | Long | 文件 ID |
| `businessId` | Long | 业务引用 ID |
| `quickUpload` | Boolean | 是否通过秒传完成 |
| `taskStatus` | Integer | 任务状态，`3` 表示已完成 |
| `fileUrl` | String | 文件访问地址 |
| `referenceCount` | Integer | 当前引用数 |

**错误码说明**

| code | 说明 |
|---|---|
| `FILE_MD5_MISMATCH` | 正文文件 MD5 不匹配 |
| `UPLOAD_TASK_EXPIRED` | 任务已过期 |
| `UPLOAD_TASK_STATUS_INVALID` | 任务状态不允许此操作（已完成或已取消） |

### 2.5 上传分片

**接口信息**
- 路径：`POST /api/user/files/upload-tasks/{uploadId}/chunks/{chunkNumber}`
- 鉴权：是
- 说明：上传单个分片，分片序号从 1 开始
- Content-Type：`multipart/form-data`

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |
| `chunkNumber` | Integer | 分片序号，从 1 开始，必须大于 0 |

**请求表单字段**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | File/Blob | 是 | 当前分片的文件对象 |
| `chunkMd5` | String | 否 | 当前分片的 MD5，用于服务端校验 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "uploadId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "chunkNumber": 1,
    "uploadedChunks": 1,
    "totalChunks": 4,
    "taskStatus": 1
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |
| `chunkNumber` | Integer | 当前分片序号（从 1 开始） |
| `uploadedChunks` | Integer | 已上传分片数 |
| `totalChunks` | Integer | 总分片数 |
| `taskStatus` | Integer | 当前任务状态 |

**错误码说明**

| code | 说明 |
|---|---|
| `CHUNK_MD5_MISMATCH` | 分片 MD5 不匹配 |
| `UPLOAD_TASK_EXPIRED` | 任务已过期 |
| `UPLOAD_TASK_STATUS_INVALID` | 任务状态不允许此操作 |

### 2.6 完成上传

**接口信息**
- 路径：`POST /api/user/files/upload-tasks/{uploadId}/complete`
- 鉴权：是
- 说明：分片全部上传完成后触发合并，仅适用于分片上传任务

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "uploadId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "taskId": 103,
    "fileId": 502,
    "businessId": 302,
    "quickUpload": false,
    "taskStatus": 3,
    "fileUrl": "https://example.com/files/report_2026.pdf",
    "referenceCount": 1
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `uploadId` | String | 上传标识 |
| `taskId` | Long | 任务 ID |
| `fileId` | Long | 文件 ID |
| `businessId` | Long | 业务引用 ID |
| `quickUpload` | Boolean | 是否通过秒传完成 |
| `taskStatus` | Integer | 任务状态，`3` 表示已完成 |
| `fileUrl` | String | 文件访问地址 |
| `referenceCount` | Integer | 当前引用数 |

**错误码说明**

| code | 说明 |
|---|---|
| `CHUNK_INCOMPLETE` | 分片未全部上传完成 |
| `FILE_MD5_REQUIRED` | 初始化时没传 MD5 且合并后无法计算 |
| `CHUNK_MERGE_FAILED` | 分片合并失败 |
| `UPLOAD_TASK_EXPIRED` | 任务已过期 |
| `UPLOAD_TASK_STATUS_INVALID` | 任务状态不允许此操作 |

---

## 3. 用户文件接口

### 3.1 查询我的文件

**接口信息**
- 路径：`GET /api/user/files`
- 鉴权：是
- 说明：查询当前用户的文件列表，用于"我的资源库"或上传结果选择框

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `keyword` | String | 否 | 文件名关键字 |
| `status` | Integer | 否 | 文件状态：`0` 已删除，`1` 正常，`2` 待物理删除，`3` 审核中，`4` 违规下架 |
| `category` | String | 否 | 业务分类：`avatar`、`attachment`、`comment`、`chat_attachment`、`temp` |
| `referenceType` | String | 否 | 引用类型：`avatar`、`chat_message`、`article_attachment`、`temp` |

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
        "businessId": 301,
        "fileId": 501,
        "fileName": "avatar_1.png",
        "originalName": "avatar.png",
        "fileUrl": "https://example.com/files/avatar_1.png",
        "fileSize": 245678,
        "fileType": "image",
        "mimeType": "image/png",
        "category": "avatar",
        "referenceType": "avatar",
        "referenceId": 1,
        "isPublic": 1,
        "status": 1,
        "createdAt": "2026-03-28 15:30:00"
      },
      {
        "businessId": 302,
        "fileId": 502,
        "fileName": "report_2026.pdf",
        "originalName": "2026年度报告.pdf",
        "fileUrl": "https://example.com/files/report_2026.pdf",
        "fileSize": 1048576,
        "fileType": "document",
        "mimeType": "application/pdf",
        "category": "attachment",
        "referenceType": "article_attachment",
        "referenceId": 10,
        "isPublic": 0,
        "status": 1,
        "createdAt": "2026-03-29 10:00:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `businessId` | Long | 业务引用 ID |
| `fileId` | Long | 文件 ID |
| `fileName` | String | 文件名（存储名） |
| `originalName` | String | 原始文件名 |
| `fileUrl` | String | 文件访问地址 |
| `fileSize` | Long | 文件大小（字节） |
| `fileType` | String | 文件类型：`image`、`video`、`document`、`other` |
| `mimeType` | String | MIME 类型 |
| `category` | String | 业务分类 |
| `referenceType` | String | 引用类型 |
| `referenceId` | Long | 引用对象 ID |
| `isPublic` | Integer | 是否公开：`0` 私有，`1` 公开 |
| `status` | Integer | 文件状态 |
| `createdAt` | DateTime | 引用创建时间 |

### 3.2 查询我的上传任务

**接口信息**
- 路径：`GET /api/user/files/upload-tasks`
- 鉴权：是
- 说明：查询当前用户的 Upload 任务列表，用于上传记录展示、失败重试提示

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `taskStatus` | Integer | 否 | 任务状态：`0` 初始化，`1` 上传中，`2` 合并中，`3` 已完成，`4` 失败，`5` 已取消 |
| `isQuickUpload` | Integer | 否 | 是否秒传：`0` 否，`1` 是 |
| `isChunked` | Integer | 否 | 是否分片：`0` 否，`1` 是 |

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
        "id": 103,
        "uploadId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "fileId": 502,
        "originalName": "2026年度报告.pdf",
        "fileSize": 10485760,
        "isQuickUpload": 0,
        "isChunked": 1,
        "chunkSize": 5242880,
        "totalChunks": 2,
        "uploadedChunks": 2,
        "taskStatus": 3,
        "errorCode": null,
        "errorMessage": null,
        "startTime": "2026-03-29 10:00:00",
        "completeTime": "2026-03-29 10:01:30",
        "createdAt": "2026-03-29 09:59:00"
      },
      {
        "id": 104,
        "uploadId": "d4e5f6a7-b8c9-0123-def1-234567890123",
        "fileId": null,
        "originalName": "large_video.mp4",
        "fileSize": 524288000,
        "isQuickUpload": 0,
        "isChunked": 1,
        "chunkSize": 10485760,
        "totalChunks": 50,
        "uploadedChunks": 30,
        "taskStatus": 4,
        "errorCode": "CHUNK_MERGE_FAILED",
        "errorMessage": "分片合并失败，请重试",
        "startTime": "2026-03-29 11:00:00",
        "completeTime": null,
        "createdAt": "2026-03-29 11:00:05"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 任务 ID |
| `uploadId` | String | 上传标识 |
| `fileId` | Long | 文件 ID（成功时才有意义） |
| `originalName` | String | 原始文件名 |
| `fileSize` | Long | 文件大小（字节） |
| `isQuickUpload` | Integer | 是否秒传：`0` 否，`1` 是 |
| `isChunked` | Integer | 是否分片：`0` 否，`1` 是 |
| `chunkSize` | Long | 分片大小 |
| `totalChunks` | Integer | 总分片数 |
| `uploadedChunks` | Integer | 已上传分片数 |
| `taskStatus` | Integer | 任务状态 |
| `errorCode` | String | 错误码（失败时有意义） |
| `errorMessage` | String | 错误信息（失败时才有意义） |
| `startTime` | DateTime | 开始时间 |
| `completeTime` | DateTime | 完成时间（成功时才有意义） |
| `createdAt` | DateTime | 创建时间 |

### 3.3 删除我的文件引用

**接口信息**
- 路径：`DELETE /api/user/files/{businessId}`
- 鉴权：是
- 说明：删除当前用户自己的业务引用记录，而非物理文件

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `businessId` | Long | 业务引用 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**错误码说明**

| code | 说明 |
|---|---|
| `FILE_REFERENCE_NOT_FOUND` | 文件引用不存在 |

**前端说明**
- 删除的是"文件引用"，不是直接按 `fileId` 删除物理文件
- 若同一底层文件没有任何引用，系统会尝试清理存储对象，并把文件状态改为 `0`

---

## 4. 公开文件访问接口

### 4.1 代理访问文件

**接口信息**
- 路径：`GET /api/public/files/{fileId}`
- 鉴权：否（无需登录，白名单接口）
- 说明：代理文件下载并对关联文件做访问控制校验，防止见对白名单文件被绕过权限直接访问
- Content-Type：根据文件 MIME 类型动态设置（如 `image/png`、`application/pdf` 等）
- 响应方式：流式响应（StreamingResponseBody）

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `fileId` | Long | 文件 ID |

**响应说明**

- 响应体为文件二进制流
- 响应头 `Content-Disposition` 设置为 `inline`，文件名经过 URL 编码
- 响应头 `Content-Type` 根据文件 MIME 类型动态设置
- 响应头 `Content-Length` 设置为文件实际大小

**错误码说明**

| code | 说明 |
|---|---|
| `FILE_NOT_FOUND` | 文件不存在 |

---