# 认证与用户 API 前端参考手册

> 本文档面向前端联调。覆盖登录注册、个人资料、通知中心等功能的完整接口参考，包含请求示例、响应示例、错误码说明和前端集成指南。

## 目录

- [快速接口索引](#快速接口索引)
- [统一响应结构](#统一响应结构)
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
- [个人中心](#个人中心)
  - [查看个人资料](#查看个人资料)
  - [更新个人资料](#更新个人资料)
  - [修改密码](#修改密码)
- [通知中心](#通知中心)
  - [通知列表](#通知列表)
  - [通知详情](#通知详情)
  - [未读数量](#未读数量)
  - [标记已读](#标记已读)
- [用户通知设置](#用户通知设置)
- [用户经验等级](#用户经验等级)
- [用户作者申请](#用户作者申请)
- [公开用户搜索](#公开用户搜索)
- [公开作者主页](#公开作者主页)
- [后台用户管理](#后台用户管理)
- [后台菜单管理](#后台菜单管理)
- [后台角色管理](#后台角色管理)
- [通知后台管理](#通知后台管理)
- [作者申请后台管理](#作者申请后台管理)
- [超级管理员操作](#超级管理员操作)
- [经验体系管理](#经验体系管理)
- [系统日志管理](#系统日志管理)
- [审计日志管理](#审计日志管理)
- [系统配置管理](#系统配置管理)
- [错误码速查](#错误码速查)
- [前端集成指南](#前端集成指南)
  - [登录流程时序](#登录流程时序)
  - [axios 拦截器配置](#axios-拦截器配置)
  - [Token 存储建议](#token-存储建议)

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
| 获取个人资料 | GET | `/api/user/profile` | 是 | 个人详细信息 |
| 更新个人资料 | PUT | `/api/user/profile` | 是 | 修改昵称/头像等 |
| 修改密码 | PUT | `/api/user/profile/password` | 是 | 需验证原密码 |
| 通知列表 | GET | `/api/user/notices` | 是 | 分页查询 |
| 通知详情 | GET | `/api/user/notices/{id}` | 是 | 单条通知 |
| 未读数量 | GET | `/api/user/notices/unread-count` | 是 | 数字 |
| 单条已读 | POST | `/api/user/notices/{id}/read` | 是 | - |
| 全部已读 | POST | `/api/user/notices/read-all` | 是 | - |
| 查询通知设置 | GET | `/api/user/notification-settings` | 是 | 全部通知设置项 |
| 批量更新通知设置 | PUT | `/api/user/notification-settings` | 是 | 批量开关 |
| 单项更新通知设置 | PUT | `/api/user/notification-settings/{type}` | 是 | 按类型开关 |
| 查看当前等级信息 | GET | `/api/user/experience/level` | 是 | 等级+经验值 |
| 提交作者申请 | POST | `/api/user/author-applications` | 是 | 提交申请 |
| 查询最近一次申请 | GET | `/api/user/author-applications/latest` | 是 | 最新一条 |
| 分页查询我的申请 | GET | `/api/user/author-applications` | 是 | 分页 |
| 搜索用户 | GET | `/api/users/search` | 否 | 关键字模糊搜索 |
| 查询公开作者主页 | GET | `/api/users/{userId}/author-profile` | 否 | 作者摘要 |
| 分页查询用户 | GET | `/api/sys/users` | 后台 | 分页 |
| 查询用户详情 | GET | `/api/sys/users/{id}` | 后台 | - |
| 新增用户 | POST | `/api/sys/users` | 后台 | - |
| 修改用户 | PUT | `/api/sys/users/{id}` | 后台 | - |
| 修改用户状态 | PUT | `/api/sys/users/{id}/status` | 后台 | 启用/禁用 |
| 重置用户密码 | PUT | `/api/sys/users/{id}/password/reset` | 后台 | - |
| 删除用户 | DELETE | `/api/sys/users/{id}` | 后台 | - |
| 查询用户角色 | GET | `/api/sys/users/{id}/roles` | 后台 | 角色 ID 列表 |
| 分配用户角色 | PUT | `/api/sys/users/{id}/roles` | 后台 | - |
| 查询菜单树 | GET | `/api/sys/menus/tree` | 后台 | 完整菜单树 |
| 查询菜单详情 | GET | `/api/sys/menus/{id}` | 后台 | - |
| 新增菜单 | POST | `/api/sys/menus` | 后台 | - |
| 修改菜单 | PUT | `/api/sys/menus/{id}` | 后台 | - |
| 删除菜单 | DELETE | `/api/sys/menus/{id}` | 后台 | - |
| 分页查询角色 | GET | `/api/sys/roles` | 后台 | 分页 |
| 查询角色详情 | GET | `/api/sys/roles/{id}` | 后台 | - |
| 新增角色 | POST | `/api/sys/roles` | 后台 | - |
| 修改角色 | PUT | `/api/sys/roles/{id}` | 后台 | - |
| 修改角色状态 | PUT | `/api/sys/roles/{id}/status` | 后台 | 启用/禁用 |
| 删除角色 | DELETE | `/api/sys/roles/{id}` | 后台 | - |
| 查询角色菜单 | GET | `/api/sys/roles/{id}/menus` | 后台 | 菜单 ID 列表 |
| 分配角色菜单 | PUT | `/api/sys/roles/{id}/menus` | 后台 | - |
| 分页查询通知 | GET | `/api/sys/notices` | 后台 | 分页 |
| 查询通知详情 | GET | `/api/sys/notices/{id}` | 后台 | - |
| 新增通知 | POST | `/api/sys/notices` | 后台 | - |
| 修改通知 | PUT | `/api/sys/notices/{id}` | 后台 | - |
| 发布通知 | POST | `/api/sys/notices/{id}/publish` | 后台 | - |
| 撤回通知 | POST | `/api/sys/notices/{id}/revoke` | 后台 | - |
| 删除通知 | DELETE | `/api/sys/notices/{id}` | 后台 | - |
| 分页查询作者申请 | GET | `/api/sys/author-applications` | 后台 | 分页 |
| 查询作者申请详情 | GET | `/api/sys/author-applications/{id}` | 后台 | - |
| 审核作者申请 | PUT | `/api/sys/author-applications/{id}/review` | 后台 | 通过/驳回 |
| 修正作者申请状态 | PUT | `/api/sys/author-applications/{id}/repair` | 后台 | - |
| 发送2FA验证码 | POST | `/api/admin/2fa/send-code` | 超管 | - |
| 校验2FA验证码 | POST | `/api/admin/2fa/verify` | 超管 | 返回 mfaTicket |
| 封禁用户 | POST | `/api/admin/users/{id}/ban` | 超管 | 需要 mfaTicket |
| 解封用户 | POST | `/api/admin/users/{id}/unban` | 超管 | 需要 mfaTicket |
| 调整用户等级 | PUT | `/api/admin/users/{id}/level` | 超管 | 需要 mfaTicket |
| 调整用户经验 | PUT | `/api/admin/users/{id}/experience` | 超管 | 需要 mfaTicket |
| 账号接管 | POST | `/api/admin/takeover` | 超管 | 需要 mfaTicket |
| 带审计的角色分配 | PUT | `/api/admin/users/{id}/roles` | 超管 | 需要 mfaTicket |
| 查看用户经验来源汇总 | GET | `/api/sys/experience/users/{userId}/summary` | 后台 | - |
| 经验流水分页查询 | GET | `/api/sys/experience/logs` | 后台 | 分页 |
| 手动调整等级或经验 | POST | `/api/sys/experience/users/{userId}/adjust` | 后台 | - |
| 查看经验来源配置 | GET | `/api/sys/experience/config` | 后台 | - |
| 更新经验来源配置 | PUT | `/api/sys/experience/config` | 后台 | - |
| 分页查询日志 | GET | `/api/sys/logs` | 后台 | 分页 |
| 查询日志详情 | GET | `/api/sys/logs/{id}` | 后台 | - |
| 删除日志 | DELETE | `/api/sys/logs/{id}` | 后台 | - |
| 按条件清理日志 | POST | `/api/sys/logs/clean` | 后台 | 返回清理数量 |
| 分页查询审计日志 | GET | `/api/sys/audit-logs` | 超管 | 分页 |
| 查询审计日志详情 | GET | `/api/sys/audit-logs/{id}` | 超管 | - |
| 分页查询配置 | GET | `/api/sys/configs` | 后台 | 分页 |
| 查询配置详情 | GET | `/api/sys/configs/{id}` | 后台 | - |
| 新增配置 | POST | `/api/sys/configs` | 后台 | - |
| 修改配置 | PUT | `/api/sys/configs/{id}` | 后台 | - |
| 删除配置 | DELETE | `/api/sys/configs/{id}` | 后台 | - |
| 按配置键查询配置值 | GET | `/api/sys/configs/key/{configKey}` | 后台 | 按 key 查 value |

---

## 统一响应结构

所有接口均返回以下 JSON 结构：

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {}
}
```

**分页响应**（通知列表等）：

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 100,
    "current": 1,
    "size": 10,
    "records": []
  }
}
```

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/login', {
  username: 'admin',
  password: 'Password123'
})
```

```javascript
// fetch
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Password123'
  })
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40101 | 用户名或密码错误 | 显示「用户名或密码错误」 |
| 40104 | 账号已锁定 | 显示「连续失败过多，请15分钟后再试」 |
| 40105 | 账号已禁用 | 显示「账号已被禁用」 |

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/register', {
  username: 'new_user',
  password: 'Abc12345',
  nickname: '新用户',
  email: 'user@example.com'
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败 | 显示具体字段错误信息 |
| 40114 | 验证码发送失败 | 显示「验证码发送失败，请重试」 |

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/email-code', {
  email: 'user@example.com'
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40115 | 发送过于频繁 | 显示「发送过于频繁，请稍后再试」 |
| 40114 | 发送失败 | 显示「验证码发送失败」 |

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/email-login', {
  email: 'admin@example.com',
  code: '123456'
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40112 | 验证码错误 | 显示「验证码错误」 |
| 40113 | 验证码已过期 | 显示「验证码已过期，请重新获取」 |

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/password-reset/code', {
  email: 'user@example.com'
})
```

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/password-reset', {
  email: 'user@example.com',
  code: '123456',
  newPassword: 'NewPass456'
})
```

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
- 鉴权: 是（需携带 `Authorization: Bearer <accessToken>`）

**请求示例**

```javascript
// axios
const res = await axios.get('/api/auth/current-user')
// res.data.data 即为用户信息对象
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40108 | 无效的令牌 | 跳转登录页 |

---

### 获取用户菜单

**接口信息**
- 路径: `GET /api/auth/current-user-menus`
- 鉴权: 是

**请求示例**

```javascript
// axios
const res = await axios.get('/api/auth/current-user-menus')
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40102 | 未登录或登录已过期 | 跳转登录页 |

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

**请求示例**

```javascript
// axios
axios.post('/api/auth/refresh', {
  refreshToken: localStorage.getItem('refreshToken')
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40108 | 无效的令牌 | 跳转登录页重新登录 |

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

**请求示例**

```javascript
// axios - 不传 token，自动从 header 获取
await axios.post('/api/auth/logout')

// axios - 显式传 token
await axios.post('/api/auth/logout', {
  accessToken: localStorage.getItem('accessToken')
})
```

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

## 账号接管认证

### 使用接管令牌登录

**接口信息**
- 路径: `POST /api/auth/takeover/login`
- 鉴权: 否（使用超管操作返回的接管令牌）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| takeoverToken | string | 是 | 超管发起接管时返回的一次性令牌 |

**请求示例**

```javascript
// axios
axios.post('/api/auth/takeover/login', {
  takeoverToken: 'xxx-takeover-token-xxx'
})
```

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

---

## 个人中心

### 查看个人资料

**接口信息**
- 路径: `GET /api/user/profile`
- 鉴权: 是

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/profile')
```

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

**请求示例**

```javascript
// axios
await axios.put('/api/user/profile', {
  nickname: '新昵称',
  avatar: 'https://example.com/new-avatar.jpg',
  bio: '这是我的新简介',
  website: 'https://mysite.com',
  gender: 1
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败 | 显示具体字段错误 |
| 40133 | 昵称已被占用 | 显示「昵称已被占用」 |

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

**请求示例**

```javascript
// axios
await axios.put('/api/user/profile/password', {
  oldPassword: 'OldPass123',
  newPassword: 'NewPass456'
})
```

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

| code | 说明 | 前端处理 |
|-----|------|---------|
| 40001 | 参数校验失败 | 显示具体字段错误 |
| 40130 | 原密码错误 | 显示「原密码错误」 |
| 40131 | 新密码不能与原密码相同 | 显示对应提示 |

---

## 通知中心

### 通知列表

**接口信息**
- 路径: `GET /api/user/notices`
- 鉴权: 是
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|------|------|
| current | integer | 否 | 当前页，默认1 | `1` |
| size | integer | 否 | 每页条数，默认10 | `10` |
| title | string | 否 | 标题（模糊搜索） | `系统` |
| isRead | integer | 否 | 已读状态：0-未读，1-已读 | `0` |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/notices', {
  params: {
    current: 1,
    size: 10,
    isRead: 0
  }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 25,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "title": "系统通知",
        "content": "您的文章已审核通过",
        "type": 1,
        "level": "info",
        "publishTime": "2024-01-15T10:30:00",
        "isRead": 0,
        "readTime": null,
        "businessType": "article",
        "businessId": 123,
        "actionPath": "/article/123"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | long | 通知ID |
| title | string | 通知标题 |
| content | string | 通知内容 |
| type | integer | 通知类型 |
| level | string | 通知等级：`info`/`warning`/`error` |
| publishTime | string | 发布时间 |
| isRead | integer | 已读状态：0-未读，1-已读 |
| readTime | string | 阅读时间，未读为 null |
| businessType | string | 业务目标类型（如 article） |
| businessId | long | 业务目标ID |
| actionPath | string | 点击跳转路径 |

---

### 通知详情

**接口信息**
- 路径: `GET /api/user/notices/{id}`
- 鉴权: 是

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/notices/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "title": "系统通知",
    "content": "您的文章已审核通过",
    "type": 1,
    "level": "info",
    "publishTime": "2024-01-15T10:30:00",
    "isRead": 1,
    "readTime": "2024-01-15T11:00:00",
    "businessType": "article",
    "businessId": 123,
    "actionPath": "/article/123"
  }
}
```

---

### 未读数量

**接口信息**
- 路径: `GET /api/user/notices/unread-count`
- 鉴权: 是

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/notices/unread-count')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": 5
}
```

---

### 标记已读

**单条已读**

**接口信息**
- 路径: `POST /api/user/notices/{id}/read`
- 鉴权: 是

**请求示例**

```javascript
// axios
await axios.post('/api/user/notices/1/read')
```

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

**全部已读**

**接口信息**
- 路径: `POST /api/user/notices/read-all`
- 鉴权: 是

**请求示例**

```javascript
// axios
await axios.post('/api/user/notices/read-all')
```

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

## 用户通知设置

### 查询我的通知设置

**接口信息**
- 路径: `GET /api/user/notification-settings`
- 鉴权: 是

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/notification-settings')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "type": "system",
      "enabled": true
    },
    {
      "type": "comment",
      "enabled": true
    },
    {
      "type": "like",
      "enabled": false
    }
  ]
}
```

---

### 批量更新我的通知设置

**接口信息**
- 路径: `PUT /api/user/notification-settings`
- 鉴权: 是
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| settings | array | 是 | 通知设置列表 |
| settings[].type | string | 是 | 通知类型 |
| settings[].enabled | boolean | 是 | 是否启用 |

**请求示例**

```javascript
// axios
await axios.put('/api/user/notification-settings', {
  settings: [
    { type: 'system', enabled: true },
    { type: 'comment', enabled: false }
  ]
})
```

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

### 单独更新某类通知设置

**接口信息**
- 路径: `PUT /api/user/notification-settings/{type}`
- 鉴权: 是
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| type | 通知类型，如 `system`、`comment`、`like` |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| enabled | boolean | 是 | 是否启用 |

**请求示例**

```javascript
// axios
await axios.put('/api/user/notification-settings/comment', {
  enabled: false
})
```

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

## 用户经验等级

### 查看当前等级信息

**接口信息**
- 路径: `GET /api/user/experience/level`
- 鉴权: 是

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/experience/level')
```

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

**请求示例**

```javascript
// axios
await axios.post('/api/user/author-applications', {
  penName: '我的笔名',
  introduction: '写作爱好者'
})
```

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

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/author-applications/latest')
```

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

**请求示例**

```javascript
// axios
const res = await axios.get('/api/user/author-applications', {
  params: { current: 1, size: 10 }
})
```

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

**请求示例**

```javascript
// axios
const res = await axios.get('/api/users/search', {
  params: { keyword: 'admin', current: 1, size: 10 }
})
```

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

**请求示例**

```javascript
// axios
const res = await axios.get('/api/users/1/author-profile')
```

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

---

## 后台用户管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询用户

**接口信息**
- 路径: `GET /api/sys/users`
- 鉴权: 后台（`sys:user:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| keyword | string | 否 | 搜索关键字（用户名/昵称/邮箱） |
| status | integer | 否 | 状态筛选 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/users', {
  params: { current: 1, size: 10, keyword: 'admin' }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 50,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@example.com",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

---

### 查询用户详情

**接口信息**
- 路径: `GET /api/sys/users/{id}`
- 鉴权: 后台（`sys:user:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 用户ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/users/1')
```

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
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": 1,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

---

### 新增用户

**接口信息**
- 路径: `POST /api/sys/users`
- 鉴权: 后台（`sys:user:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| nickname | string | 否 | 昵称 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| status | integer | 否 | 状态 |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/users', {
  username: 'new_user',
  password: 'Abc12345',
  nickname: '新用户',
  email: 'new@example.com'
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 10,
    "username": "new_user",
    "nickname": "新用户"
  }
}
```

---

### 修改用户

**接口信息**
- 路径: `PUT /api/sys/users/{id}`
- 鉴权: 后台（`sys:user:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 用户ID |

**请求参数**：同新增用户（字段均可选）

**请求示例**

```javascript
// axios
await axios.put('/api/sys/users/10', {
  nickname: '修改后的昵称',
  status: 1
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 10,
    "username": "new_user",
    "nickname": "修改后的昵称"
  }
}
```

---

### 修改用户状态

**接口信息**
- 路径: `PUT /api/sys/users/{id}/status`
- 鉴权: 后台（`sys:user:update`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| status | integer | 是 | 状态值（1-启用，0-禁用） |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/users/10/status', { status: 0 })
```

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

### 重置用户密码

**接口信息**
- 路径: `PUT /api/sys/users/{id}/password/reset`
- 鉴权: 后台（`sys:user:reset-password`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| password | string | 是 | 新密码 |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/users/10/password/reset', { password: 'NewPass123' })
```

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

### 删除用户

**接口信息**
- 路径: `DELETE /api/sys/users/{id}`
- 鉴权: 后台（`sys:user:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 用户ID |

**请求示例**

```javascript
// axios
await axios.delete('/api/sys/users/10')
```

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

### 查询用户角色

**接口信息**
- 路径: `GET /api/sys/users/{id}/roles`
- 鉴权: 后台（`sys:user:query`）

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/users/1/roles')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [1, 2]
}
```

---

### 分配用户角色

**接口信息**
- 路径: `PUT /api/sys/users/{id}/roles`
- 鉴权: 后台（`sys:user:assign-role`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| roleIds | array\<long\> | 是 | 角色 ID 列表 |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/users/1/roles', { roleIds: [1, 3] })
```

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

## 后台菜单管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 查询菜单树

**接口信息**
- 路径: `GET /api/sys/menus/tree`
- 鉴权: 后台（`sys:menu:query`）

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/menus/tree')
```

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
      "sort": 1,
      "children": []
    }
  ]
}
```

---

### 查询菜单详情

**接口信息**
- 路径: `GET /api/sys/menus/{id}`
- 鉴权: 后台（`sys:menu:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 菜单ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/menus/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "parentId": 0,
    "name": "工作台",
    "type": "menu",
    "routeName": "Dashboard",
    "routePath": "/dashboard",
    "component": "dashboard/index",
    "perm": null,
    "visible": 1,
    "sort": 1,
    "icon": "ant-design:dashboard-outlined"
  }
}
```

---

### 新增菜单

**接口信息**
- 路径: `POST /api/sys/menus`
- 鉴权: 后台（`sys:menu:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| parentId | long | 否 | 父菜单ID，默认0 |
| name | string | 是 | 菜单名称 |
| type | string | 是 | 菜单类型 |
| routeName | string | 否 | 路由名称 |
| routePath | string | 否 | 路由路径 |
| component | string | 否 | 组件路径 |
| perm | string | 否 | 权限标识 |
| visible | integer | 否 | 是否显示，默认1 |
| sort | integer | 否 | 排序序号 |
| icon | string | 否 | 图标 |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/menus', {
  parentId: 0,
  name: '新菜单',
  type: 'menu',
  routePath: '/new-menu',
  component: 'new-menu/index',
  sort: 10
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 10,
    "parentId": 0,
    "name": "新菜单"
  }
}
```

---

### 修改菜单

**接口信息**
- 路径: `PUT /api/sys/menus/{id}`
- 鉴权: 后台（`sys:menu:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 菜单ID |

**请求参数**：同新增菜单（字段均可选）

**请求示例**

```javascript
// axios
await axios.put('/api/sys/menus/10', { name: '修改后的菜单', sort: 20 })
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 10,
    "name": "修改后的菜单"
  }
}
```

---

### 删除菜单

**接口信息**
- 路径: `DELETE /api/sys/menus/{id}`
- 鉴权: 后台（`sys:menu:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 菜单ID |

**请求示例**

```javascript
// axios
await axios.delete('/api/sys/menus/10')
```

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

## 后台角色管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询角色

**接口信息**
- 路径: `GET /api/sys/roles`
- 鉴权: 后台（`sys:role:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| keyword | string | 否 | 搜索关键字 |
| status | integer | 否 | 状态筛选 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/roles', {
  params: { current: 1, size: 10 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 5,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "name": "超级管理员",
        "code": "admin",
        "status": 1
      }
    ]
  }
}
```

---

### 查询角色详情

**接口信息**
- 路径: `GET /api/sys/roles/{id}`
- 鉴权: 后台（`sys:role:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 角色ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/roles/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "name": "超级管理员",
    "code": "admin",
    "status": 1,
    "description": "拥有所有权限"
  }
}
```

---

### 新增角色

**接口信息**
- 路径: `POST /api/sys/roles`
- 鉴权: 后台（`sys:role:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | string | 是 | 角色名称 |
| code | string | 是 | 角色编码 |
| description | string | 否 | 描述 |
| status | integer | 否 | 状态 |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/roles', {
  name: '编辑',
  code: 'editor',
  description: '内容编辑'
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 5,
    "name": "编辑",
    "code": "editor"
  }
}
```

---

### 修改角色

**接口信息**
- 路径: `PUT /api/sys/roles/{id}`
- 鉴权: 后台（`sys:role:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 角色ID |

**请求参数**：同新增角色（字段均可选）

**请求示例**

```javascript
// axios
await axios.put('/api/sys/roles/5', { description: '内容编辑，可发布文章' })
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 5,
    "name": "编辑",
    "code": "editor"
  }
}
```

---

### 修改角色状态

**接口信息**
- 路径: `PUT /api/sys/roles/{id}/status`
- 鉴权: 后台（`sys:role:update`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| status | integer | 是 | 状态值（1-启用，0-禁用） |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/roles/5/status', { status: 0 })
```

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

### 删除角色

**接口信息**
- 路径: `DELETE /api/sys/roles/{id}`
- 鉴权: 后台（`sys:role:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 角色ID |

**请求示例**

```javascript
// axios
await axios.delete('/api/sys/roles/5')
```

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

### 查询角色菜单

**接口信息**
- 路径: `GET /api/sys/roles/{id}/menus`
- 鉴权: 后台（`sys:role:query`）

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/roles/1/menus')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [1, 2, 3, 4, 5]
}
```

---

### 分配角色菜单

**接口信息**
- 路径: `PUT /api/sys/roles/{id}/menus`
- 鉴权: 后台（`sys:role:assign-menu`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| menuIds | array\<long\> | 是 | 菜单 ID 列表 |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/roles/2/menus', { menuIds: [1, 2, 3] })
```

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

## 通知后台管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询通知

**接口信息**
- 路径: `GET /api/sys/notices`
- 鉴权: 后台（`sys:notice:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| title | string | 否 | 标题筛选 |
| status | integer | 否 | 状态筛选 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/notices', {
  params: { current: 1, size: 10 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 10,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "title": "系统维护通知",
        "content": "...",
        "status": "published",
        "createdAt": "2026-05-01T10:00:00"
      }
    ]
  }
}
```

---

### 查询通知详情

**接口信息**
- 路径: `GET /api/sys/notices/{id}`
- 鉴权: 后台（`sys:notice:query`）

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/notices/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "title": "系统维护通知",
    "content": "系统将于今晚进行维护",
    "type": 1,
    "level": "info",
    "status": "published",
    "createdAt": "2026-05-01T10:00:00"
  }
}
```

---

### 新增通知

**接口信息**
- 路径: `POST /api/sys/notices`
- 鉴权: 后台（`sys:notice:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| title | string | 是 | 通知标题 |
| content | string | 是 | 通知内容 |
| type | integer | 否 | 通知类型 |
| level | string | 否 | 通知等级：info/warning/error |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/notices', {
  title: '新通知',
  content: '通知内容',
  type: 1,
  level: 'info'
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "title": "新通知",
    "status": "draft"
  }
}
```

---

### 修改通知

**接口信息**
- 路径: `PUT /api/sys/notices/{id}`
- 鉴权: 后台（`sys:notice:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

**请求参数**：同新增通知（字段均可选）

**请求示例**

```javascript
// axios
await axios.put('/api/sys/notices/2', { title: '修改后的标题' })
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "title": "修改后的标题"
  }
}
```

---

### 发布通知

**接口信息**
- 路径: `POST /api/sys/notices/{id}/publish`
- 鉴权: 后台（`sys:notice:publish`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/notices/2/publish')
```

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

### 撤回通知

**接口信息**
- 路径: `POST /api/sys/notices/{id}/revoke`
- 鉴权: 后台（`sys:notice:revoke`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/notices/2/revoke')
```

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

### 删除通知

**接口信息**
- 路径: `DELETE /api/sys/notices/{id}`
- 鉴权: 后台（`sys:notice:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 通知ID |

**请求示例**

```javascript
// axios
await axios.delete('/api/sys/notices/2')
```

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

## 作者申请后台管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询作者申请

**接口信息**
- 路径: `GET /api/sys/author-applications`
- 鉴权: 后台（`sys:author-application:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| status | string | 否 | 状态筛选（pending/approved/rejected） |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/author-applications', {
  params: { current: 1, size: 10 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 5,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 10,
        "status": "pending",
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 查询作者申请详情

**接口信息**
- 路径: `GET /api/sys/author-applications/{id}`
- 鉴权: 后台（`sys:author-application:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 申请ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/author-applications/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "userId": 10,
    "status": "pending",
    "penName": "笔名",
    "introduction": "自我介绍",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

### 审核作者申请

**接口信息**
- 路径: `PUT /api/sys/author-applications/{id}/review`
- 鉴权: 后台（`sys:author-application:review`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 申请ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| approved | boolean | 是 | 是否通过 |
| reason | string | 否 | 驳回原因 |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/author-applications/1/review', {
  approved: true
})
```

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

### 修正作者申请状态

**接口信息**
- 路径: `PUT /api/sys/author-applications/{id}/repair`
- 鉴权: 后台（`sys:author-application:repair`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 申请ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| status | string | 是 | 目标状态 |
| reason | string | 否 | 修正原因 |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/author-applications/1/repair', {
  status: 'approved',
  reason: '数据修正'
})
```

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

## 超级管理员操作

> 以下接口均需要超级管理员权限及 2FA 验证，通过 `@PreAuthorize` 控制。大部分操作需要 `mfaTicket` 参数。

### 发送2FA验证码

**接口信息**
- 路径: `POST /api/admin/2fa/send-code`
- 鉴权: 超管（`sys:user:update`）

**请求示例**

```javascript
// axios
await axios.post('/api/admin/2fa/send-code')
```

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

### 校验2FA验证码

**接口信息**
- 路径: `POST /api/admin/2fa/verify`
- 鉴权: 超管（`sys:user:update`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| code | string | 是 | 6位验证码 |

**请求示例**

```javascript
// axios
const res = await axios.post('/api/admin/2fa/verify', { code: '123456' })
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "ticket": "xxx-mfa-ticket-xxx",
    "expiresIn": 1800
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| ticket | string | MFA 凭证，用于后续敏感操作 |
| expiresIn | long | 凭证有效期，单位：秒（1800 = 30分钟） |

---

### 封禁用户

**接口信息**
- 路径: `POST /api/admin/users/{id}/ban`
- 鉴权: 超管（`sys:user:ban`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 目标用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| mfaTicket | string | 是 | 2FA 验证凭证 |

**请求示例**

```javascript
// axios
await axios.post('/api/admin/users/10/ban', { mfaTicket: 'xxx-mfa-ticket-xxx' })
```

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

### 解封用户

**接口信息**
- 路径: `POST /api/admin/users/{id}/unban`
- 鉴权: 超管（`sys:user:unban`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 目标用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| mfaTicket | string | 是 | 2FA 验证凭证 |

**请求示例**

```javascript
// axios
await axios.post('/api/admin/users/10/unban', { mfaTicket: 'xxx-mfa-ticket-xxx' })
```

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

### 调整用户等级

**接口信息**
- 路径: `PUT /api/admin/users/{id}/level`
- 鉴权: 超管（`sys:user:adjust-level`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 目标用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| level | integer | 是 | 目标等级 |
| mfaTicket | string | 是 | 2FA 验证凭证 |

**请求示例**

```javascript
// axios
await axios.put('/api/admin/users/10/level', {
  level: 10,
  mfaTicket: 'xxx-mfa-ticket-xxx'
})
```

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

### 调整用户经验

**接口信息**
- 路径: `PUT /api/admin/users/{id}/experience`
- 鉴权: 超管（`sys:user:adjust-experience`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 目标用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| experience | integer | 是 | 目标经验值 |
| mfaTicket | string | 是 | 2FA 验证凭证 |

**请求示例**

```javascript
// axios
await axios.put('/api/admin/users/10/experience', {
  experience: 50000,
  mfaTicket: 'xxx-mfa-ticket-xxx'
})
```

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

### 账号接管

**接口信息**
- 路径: `POST /api/admin/takeover`
- 鉴权: 超管（`sys:user:takeover`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| targetUserId | long | 是 | 目标用户ID |
| mfaTicket | string | 是 | 2FA 验证凭证 |

**请求示例**

```javascript
// axios
const res = await axios.post('/api/admin/takeover', {
  targetUserId: 10,
  mfaTicket: 'xxx-mfa-ticket-xxx'
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "takeoverToken": "xxx-takeover-token-xxx",
    "expiresIn": 300
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| takeoverToken | string | 接管令牌，用于调用 `/api/auth/takeover/login` |
| expiresIn | long | 令牌有效期，单位：秒 |

---

### 带审计的角色分配

**接口信息**
- 路径: `PUT /api/admin/users/{id}/roles`
- 鉴权: 超管（`sys:user:assign-role`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 目标用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| roleIds | array\<long\> | 是 | 角色 ID 列表 |
| mfaTicket | string | 是 | 2FA 验证凭证 |

**请求示例**

```javascript
// axios
await axios.put('/api/admin/users/10/roles', {
  roleIds: [1, 2],
  mfaTicket: 'xxx-mfa-ticket-xxx'
})
```

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

## 经验体系管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 查看用户经验来源汇总

**接口信息**
- 路径: `GET /api/sys/experience/users/{userId}/summary`
- 鉴权: 后台（`sys:experience:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| userId | 用户ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/experience/users/1/summary')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "userId": 1,
    "level": 5,
    "experiencePoints": 15000,
    "sources": [
      { "source": "article_publish", "total": 5000 },
      { "source": "comment", "total": 3000 }
    ]
  }
}
```

---

### 经验流水分页查询

**接口信息**
- 路径: `GET /api/sys/experience/logs`
- 鉴权: 后台（`sys:experience:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |
| userId | long | 否 | 用户ID筛选 |
| source | string | 否 | 经验来源筛选 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/experience/logs', {
  params: { current: 1, size: 10, userId: 1 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 20,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 1,
        "source": "article_publish",
        "points": 50,
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 手动调整等级或经验

**接口信息**
- 路径: `POST /api/sys/experience/users/{userId}/adjust`
- 鉴权: 后台（`sys:experience:adjust`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| userId | 用户ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| level | integer | 否 | 目标等级（与 experience 二选一或同时传） |
| experience | integer | 否 | 增减的经验值 |
| reason | string | 否 | 调整原因 |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/experience/users/1/adjust', {
  level: 6,
  experience: 1000,
  reason: '运营活动奖励'
})
```

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

### 查看经验来源配置

**接口信息**
- 路径: `GET /api/sys/experience/config`
- 鉴权: 后台（`sys:experience:config`）

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/experience/config')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "configKey": "exp_article_publish",
      "configValue": "50",
      "description": "发布文章获得经验"
    }
  ]
}
```

