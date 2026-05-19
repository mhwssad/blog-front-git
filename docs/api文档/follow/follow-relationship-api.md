# 关注关系 - 关注列表与粉丝列表

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

---

## 1. 统一说明

### 1.4 Integer 字段约定

文档中所有 `0/1` 型 Integer 字段含义如下：

| 字段 | 值 | 含义 |
|-----|---|-----|
| `isSpecialFollow` | `0` | 非特别关注 |
| `isSpecialFollow` | `1` | 特别关注 |
| `mutualFollow` | `0` | 非互关 |
| `mutualFollow` | `1` | 互相关注 |
| `followStatus` | `0` | 已取关 |
| `followStatus` | `1` | 已关注 |
| `followerStatus` / `followingStatus` | `0` | 禁用 |
| `followerStatus` / `followingStatus` | `1` | 启用 |
| `followerDeletedFlag` / `followingDeletedFlag` | `0` | 未删除 |
| `followerDeletedFlag` / `followingDeletedFlag` | `1` | 已删除 |

---

## 2. 关注列表页面

> 场景：用户在自己的个人中心查看"我关注的用户"列表，支持分页和特别关注筛选。

### 2.1 关注用户

**接口信息**
- 路径: `POST /api/user/follows/{userId}`
- 鉴权: 是
- 说明: 关注指定用户，幂等操作

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `userId` | Long | 是 | 被关注用户 ID，必须为正整数 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**业务规则**
- 已关注时再次关注等同于成功，不重复创建关系
- 已取关时再次关注会恢复旧记录并更新 `followTime`
- 不能关注自己
- 目标用户不存在、已删除时返回 `40401`
- 目标用户已禁用时返回 `40011`
- 关注成功后会给被关注用户异步发消息（新增粉丝通知），通知失败不回滚主链路
- 关注或恢复关注后，会同步清除关注者和被关注者两处的关注计数缓存

**错误码**

| code | 说明 |
|-----|------|
| `401` | 未登录或 Token 失效 |
| `40011` | 非法参数（如关注自己、目标用户已禁用） |
| `40401` | 目标用户不存在或已删除 |

---

### 2.2 取消关注

**接口信息**
- 路径: `DELETE /api/user/follows/{userId}`
- 鉴权: 是
- 说明: 取消关注指定用户

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `userId` | Long | 是 | 被关注用户 ID，必须为正整数 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**业务规则**
- 取消前会验证目标用户是否存在、可用且不是自己
- 必须存在有效的关注关系，否则返回 `40011`
- 取消关注后重新关注会复用原关系记录，不新增第二条关系
- 取消后同时清除关注者和被关注者两处的关注计数缓存

**错误码**

| code | 说明 |
|-----|------|
| `401` | 未登录或 Token 失效 |
| `40011` | 关注关系不存在或目标用户不可用 |
| `40401` | 目标用户不存在或已删除 |

---

### 2.3 获取我的关注列表

**接口信息**
- 路径: `GET /api/user/follows`
- 鉴权: 是
- 说明: 分页查询当前用户的关注列表，支持过滤特别关注

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10`，最大 `100` |
| `specialOnly` | Boolean | 否 | `true` 时仅返回特别关注，默认 `false` |

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
        "relationId": 1,
        "userId": 100,
        "username": "zhangsan",
        "nickname": "张三",
        "avatar": "https://example.com/avatar/100.jpg",
        "isSpecialFollow": 1,
        "remark": "前端联调账号",
        "mutualFollow": 1,
        "followTime": "2026-04-15 10:30:00"
      },
      {
        "relationId": 2,
        "userId": 101,
        "username": "lisi",
        "nickname": "李四",
        "avatar": "https://example.com/avatar/101.jpg",
        "isSpecialFollow": 0,
        "remark": null,
        "mutualFollow": 0,
        "followTime": "2026-04-10 08:20:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `relationId` | Long | 关注关系 ID |
| `userId` | Long | 被关注用户 ID |
| `username` | String | 被关注用户名 |
| `nickname` | String | 被关注用户昵称 |
| `avatar` | String | 被关注用户头像 URL |
| `isSpecialFollow` | Integer | 是否特别关注，`0/1` |
| `remark` | String | 备注 |
| `mutualFollow` | Integer | 是否互关，`0/1` |
| `followTime` | String | 最近关注时间，格式 `yyyy-MM-dd HH:mm:ss` |

**列表排序规则**
- 特别关注的用户优先显示
- 同优先级内按最近关注时间倒序排列

**错误码**

| code | 说明 |
|-----|------|
| `401` | 未登录或 Token 失效 |

---

## 3. 粉丝列表页面

> 场景：用户在自己的个人中心查看"关注我的用户"列表。

### 3.1 获取我的粉丝列表

**接口信息**
- 路径: `GET /api/user/fans`
- 鉴权: 是
- 说明: 分页查询当前用户的粉丝列表

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10`，最大 `100` |

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
        "relationId": 3,
        "userId": 200,
        "username": "wangwu",
        "nickname": "王五",
        "avatar": "https://example.com/avatar/200.jpg",
        "isSpecialFollow": 1,
        "remark": null,
        "mutualFollow": 1,
        "followTime": "2026-04-18 14:00:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `relationId` | Long | 关注关系 ID |
