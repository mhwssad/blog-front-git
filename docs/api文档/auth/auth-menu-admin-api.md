# 后台菜单管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

## 后台菜单管理

> 以下接口均需要对应后台权限，通过 `@PreAuthorize` 控制。

### 查询菜单树

**接口信息**
- 路径: `GET /api/sys/menus/tree`
- 鉴权: 后台（`sys:menu:query`）

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

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```
