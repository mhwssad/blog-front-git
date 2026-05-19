# 内容域 - 用户收藏

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

---

## 用户收藏

### 6.1 查询我的收藏夹

**接口信息**
- 路径: `GET /api/user/collection-folders`
- 鉴权: 必须登录
- 说明: 返回当前用户的收藏夹分页列表

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 3,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 8,
        "folderName": "技术收藏",
        "folderType": "article",
        "description": "技术相关文章收藏",
        "isPublic": 0,
        "isDefault": 1,
        "sortOrder": 1,
        "collectionCount": 25,
        "createdAt": "2024-12-01T10:00:00",
        "updatedAt": "2025-01-15T09:00:00"
      }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 收藏夹 ID |
| userId | Long | 用户 ID |
| folderName | String | 收藏夹名称 |
| folderType | String | 收藏夹类型，article 表示文章收藏 |
| description | String | 收藏夹描述 |
| isPublic | Integer | 是否公开，1-公开，0-私有 |
| isDefault | Integer | 是否默认收藏夹，1-是，0-否 |
| sortOrder | Integer | 排序序号 |
| collectionCount | Integer | 收藏数量 |
| createdAt | String | 创建时间 |
| updatedAt | String | 更新时间 |

---

### 6.2 新增收藏夹

**接口信息**
- 路径: `POST /api/user/collection-folders`
- 鉴权: 必须登录
- 说明: 创建一个新的收藏夹

**请求体**

```json
{
  "folderName": "我的收藏",
  "folderType": "article",
  "description": "收藏夹描述",
  "isPublic": 0,
  "isDefault": 0,
  "sortOrder": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| folderName | String | 是 | 收藏夹名称 |
| folderType | String | 否 | 收藏夹类型，默认 article |
| description | String | 否 | 收藏夹描述 |
| isPublic | Integer | 否 | 是否公开，0-私有，1-公开 |
| isDefault | Integer | 否 | 是否默认，0-否，1-是 |
| sortOrder | Integer | 否 | 排序序号 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 5,
    "userId": 8,
    "folderName": "我的收藏",
    "folderType": "article",
    "description": "收藏夹描述",
    "isPublic": 0,
    "isDefault": 0,
    "sortOrder": 0,
    "collectionCount": 0,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |

---

### 6.3 修改收藏夹

**接口信息**
- 路径: `PUT /api/user/collection-folders/{id}`
- 鉴权: 必须登录
- 说明: 修改指定收藏夹的信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 收藏夹 ID |

**请求体**

同 6.2 新增收藏夹

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 5,
    "userId": 8,
    "folderName": "修改后的名称",
    "folderType": "article",
    "description": "修改后的描述",
    "isPublic": 0,
    "isDefault": 0,
    "sortOrder": 0,
    "collectionCount": 0,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:35:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |
| 40400 | 收藏夹不存在 |

---

### 6.4 删除收藏夹

**接口信息**
- 路径: `DELETE /api/user/collection-folders/{id}`
- 鉴权: 必须登录
- 说明: 删除指定的收藏夹（同时删除夹内所有收藏记录）

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 收藏夹 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40400 | 收藏夹不存在 |

---

### 6.5 查询我的收藏

**接口信息**
- 路径: `GET /api/user/collections`
- 鉴权: 必须登录
- 说明: 返回当前用户的收藏记录分页列表

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 50,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 200,
        "folderId": 1,
        "targetId": 100,
        "targetType": "article",
        "remark": "很实用的文章",
        "targetTitle": "Spring Boot 权威指南",
        "targetUrl": "/article/100",
        "createdAt": "2025-01-10T14:00:00"
      }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 收藏记录 ID |
| folderId | Long | 所属收藏夹 ID |
| targetId | Long | 目标 ID（如文章 ID） |
| targetType | String | 目标类型，article 表示文章 |
| remark | String | 收藏备注 |
| targetTitle | String | 目标标题 |
| targetUrl | String | 目标地址 |
| createdAt | String | 收藏时间 |

---

### 6.6 新增收藏

**接口信息**
- 路径: `POST /api/user/collections`
- 鉴权: 必须登录
- 说明: 将目标（文章等）添加到收藏夹

**请求体**

```json
{
  "folderId": 1,
  "targetId": 100,
  "targetType": "article",
  "remark": "很实用的文章"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| folderId | Long | 是 | 收藏夹 ID |
| targetId | Long | 是 | 目标 ID（文章 ID） |
| targetType | String | 是 | 目标类型，固定为 article |
| remark | String | 否 | 收藏备注 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |

---

### 6.7 删除收藏

**接口信息**
- 路径: `DELETE /api/user/collections/{id}`
- 鉴权: 必须登录
- 说明: 删除指定的收藏记录

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 收藏记录 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40400 | 收藏记录不存在 |

---
