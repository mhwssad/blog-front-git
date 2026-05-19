# 通用组件迁移进度跟踪

> 创建日期: 2026-05-19
> 最后更新: 2026-05-20
> 状态: 进行中 (批次 1a~2d 已完成，批次 3a~4 待执行)

## 已完成

| 批次 | 任务 | 文件数 | 类型检查 |
| ------ | ------ | ------ | ------ |
| 1a | useConfirm 替换 ElMessageBox.confirm | ~39 | 通过 |
| 1b | EmptyState 替换 el-empty | ~32 | 通过 |
| 1c | UserCell 替换 avatar+nickname | 5 | 通过 |
| 2a | StatusSwitch 替换 el-switch (表格列) | 12 | 通过 |
| 2b | ActionColumn 替换 操作列 | 25 | 通过 |
| 2c | SearchFilter 替换 搜索卡片 | 31 | 通过 |
| 2d | DataTable 替换 表格卡片 | 28 | 通过 |

---

## 待执行

| 批次 | 任务 | 文件数 |
| ------ | ------ | ------ |
| 3a | FormDialog 替换 表单对话框 | 14 |
| 3b | DetailDialog 替换 详情对话框 | 14 |
| 4 | BatchToolbar + ImagePreview 替换 | 3 |

---

## 批次 3a: FormDialog 替换

**模式:** el-dialog 外壳 + 标题计算 + footer 按钮 → `<FormDialog>`

### 目标文件 (14)

**文章/内容类:**

- TagFormDialog, CategoryFormDialog, NoticeFormDialog

**系统管理类:**

- ConfigFormDialog, MenuFormDialog, RoleFormDialog, UserFormDialog

**AI 模块类:**

- AccountFormDialog, AgentFormDialog, ChannelFormDialog, McpServerFormDialog, ToolFormDialog, KnowledgeSourceConfigFormDialog, ToolAuthorizationFormDialog

### 替换要点

FormDialog 组件 props:

- `modelValue` / `update:modelValue` (v-model 控制显隐)
- `title` — 基础标题
- `editMode` — 是否编辑模式 (影响标题显示)
- `loading` — 提交加载状态
- `permission` — 权限标识
- `width` — 对话框宽度

FormDialog slots:

- `default` — 表单内容 (el-form + el-form-item)
- `footer` — 自定义 footer

---

## 批次 3b: DetailDialog 替换

**模式:** el-dialog + visible computed + close footer → `<DetailDialog>`

### 目标文件 (14)

- TagDetailDialog, CategoryDetailDialog, MenuDetailDialog, NoticeDetailDialog, RoleDetailDialog, UserDetailDialog, CommentDetailDialog, LogDetailDialog, AuditLogDetailDialog, FollowDetailDialog, InteractionDetailDialog, ArticleDetailDialog, CollectionFolderDetailDialog, CollectionRecordDetailDialog

### 替换要点

DetailDialog 组件 props:

- `modelValue` (v-model)
- `title`
- `detail` — 详情数据对象
- `loading` — 加载状态
- `width`

DetailDialog slots:

- `default` — 描述内容 (el-descriptions)

---

## 批次 4: 小范围替换

### 4a. BatchToolbar (1 文件)

- `src/views/admin/user/Users.vue` — 提取批量操作栏

### 4b. ImagePreview (2 文件)

- `src/views/front/chat/MessageList.vue`
- `src/views/admin/comment/components/CommentDetailDialog.vue`

---

## 通用组件 API 参考

### FormDialog (`src/components/common/FormDialog.vue`)

```
Props: modelValue (v-model), title, editMode, loading, permission, width
Emits: update:modelValue, submit
Slots: default, footer
```

### DetailDialog (`src/components/common/DetailDialog.vue`)

```
Props: modelValue (v-model), title, detail, loading, width
Emits: update:modelValue
Slots: default, footer
```

### BatchToolbar (`src/components/common/BatchToolbar.vue`)

```
Props: selectedCount
Slots: default
```

### ImagePreview (`src/components/common/ImagePreview.vue`)

```
Props: src, previewSrcList, fit('cover'), width(60), height(60), lazy(true)
```

---

## 注意事项

1. **自动导入:** 项目使用 `unplugin-auto-import`，通用组件无需手动 import
2. **每次批次完成后运行 `pnpm type-check` 验证**
3. **批次 3 的对话框替换需要保留各表单的 el-form-item 和验证逻辑**
4. **最终完成后运行 `pnpm type-check && pnpm build` 完整验证**
