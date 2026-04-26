# 阶段五：Mock联调与验收收尾任务清单

[返回总栏](./后台管理完善计划.md) | [对应任务文档](./阶段五-Mock联调与验收收尾.md) | [上一阶段](./阶段四-后台首页与总览建设-任务清单.md)

## 1. 阶段摘要

- 当前状态：`done`
- 前置依赖：阶段一至阶段四完成主要收口
- 完成判定：后台默认 Mock 环境可完整演示，文档与验证同步完成

## 2. Mock 与测试数据

| 状态 | 任务 | 交付物 | 验收方式 |
| --- | --- | --- | --- |
| `done` | 补齐 `follow / file / chat` 后台 Mock 文件 | 对应 mock 文件 | 三个模块可在默认 Mock 环境下访问 |
| `done` | 扩展 `mock/test-data.json` 覆盖阶段二数据链路 | 后台测试数据 | 页面查询、详情和治理动作可演示 |
| `done` | 统一校准 Mock 路由、字段、分页和状态行为 | Mock 收口结果 | 页面与 Mock 行为一致 |
| `done` | 补齐 Users（lastLoginTime、lastLoginIp）、Roles（dataScope）、Logs（完整字段）、Notices（完整字段）Mock 数据 | 字段补齐结果 | 后台页面可展示完整字段 |
| `done` | 足迹 Mock 数据扩展至 8 条（含 7 条今日数据） | PV 统计数据 | Dashboard 今日访问量可正常展示 |

## 3. 菜单、权限与账号体验

| 状态 | 任务 | 交付物 | 验收方式 |
| --- | --- | --- | --- |
| `done` | 补齐 `follow / file / chat` 菜单权限与按钮权限 | 菜单权限首版 | 新模块可经菜单访问 |
| `done` | 校准演示账号、菜单可见性和按钮可操作性 | 账号体验结果 | 管理员和内容侧账号体验符合预期 |
| `done` | 统一核对首页、菜单、按钮三层权限链路 | 权限最终验收结果 | 权限行为无断层 |

## 4. 环境配置与文档

| 状态 | 任务 | 交付物 | 验收方式 |
| --- | --- | --- | --- |
| `done` | `.env.production` 的 `VITE_ENABLE_MOCK` 改为 `false` | 环境配置修正 | 生产构建不启用 Mock |
| `done` | 同步总栏、阶段文档和阶段清单说明 | 更新后的文档 | 文档入口与现状一致 |
| `done` | 运行 `pnpm type-check` 并记录结果 | 类型验证结果 | 类型检查通过 |
| `done` | 运行 `pnpm build` 并记录结果 | 构建验证结果 | 构建通过 |
| `done` | 运行 `pnpm lint` 并记录结果 | Lint 验证结果 | 仅存在预有问题，未扩大 |

## 5. 已完成记录

- `follow / file / chat` 的后台 Mock 文件与测试数据已补齐
- Users 补充 `lastLoginTime`、`lastLoginIp` 字段
- Roles 补充 `dataScope` 字段
- Logs 补充完整字段：`requestUri`、`requestParams`、`responseContent`、`content`、`method`、`province`、`city`、`executionTime`、`browser`、`browserVersion`、`os`，扩展至 3 条
- Notices 补充完整字段：`level`、`targetType`、`targetUserIds`、`publisherId`、`publishStatus`、`revokeTime`、`updateTime`
- `.env.production` 的 `VITE_ENABLE_MOCK` 已改为 `false`
- Mock handler 新增记录也同步补齐了新字段默认值
- type-check、build 验证通过，lint 仅存在预有问题
