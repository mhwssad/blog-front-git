# 内容域 - 公开接口

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

本文档包含公开访问的文章接口，无需登录即可调用。

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

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |

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

| code | 说明 |
|-----|------|
| 40400 | 文章不存在 |
| 40300 | 无访问权限 |

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

## 九、公开友情链接

### 9.1 查询启用友情链接列表

**接口信息**
- 路径: `GET /api/public/friend-links`
- 鉴权: 否
- 说明: 返回已启用的友情链接列表

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