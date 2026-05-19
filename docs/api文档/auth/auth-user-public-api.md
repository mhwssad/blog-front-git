# 公开用户 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

[场景说明] 用户经验等级、用户作者申请、公开用户搜索、公开作者主页

---
## 用户经验等级

### 查看当前等级信息

**接口信息**
- 路径: `GET /api/user/experience/level`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "level": 5,
    "experiencePoints": 15000,
    "nextLevelExp": 20000
  }
}
```

---

## 用户作者申请

### 提交作者申请

**接口信息**
- 路径: `POST /api/user/author-applications`
- 鉴权: 是
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| realName | string | 否 | 真实姓名 |
| penName | string | 否 | 笔名 |
| introduction | string | 否 | 自我介绍 |
| portfolioUrl | string | 否 | 作品集链接 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "status": "pending",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

### 查询最近一次作者申请

**接口信息**
- 路径: `GET /api/user/author-applications/latest`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "status": "pending",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

### 分页查询我的作者申请记录

**接口信息**
- 路径: `GET /api/user/author-applications`
- 鉴权: 是
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| current | integer | 否 | 当前页，默认1 | `1` |
| size | integer | 否 | 每页条数，默认10 | `10` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 3,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "status": "approved",
        "createdAt": "2026-05-10T10:00:00"
      }
    ]
  }
}
```

---

## 公开用户搜索

### 搜索用户

**接口信息**
- 路径: `GET /api/users/search`
- 鉴权: 否
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 | 限制 |
|-----|------|------|------|------|
| keyword | string | 是 | 搜索关键字 | 至少2个字符 |
| current | integer | 否 | 当前页，默认1 | - |
| size | integer | 否 | 每页条数，默认10 | - |

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
        "userId": 1,
        "username": "admin",
        "nickname": "管理员",
        "avatar": "https://example.com/avatar.jpg"
      }
    ]
  }
}
```

---

## 公开作者主页

### 查询指定用户的公开作者主页摘要

**接口信息**
- 路径: `GET /api/users/{userId}/author-profile`
- 鉴权: 否

**路径参数**

| 参数 | 说明 |
|------|------|
| userId | 目标用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "userId": 1,
    "nickname": "管理员",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "这是个人简介",
    "articleCount": 10,
    "likeCount": 50
  }
}
```