| `userId` | Long | 粉丝用户 ID（关注我的人） |
| `username` | String | 粉丝用户名 |
| `nickname` | String | 粉丝昵称 |
| `avatar` | String | 粉丝头像 URL |
| `isSpecialFollow` | Integer | 我是否把该粉丝设特别关注，`0/1` |
| `remark` | String | 我对该粉丝的备注 |
| `mutualFollow` | Integer | 是否互关，`0/1` |
| `followTime` | String | 该粉丝关注我的时间，格式 `yyyy-MM-dd HH:mm:ss` |

**字段语义说明**
- `isSpecialFollow` 和 `remark` 表示"我是否把该粉丝设特别关注、以及我对他的备注"
- 无互关时 `isSpecialFollow=0`，`remark=null`

**错误码**

| code | 说明 |
|-----|------|
| `401` | 未登录或 Token 失效 |

---

## 4. 个人主页 - 公开关注列表

> 场景：用户访问他人个人主页，查看该用户的关注列表（无需登录即可访问）。

### 4.1 获取指定用户的关注列表

**接口信息**
- 路径: `GET /api/users/{userId}/follows`
- 鉴权: 否
- 说明: 公开接口，无需登录即可访问，返回指定用户的关注列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `userId` | Long | 是 | 要查看的用户 ID，必须为正整数 |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10`，最大 `100` |

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
        "userId": 101,
        "username": "lisi",
        "nickname": "李四",
        "avatar": "https://example.com/avatar/101.jpg",
        "followTime": "2026-04-15 10:30:00"
      },
      {
        "userId": 102,
        "username": "wangwu",
        "nickname": "王五",
        "avatar": "https://example.com/avatar/102.jpg",
        "followTime": "2026-04-10 08:20:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `userId` | Long | 被关注用户 ID |
| `username` | String | 被关注用户名 |
| `nickname` | String | 被关注用户昵称 |
| `avatar` | String | 被关注用户头像 URL |
| `followTime` | String | 关注时间，格式 `yyyy-MM-dd HH:mm:ss` |

**与登录用户关注列表的差异**

| 字段 | 登录用户接口 | 公开接口 |
|-----|-----------|---------|
| `relationId` | 有 | 无 |
| `isSpecialFollow` | 有 | 无 |
| `remark` | 有 | 无 |
| `mutualFollow` | 有 | 无 |

**错误码**

| code | 说明 |
|-----|------|
| `40401` | 目标用户不存在或已删除 |

---

## 5. 个人主页 - 公开粉丝列表

> 场景：用户访问他人个人主页，查看该用户的粉丝列表（无需登录即可访问）。

### 5.1 获取指定用户的粉丝列表

**接口信息**
- 路径: `GET /api/users/{userId}/fans`
- 鉴权: 否
- 说明: 公开接口，无需登录即可访问，返回指定用户的粉丝列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `userId` | Long | 是 | 要查看的用户 ID，必须为正整数 |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10`，最大 `100` |

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
        "userId": 200,
        "username": "zhangsan",
        "nickname": "张三",
        "avatar": "https://example.com/avatar/200.jpg",
        "followTime": "2026-04-18 14:00:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `userId` | Long | 粉丝用户 ID |
| `username` | String | 粉丝用户名 |
| `nickname` | String | 粉丝昵称 |
| `avatar` | String | 粉丝头像 URL |
| `followTime` | String | 该粉丝关注目标用户的时间，格式 `yyyy-MM-dd HH:mm:ss` |

**错误码**

| code | 说明 |
|-----|------|
| `40401` | 目标用户不存在或已删除 |

---

## 9. 错误码速查

| 错误码 | 说明 | 处理建议 |
|-------|-----|---------|
| `40001` | 参数校验失败 | 检查请求参数 |
| `40011` | 业务校验失败（如目标用户不可用、关系不存在、备注超长等） | 根据 message 提示处理 |
| `40100` | 未登录或 Token 失效 | 跳转登录页 |
| `40300` | 无权限 | 提示没有访问权限 |
| `40401` | 资源不存在（如目标用户不存在） | 提示目标用户不存在 |