---

### 更新经验来源配置

**接口信息**
- 路径: `PUT /api/sys/experience/config`
- 鉴权: 后台（`sys:experience:config`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| configKey | string | 是 | 配置键 |
| configValue | string | 是 | 配置值 |

**请求示例**

```javascript
// axios
await axios.put('/api/sys/experience/config', {
  configKey: 'exp_article_publish',
  configValue: '100'
})
```

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

## 系统日志管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询日志

**接口信息**
- 路径: `GET /api/sys/logs`
- 鉴权: 后台（`sys:log:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/logs', {
  params: { current: 1, size: 10 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 100,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "action": "LOGIN",
        "operator": "admin",
        "ip": "127.0.0.1",
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 查询日志详情

**接口信息**
- 路径: `GET /api/sys/logs/{id}`
- 鉴权: 后台（`sys:log:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 日志ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/logs/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "action": "LOGIN",
    "operator": "admin",
    "ip": "127.0.0.1",
    "detail": "登录成功",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

### 删除日志

**接口信息**
- 路径: `DELETE /api/sys/logs/{id}`
- 鉴权: 后台（`sys:log:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 日志ID |

**请求示例**

```javascript
// axios
await axios.delete('/api/sys/logs/1')
```

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

### 按条件清理日志

**接口信息**
- 路径: `POST /api/sys/logs/clean`
- 鉴权: 后台（`sys:log:clean`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| beforeDate | string | 否 | 清理此日期之前的日志 |
| action | string | 否 | 按操作类型清理 |

**请求示例**

```javascript
// axios
const res = await axios.post('/api/sys/logs/clean', {
  beforeDate: '2026-01-01'
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": 150
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|------|
| data | long | 清理的日志数量 |

---

## 审计日志管理

> 以下接口仅超级管理员可访问，通过 `@PreAuthorize` + `superAdminVerifier` 双重校验。

### 分页查询审计日志

**接口信息**
- 路径: `GET /api/sys/audit-logs`
- 鉴权: 超管（`sys:audit:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/audit-logs', {
  params: { current: 1, size: 10 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 50,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "action": "BAN_USER",
        "operatorId": 1,
        "targetUserId": 10,
        "ip": "127.0.0.1",
        "createdAt": "2026-05-16T10:00:00"
      }
    ]
  }
}
```

---

### 查询审计日志详情

**接口信息**
- 路径: `GET /api/sys/audit-logs/{id}`
- 鉴权: 超管（`sys:audit:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 审计日志ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/audit-logs/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "action": "BAN_USER",
    "operatorId": 1,
    "targetUserId": 10,
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "detail": "封禁用户",
    "createdAt": "2026-05-16T10:00:00"
  }
}
```

---

## 系统配置管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 分页查询配置

**接口信息**
- 路径: `GET /api/sys/configs`
- 鉴权: 后台（`sys:config:query`）
- 分页参数通过 Query 传递

**请求参数**（Query）

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| current | integer | 否 | 当前页，默认1 |
| size | integer | 否 | 每页条数，默认10 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/configs', {
  params: { current: 1, size: 10 }
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 20,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "configKey": "site_name",
        "configValue": "我的博客",
        "description": "站点名称"
      }
    ]
  }
}
```

---

### 查询配置详情

**接口信息**
- 路径: `GET /api/sys/configs/{id}`
- 鉴权: 后台（`sys:config:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 配置ID |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/configs/1')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "configKey": "site_name",
    "configValue": "我的博客",
    "description": "站点名称"
  }
}
```

---

### 新增配置

**接口信息**
- 路径: `POST /api/sys/configs`
- 鉴权: 后台（`sys:config:create`）
- Content-Type: `application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| configKey | string | 是 | 配置键 |
| configValue | string | 是 | 配置值 |
| description | string | 否 | 描述 |

