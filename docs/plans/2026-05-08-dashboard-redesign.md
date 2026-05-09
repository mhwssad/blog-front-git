# 后台仪表盘重设计方案

## 背景

当前仪表盘仅使用了部分 API 数据（概览和治理），未充分利用 `DashboardContentVO`、`DashboardCommunityVO`、`DashboardAiVO` 的完整字段。本次重设计目标是：

1. 全面展示所有 5 个 API 端点的数据
2. 采用数据平台风格，使用 ECharts 图表（饼图/环形图 + 柱状图）
3. 保留时间范围切换功能

## 页面布局

```
┌─────────────────────────────────────────────────────┐
│                    DashboardHero                      │
│  [今日|本周|本月|全部]            [进入常用] [刷新]    │
└─────────────────────────────────────────────────────┘
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│注册用户│ │活跃用户│ │作者数 │ │文章数 │ │评论数 │ │举报数 │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
┌───────────────────────┐ ┌───────────────────────────┐
│     内容统计           │ │     社区统计               │
│ 发文数 评论数 点赞数    │ │ 聊天消息 大厅消息 群组数    │
│ 收藏数 待审核          │ │ 论坛发帖 论坛回复           │
│                       │ │ ┌─────────────────────────┐│
│                       │ │ │  热门版块 Top5 柱状图     ││
│                       │ │ └─────────────────────────┘│
└───────────────────────┘ └───────────────────────────┘
┌───────────────────────┐ ┌───────────────────────────┐
│     AI 统计            │ │     治理面板               │
│ 调用总数 RAG Agent任务  │ │ 举报：总/待处理/处理中/     │
│ ┌──────┐ ┌──────┐     │ │      已处理/已驳回          │
│ │AI成功 │ │Agent │     │ │ 平均处理时长               │
│ │/失败  │ │成功   │     │ │ 待审核文章/作者申请         │
│ │环形图 │ │/失败  │     │ │ ┌─────────────────────────┐│
│ └──────┘ └──────┘     │ │ │  处罚类型分布 柱状图      ││
│                       │ │ └─────────────────────────┘│
└───────────────────────┘ └───────────────────────────┘
┌───────────────────────┐ ┌───────────────────────────┐
│     快捷入口           │ │     通知公告 + 异常关注     │
│  [用户] [文章] [关注]   │ │ 异常关注关系 / 失败上传 /   │
│  [文件] [聊天] [通知]   │ │ 冻结会话                   │
│  [分类] [菜单]         │ │ 近期通知列表               │
└───────────────────────┘ └───────────────────────────┘
```

## 数据映射

### API 端点 → 组件映射

| API 端点 | 数据类型 | 展示组件 | 图表 |
|---------|---------|---------|------|
| `GET /sys/dashboard/overview` | `DashboardOverviewVO` | OverviewCards | 无 |
| `GET /sys/dashboard/content` | `DashboardContentVO` | ContentPanel | 无 |
| `GET /sys/dashboard/community` | `DashboardCommunityVO` | CommunityPanel | 柱状图（热门版块） |
| `GET /sys/dashboard/ai` | `DashboardAiVO` | AiPanel | 2 个环形图（AI 成功率、Agent 任务成功率） |
| `GET /sys/dashboard/governance` | `DashboardGovernanceVO` | GovernancePanel | 柱状图（处罚类型分布） |
| 补充 API（关注/文件/聊天/通知/作者申请） | 各自的列表 API | SidebarPanel | 无 |

### 各组件详细数据字段

#### OverviewCards（6 个统计卡片）
数据来源：`DashboardOverviewVO`
- `registeredUserCount` — 注册用户数
- `activeUserCount` — 活跃用户数
- `authorCount` — 作者数
- `articleCount` — 文章数
- `commentCount` — 评论数（注：overview 中的 commentCount 和 content 中的一致，优先用 overview）
- `reportCount` — 举报数

#### ContentPanel（内容统计）
数据来源：`DashboardContentVO`
- `articleCount` — 发文数
- `pendingArticleReviewCount` — 待审核文章
- `commentCount` — 评论数
- `likeCount` — 点赞数
- `collectCount` — 收藏数

#### CommunityPanel（社区统计）
数据来源：`DashboardCommunityVO`
- `chatMessageCount` — 聊天消息数
- `lobbyMessageCount` — 大厅消息数
- `groupCount` — 群组数
- `forumPostCount` — 论坛发帖数
- `forumReplyCount` — 论坛回复数
- `hotSections` — 热门版块 Top 5（柱状图：版块名称 vs 热度值）

#### AiPanel（AI 统计）
数据来源：`DashboardAiVO`
- 数字指标：`aiCallCount`、`aiSuccessCallCount`、`aiFailedCallCount`、`ragCallCount`、`agentTaskCount`、`agentSuccessTaskCount`、`agentFailedTaskCount`
- 环形图 1：AI 调用成功 / 失败占比
- 环形图 2：Agent 任务成功 / 失败占比

