# 个人中心 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

[场景说明] 查看个人资料、更新个人资料、修改密码

---
## 个人中心

### 查看个人资料

**接口信息**
- 路径: `GET /api/user/profile`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "这是个人简介",
    "website": "https://example.com",
    "gender": 1,
    "birthday": "1990-01-01",
    "email": "a***@example.com",
    "phone": "138****8000",
    "userLevel": 5,
    "experiencePoints": 15000,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | long | 用户ID |
| username | string | 用户名 |
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| bio | string | 个人简介 |
| website | string | 个人站点 |
| gender | integer | 性别：0-未知，1-男，2-女，3-保密 |
| birthday | string | 生日，格式 `yyyy-MM-dd` |
| email | string | 邮箱（脱敏显示） |
| phone | string | 手机号（脱敏显示） |
| userLevel | integer | 用户等级 |
| experiencePoints | integer | 经验值 |
| createdAt | string | 注册时间 |

---

### 更新个人资料

**接口信息**
- 路径: `PUT /api/user/profile`
- 鉴权: 是
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 限制 |
|-----|------|------|------|------|
| nickname | string | 否 | 昵称 | 最多50字符 |
| avatar | string | 否 | 头像URL | 最多500字符 |
| bio | string | 否 | 个人简介 | 最多500字符 |
| website | string | 否 | 个人站点 | 合法HTTP/HTTPS URL，最多255字符 |
| gender | integer | 否 | 性别 | 0-未知，1-男，2-女，3-保密 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "新昵称",
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "这是我的新简介",
    "website": "https://mysite.com",
    "gender": 1,
    "birthday": "1990-01-01",
    "email": "a***@example.com",
    "phone": "138****8000",
    "userLevel": 5,
    "experiencePoints": 15000,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40133 | 昵称已被占用 |

---

### 修改密码

**接口信息**
- 路径: `PUT /api/user/profile/password`
- 鉴权: 是
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 限制 |
|-----|------|------|------|------|
| oldPassword | string | 是 | 原密码 | 不能为空 |
| newPassword | string | 是 | 新密码 | 8-64位，需包含大小写字母和数字 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40130 | 原密码错误 |
| 40131 | 新密码不能与原密码相同 |
