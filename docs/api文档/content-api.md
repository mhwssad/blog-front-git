# 内容域 API 前端参考手册

本文档面向前端开发人员，按页面和功能模块组织接口说明。每个接口包含完整的请求示例、响应示例、字段说明和错误处理指南。

---

## 通用规范

### 统一响应结构

所有接口均返回以下 JSON 结构：

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|-----|------|-----|
| code | Integer | 业务状态码，200 表示成功，非 200 为异常 |
| message | String | 描述信息 |
| timestamp | String | 响应时间（ISO 8601 格式） |
| data | Object | 响应数据，分页接口为 PageResult 结构 |

**分页响应结构 PageResult：**

```json
{
  "total": 100,
  "current": 1,
  "size": 10,
  "records": []
}
```

| 字段 | 类型 | 说明 |
|-----|------|-----|
| total | Long | 总记录数 |
| current | Long | 当前页码 |
| size | Long | 每页条数 |
| records | Array | 数据列表 |

### 错误响应示例

```json
{
  "code": 40001,
  "message": "参数校验失败",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

### 常用错误码

| code | 说明 | 前端处理建议 |
|-----|------|-------------|
| 200 | 成功 | - |
| 40001 | 参数校验失败 | 检查请求参数是否合法 |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40300 | 没有访问权限 | 提示用户无权限 |
| 40400 | 请求的接口不存在 | 检查接口地址 |
| 42900 | 请求过于频繁 | 显示提示，稍后重试 |
| 50000 | 系统异常 | 提示用户联系管理员 |

---

## 一、首页文章列表

### 1.1 获取文章分页列表

**接口信息**
- 路径: `GET /api/articles`
- 鉴权: 否
- 说明: 返回公开已发布的文章列表，支持分页、关键词搜索、分类筛选、标签筛选和排序

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键词（匹配标题和摘要） | Java |
| categoryId | Long | 否 | 分类 ID | 1 |
| tagId | Long | 否 | 标签 ID | 5 |
| sort | String | 否 | 排序方式，默认 latest | latest |

**sort 取值说明：**
- `latest` - 按发布时间倒序（默认）
- `popular` - 按浏览数倒序
- `hot` - 按点赞数倒序

**请求示例**

```javascript
// axios
axios.get('/api/articles', {
  params: {
    current: 1,
    size: 10,
    keyword: 'Java',
    categoryId: 1,
    sort: 'latest'
  }
})

// fetch
fetch('/api/articles?current=1&size=10&keyword=Java&categoryId=1&sort=latest')
  .then(res => res.json())
  .then(data => console.log(data))
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 42,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 100,
        "title": "Spring Boot 权威指南",
        "summary": "本文详细介绍 Spring Boot 的核心特性...",
        "coverImage": "https://example.com/cover.jpg",
        "authorId": 8,
        "authorName": "张三",
        "isTop": 1,
        "isRecommend": 1,
        "accessLevel": 0,
        "viewCount": 1520,
        "likeCount": 128,
        "commentCount": 35,
        "collectCount": 67,
        "publishTime": "2025-01-10T08:00:00"
      }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 文章 ID |
| title | String | 文章标题 |
| summary | String | 文章摘要 |
| coverImage | String | 封面图地址 |
| authorId | Long | 作者 ID |
| authorName | String | 作者昵称 |
| isTop | Integer | 是否置顶，1-是，0-否 |
| isRecommend | Integer | 是否推荐，1-是，0-否 |
| accessLevel | Integer | 访问级别，0-免费，1-付费等 |
| viewCount | Integer | 浏览数 |
| likeCount | Integer | 点赞数 |
| commentCount | Integer | 评论数 |
| collectCount | Integer | 收藏数 |
| publishTime | String | 发布时间 |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40001 | 参数校验失败 | 检查参数格式 |

---

## 二、文章详情页

### 2.1 获取文章详情

**接口信息**
- 路径: `GET /api/articles/{id}`
- 鉴权: 否（部分字段如 liked、collected 需要登录）
- 说明: 返回文章完整详情，包含分类、标签、用户互动状态等信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.get('/api/articles/100')
  .then(res => {
    if (res.data.code === 200) {
      console.log(res.data.data)
    }
  })

// fetch
fetch('/api/articles/100')
  .then(res => res.json())
  .then(data => console.log(data))
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 100,
    "title": "Spring Boot 权威指南",
    "summary": "本文详细介绍 Spring Boot 的核心特性...",
    "content": "<p>文章正文 HTML 内容...</p>",
    "coverImage": "https://example.com/cover.jpg",
    "authorId": 8,
    "authorName": "张三",
    "isTop": 1,
    "isRecommend": 1,
    "isOriginal": 1,
    "sourceUrl": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 1520,
    "likeCount": 128,
    "commentCount": 35,
    "collectCount": 67,
    "shareCount": 12,
    "publishTime": "2025-01-10T08:00:00",
    "categories": [
      {
        "id": 1,
        "parentId": 0,
        "name": "后端",
        "code": "backend",
        "type": "article",
        "level": 1,
        "sortOrder": 1,
        "icon": "code",
        "description": "后端技术文章",
        "children": [
          {
            "id": 5,
            "parentId": 1,
            "name": "Java",
            "code": "java",
            "type": "article",
            "level": 2,
            "sortOrder": 1,
            "icon": "coffee",
            "description": null,
            "children": []
          }
        ]
      }
    ],
    "tags": [
      { "id": 10, "name": "Spring Boot", "color": "#6db33f" },
      { "id": 11, "name": "Java", "color": "#007396" }
    ],
    "seriesList": [
      {
        "id": 3,
        "title": "Spring 系列教程",
        "coverImage": "https://example.com/series.jpg",
        "articleCount": 12,
        "sortOrder": 1,
        "visibilityScope": 0
      }
    ],
    "liked": true,
    "collected": false,
    "canComment": true
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 文章 ID |
| title | String | 文章标题 |
| summary | String | 文章摘要 |
| content | String | 文章正文（HTML 格式） |
| coverImage | String | 封面图地址 |
| authorId | Long | 作者 ID |
| authorName | String | 作者昵称 |
| isTop | Integer | 是否置顶 |
| isRecommend | Integer | 是否推荐 |
| isOriginal | Integer | 是否原创，1-原创，0-转载 |
| sourceUrl | String | 来源地址，转载时有效 |
| accessLevel | Integer | 访问级别 |
| visibilityScope | Integer | 可见范围：0-公开，1-仅自己，2-白名单，3-登录可见 |
| viewCount | Integer | 浏览数 |
| likeCount | Integer | 点赞数 |
| commentCount | Integer | 评论数 |
| collectCount | Integer | 收藏数 |
| shareCount | Integer | 分享数 |
| publishTime | String | 发布时间 |
| categories | Array | 分类列表（树形结构） |
| tags | Array | 标签列表 |
| seriesList | Array | 所属系列列表 |
| liked | Boolean | 当前用户是否已点赞（需登录，未登录为 null） |
| collected | Boolean | 当前用户是否已收藏（需登录，未登录为 null） |
| canComment | Boolean | 当前用户是否允许评论 |

**categories 子字段**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 分类 ID |
| parentId | Long | 父分类 ID，0 表示顶级 |
| name | String | 分类名称 |
| code | String | 分类编码 |
| type | String | 分类类型，article 表示文章分类 |
| level | Integer | 层级，从 1 开始 |
| sortOrder | Integer | 排序序号 |
| icon | String | 图标名称 |
| description | String | 分类描述 |
| children | Array | 子分类列表 |

