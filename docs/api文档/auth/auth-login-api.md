# 认证登录 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

[场景说明] 登录页 / 注册页、找回密码、应用启动初始化、Token刷新机制、退出登录、账号接管认证

---
## 目录

- [快速接口索引](#快速接口索引)
- [登录页 / 注册页](#登录页--注册页)
  - [账号密码登录](#账号密码登录)
  - [账号注册](#账号注册)
  - [发送邮箱验证码](#发送邮箱验证码)
  - [邮箱验证码登录](#邮箱验证码登录)
- [找回密码](#找回密码)
  - [发送找回密码验证码](#发送找回密码验证码)
  - [重置密码](#重置密码)
- [应用启动初始化](#应用启动初始化)
  - [恢复登录态](#恢复登录态)
  - [获取当前用户信息](#获取当前用户信息)
  - [获取用户菜单](#获取用户菜单)
- [Token 刷新机制](#token-刷新机制)
- [退出登录](#退出登录)
- [账号接管认证](#账号接管认证)

---

## 快速接口索引

| 功能 | 方法 | 路径 | 鉴权 | 说明 |
|-----|------|------|------|------|
| 账号登录 | POST | `/api/auth/login` | 否 | 用户名/邮箱/手机号 + 密码 |
| 账号注册 | POST | `/api/auth/register` | 否 | 支持邮箱/手机号 |
| 发送邮箱验证码 | POST | `/api/auth/email-code` | 否 | 用于邮箱登录/注册 |
| 邮箱验证码登录 | POST | `/api/auth/email-login` | 否 | 邮箱 + 验证码 |
| 发送找回密码验证码 | POST | `/api/auth/password-reset/code` | 否 | 用于密码重置 |
| 重置密码 | POST | `/api/auth/password-reset` | 否 | 邮箱 + 验证码 + 新密码 |
| 刷新令牌 | POST | `/api/auth/refresh` | 否 | 使用 refreshToken |
| 退出登录 | POST | `/api/auth/logout` | 是 | 支持不传 token |
| 获取当前用户 | GET | `/api/auth/current-user` | 是 | 包含角色权限 |
| 获取用户菜单 | GET | `/api/auth/current-user-menus` | 是 | 树形菜单结构 |
| 接管令牌登录 | POST | `/api/auth/takeover/login` | 否 | 超管接管 |

---

## 登录页 / 注册页

### 账号密码登录

**接口信息**
- 路径: `POST /api/auth/login`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| username | string | 是 | 登录账号，支持用户名/邮箱/手机号 | `admin` |
| password | string | 是 | 密码 | `Password123` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 7200
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| tokenType | string | 令牌类型，固定为 `Bearer` |
| accessToken | string | 访问令牌，用于接口鉴权 |
| refreshToken | string | 刷新令牌，用于续期 |
| expiresIn | integer | 过期时间，单位：秒（7200 = 2小时） |

**错误码**

| code | 说明 |
|-----|------|
| 40101 | 用户名或密码错误 |
| 40104 | 账号已锁定 |
| 40105 | 账号已禁用 |

---

### 账号注册

**接口信息**
- 路径: `POST /api/auth/register`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| username | string | 是 | 用户名 | `new_user` |
| password | string | 是 | 密码（需包含大小写字母和数字，8-64位） | `Abc12345` |
| nickname | string | 否 | 昵称 | `新用户` |
| email | string | 否 | 邮箱地址 | `user@example.com` |
| phone | string | 否 | 手机号 | `13800138000` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 7200
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40114 | 验证码发送失败 |

---

### 发送邮箱验证码

**接口信息**
- 路径: `POST /api/auth/email-code`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| email | string | 是 | 邮箱地址 | `user@example.com` |

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
| 40115 | 发送过于频繁 |
| 40114 | 发送失败 |

---

### 邮箱验证码登录

**接口信息**
- 路径: `POST /api/auth/email-login`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| email | string | 是 | 邮箱地址 | `admin@example.com` |
| code | string | 是 | 邮箱验证码（6位数字） | `123456` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 7200
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40112 | 验证码错误 |
| 40113 | 验证码已过期 |

---

## 找回密码

### 发送找回密码验证码

**接口信息**
- 路径: `POST /api/auth/password-reset/code`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| email | string | 是 | 注册时绑定的邮箱地址 | `user@example.com` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

---

### 重置密码

**接口信息**
- 路径: `POST /api/auth/password-reset`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 限制 |
|-----|------|------|------|------|
| email | string | 是 | 邮箱地址 | 与验证码发送邮箱一致 |
| code | string | 是 | 邮箱验证码（6位数字） | - |
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

---

## 应用启动初始化

### 恢复登录态

应用启动时（如页面刷新、前端路由守卫），按以下顺序调用：

```
1. GET /api/auth/current-user    → 获取用户基本信息
2. GET /api/auth/current-user-menus → 获取菜单权限
```

---

### 获取当前用户信息

**接口信息**
- 路径: `GET /api/auth/current-user`
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
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": 1,
    "userLevel": 5,
    "experiencePoints": 15000,
    "roles": ["admin"],
    "permissions": ["system:user:view", "system:user:edit"]
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
| email | string | 邮箱 |
| phone | string | 手机号 |
| status | integer | 状态：1-正常 |
| userLevel | integer | 用户等级 |
| experiencePoints | integer | 经验值 |
| roles | array | 角色编码列表，如 `["admin", "author"]` |
| permissions | array | 权限标识列表，如 `["system:user:view"]` |

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录或登录已过期 |
| 40108 | 无效的令牌 |

---

### 获取用户菜单

**接口信息**
- 路径: `GET /api/auth/current-user-menus`
- 鉴权: 是

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "name": "工作台",
      "type": "menu",
      "routeName": "Dashboard",
      "routePath": "/dashboard",
      "component": "dashboard/index",
      "visible": 1,
      "sort": 1,
      "icon": "ant-design:dashboard-outlined",
      "redirect": null,
      "alwaysShow": null,
      "keepAlive": null,
      "params": null,
      "children": []
    },
    {
      "id": 2,
      "parentId": 0,
      "name": "系统管理",
      "type": "menu",
      "routeName": "System",
      "routePath": "/system",
      "component": "Layout",
      "visible": 1,
      "sort": 2,
      "icon": "ant-design:setting-outlined",
      "redirect": "/system/user",
      "alwaysShow": 1,
      "children": [
        {
          "id": 3,
          "parentId": 2,
          "name": "用户管理",
          "type": "menu",
          "routeName": "UserManagement",
          "routePath": "user",
          "component": "system/user/index",
          "visible": 1,
          "sort": 1,
          "icon": null,
          "children": []
        }
      ]
    }
  ]
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | long | 菜单ID |
| parentId | long | 父菜单ID，0表示顶级 |
| name | string | 菜单名称 |
| type | string | 菜单类型 |
| routeName | string | 路由名称（用于 keep-alive） |
| routePath | string | 路由路径 |
| component | string | 组件路径（前端项目内） |
| perm | string | 权限标识 |
| visible | integer | 是否显示：1-显示，0-隐藏 |
| sort | integer | 排序序号 |
| icon | string | 菜单图标 |
| redirect | string | 重定向地址 |
| alwaysShow | integer | 是否始终显示根菜单 |
| keepAlive | integer | 是否缓存 |
| params | object | 路由参数 |
| children | array | 子菜单列表 |

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录或登录已过期 |

---

## Token 刷新机制

**接口信息**
- 路径: `POST /api/auth/refresh`
- 鉴权: 否
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| refreshToken | string | 是 | 刷新令牌（登录时获取） |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 7200
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40108 | 无效的令牌 |

---

## 退出登录

**接口信息**
- 路径: `POST /api/auth/logout`
- 鉴权: 是
- Content-Type: `application/json`

**请求参数**（可选）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| accessToken | string | 否 | 访问令牌，不传时从 Authorization header 读取 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