**请求示例**

```javascript
// axios
await axios.post('/api/sys/configs', {
  configKey: 'site_description',
  configValue: '一个技术博客',
  description: '站点描述'
})
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "configKey": "site_description",
    "configValue": "一个技术博客"
  }
}
```

---

### 修改配置

**接口信息**
- 路径: `PUT /api/sys/configs/{id}`
- 鉴权: 后台（`sys:config:update`）
- Content-Type: `application/json`

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 配置ID |

**请求参数**：同新增配置（字段均可选）

**请求示例**

```javascript
// axios
await axios.put('/api/sys/configs/2', { configValue: '新的站点描述' })
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 2,
    "configKey": "site_description",
    "configValue": "新的站点描述"
  }
}
```

---

### 删除配置

**接口信息**
- 路径: `DELETE /api/sys/configs/{id}`
- 鉴权: 后台（`sys:config:delete`）

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 配置ID |

**请求示例**

```javascript
// axios
await axios.delete('/api/sys/configs/2')
```

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

### 按配置键查询配置值

**接口信息**
- 路径: `GET /api/sys/configs/key/{configKey}`
- 鉴权: 后台（`sys:config:query`）

**路径参数**

| 参数 | 说明 |
|------|------|
| configKey | 配置键名 |

**请求示例**