**tags 子字段**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 标签 ID |
| name | String | 标签名称 |
| color | String | 标签颜色（十六进制） |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40400 | 文章不存在 | 显示文章不存在提示 |
| 40300 | 无访问权限 | 显示无权访问提示 |

---

### 2.2 查询作者公开系列列表

**接口信息**
- 路径: `GET /api/public/authors/{authorId}/series`
- 鉴权: 否
- 说明: 返回指定作者的公开文章系列列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| authorId | Long | 是 | 作者 ID |

**请求示例**

```javascript
// axios
axios.get('/api/public/authors/8/series')

// fetch
fetch('/api/public/authors/8/series')
  .then(res => res.json())
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 3,
      "title": "Spring 系列教程",
      "coverImage": "https://example.com/series.jpg",
      "articleCount": 12,
      "sortOrder": 1,
      "visibilityScope": 0
    }
  ]
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 系列 ID |
| title | String | 系列标题 |
| coverImage | String | 封面图地址 |
| articleCount | Integer | 文章数量 |
| sortOrder | Integer | 排序序号 |
| visibilityScope | Integer | 可见范围 |

---

### 2.3 查询公开系列详情

**接口信息**
- 路径: `GET /api/public/article-series/{id}`
- 鉴权: 否
- 说明: 返回指定文章系列的详细信息，包含系列内文章列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求示例**

```javascript
// axios
axios.get('/api/public/article-series/3')

// fetch
fetch('/api/public/article-series/3')
  .then(res => res.json())
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 3,
    "title": "Spring 系列教程",
    "description": "从入门到精通",
    "coverImage": "https://example.com/series.jpg",
    "authorId": 8,
    "authorName": "张三",
    "articleCount": 12,
    "sortOrder": 1,
    "visibilityScope": 0,
    "articles": [
      {
        "id": 100,
        "title": "Spring Boot 快速入门",
        "summary": "本文介绍 Spring Boot 基础...",
        "sortOrder": 1
      }
    ]
  }
}
```

---

## 三、分类与标签

### 3.1 获取分类树

**接口信息**
- 路径: `GET /api/categories/tree`
- 鉴权: 否
- 说明: 返回文章分类的树形结构

**请求示例**

```javascript
// axios
axios.get('/api/categories/tree')

// fetch
fetch('/api/categories/tree')
  .then(res => res.json())
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "name": "后端",
      "code": "backend",
      "type": "article",
      "level": 1,
      "sortOrder": 1,
      "icon": "code",
      "description": "后端技术文章",
      "children": [
        {
          "id": 5,
          "parentId": 1,
          "name": "Java",
          "code": "java",
          "type": "article",
          "level": 2,
          "sortOrder": 1,
          "icon": "coffee",
          "description": null,
          "children": []
        }
      ]
    },
    {
      "id": 2,
      "parentId": 0,
      "name": "前端",
      "code": "frontend",
      "type": "article",
      "level": 1,
      "sortOrder": 2,
      "icon": "html",
      "description": "前端技术文章",
      "children": []
    }
  ]
}
```

**字段说明**

同 2.1 中 categories 字段说明。

---

### 3.2 获取标签列表

**接口信息**
- 路径: `GET /api/tags`
- 鉴权: 否
- 说明: 返回已启用的文章标签列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| targetType | String | 否 | 目标类型，默认 article | article |

**请求示例**

```javascript
// axios
axios.get('/api/tags', { params: { targetType: 'article' } })

// fetch
fetch('/api/tags?targetType=article')
  .then(res => res.json())
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    { "id": 10, "name": "Spring Boot", "color": "#6db33f" },
    { "id": 11, "name": "Java", "color": "#007396" },
    { "id": 12, "name": "Vue", "color": "#4fc08d" }
  ]
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 标签 ID |
| name | String | 标签名称 |
| color | String | 标签颜色（十六进制） |

---

## 四、文章评论

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

**请求示例**

