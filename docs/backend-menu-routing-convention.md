# 后端菜单驱动路由规范

## 目的

当前项目采用“**固定前后台路由 + 后端菜单动态路由**”的组合模式。

前端会保留一组固定路由：

- 前台固定路由：非 `/admin` 前缀页面
- 后台固定路由：`/admin/dashboard` 首页

除此之外，前端会根据 `GET /api/auth/current-user-menus` 返回的菜单数据，动态创建后台业务路由，
并结合后端返回的 `component` 与 `routePath` 字段，解析本地 `src/views` 下的 Vue 页面组件。

本文档用于统一前后端在菜单驱动路由上的命名、配置和协作规则，避免出现：

- 菜单已授权，但页面无法访问
- 路由已注册，但组件解析失败
- 前后端各自维护一套不一致的路由约定

## 路由来源

- 前台固定路由：前端代码维护
  - 例如：`/`、`/login`、`/register`
- 后台固定路由：前端代码维护
  - 当前固定首页：`/admin/dashboard`
- 后台动态业务路由：后端菜单授权决定
- 后台菜单显示顺序、可见性：后端菜单数据决定
- 页面实际组件加载：前端本地 `src/views` 页面文件决定
- 通用组件统一放在 `src/components`

可以理解为：

- `/admin/**` 表示管理员后台
- 非 `/admin/**` 表示普通前台页面
- 后端菜单只负责“后台业务页面”，不负责替代前台固定路由

## 后台路由组合规则

后台最终可访问路由由两部分组成：

1. 前端固定后台路由
   - 当前内置：`/admin/dashboard`
2. 后端返回并被前端成功解析的动态菜单路由

其中：

- `/admin/dashboard` 为后台固定首页，允许写死在代码中
- 即使后端菜单未返回 dashboard，前端仍会保留并渲染后台首页
- 如果后端菜单本身已经提供 `/admin/dashboard`，前端不会重复注册
- 侧边栏菜单会把固定首页与后端菜单合并后再显示

## 支持的菜单类型

- `C`：目录节点
  - 用于菜单分组或路由容器
  - 不直接加载业务页面
  - 推荐 `component`：`layouts/RouteView`
- `M`：菜单页面
  - 表示一个真实可访问页面
  - 必须提供可路由的 `routePath`
  - 应提供可被前端解析的 `component`
- `B`：按钮权限
  - 不注册为路由
  - 仅用于按钮级权限控制

## 路径规范

- 后台页面统一使用 `/admin/**`
- `/admin/**` 统一渲染后台布局 `src/layouts/AdminLayouts.vue`
- 其他非 `/admin/**` 路径统一渲染前台页面
- 菜单 `routePath` 必须直接写最终访问路径
- 不再支持 `/system/**`、`/content/**`、`/dashboard` 等旧路径别名
- 不再支持相对路径子菜单写法，例如 `users`、`roles`、`articles`

新增菜单时统一使用最终形态：

- `/admin/users`
- `/admin/roles`
- `/admin/articles`

不建议后端重复维护固定首页：

- 前端固定：`/admin/dashboard`
- 后端菜单主要维护：`/admin/users`、`/admin/roles`、`/admin/articles` 等业务页

## component 规范

### 基本规则

后端 `component` 应描述一个可映射到前端 `src/views` 下页面文件的组件路径。
业务功能建议按“一个功能一个目录”组织。

当前解析器只接受以下两类写法：

- 页面组件：`admin/user/Users`
- 路由容器：`layouts/RouteView`

### 推荐命名风格

建议统一使用前端视图路径风格，不再接受业务域别名风格。

1. 页面组件
   - 例如：`admin/user/Users`
   - 例如：`admin/article/Articles`
2. 路由容器
   - 例如：`layouts/RouteView`

### 解析顺序

前端组件解析器只按后端返回的 `component` 精确匹配本地页面。

例如：

- `component = admin/user/Users` 对应 `src/views/admin/user/Users.vue`
- `component = admin/article/Articles` 对应 `src/views/admin/article/Articles.vue`
- `component = layouts/RouteView` 对应嵌套路由容器 `RouterView`

## routeName 规范

