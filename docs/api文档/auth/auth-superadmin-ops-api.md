# 超级管理员操作

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 超级管理员操作

> 以下接口均需要超级管理员权限及 2FA 验证，通过 `@PreAuthorize` 控制。大部分操作需要 `mfaTicket` 参数。

### 发送2FA验证码

**接口信息**
- 路径: `POST /api/admin/2fa/send-code`
- 鉴权: 超管（`sys:user:update`）

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

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
