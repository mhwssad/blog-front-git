# 文件与上传 API - 后台管理

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：本文档面向后台管理员，提供文件库管理、上传任务管理、文件状态更新、文件删除等后台接口说明。

---

## 5. 后台文件管理接口

### 5.1 权限说明

所有后台接口都需要：
1. 登录状态
2. 对应权限

| 权限标识 | 说明 |
|---|---|
| `content:file:query` | 文件查询权限 |
| `content:file:update` | 文件更新权限 |
| `content:file:delete` | 文件删除权限 |

### 5.2 分页查询文件

**接口信息**
- 路径：`GET /api/sys/files`
- 鉴权：是（需要 `content:file:query` 权限）
- 说明：后台文件库，用于管理所有上传的文件

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `keyword` | String | 否 | 文件名 / 原始文件名关键字 |
| `uploadUserId` | Long | 否 | 上传用户 ID |
| `status` | Integer | 否 | 文件状态：`0` 已删除，`1` 正常，`2` 待物理删除，`3` 审核中，`4` 违规下架 |
| `category` | String | 否 | 业务分类 |
| `referenceType` | String | 否 | 引用类型 |
| `isPublic` | Integer | 否 | 是否公开：`0` 私有，`1` 公开 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 1,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 501,
        "fileName": "avatar_1.png",
        "originalName": "avatar.png",
        "filePath": "/upload/2026/03/28/avatar_1.png",
        "fileUrl": "https://example.com/files/avatar_1.png",
        "storageKey": "local",
        "fileSize": 245678,
        "fileType": "image",
        "mimeType": "image/png",
        "fileExtension": ".png",
        "uploadUserId": 1,
        "isPublic": 1,
        "category": "avatar",
        "status": 1,
        "referenceCount": 2,
        "createdAt": "2026-03-28 15:30:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 文件 ID |
| `fileName` | String | 文件名（存储名） |
| `originalName` | String | 原始文件名 |
| `filePath` | String | 文件路径（服务端存储路径） |
| `fileUrl` | String | 文件访问地址 |
| `storageKey` | String | 存储节点标识 |
| `fileSize` | Long | 文件大小（字节） |
| `fileType` | String | 文件类型 |
| `mimeType` | String | MIME 类型 |
| `fileExtension` | String | 扩展名（带点，如 `.png`） |
| `uploadUserId` | Long | 上传用户 ID |
| `isPublic` | Integer | 是否公开 |
| `category` | String | 业务分类 |
| `status` | Integer | 文件状态 |
| `referenceCount` | Integer | 引用数 |
| `createdAt` | DateTime | 创建时间 |

### 5.3 查询文件详情

**接口信息**
- 路径：`GET /api/sys/files/{id}`
- 鉴权：是（需要 `content:file:query` 权限）
- 说明：查询单个文件的详细信息，包含引用列表和关联的上传任务

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 文件 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 501,
    "fileName": "avatar_1.png",
    "originalName": "avatar.png",
    "filePath": "/upload/2026/03/28/avatar_1.png",
    "fileUrl": "https://example.com/files/avatar_1.png",
    "storageKey": "local",
    "fileSize": 245678,
    "fileType": "image",
    "mimeType": "image/png",
    "fileExtension": ".png",
    "uploadUserId": 1,
    "isPublic": 1,
    "category": "avatar",
    "status": 1,
    "referenceCount": 2,
    "createdAt": "2026-03-28 15:30:00",
    "references": [
      {
        "id": 301,
        "userId": 1,
        "referenceType": "avatar",
        "referenceId": 1,
        "isPublic": 1,
        "category": "avatar",
        "remark": "用户头像",
        "createdAt": "2026-03-28 15:30:00"
      }
    ],
    "tasks": [
      {
        "id": 102,
        "uploadId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "fileId": 501,
        "uploadUserId": 1,
        "originalName": "avatar.png",
        "fileSize": 245678,
        "storageKey": "local",
        "isQuickUpload": 1,
        "isChunked": 0,
        "uploadedChunks": 0,
        "totalChunks": 0,
        "taskStatus": 3,
        "errorMessage": null,
        "createdAt": "2026-03-28 15:29:55",
        "completeTime": "2026-03-28 15:30:00"
      }
    ]
  }
}
```

**响应字段说明**

在 `FileAdminVO` 基础上额外返回：

| 字段 | 类型 | 说明 |
|---|---|---|
| `references` | List\<FileReferenceVO\> | 该文件的引用列表 |
| `tasks` | List\<FileTaskAdminVO\> | 该文件关联的上传任务列表 |

**FileReferenceVO 字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 引用 ID |
| `userId` | Long | 用户 ID |
| `referenceType` | String | 引用类型 |
| `referenceId` | Long | 引用对象 ID |
| `isPublic` | Integer | 是否公开 |
| `category` | String | 业务分类 |
| `remark` | String | 备注 |
| `createdAt` | DateTime | 创建时间 |

**FileTaskAdminVO 字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 任务 ID |
| `uploadId` | String | 上传标识 |
| `fileId` | Long | 文件 ID |
| `uploadUserId` | Long | 上传用户 ID |
| `originalName` | String | 原始文件名 |
| `fileSize` | Long | 文件大小 |
| `storageKey` | String | 存储节点 |
| `isQuickUpload` | Integer | 是否秒传 |
| `isChunked` | Integer | 是否分片 |
| `uploadedChunks` | Integer | 已上传分片数 |
| `totalChunks` | Integer | 总分片数 |
| `taskStatus` | Integer | 任务状态 |
| `errorMessage` | String | 错误信息 |
| `createdAt` | DateTime | 创建时间 |
| `completeTime` | DateTime | 完成时间 |

### 5.4 分页查询上传任务

**接口信息**
- 路径：`GET /api/sys/files/upload-tasks`
- 鉴权：是（需要 `content:file:query` 权限）
- 说明：后台查看所有用户的 Upload 任务，用于排查上传问题

**查询参数说明**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |
| `uploadUserId` | Long | 否 | 上传用户 ID |
| `taskStatus` | Integer | 否 | 任务状态 |
| `isQuickUpload` | Integer | 否 | 是否秒传 |
| `isChunked` | Integer | 否 | 是否分片 |

**响应字段**：同 `FileTaskAdminVO`

### 5.5 更新文件状态

**接口信息**
- 路径：`PUT /api/sys/files/{id}/status`
- 鉴权：是（需要 `content:file:update` 权限）
- 说明：更新文件状态，用于审核、违规下架等场景

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 文件 ID |

**请求体字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `status` | Integer | 是 | 文件状态：`1` 正常，`3` 审核中，`4` 违规下架 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**前端说明**：
- 此接口不支持设置为 `0`（已删除），删除文件应使用 DELETE 接口
- 此接口不支持设置为 `2`（待物理删除），此状态由系统自动管理
- 已删除文件（`status=0`）不支持通过此接口恢复状态

### 5.6 删除文件

**接口信息**
- 路径：`DELETE /api/sys/files/{id}`
- 鉴权：是（需要 `content:file:delete` 权限）
- 说明：删除文件记录及关联业务引用，清理上传任务、分片和物理文件

**路径参数说明**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 文件 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

---