- `routeName` 必须全局唯一
- 推荐使用 PascalCase（大驼峰）
- 推荐示例：
  - `AdminDashboard`
  - `AdminUsers`
  - `AdminRoles`
  - `AdminArticles`
- 如果后端未传 `routeName`，前端会根据 `routePath` 自动生成

## redirect 规范

- `redirect` 可以是站内路由，也可以是外部地址
- 站内重定向应遵循与 `routePath` 相同的路径规范
- 推荐写法：
  - `/admin/users`
- 外部链接仅在明确需要跳新窗口时使用

## params 规范

- `params` 只用于可序列化的路由参数
- Key 统一使用小驼峰命名
- 示例：

```json
{
  "articleId": "1001"
}
```

不要在 `params` 中存放以下内容：

- 页面临时状态
- 列表筛选条件
- 大对象数据

## keepAlive 规范

- `keepAlive = 1`：页面允许缓存
- `keepAlive = 0`：页面不缓存
- 仅对确实需要保留状态的页面开启缓存

## icon 规范

- `icon` 应使用前端已支持的 Element Plus 图标别名
- 当前常用值包括：
  - `Home`
  - `User`
  - `Lock`
  - `Menu`
  - `Setting`
  - `Bell`
  - `Document`
  - `Files`
  - `DataAnalysis`

如果后端使用了另一套图标命名，前端图标映射也必须同步扩展。

## 页面文件命名规范

- 后台页面统一放在 `src/views/admin`
- 每个功能使用独立目录表示，例如：
  - `src/views/admin/user`
  - `src/views/admin/article`
  - `src/views/admin/category`
- 真实页面组件文件名使用 PascalCase
- 推荐示例：
  - `src/views/admin/user/Users.vue`
  - `src/views/admin/article/Articles.vue`
  - `src/views/admin/role/Roles.vue`
  - `src/views/admin/role/Roles.vue`

## 组件目录规范

- 通用组件统一放在 `src/components`
- 如果组件只服务于某个功能，则放在该功能目录内部
- 推荐示例：
  - 通用组件：`src/components/admin/AdminResourceOverview.vue`
  - 用户功能专属组件：`src/views/admin/user/components/UserFormDialog.vue`
  - 用户功能专属组件：`src/views/admin/user/components/AssignRolesDialog.vue`

除非有明确业务原因，否则不要创建“仅目录不同、职责相同”的重复页面文件。

## 新增菜单检查清单

新增一个后台菜单页面时，至少确认下面几点：

1. `type = M`
2. `routePath` 合法且可访问
3. `component` 符合当前组件命名规范
4. `routeName` 唯一
5. `visible` 配置正确
6. `perm` 与后端权限设计一致
7. 前端 `src/views` 下已存在对应页面文件

## 推荐示例

### 固定后台首页

这个路由由前端直接写死，不依赖后端菜单：

```ts
{
  path: '/admin',
  name: 'AdminLayout',
  component: () => import('@/layouts/AdminLayouts.vue'),
  children: [
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/Layouts.vue')
    }
  ]
}
```

### 用户管理页面

```json
{
  "name": "用户管理",
  "type": "M",
  "routeName": "AdminUsers",
  "routePath": "/admin/users",
  "component": "admin/user/Users",
  "perm": "sys:user:query",
  "keepAlive": 1,
  "icon": "User",
  "visible": 1
}
```

### 文章管理页面

```json
{
  "name": "文章管理",
  "type": "M",
  "routeName": "AdminArticles",
  "routePath": "/admin/articles",
  "component": "admin/article/Articles",
  "perm": "content:article:query",
  "keepAlive": 1,
  "icon": "Document",
  "visible": 1
}
```

### 目录节点

```json
{
  "name": "系统管理",
  "type": "C",
  "routeName": "AdminSystem",
  "routePath": "/admin/system",
  "component": "layouts/RouteView",
  "redirect": "/admin/users",
  "icon": "Setting",
  "visible": 1
}
```

## 变更协作要求

当以下任一项发生变化时，前后端必须一起评审：

- 新增路由域前缀
- 新增组件命名风格
- 新增图标命名体系
- 修改目录节点语义

否则很容易出现“动态路由注册成功，但页面并不是预期页面”这类隐蔽问题。