#### GovernancePanel（治理面板）
数据来源：`DashboardGovernanceVO`
- 数字指标：`reportCount`、`pendingReportCount`、`processingReportCount`、`handledReportCount`、`rejectedReportCount`、`averageHandleDurationMinutes`
- 补充指标：`overview.pendingArticleReviewCount`、`pendingAuthorAppCount`
- 柱状图：`punishmentDistributions`（处罚类型 vs 数量）

#### SidebarPanel（通知 + 异常关注 + 快捷入口）
数据来源：补充 API 调用
- 异常关注项：异常关注关系、失败上传任务、冻结会话
- 通知列表：最近 3 条通知
- 快捷入口：8 个管理模块入口（根据权限过滤）

## 组件拆分

### 保留/修改的组件
| 组件 | 变更 |
|-----|------|
| `DashboardHero.vue` | 保持不变 |
| `StatCards.vue` | 重命名为 `OverviewCards.vue`，6 个卡片 |
| `ShortcutGrid.vue` | 保持不变 |
| `NoticeList.vue` | 保持不变 |

### 新增的组件
| 组件 | 职责 |
|-----|------|
| `ContentPanel.vue` | 内容统计面板（5 个指标） |
| `CommunityPanel.vue` | 社区统计面板（5 个指标 + 热门版块柱状图） |
| `AiPanel.vue` | AI 统计面板（数字指标 + 2 个环形图） |
| `GovernancePanel.vue` | 重写治理面板（举报指标 + 处罚柱状图 + 补充指标） |
| `SidebarPanel.vue` | 合并关注项 + 通知 + 快捷入口 |

### 删除的组件
无。现有组件逐步替换，不引入额外依赖。

## ECharts 图表规格

### 热门版块柱状图（CommunityPanel）
- 类型：水平柱状图
- X 轴：热度值
- Y 轴：版块名称
- 配色：渐变蓝色系
- 数据字段：`hotSections[].sectionName` vs `hotSections[].hotValue`

### AI 调用环形图（AiPanel）
- 类型：环形图（doughnut）
- 数据：成功 `aiSuccessCallCount` / 失败 `aiFailedCallCount`
- 配色：成功 #10b981 / 失败 #ef4444
- 中心文字：成功率百分比

### Agent 任务环形图（AiPanel）
- 类型：环形图（doughnut）
- 数据：成功 `agentSuccessTaskCount` / 失败 `agentFailedTaskCount`
- 配色：成功 #3b82f6 / 失败 #f59e0b
- 中心文字：成功率百分比

### 处罚类型分布柱状图（GovernancePanel）
- 类型：垂直柱状图
- X 轴：处罚类型名称
- Y 轴：数量
- 配色：渐变橙色系
- 数据字段：`punishmentDistributions[].punishmentType` vs `punishmentDistributions[].count`

## 交互逻辑

1. **时间范围切换**：Hero 区域下拉框切换 today/week/month/all，触发 `refreshDashboard()` 重新加载所有 API 数据
2. **刷新按钮**：手动刷新所有数据
3. **快捷入口**：点击卡片跳转到对应管理页面
4. **图表自适应**：所有 ECharts 图表监听容器 resize，使用 `ResizeObserver` 或 `autoresize`

## 文件变更清单

### 修改文件
1. `src/views/admin/dashboard/index.vue` — 重新组织布局和 API 调用
2. `src/views/admin/dashboard/StatCards.vue` — 重命名/重写为 OverviewCards
3. `src/views/admin/dashboard/GovernancePanel.vue` — 重写，增加处罚分布柱状图

### 新增文件
1. `src/views/admin/dashboard/ContentPanel.vue`
2. `src/views/admin/dashboard/CommunityPanel.vue`
3. `src/views/admin/dashboard/AiPanel.vue`
4. `src/views/admin/dashboard/SidebarPanel.vue`

### 不变文件
1. `src/views/admin/dashboard/DashboardHero.vue`
2. `src/views/admin/dashboard/ShortcutGrid.vue`
3. `src/views/admin/dashboard/NoticeList.vue`
4. `src/api/sys/dashboard.ts`
5. `src/stores/modules/dashboard.ts`
6. `src/types/api-types/dashboard.ts`
7. `src/types/ui.ts`

## Store 变更

无需修改。当前 `dashboardStore` 已经包含所有 5 个 API 的 fetch 方法和 loading 状态，完全满足新设计需求。`index.vue` 只需将 `dashboardStore.community` 和 `dashboardStore.ai` 传递给新组件即可。

## 实施顺序

1. 新增 `ContentPanel.vue` — 纯数字展示，无图表依赖
2. 新增 `CommunityPanel.vue` — 含 ECharts 柱状图
3. 新增 `AiPanel.vue` — 含 ECharts 环形图
4. 重写 `GovernancePanel.vue` — 增加 ECharts 柱状图
5. 新增 `SidebarPanel.vue` — 合并现有组件
6. 重写 `index.vue` — 整合所有组件
7. 删除旧的 `StatCards.vue`（如已重命名）