```javascript
// axios
const res = await axios.get('/api/sys/configs/key/site_name')
```

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": "我的博客"
}
```

---

## 错误码速查

### 认证相关（401xx）

| code | 说明 | 前端处理建议 |
|-----|------|-------------|
| 40101 | 用户名或密码错误 | 登录页显示「用户名或密码错误」 |
| 40102 | 未登录或登录已过期 | 跳转登录页 |
| 40104 | 账号已锁定 | 显示「连续失败过多，请15分钟后再试」 |
| 40105 | 账号已禁用 | 显示「账号已被禁用」 |
| 40108 | 无效的令牌 | 跳转登录页 |
| 40112 | 邮箱验证码错误 | 显示「验证码错误」 |
| 40113 | 邮箱验证码已过期 | 显示「验证码已过期，请重新获取」 |
| 40115 | 发送验证码过于频繁 | 显示「发送过于频繁，请稍后再试」 |
| 40130 | 原密码错误 | 修改密码页显示「原密码错误」 |

### 参数校验（400xx）

| code | 说明 | 前端处理建议 |
|-----|------|-------------|
| 40001 | 参数校验失败 | 显示具体字段的错误提示 |

### 权限相关（403xx）

| code | 说明 | 前端处理建议 |
|-----|------|-------------|
| 40300 | 没有访问权限 | 显示「无权限访问该资源」 |
| 40304 | 仅超级管理员可执行此操作 | 显示「需要管理员权限」 |

---

## 前端集成指南

### 登录流程时序

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   登录页    │     │   后端 API   │     │   前端存储    │
└──────┬──────┘     └──────┬───────┘     └───────┬───────┘
       │                    │                     │
       │  1. POST /login    │                     │
       │  username, password│                     │
       │───────────────────>│                     │
       │                    │                     │
       │  200 { accessToken,│                     │
       │        refreshToken,│                     │
       │        expiresIn } │                     │
       │<───────────────────│                     │
       │                    │                     │
       │                    │         ┌───────────┴───┐
       │                    │         │ accessToken   │
       │                    │         │ refreshToken  │
       │                    │         │ expiresIn     │
       │                    │         └───────────────┘
       │                    │                     │
       │  2. GET /current-user│                    │
       │───────────────────>│                     │
       │  200 { user info } │                     │
       │<───────────────────│                     │
       │                    │                     │
       │  3. GET /current-user-menus            │
       │───────────────────>│                     │
       │  200 [ menus ]     │                     │
       │<───────────────────│                     │
       │                    │                     │
       ▼                    ▼                     ▼
```