```javascript
// axios
axios.get('/api/comments', {
  params: {
    targetType: 'article',
    targetId: 100,
    current: 1,
    size: 10
  }
})

// fetch
fetch('/api/comments?targetType=article&targetId=100&current=1&size=10')
  .then(res => res.json())
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40001 | 参数校验失败 | targetType 或 targetId 为空 |
| 40011 | 非法参数 | targetType 不支持 |

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

**请求示例**

```javascript
// axios
axios.post('/api/user/comments', {
  targetType: 'article',
  targetId: 100,
  content: '写得很好！'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({
    targetType: 'article',
    targetId: 100,
    content: '写得很好！'
  })
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新评论列表 |
| 40001 | 参数校验失败 | 检查必填字段 |
| 40102 | 未登录 | 跳转登录页 |

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

**请求示例**

```javascript
// axios
axios.delete('/api/user/comments/500', {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/comments/500', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

**请求示例**

```javascript
// axios
axios.post('/api/user/comments/500/likes', null, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/comments/500/likes', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

**请求示例**

```javascript
// axios
axios.delete('/api/user/comments/500/likes', {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/comments/500/likes', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 五、用户文章行为（需登录）

### 5.1 点赞文章

**接口信息**
- 路径: `POST /api/user/articles/{id}/likes`
- 鉴权: 必须登录
- 说明: 为指定文章点赞

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.post('/api/user/articles/100/likes')

// fetch
fetch('/api/user/articles/100/likes', { method: 'POST' })
  .then(res => res.json())
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 更新 UI 点赞状态 |
| 40102 | 未登录 | 跳转登录页 |
| 40011 | 非法参数 | 文章 ID 无效 |

---

### 5.2 取消点赞文章

**接口信息**
- 路径: `DELETE /api/user/articles/{id}/likes`
- 鉴权: 必须登录
- 说明: 取消对指定文章的点赞

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/user/articles/100/likes')

// fetch
fetch('/api/user/articles/100/likes', { method: 'DELETE' })
  .then(res => res.json())
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 更新 UI 点赞状态 |
| 40102 | 未登录 | 跳转登录页 |

---

### 5.3 分页查询我的文章

**接口信息**
- 路径: `GET /api/user/articles`
- 鉴权: 必须登录
- 说明: 返回当前用户自己文章的分页列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键字 | Spring |
| status | Integer | 否 | 文章状态 | 1 |
| reviewStatus | Integer | 否 | 审核状态 | 0 |

**请求示例**

```javascript
// axios
axios.get('/api/user/articles', {
  params: { current: 1, size: 10, status: 1 },
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/articles?current=1&size=10&status=1', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 15,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 100,
        "title": "Spring Boot 权威指南",
        "summary": "本文详细介绍 Spring Boot 的核心特性...",
        "coverImage": "https://example.com/cover.jpg",
        "status": 1,
        "reviewStatus": 1,
        "viewCount": 1520,
        "likeCount": 128,
        "commentCount": 35,
        "publishTime": "2025-01-10T08:00:00"
      }
    ]
  }
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40102 | 未登录 | 跳转登录页 |

---

### 5.4 查询我的文章详情

**接口信息**
- 路径: `GET /api/user/articles/{id}`
- 鉴权: 必须登录
- 说明: 返回当前用户自己文章的完整详情（含编辑所需信息）

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.get('/api/user/articles/100', {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/articles/100', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 100,
    "title": "Spring Boot 权威指南",
    "summary": "本文详细介绍...",
    "content": "<p>正文...</p>",
    "status": 1,
    "reviewStatus": 1,
    "categoryIds": [1, 5],
    "tagIds": [10, 11]
  }
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40102 | 未登录 | 跳转登录页 |
| 40400 | 文章不存在 | 提示不存在 |

---

### 5.5 配置我的文章访问名单

**接口信息**
- 路径: `PUT /api/user/articles/{id}/access`
- 鉴权: 必须登录
- 说明: 配置当前用户自己文章的访问白名单

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "accessList": [
    {
      "userId": 15,
      "accessType": 1,
      "expireTime": "2025-12-31T23:59:59",
      "grantReason": "VIP用户"
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| accessList | Array | 是 | 访问授权列表 |
| accessList[].userId | Long | 是 | 被授权用户 ID |
| accessList[].accessType | Integer | 否 | 授权类型 |
| accessList[].expireTime | String | 否 | 过期时间 |
| accessList[].grantReason | String | 否 | 授权原因 |

**请求示例**

```javascript
// axios
axios.put('/api/user/articles/100/access', {
  accessList: [{ userId: 15, accessType: 1, grantReason: 'VIP用户' }]
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/articles/100/access', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({
    accessList: [{ userId: 15, accessType: 1 }]
  })
})
```

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

### 5.6 提交文章审核

**接口信息**
- 路径: `POST /api/user/articles/{id}/submit-review`
- 鉴权: 必须登录
- 说明: 将文章提交审核

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体（可选）**

```json
{
  "remark": "请审核"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| remark | String | 否 | 提交备注 |

**请求示例**

```javascript
// axios
axios.post('/api/user/articles/100/submit-review', {
  remark: '请审核'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/articles/100/submit-review', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({ remark: '请审核' })
})
```

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

### 5.7 查询文章审核日志

**接口信息**
- 路径: `GET /api/user/articles/{id}/review-log`
- 鉴权: 必须登录
- 说明: 返回指定文章的审核日志列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.get('/api/user/articles/100/review-log', {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/articles/100/review-log', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 1,
      "articleId": 100,
      "reviewerId": 1,
      "reviewerName": "管理员",
      "action": "approve",
      "reason": "内容合规",
      "createdAt": "2025-01-12T10:00:00"
    }
  ]
}
```

---

### 5.8 用户文章系列管理

#### 查询我的系列列表

**接口信息**
- 路径: `GET /api/user/article-series`
- 鉴权: 必须登录
- 说明: 返回当前用户的文章系列列表

**请求示例**

```javascript
// axios
axios.get('/api/user/article-series', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 3,
      "title": "Spring 系列教程",
      "coverImage": "https://example.com/series.jpg",
      "articleCount": 12,
      "sortOrder": 1,
      "visibilityScope": 0
    }
  ]
}
```

#### 查询我的系列详情

**接口信息**
- 路径: `GET /api/user/article-series/{id}`
- 鉴权: 必须登录
- 说明: 返回当前用户指定系列的详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

#### 创建系列

**接口信息**
- 路径: `POST /api/user/article-series`
- 鉴权: 必须登录
- 说明: 创建新的文章系列

**请求体**

```json
{
  "title": "新系列",
  "description": "系列描述",
  "coverImage": "https://example.com/cover.jpg",
  "visibilityScope": 0,
  "sortOrder": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| title | String | 是 | 系列标题 |
| description | String | 否 | 系列描述 |
| coverImage | String | 否 | 封面图地址 |
| visibilityScope | Integer | 否 | 可见范围，0-公开 |
| sortOrder | Integer | 否 | 排序序号 |

**请求示例**

```javascript
// axios
axios.post('/api/user/article-series', {
  title: '新系列',
  description: '系列描述'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 5,
    "title": "新系列",
    "description": "系列描述",
    "coverImage": null,
    "articleCount": 0,
    "sortOrder": 0,
    "visibilityScope": 0
  }
}
```

#### 修改系列

**接口信息**
- 路径: `PUT /api/user/article-series/{id}`
- 鉴权: 必须登录
- 说明: 修改指定系列信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求体**

同创建系列。

#### 删除系列

**接口信息**
- 路径: `DELETE /api/user/article-series/{id}`
- 鉴权: 必须登录
- 说明: 删除指定系列

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

#### 向系列加入文章

**接口信息**
- 路径: `POST /api/user/article-series/{id}/articles`
- 鉴权: 必须登录
- 说明: 将文章加入指定系列

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求体**

```json
{
  "articleId": 100,
  "sortOrder": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| articleId | Long | 是 | 文章 ID |
| sortOrder | Integer | 否 | 排序序号 |

**请求示例**

```javascript
// axios
axios.post('/api/user/article-series/5/articles', {
  articleId: 100,
  sortOrder: 1
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

#### 从系列移出文章

**接口信息**
- 路径: `DELETE /api/user/article-series/{id}/articles/{articleId}`
- 鉴权: 必须登录
- 说明: 将文章从指定系列中移除

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |
| articleId | Long | 是 | 文章 ID |

#### 调整系列文章顺序

**接口信息**
- 路径: `PUT /api/user/article-series/{id}/articles/sort`
- 鉴权: 必须登录
- 说明: 调整系列内文章的排序

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求体**

```json
{
  "articleOrders": [
    { "articleId": 100, "sortOrder": 1 },
    { "articleId": 101, "sortOrder": 2 }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| articleOrders | Array | 是 | 文章排序列表 |
| articleOrders[].articleId | Long | 是 | 文章 ID |
| articleOrders[].sortOrder | Integer | 是 | 排序序号 |

---

## 六、用户收藏（需登录）

### 6.1 查询我的收藏夹

**接口信息**
- 路径: `GET /api/user/collection-folders`
- 鉴权: 必须登录
- 说明: 返回当前用户的收藏夹分页列表

**请求示例**

```javascript
// axios
axios.get('/api/user/collection-folders')

// fetch
fetch('/api/user/collection-folders')
  .then(res => res.json())
```

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

**请求示例**

```javascript
// axios
axios.post('/api/user/collection-folders', {
  folderName: '我的收藏',
  folderType: 'article',
  description: '收藏夹描述',
  isPublic: 0
})

// fetch
fetch('/api/user/collection-folders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderName: '我的收藏',
    folderType: 'article',
    isPublic: 0
  })
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 关闭创建弹窗，刷新列表 |
| 40001 | 参数校验失败 | folderName 为空 |
| 40102 | 未登录 | 跳转登录页 |

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

**请求示例**

```javascript
// axios
axios.put('/api/user/collection-folders/5', {
  folderName: '修改后的名称',
  description: '修改后的描述'
})

// fetch
fetch('/api/user/collection-folders/5', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderName: '修改后的名称'
  })
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 关闭编辑弹窗，刷新列表 |
| 40001 | 参数校验失败 | folderName 为空 |
| 40102 | 未登录 | 跳转登录页 |
| 40400 | 收藏夹不存在 | 提示收藏夹不存在 |

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

**请求示例**

```javascript
// axios
axios.delete('/api/user/collection-folders/5')

// fetch
fetch('/api/user/collection-folders/5', { method: 'DELETE' })
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新收藏夹列表 |
| 40102 | 未登录 | 跳转登录页 |
| 40400 | 收藏夹不存在 | 提示收藏夹不存在 |

---

### 6.5 查询我的收藏

**接口信息**
- 路径: `GET /api/user/collections`
- 鉴权: 必须登录
- 说明: 返回当前用户的收藏记录分页列表

**请求示例**

```javascript
// axios
axios.get('/api/user/collections')

// fetch
fetch('/api/user/collections')
  .then(res => res.json())
```

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

**请求示例**

```javascript
// axios
axios.post('/api/user/collections', {
  folderId: 1,
  targetId: 100,
  targetType: 'article',
  remark: '很实用的文章'
})

// fetch
fetch('/api/user/collections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderId: 1,
    targetId: 100,
    targetType: 'article'
  })
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 显示收藏成功提示 |
| 40001 | 参数校验失败 | folderId 或 targetId 为空 |
| 40102 | 未登录 | 跳转登录页 |

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

**请求示例**

```javascript
// axios
axios.delete('/api/user/collections/200')

// fetch
fetch('/api/user/collections/200', { method: 'DELETE' })
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新收藏列表 |
| 40102 | 未登录 | 跳转登录页 |
| 40400 | 收藏记录不存在 | 提示收藏记录不存在 |

---

## 七、后台文章管理（需管理员权限）

### 7.1 分页查询文章

**接口信息**
- 路径: `GET /api/sys/articles`
- 鉴权: 必须登录且有 `content:article:query` 权限
- 说明: 后台分页查询文章列表，支持多条件筛选

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键字（匹配标题和摘要） | Spring |
| authorId | Long | 否 | 作者 ID | 8 |
| status | Integer | 否 | 文章状态 | 1 |
| reviewStatus | Integer | 否 | 审核状态 | 0 |
| accessLevel | Integer | 否 | 访问级别 | 0 |
| visibilityScope | Integer | 否 | 可见范围 | 0 |
| categoryId | Long | 否 | 分类 ID | 5 |
| tagId | Long | 否 | 标签 ID | 10 |
| isTop | Integer | 否 | 是否置顶 | 1 |
| isRecommend | Integer | 否 | 是否推荐 | 1 |
| publishTimeStart | String | 否 | 发布时间开始 | 2025-01-01 00:00:00 |
| publishTimeEnd | String | 否 | 发布时间结束 | 2025-01-31 23:59:59 |

**文章状态 status 取值：**
- `0` - 草稿
- `1` - 已发布
- `2` - 待发布
- `3` - 已下架

**审核状态 reviewStatus 取值：**
- `0` - 待审核
- `1` - 审核通过
- `2` - 审核拒绝

**请求示例**

```javascript
// axios
axios.get('/api/sys/articles', {
  params: {
    current: 1,
    size: 10,
    keyword: 'Spring',
    status: 1
  },
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles?current=1&size=10&status=1', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 120,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 100,
        "title": "Spring Boot 权威指南",
        "summary": "本文详细介绍 Spring Boot 的核心特性...",
        "coverImage": "https://example.com/cover.jpg",
        "authorId": 8,
        "authorName": "张三",
        "isTop": 1,
        "isRecommend": 1,
        "isOriginal": 1,
        "status": 1,
        "reviewStatus": 1,
        "accessLevel": 0,
        "visibilityScope": 0,
        "viewCount": 1520,
        "likeCount": 128,
        "commentCount": 35,
        "collectCount": 67,
        "shareCount": 12,
        "publishTime": "2025-01-10T08:00:00",
        "scheduledPublishTime": null,
        "createdAt": "2024-12-20T10:00:00",
        "updatedAt": "2025-01-10T08:00:00",
        "remark": "优质文章，已推荐至首页"
      }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 文章 ID |
| title | String | 文章标题 |
| summary | String | 文章摘要 |
| coverImage | String | 封面图地址 |
| authorId| Long | 作者 ID |
| authorName | String | 作者昵称 |
| isTop | Integer | 是否置顶 |
| isRecommend | Integer | 是否推荐 |
| isOriginal | Integer | 是否原创 |
| status | Integer | 文章状态 |
| reviewStatus | Integer | 审核状态 |
| accessLevel | Integer | 访问级别 |
| visibilityScope | Integer | 可见范围 |
| viewCount | Integer | 浏览数 |
| likeCount | Integer | 点赞数 |
| commentCount | Integer | 评论数 |
| collectCount | Integer | 收藏数 |
| shareCount | Integer | 分享数 |
| publishTime | String | 发布时间 |
| scheduledPublishTime | String | 定时发布时间 |
| createdAt | String | 创建时间 |
| updatedAt | String | 更新时间 |
| remark | String | 备注 |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |

---

### 7.2 查询文章详情

**接口信息**
- 路径: `GET /api/sys/articles/{id}`
- 鉴权: 必须登录且有 `content:article:query` 权限
- 说明: 后台查询文章的完整详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.get('/api/sys/articles/100', {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/100', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 100,
    "title": "Spring Boot 权威指南",
    "summary": "本文详细介绍 Spring Boot 的核心特性...",
    "content": "<p>文章正文 HTML 内容...</p>",
    "coverImage": "https://example.com/cover.jpg",
    "authorId": 8,
    "authorName": "张三",
    "isTop": 1,
    "isRecommend": 1,
    "isOriginal": 1,
    "sourceUrl": null,
    "status": 1,
    "reviewStatus": 1,
    "publishTime": "2025-01-10T08:00:00",
    "scheduledPublishTime": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 1520,
    "likeCount": 128,
    "commentCount": 35,
    "collectCount": 67,
    "shareCount": 12,
    "createdAt": "2024-12-20T10:00:00",
    "updatedAt": "2025-01-10T08:00:00",
    "remark": "优质文章，已推荐至首页",
    "categoryIds": [1, 5],
    "tagIds": [10, 11],
    "accessList": [
      {
        "userId": 15,
        "accessType": 1,
        "expireTime": "2025-12-31T23:59:59",
        "grantReason": "VIP用户"
      }
    ],
    "seriesList": []
  }
}
```

**新增字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| categoryIds | Array | 分类 ID 列表 |
| tagIds | Array | 标签 ID 列表 |
| accessList | Array | 访问授权列表 |

**accessList 子字段**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| userId | Long | 被授权用户 ID |
| accessType | Integer | 授权类型 |
| expireTime | String | 过期时间 |
| grantReason | String | 授权原因 |

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | - |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |
| 40400 | 文章不存在 | 提示文章不存在 |

---

### 7.3 新增文章

**接口信息**
- 路径: `POST /api/sys/articles`
- 鉴权: 必须登录且有 `content:article:create` 权限
- 说明: 创建新文章

**请求体**

```json
{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "<p>文章正文内容</p>",
  "coverImage": "https://example.com/cover.jpg",
  "authorId": 8,
  "isTop": 0,
  "isRecommend": 0,
  "isOriginal": 1,
  "sourceUrl": null,
  "status": 1,
  "publishTime": "2025-01-10T08:00:00",
  "scheduledPublishTime": null,
  "accessLevel": 0,
  "visibilityScope": 0,
  "remark": "备注信息",
  "categoryIds": [1, 5],
  "tagIds": [10, 11],
  "accessList": []
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| title | String | 是 | 文章标题，最大 128 字符 |
| summary | String | 否 | 文章摘要，最大 2000 字符 |
| content | String | 否 | 文章正文（HTML） |
| coverImage | String | 否 | 封面图地址，最大 512 字符 |
| authorId | Long | 是 | 作者 ID |
| isTop | Integer | 否 | 是否置顶，0-否，1-是 |
| isRecommend | Integer | 否 | 是否推荐，0-否，1-是 |
| isOriginal | Integer | 否 | 是否原创，0-否，1-是 |
| sourceUrl | String | 否 | 来源地址（转载时填写） |
| status | Integer | 否 | 文章状态，0-草稿，1-已发布 |
| publishTime | String | 否 | 发布时间，格式 yyyy-MM-dd HH:mm:ss |
| scheduledPublishTime | String | 否 | 定时发布时间 |
| accessLevel | Integer | 否 | 访问级别，0-免费 |
| visibilityScope | Integer | 否 | 可见范围，0-公开 |
| remark | String | 否 | 备注，最大 256 字符 |
| categoryIds | Array | 否 | 分类 ID 列表 |
| tagIds | Array | 否 | 标签 ID 列表 |
| accessList | Array | 否 | 访问授权列表 |

**请求示例**

```javascript
// axios
axios.post('/api/sys/articles', {
  title: '新文章标题',
  authorId: 8,
  isOriginal: 1,
  status: 1,
  categoryIds: [1],
  tagIds: [10]
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({
    title: '新文章标题',
    authorId: 8,
    status: 1
  })
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 105,
    "title": "新文章标题",
    "summary": null,
    "content": null,
    "coverImage": null,
    "authorId": 8,
    "authorName": "张三",
    "isTop": 0,
    "isRecommend": 0,
    "isOriginal": 1,
    "sourceUrl": null,
    "status": 1,
    "reviewStatus": 1,
    "publishTime": "2025-01-15T10:30:00",
    "scheduledPublishTime": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0,
    "collectCount": 0,
    "shareCount": 0,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00",
    "remark": null,
    "categoryIds": [1],
    "tagIds": [10],
    "accessList": [],
    "seriesList": []
  }
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 关闭编辑弹窗，刷新列表，跳转详情 |
| 40001 | 参数校验失败 | 检查必填字段 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |

---

### 7.4 修改文章

**接口信息**
- 路径: `PUT /api/sys/articles/{id}`
- 鉴权: 必须登录且有 `content:article:update` 权限
- 说明: 修改指定文章的信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

同 7.3 新增文章

**请求示例**

```javascript
// axios
axios.put('/api/sys/articles/105', {
  title: '修改后的标题',
  summary: '修改后的摘要'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/105', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({
    title: '修改后的标题'
  })
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:35:00",
  "data": {
    "id": 105,
    "title": "修改后的标题",
    "summary": "修改后的摘要",
    "content": null,
    "coverImage": null,
    "authorId": 8,
    "authorName": "张三",
    "isTop": 0,
    "isRecommend": 0,
    "isOriginal": 1,
    "sourceUrl": null,
    "status": 1,
    "reviewStatus": 1,
    "publishTime": "2025-01-15T10:30:00",
    "scheduledPublishTime": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0,
    "collectCount": 0,
    "shareCount": 0,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:35:00",
    "remark": null,
    "categoryIds": [1],
    "tagIds": [10],
    "accessList": [],
    "seriesList": []
  }
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 关闭编辑弹窗，刷新列表 |
| 40001 | 参数校验失败 | 检查必填字段 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |
| 40400 | 文章不存在 | 提示文章不存在 |

---

### 7.5 修改文章状态

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/status`
- 鉴权: 必须登录且有 `content:article:update-status` 权限
- 说明: 修改文章的发布状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "status": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 文章状态，0-草稿，1-已发布，2-待发布，3-已下架 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/articles/105/status', { status: 3 }, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/105/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({ status: 3 })
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新列表状态 |
| 40001 | 参数校验失败 | status 为空 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |
| 40400 | 文章不存在 | 提示文章不存在 |

---

### 7.6 切换文章置顶状态

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/top`
- 鉴权: 必须登录且有 `content:article:update` 权限
- 说明: 切换文章的置顶状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| enabled | Boolean | 是 | 是否置顶，true-置顶，false-取消置顶 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/articles/105/top', null, {
  params: { enabled: true },
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/105/top?enabled=true', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新列表 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |

---

### 7.7 切换文章推荐状态

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/recommend`
- 鉴权: 必须登录且有 `content:article:update` 权限
- 说明: 切换文章的推荐状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| enabled | Boolean | 是 | 是否推荐，true-推荐，false-取消推荐 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/articles/105/recommend', null, {
  params: { enabled: true },
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/105/recommend?enabled=true', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新列表 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |

---

### 7.8 配置文章访问名单

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/access`
- 鉴权: 必须登录且有 `content:article:access` 权限
- 说明: 配置文章的访问白名单用户

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "accessList": [
    {
      "userId": 15,
      "accessType": 1,
      "expireTime": "2025-12-31T23:59:59",
      "grantReason": "VIP用户"
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| accessList | Array | 是 | 访问授权列表 |
| accessList[].userId | Long | 是 | 被授权用户 ID |
| accessList[].accessType | Integer | 否 | 授权类型 |
| accessList[].expireTime | String | 否 | 过期时间，格式 yyyy-MM-dd HH:mm:ss |
| accessList[].grantReason | String | 否 | 授权原因 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/articles/105/access', {
  accessList: [
    { userId: 15, accessType: 1, grantReason: 'VIP用户' }
  ]
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/105/access', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  body: JSON.stringify({
    accessList: [{ userId: 15, accessType: 1 }]
  })
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 关闭弹窗，刷新 |
| 40001 | 参数校验失败 | 检查参数 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |

---

### 7.9 删除文章

**接口信息**
- 路径: `DELETE /api/sys/articles/{id}`
- 鉴权: 必须登录且有 `content:article:delete` 权限
- 说明: 删除指定文章

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/articles/105', {
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/sys/articles/105', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 | 前端处理 |
|-----|------|---------|
| 200 | 成功 | 刷新列表 |
| 40102 | 未登录 | 跳转登录页 |
| 40300 | 无权限 | 提示无权限 |
| 40400 | 文章不存在 | 提示文章不存在 |

---

## 八、用户足迹（需登录）

### 8.1 查询我的足迹

**接口信息**
- 路径: `GET /api/user/footprints`
- 鉴权: 必须登录
- 说明: 返回当前用户的浏览足迹分页列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |

**请求示例**

```javascript
// axios
axios.get('/api/user/footprints', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})

// fetch
fetch('/api/user/footprints?current=1&size=10', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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
        "id": 1,
        "userId": 8,
        "targetId": 100,
        "targetType": "article",
        "targetTitle": "Spring Boot 权威指南",
        "visitedAt": "2025-01-15T10:00:00"
      }
    ]
  }
}
```

---

### 8.2 删除我的足迹

**接口信息**
- 路径: `DELETE /api/user/footprints/{id}`
- 鉴权: 必须登录
- 说明: 删除指定的浏览足迹

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 足迹 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/user/footprints/1', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

### 8.3 清空我的足迹

**接口信息**
- 路径: `DELETE /api/user/footprints`
- 鉴权: 必须登录
- 说明: 清空当前用户的所有浏览足迹

**请求示例**

```javascript
// axios
axios.delete('/api/user/footprints', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 九、公开友情链接

### 9.1 查询启用友情链接列表

**接口信息**
- 路径: `GET /api/public/friend-links`
- 鉴权: 否
- 说明: 返回已启用的友情链接列表

**请求示例**

```javascript
// axios
axios.get('/api/public/friend-links')

// fetch
fetch('/api/public/friend-links')
  .then(res => res.json())
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 1,
      "name": "示例站点",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "description": "示例站点描述",
      "sortOrder": 1
    }
  ]
}
```

---

## 十、后台文章审核（需管理员权限）

### 10.1 分页查询文章审核

**接口信息**
- 路径: `GET /api/sys/article-reviews`
- 鉴权: 必须登录且有 `content:article-review:query` 权限
- 说明: 后台分页查询待审核文章列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键字 | Spring |
| reviewStatus | Integer | 否 | 审核状态 | 0 |
| authorId | Long | 否 | 作者 ID | 8 |

**请求示例**

```javascript
// axios
axios.get('/api/sys/article-reviews', {
  params: { current: 1, size: 10, reviewStatus: 0 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 5,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 100,
        "title": "待审核文章",
        "authorId": 8,
        "authorName": "张三",
        "reviewStatus": 0,
        "createdAt": "2025-01-14T10:00:00"
      }
    ]
  }
}
```

---

### 10.2 查询文章审核详情

**接口信息**
- 路径: `GET /api/sys/article-reviews/{id}`
- 鉴权: 必须登录且有 `content:article-review:query` 权限
- 说明: 查询待审核文章的完整详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

---

### 10.3 审核通过文章

**接口信息**
- 路径: `PUT /api/sys/article-reviews/{id}/approve`
- 鉴权: 必须登录且有 `content:article-review:review` 权限
- 说明: 审核通过指定文章

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体（可选）**

```json
{
  "reason": "内容合规"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| reason | String | 否 | 审核意见 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/article-reviews/100/approve', {
  reason: '内容合规'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

### 10.4 审核拒绝文章

**接口信息**
- 路径: `PUT /api/sys/article-reviews/{id}/reject`
- 鉴权: 必须登录且有 `content:article-review:review` 权限
- 说明: 审核拒绝指定文章

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "reason": "内容不符合规范"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| reason | String | 是 | 拒绝原因 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/article-reviews/100/reject', {
  reason: '内容不符合规范'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

### 10.5 修正文章审核状态

**接口信息**
- 路径: `PUT /api/sys/article-reviews/{id}/repair-status`
- 鉴权: 必须登录且有 `content:article-review:repair` 权限
- 说明: 修正文章的审核状态（用于异常数据修复）

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "reviewStatus": 1,
  "reason": "数据修复"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| reviewStatus | Integer | 是 | 目标审核状态 |
| reason | String | 否 | 修正原因 |

---

## 十一、后台分类管理（需管理员权限）

### 11.1 查询分类树

**接口信息**
- 路径: `GET /api/sys/categories/tree`
- 鉴权: 必须登录且有 `content:category:query` 权限
- 说明: 后台查询分类树形结构（含未启用的分类）

**请求示例**

```javascript
// axios
axios.get('/api/sys/categories/tree', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "name": "后端",
      "code": "backend",
      "type": "article",
      "level": 1,
      "sortOrder": 1,
      "status": 1,
      "children": []
    }
  ]
}
```

---

### 11.2 查询分类详情

**接口信息**
- 路径: `GET /api/sys/categories/{id}`
- 鉴权: 必须登录且有 `content:category:query` 权限
- 说明: 后台查询分类详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 分类 ID |

---

### 11.3 新增分类

**接口信息**
- 路径: `POST /api/sys/categories`
- 鉴权: 必须登录且有 `content:category:create` 权限
- 说明: 创建新分类

**请求体**

```json
{
  "name": "后端",
  "code": "backend",
  "parentId": 0,
  "type": "article",
  "icon": "code",
  "description": "后端技术文章",
  "sortOrder": 1,
  "status": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| name | String | 是 | 分类名称 |
| code | String | 是 | 分类编码 |
| parentId | Long | 否 | 父分类 ID，0 表示顶级 |
| type | String | 否 | 分类类型 |
| icon | String | 否 | 图标名称 |
| description | String | 否 | 分类描述 |
| sortOrder | Integer | 否 | 排序序号 |
| status | Integer | 否 | 状态，1-启用，0-禁用 |

**请求示例**

```javascript
// axios
axios.post('/api/sys/categories', {
  name: '后端',
  code: 'backend',
  parentId: 0,
  type: 'article'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 1,
    "name": "后端",
    "code": "backend",
    "parentId": 0,
    "status": 1
  }
}
```

---

### 11.4 修改分类

**接口信息**
- 路径: `PUT /api/sys/categories/{id}`
- 鉴权: 必须登录且有 `content:category:update` 权限
- 说明: 修改分类信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 分类 ID |

**请求体**

同 11.3 新增分类。

---

### 11.5 修改分类状态

**接口信息**
- 路径: `PUT /api/sys/categories/{id}/status`
- 鉴权: 必须登录且有 `content:category:update` 权限
- 说明: 启停分类

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 分类 ID |

**请求体**

```json
{
  "status": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 状态，1-启用，0-禁用 |

---

### 11.6 删除分类

**接口信息**
- 路径: `DELETE /api/sys/categories/{id}`
- 鉴权: 必须登录且有 `content:category:delete` 权限
- 说明: 删除分类

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 分类 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/categories/1', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十二、后台标签管理（需管理员权限）

### 12.1 查询标签列表

**接口信息**
- 路径: `GET /api/sys/tags`
- 鉴权: 必须登录且有 `content:tag:query` 权限
- 说明: 后台查询所有标签

**请求示例**

```javascript
// axios
axios.get('/api/sys/tags', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    { "id": 10, "name": "Spring Boot", "color": "#6db33f" },
    { "id": 11, "name": "Java", "color": "#007396" }
  ]
}
```

---

### 12.2 查询标签详情

**接口信息**
- 路径: `GET /api/sys/tags/{id}`
- 鉴权: 必须登录且有 `content:tag:query` 权限
- 说明: 后台查询标签详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 标签 ID |

---

### 12.3 新增标签

**接口信息**
- 路径: `POST /api/sys/tags`
- 鉴权: 必须登录且有 `content:tag:create` 权限
- 说明: 创建新标签

**请求体**

```json
{
  "name": "Spring Boot",
  "color": "#6db33f"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| name | String | 是 | 标签名称 |
| color | String | 否 | 标签颜色（十六进制） |

**请求示例**

```javascript
// axios
axios.post('/api/sys/tags', {
  name: 'Spring Boot',
  color: '#6db33f'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 10,
    "name": "Spring Boot",
    "color": "#6db33f"
  }
}
```

---

### 12.4 修改标签

**接口信息**
- 路径: `PUT /api/sys/tags/{id}`
- 鉴权: 必须登录且有 `content:tag:update` 权限
- 说明: 修改标签信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 标签 ID |

**请求体**

同 12.3 新增标签。

---

### 12.5 删除标签

**接口信息**
- 路径: `DELETE /api/sys/tags/{id}`
- 鉴权: 必须登录且有 `content:tag:delete` 权限
- 说明: 删除标签

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 标签 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/tags/10', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十三、后台评论管理（需管理员权限）

### 13.1 分页查询评论

**接口信息**
- 路径: `GET /api/sys/comments`
- 鉴权: 必须登录且有 `content:comment:query` 权限
- 说明: 后台分页查询评论列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| targetType | String | 否 | 目标类型 | article |
| targetId | Long | 否 | 目标 ID | 100 |
| status | Integer | 否 | 评论状态 | 1 |
| keyword | String | 否 | 搜索关键字 | 测试 |

**请求示例**

```javascript
// axios
axios.get('/api/sys/comments', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 80,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 500,
        "targetType": "article",
        "targetId": 100,
        "content": "写得很好！",
        "userId": 8,
        "userNickname": "Tom",
        "status": 1,
        "createdAt": "2025-01-12T14:30:00"
      }
    ]
  }
}
```

---

### 13.2 查询评论详情

**接口信息**
- 路径: `GET /api/sys/comments/{id}`
- 鉴权: 必须登录且有 `content:comment:query` 权限
- 说明: 后台查询评论详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 评论 ID |

---

### 13.3 修改评论状态

**接口信息**
- 路径: `PUT /api/sys/comments/{id}/status`
- 鉴权: 必须登录且有 `content:comment:update` 权限
- 说明: 修改评论的显示状态（显示/隐藏）

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 评论 ID |

**请求体**

```json
{
  "status": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 评论状态，1-正常，0-隐藏 |

**请求示例**

```javascript
// axios
axios.put('/api/sys/comments/500/status', { status: 0 }, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

### 13.4 删除评论

**接口信息**
- 路径: `DELETE /api/sys/comments/{id}`
- 鉴权: 必须登录且有 `content:comment:delete` 权限
- 说明: 删除评论

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 评论 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/comments/500', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十四、后台收藏管理（需管理员权限）

### 14.1 分页查询收藏夹

**接口信息**
- 路径: `GET /api/sys/collections/folders`
- 鉴权: 必须登录且有 `content:collection:query` 权限
- 说明: 后台分页查询收藏夹列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |

**请求示例**

```javascript
// axios
axios.get('/api/sys/collections/folders', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 20,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 8,
        "folderName": "技术收藏",
        "folderType": "article",
        "collectionCount": 25,
        "createdAt": "2024-12-01T10:00:00"
      }
    ]
  }
}
```

---

### 14.2 分页查询收藏记录

**接口信息**
- 路径: `GET /api/sys/collections`
- 鉴权: 必须登录且有 `content:collection:query` 权限
- 说明: 后台分页查询收藏记录

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |

**请求示例**

```javascript
// axios
axios.get('/api/sys/collections', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 100,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 200,
        "folderId": 1,
        "targetId": 100,
        "targetType": "article",
        "userId": 8,
        "createdAt": "2025-01-10T14:00:00"
      }
    ]
  }
}
```

---

### 14.3 删除收藏记录

**接口信息**
- 路径: `DELETE /api/sys/collections/{id}`
- 鉴权: 必须登录且有 `content:collection:delete` 权限
- 说明: 后台删除收藏记录

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 收藏记录 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/collections/200', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十五、后台足迹管理（需管理员权限）

### 15.1 分页查询足迹

**接口信息**
- 路径: `GET /api/sys/footprints`
- 鉴权: 必须登录且有 `content:footprint:query` 权限
- 说明: 后台分页查询浏览足迹

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| userId | Long | 否 | 用户 ID | 8 |
| targetType | String | 否 | 目标类型 | article |

**请求示例**

```javascript
// axios
axios.get('/api/sys/footprints', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 200,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 8,
        "targetId": 100,
        "targetType": "article",
        "visitedAt": "2025-01-15T10:00:00"
      }
    ]
  }
}
```

---

### 15.2 删除足迹

**接口信息**
- 路径: `DELETE /api/sys/footprints/{id}`
- 鉴权: 必须登录且有 `content:footprint:delete` 权限
- 说明: 后台删除指定足迹

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 足迹 ID |

---

### 15.3 按条件清理足迹

**接口信息**
- 路径: `DELETE /api/sys/footprints`
- 鉴权: 必须登录且有 `content:footprint:delete` 权限
- 说明: 按条件批量清理足迹

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| userId | Long | 否 | 用户 ID | 8 |
| targetType | String | 否 | 目标类型 | article |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/footprints', {
  params: { userId: 8 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十六、后台互动管理（需管理员权限）

### 16.1 分页查询互动

**接口信息**
- 路径: `GET /api/sys/interactions`
- 鉴权: 必须登录且有 `content:interaction:query` 权限
- 说明: 后台分页查询互动记录（点赞等）

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| targetType | String | 否 | 目标类型 | article |
| targetId | Long | 否 | 目标 ID | 100 |
| userId | Long | 否 | 用户 ID | 8 |

**请求示例**

```javascript
// axios
axios.get('/api/sys/interactions', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 300,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 8,
        "targetType": "article",
        "targetId": 100,
        "interactionType": "like",
        "createdAt": "2025-01-15T10:00:00"
      }
    ]
  }
}
```

---

### 16.2 删除互动

**接口信息**
- 路径: `DELETE /api/sys/interactions/{id}`
- 鉴权: 必须登录且有 `content:interaction:delete` 权限
- 说明: 后台删除互动记录

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 互动记录 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/interactions/1', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十七、后台友情链接管理（需管理员权限）

### 17.1 分页查询友情链接

**接口信息**
- 路径: `GET /api/sys/friend-links`
- 鉴权: 必须登录且有 `content:friend-link:query` 权限
- 说明: 后台分页查询友情链接列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键字 | 示例 |
| status | Integer | 否 | 状态 | 1 |

**请求示例**

```javascript
// axios
axios.get('/api/sys/friend-links', {
  params: { current: 1, size: 10 },
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 10,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "name": "示例站点",
        "url": "https://example.com",
        "logo": "https://example.com/logo.png",
        "description": "示例站点描述",
        "sortOrder": 1,
        "status": 1,
        "createdAt": "2025-01-01T10:00:00"
      }
    ]
  }
}
```

---

### 17.2 查询友情链接详情

**接口信息**
- 路径: `GET /api/sys/friend-links/{id}`
- 鉴权: 必须登录且有 `content:friend-link:query` 权限
- 说明: 后台查询友情链接详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 友情链接 ID |

---

### 17.3 新增友情链接

**接口信息**
- 路径: `POST /api/sys/friend-links`
- 鉴权: 必须登录且有 `content:friend-link:create` 权限
- 说明: 创建友情链接

**请求体**

```json
{
  "name": "示例站点",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "示例站点描述",
  "sortOrder": 1,
  "status": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| name | String | 是 | 站点名称 |
| url | String | 是 | 站点地址 |
| logo | String | 否 | 站点 Logo 地址 |
| description | String | 否 | 站点描述 |
| sortOrder | Integer | 否 | 排序序号 |
| status | Integer | 否 | 状态，1-启用，0-禁用 |

**请求示例**

```javascript
// axios
axios.post('/api/sys/friend-links', {
  name: '示例站点',
  url: 'https://example.com'
}, {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 1,
    "name": "示例站点",
    "url": "https://example.com",
    "logo": null,
    "description": null,
    "sortOrder": 0,
    "status": 1
  }
}
```

---

### 17.4 修改友情链接

**接口信息**
- 路径: `PUT /api/sys/friend-links/{id}`
- 鉴权: 必须登录且有 `content:friend-link:update` 权限
- 说明: 修改友情链接信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 友情链接 ID |

**请求体**

同 17.3 新增友情链接。

---

### 17.5 启停友情链接

**接口信息**
- 路径: `PUT /api/sys/friend-links/{id}/status`
- 鉴权: 必须登录且有 `content:friend-link:update` 权限
- 说明: 启停友情链接

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 友情链接 ID |

**请求体**

```json
{
  "status": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 状态，1-启用，0-禁用 |

---

### 17.6 删除友情链接

**接口信息**
- 路径: `DELETE /api/sys/friend-links/{id}`
- 鉴权: 必须登录且有 `content:friend-link:delete` 权限
- 说明: 删除友情链接

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 友情链接 ID |

**请求示例**

```javascript
// axios
axios.delete('/api/sys/friend-links/1', {
  headers: { 'Authorization': 'Bearer xxx' }
})
```

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

## 十八、接口速查表

### 公开接口（无需登录）

| 接口 | 方法 | 路径 | 说明 |
|-----|------|-----|------|
| 文章分页列表 | GET | /api/articles | 首页/列表页文章 |
| 文章详情 | GET | /api/articles/{id} | 文章详情页 |
| 作者系列列表 | GET | /api/public/authors/{authorId}/series | 作者公开系列 |
| 系列详情 | GET | /api/public/article-series/{id} | 系列详情 |
| 分类树 | GET | /api/categories/tree | 获取分类结构 |
| 标签列表 | GET | /api/tags | 获取所有标签 |
| 评论树 | GET | /api/comments | 获取文章评论 |
| 友情链接列表 | GET | /api/public/friend-links | 启用的友情链接 |

### 用户接口（需登录）

| 接口 | 方法 | 路径 | 说明 |
|-----|------|-----|------|
| 我的文章列表 | GET | /api/user/articles | 我发表的文章 |
| 我的文章详情 | GET | /api/user/articles/{id} | 文章编辑信息 |
| 点赞文章 | POST | /api/user/articles/{id}/likes | 点赞 |
| 取消点赞 | DELETE | /api/user/articles/{id}/likes | 取消点赞 |
| 配置文章访问 | PUT | /api/user/articles/{id}/access | 我的文章访问名单 |
| 提交审核 | POST | /api/user/articles/{id}/submit-review | 提交文章审核 |
| 审核日志 | GET | /api/user/articles/{id}/review-log | 查看审核日志 |
| 我的系列列表 | GET | /api/user/article-series | 我的文章系列 |
| 系列详情 | GET | /api/user/article-series/{id} | 系列详情 |
| 创建系列 | POST | /api/user/article-series | 创建系列 |
| 修改系列 | PUT | /api/user/article-series/{id} | 修改系列 |
| 删除系列 | DELETE | /api/user/article-series/{id} | 删除系列 |
| 系列加入文章 | POST | /api/user/article-series/{id}/articles | 向系列加入文章 |
| 系列移出文章 | DELETE | /api/user/article-series/{id}/articles/{articleId} | 从系列移出文章 |
| 系列文章排序 | PUT | /api/user/article-series/{id}/articles/sort | 调整文章顺序 |
| 发表评论 | POST | /api/user/comments | 发表评论 |
| 删除我的评论 | DELETE | /api/user/comments/{id} | 删除自己的评论 |
| 点赞评论 | POST | /api/user/comments/{id}/likes | 点赞评论 |
| 取消点赞评论 | DELETE | /api/user/comments/{id}/likes | 取消点赞评论 |
| 收藏夹列表 | GET | /api/user/collection-folders | 我的收藏夹 |
| 新增收藏夹 | POST | /api/user/collection-folders | 创建收藏夹 |
| 修改收藏夹 | PUT | /api/user/collection-folders/{id} | 编辑收藏夹 |
| 删除收藏夹 | DELETE | /api/user/collection-folders/{id} | 删除收藏夹 |
| 收藏列表 | GET | /api/user/collections | 我的收藏 |
| 新增收藏 | POST | /api/user/collections | 添加收藏 |
| 删除收藏 | DELETE | /api/user/collections/{id} | 移除收藏 |
| 我的足迹 | GET | /api/user/footprints | 浏览足迹 |
| 删除足迹 | DELETE | /api/user/footprints/{id} | 删除单条足迹 |
| 清空足迹 | DELETE | /api/user/footprints | 清空所有足迹 |

### 后台接口（需管理员权限）

| 接口 | 方法 | 路径 | 权限 |
|-----|------|-----|------|
| 文章列表 | GET | /api/sys/articles | content:article:query |
| 文章详情 | GET | /api/sys/articles/{id} | content:article:query |
| 新增文章 | POST | /api/sys/articles | content:article:create |
| 修改文章 | PUT | /api/sys/articles/{id} | content:article:update |
| 修改状态 | PUT | /api/sys/articles/{id}/status | content:article:update-status |
| 配置访问 | PUT | /api/sys/articles/{id}/access | content:article:access |
| 切换置顶 | PUT | /api/sys/articles/{id}/top | content:article:update |
| 切换推荐 | PUT | /api/sys/articles/{id}/recommend | content:article:update |
| 删除文章 | DELETE | /api/sys/articles/{id} | content:article:delete |
| 审核列表 | GET | /api/sys/article-reviews | content:article-review:query |
| 审核详情 | GET | /api/sys/article-reviews/{id} | content:article-review:query |
| 审核通过 | PUT | /api/sys/article-reviews/{id}/approve | content:article-review:review |
| 审核拒绝 | PUT | /api/sys/article-reviews/{id}/reject | content:article-review:review |
| 修正审核状态 | PUT | /api/sys/article-reviews/{id}/repair-status | content:article-review:repair |
| 分类树 | GET | /api/sys/categories/tree | content:category:query |
| 分类详情 | GET | /api/sys/categories/{id} | content:category:query |
| 新增分类 | POST | /api/sys/categories | content:category:create |
| 修改分类 | PUT | /api/sys/categories/{id} | content:category:update |
| 分类启停 | PUT | /api/sys/categories/{id}/status | content:category:update |
| 删除分类 | DELETE | /api/sys/categories/{id} | content:category:delete |
| 标签列表 | GET | /api/sys/tags | content:tag:query |
| 标签详情 | GET | /api/sys/tags/{id} | content:tag:query |
| 新增标签 | POST | /api/sys/tags | content:tag:create |
| 修改标签 | PUT | /api/sys/tags/{id} | content:tag:update |
| 删除标签 | DELETE | /api/sys/tags/{id} | content:tag:delete |
| 评论列表 | GET | /api/sys/comments | content:comment:query |
| 评论详情 | GET | /api/sys/comments/{id} | content:comment:query |
| 评论启停 | PUT | /api/sys/comments/{id}/status | content:comment:update |
| 删除评论 | DELETE | /api/sys/comments/{id} | content:comment:delete |
| 收藏夹列表 | GET | /api/sys/collections/folders | content:collection:query |
| 收藏记录列表 | GET | /api/sys/collections | content:collection:query |
| 删除收藏记录 | DELETE | /api/sys/collections/{id} | content:collection:delete |
| 足迹列表 | GET | /api/sys/footprints | content:footprint:query |
| 删除足迹 | DELETE | /api/sys/footprints/{id} | content:footprint:delete |
| 清理足迹 | DELETE | /api/sys/footprints | content:footprint:delete |
| 互动列表 | GET | /api/sys/interactions | content:interaction:query |
| 删除互动 | DELETE | /api/sys/interactions/{id} | content:interaction:delete |
| 友情链接列表 | GET | /api/sys/friend-links | content:friend-link:query |
| 友情链接详情 | GET | /api/sys/friend-links/{id} | content:friend-link:query |
| 新增友情链接 | POST | /api/sys/friend-links | content:friend-link:create |
| 修改友情链接 | PUT | /api/sys/friend-links/{id} | content:friend-link:update |
| 友情链接启停 | PUT | /api/sys/friend-links/{id}/status | content:friend-link:update |
| 删除友情链接 | DELETE | /api/sys/friend-links/{id} | content:friend-link:delete |