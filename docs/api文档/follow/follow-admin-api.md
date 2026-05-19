# 关注关系 API - 后台管理

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：本文档面向后台运营人员，提供关注关系查询、异常数据清理等后台管理功能。

---

## 1. 后台管理

> 场景：后台运营人员查看关注关系列表、清理异常数据。

### 1.1 分页查询关注关系

**接口信息**
- 路径: `GET /api/sys/follows`
- 鉴权: 是（需要后台权限 `content:follow:query`）
- 说明: 分页查询全站关注关系，用于数据排查

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10`，最大 `100` |
| `followerId` | Long | 否 | 关注者用户 ID |
| `followingId` | Long | 否 | 被关注者用户 ID |
| `followStatus` | Integer | 否 | 关注状态：`0` 已取关，`1` 已关注，仅允许 `0` 或 `1` |
| `specialFollow` | Integer | 否 | 是否特别关注，`0/1`，仅允许 `0` 或 `1` |
| `source` | String | 否 | 关注来源 |
| `keyword` | String | 否 | 关键词，匹配关注双方用户名或昵称 |

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
        "relationId": 1,
        "followerId": 1,
        "followerUsername": "admin",
        "followerNickname": "管理员",
        "followerStatus": 1,
        "followerDeletedFlag": 0,
        "followingId": 100,
        "followingUsername": "zhangsan",
        "followingNickname": "张三",
        "followingStatus": 1,
        "followingDeletedFlag": 0,
        "followStatus": 1,
        "isSpecialFollow": 0,
        "source": "search",
        "remark": null,
        "followTime": "2026-04-15 10:30:00",
        "unfollowTime": null,
        "createdAt": "2026-04-15 10:30:00",
        "updatedAt": "2026-04-15 10:30:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `relationId` | Long | 关注关系 ID |
| `followerId` | Long | 关注者用户 ID |
| `followerUsername` | String | 关注者用户名 |
| `followerNickname` | String | 关注者昵称 |
| `followerStatus` | Integer | 关注者状态：`0` 禁用，`1` 启用 |
| `followerDeletedFlag` | Integer | 关注者是否已删除，`0/1` |
| `followingId` | Long | 被关注者用户 ID |
| `followingUsername` | String | 被关注者用户名 |
| `followingNickname` | String | 被关注者昵称 |
| `followingStatus` | Integer | 被关注者状态：`0` 禁用，`1` 启用 |
| `followingDeletedFlag` | Integer | 被关注者是否已删除，`0/1` |
| `followStatus` | Integer | 关系状态：`0` 已取关，`1` 已关注 |
| `isSpecialFollow` | Integer | 是否特别关注，`0/1` |
| `source` | String | 关注来源 |
| `remark` | String | 备注 |
| `followTime` | String | 最近关注时间，格式 `yyyy-MM-dd HH:mm:ss` |
| `unfollowTime` | String | 最近取关时间（未取关时为 `null`），格式 `yyyy-MM-dd HH:mm:ss` |
| `createdAt` | String | 关系创建时间，格式 `yyyy-MM-dd HH:mm:ss` |
| `updatedAt` | String | 关系更新时间，格式 `yyyy-MM-dd HH:mm:ss` |

**后台分页特殊说明**
- 后台分页会保留异常关系（如用户已删除但关系仍存在），用于排查数据问题
- `current` 和 `size` 不传时分别默认为 `1` 和 `10`

**错误码**

| code | 说明 |
|-----|------|
| `401` | 未登录或 Token 失效 |
| `40300` | 无后台权限 |
| `40011` | `followStatus` 或 `specialFollow` 值不合法（非 `0/1`） |

---

### 1.2 异常关注关系清理

**接口信息**
- 路径: `DELETE /api/sys/follows/clean`
- 鉴权: 是（需要后台权限 `content:follow:clean`）
- 说明: 批量清理异常关注关系，返回本次清理的记录数量

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|-----|
| `cleanInactive` | Boolean | 否 | 是否清理已取关关系 |
| `cleanDeletedUsers` | Boolean | 否 | 是否清理已（一端）已删除或拉黑用户的关注关系 |
| `cleanDisabledUsers` | Boolean | 否 | 是否清理已（一端）已禁用用户的关注关系 |

**校验规则**
- 三个条件至少要有一个为 `true`，否则返回校验错误

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": 15
}
```

**响应说明**
- `data` 为本次清理涉及的关系数量（Long 类型）

**业务规则**
- 三个条件至少要有一个为 `true`，否则返回校验错误
- 删除动作只收口异常关系，不参与普通用户前端取关流程
- 清理前会先统记待清理数量，若为 0 直接返回 `data: 0`
- 清理操作的事务性删除，失败会回滚

**错误码**

| code | 说明 |
|-----|------|
| `401` | 未登录或 Token 失效 |
| `40300` | 无后台权限 |
| `40001` | 清理条件不能为空或至少指定一个条件 |
