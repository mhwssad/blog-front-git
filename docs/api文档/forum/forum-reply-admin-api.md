# 后台管理 - 回复管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

> 以下接口均要求后台登录账号，并校验 `content:forum:*` 权限

---

### 分页查询回复

**接口信息**

- 路径：`GET /api/sys/forum/replies`
- 鉴权：`content:forum:query`
- 说明：分页查询所有回复，支持多条件筛选

**请求参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量 | 10 |
| `keyword` | String | 否 | 回复内容关键字 | - |
| `postId` | Long | 否 | 帖子ID | - |
| `userId` | Long | 否 | 回复用户ID | - |
| `status` | Integer | 否 | 回复状态 | - |

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
        "id": 1001,
        "postId": 10,
        "postTitle": "Spring Boot 最佳实践",
        "parentId": 0,
        "rootId": 0,
        "userId": 101,
        "userName": "李四",
        "content": "写得很好，收藏了！",
        "status": 1,
        "statusName": "正常",
        "floorNo": 1,
        "likeCount": 5,
        "replyCount": 2,
        "createdAt": "2025-01-14T16:00:00",
        "updatedAt": "2025-01-14T16:00:00"
      },
      {
        "id": 1002,
        "postId": 10,
        "postTitle": "Spring Boot 最佳实践",
        "parentId": 1001,
        "rootId": 1001,
        "userId": 100,
        "userName": "张三",
        "content": "感谢支持！",
        "status": 1,
        "statusName": "正常",
        "floorNo": 2,
        "likeCount": 1,
        "replyCount": 0,
        "createdAt": "2025-01-14T16:30:00",
        "updatedAt": "2025-01-14T16:30:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `total` | Long | 总记录数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页数量 |
| `records[].id` | Long | 回复ID |
| `records[].postId` | Long | 帖子ID |
| `records[].postTitle` | String | 帖子标题 |
| `records[].parentId` | Long | 父回复ID，顶级回复为0 |
| `records[].rootId` | Long | 根回复ID，顶级回复为0 |
| `records[].userId` | Long | 回复用户ID |
| `records[].userName` | String | 回复用户昵称 |
| `records[].content` | String | 回复内容 |
| `records[].status` | Integer | 回复状态值 |
| `records[].statusName` | String | 回复状态描述 |
| `records[].floorNo` | Integer | 楼层号 |
| `records[].likeCount` | Integer | 点赞数 |
| `records[].replyCount` | Integer | 该回复下子回复数 |
| `records[].createdAt` | DateTime | 创建时间 |
| `records[].updatedAt` | DateTime | 更新时间 |

**错误码**

| code | 说明 |
|-----|------|
| 40301 | 无查询权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 隐藏回复

**接口信息**

- 路径：`PUT /api/sys/forum/replies/{id}/hide`
- 鉴权：`content:forum:update`
- 说明：将回复设为隐藏状态，仅正常状态回复可隐藏

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 回复已删除无法隐藏 |
| 40401 | 回复不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 恢复回复

**接口信息**

- 路径：`PUT /api/sys/forum/replies/{id}/restore`
- 鉴权：`content:forum:update`
- 说明：恢复已隐藏的回复，恢复后状态为正常

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 回复状态不支持恢复 |
| 40401 | 回复不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 删除回复

**接口信息**

- 路径：`DELETE /api/sys/forum/replies/{id}`
- 鉴权：`content:forum:delete`
- 说明：软删除回复，同步递减帖子回复数和父回复回复数

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T12:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 回复已删除 |
| 40401 | 回复不存在 |
| 40301 | 无删除权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---
