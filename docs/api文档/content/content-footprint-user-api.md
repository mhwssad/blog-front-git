# 内容域 - 用户足迹

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

---

## 用户足迹

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