### axios 拦截器配置

```javascript
// main.js 或独立的 api 配置文件中

// 假设使用 localStorage 存储 token
const getToken = () => localStorage.getItem('accessToken')
const getRefreshToken = () => localStorage.getItem('refreshToken')

// 请求拦截器：自动附加 token
axios.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：处理 token 过期
let isRefreshing = false
let refreshQueue = []

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // token 过期，尝试刷新
    if (error.response?.status === 401 && 
        error.response?.data?.code === 40108 && 
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // 正在刷新，把请求加入队列
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axios(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post('/api/auth/refresh', {
          refreshToken
        })

        const { accessToken, refreshToken: newRefresh } = res.data.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefresh)

        // 重试排队的请求
        refreshQueue.forEach(({ resolve }) => resolve(accessToken))
        refreshQueue = []

        // 重试当前请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)

      } catch (refreshError) {
        // 刷新失败，清除 token 跳转登录
        refreshQueue.forEach(({ reject }) => reject(refreshError))
        refreshQueue = []
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

### Token 存储建议

| 存储方式 | 优点 | 缺点 | 建议场景 |
|---------|------|------|---------|
| localStorage | 简单，跨标签页共享 | 易受 XSS 攻击 | 非敏感应用 |
| sessionStorage | 标签页关闭即清除 | 不跨标签页 | 需要严格安全 |
| cookies (HttpOnly) | 可防 XSS，服务端控制 | 跨域配置复杂 | 高安全要求 |

**最低安全建议**：
1. accessToken 存储在 localStorage，用于接口鉴权
2. refreshToken 可以存储在 cookie（HttpOnly）或较安全的存储
3. 敏感操作（如修改密码）要求用户重新输入密码
4. 退出登录时清除所有 token