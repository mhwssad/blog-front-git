# 内容域 - 文章评论接口

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

本文档包含文章评论相关接口，包含公开评论列表和用户评论操作。

---

## 文章评论

### 4.1 获取评论树

**接口信息**
- 路径: `GET /api/comments`
- 鉴权: 否（liked 字段需要登录）
- 说明: 返回指定文章的评论树形结构，包含根评论及其子评论

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| targetType | String | 是 | 目标类型，固定为 article | article |
| targetId | Long | 是 | 目标 ID（文章 ID） | 100 |
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 25,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 500,
        "targetId": 100,
        "targetType": "article",
        "content": "写得很好，收藏了！",
        "images": ["https://example.com/img1.jpg"],
        "userId": 8,
        "userNickname": "Tom",
        "userAvatar": "https://example.com/avatar/8.png",
        "rootId": 0,
        "parentId": 0,
        "likeCount": 12,
        "replyCount": 3,
        "status": 1,
        "createdAt": "2025-01-12T14:30:00",
        "liked": false,
        "children": [
          {
            "id": 501,
            "targetId": 100,
            "targetType": "article",
            "content": "同感！",
            "images": [],
            "userId": 9,
            "userNickname": "Jerry",
            "userAvatar": "https://example.com/avatar/9.png",
            "rootId": 500,
            "parentId": 500,
            "likeCount": 2,
            "replyCount": 0,
            "status": 1,
            "createdAt": "2025-01-12T15:00:00",
            "liked": true,
            "children": []
          }
        ]
      }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 评论 ID |
| targetId | Long | 目标 ID（文章 ID） |
| targetType | String | 目标类型 |
| content | String | 评论内容 |
| images | Array | 评论图片列表 |
| userId | Long | 评论用户 ID |
| userNickname | String | 评论用户昵称 |
| userAvatar | String | 评论用户头像 |
| rootId | Long | 根评论 ID，0 表示根评论 |
| parentId | Long | 父评论 ID，0 表示根评论 |
| likeCount | Integer | 点赞数 |
| replyCount | Integer | 回复数 |
| status | Integer | 评论状态，1-正常，0-隐藏 |
| createdAt | String | 创建时间 |
| liked | Boolean | 当前用户是否已点赞（需登录） |
| children | Array | 子评论列表 |

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40011 | 非法参数 |

---

### 4.2 发表评论

**接口信息**
- 路径: `POST /api/user/comments`
- 鉴权: 必须登录
- 说明: 发表评论或回复

**请求体**

```json
{
  "targetType": "article",
  "targetId": 100,
  "content": "写得很好！",
  "images": ["https://example.com/img1.jpg"],
  "rootId": 0,
  "parentId": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| targetType | String | 是 | 目标类型，article / forum_post 等 |
| targetId | Long | 是 | 目标 ID |
| content | String | 是 | 评论内容 |
| images | Array | 否 | 评论图片列表 |
| rootId | Long | 否 | 根评论 ID，回复时填写 |
| parentId | Long | 否 | 父评论 ID，回复时填写 |

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

### 4.3 删除我的评论

**接口信息**
- 路径: `DELETE /api/user/comments/{id}`
- 鉴权: 必须登录
- 说明: 删除当前用户自己的评论

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 评论 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

---

### 4.4 点赞评论

**接口信息**
- 路径: `POST /api/user/comments/{id}/likes`
- 鉴权: 必须登录
- 说明: 为指定评论点赞

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 评论 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

---

### 4.5 取消点赞评论

**接口信息**
- 路径: `DELETE /api/user/comments/{id}/likes`
- 鉴权: 必须登录
- 说明: 取消对指定评论的点赞

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 评论 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

---
