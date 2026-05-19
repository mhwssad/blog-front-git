/** * 文章管理 * @description 后台文章列表管理，支持文章查询、编辑、删除、置顶、推荐及访问权限设置 *
@module admin/article/Articles * @see api/sys/article.ts (useArticleStore) */
<template>
  <div class="article-management-page">
    <ArticleEditorPage
      v-if="editorMode !== 'list'"
      :article-id="editorMode === 'edit' ? editorArticleId : null"
      @back="handleBackToList"
      @success="handleEditorSuccess"
    />

    <template v-else>
      <el-card class="search-card" shadow="never">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="关键词" class="filter-item">
            <el-input
              v-model="searchForm.keyword"
              class="filter-control"
              clearable
              placeholder="请输入标题或摘要关键字"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态" class="filter-item">
            <el-select
              v-model="searchForm.status"
              class="filter-control"
              clearable
              placeholder="请选择状态"
            >
              <el-option
                v-for="option in ARTICLE_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态" class="filter-item">
            <el-select
              v-model="searchForm.reviewStatus"
              class="filter-control"
              clearable
              placeholder="请选择审核状态"
            >
              <el-option label="待审核" :value="1" />
              <el-option label="已通过" :value="2" />
              <el-option label="已拒绝" :value="3" />
            </el-select>
          </el-form-item>
          <template v-if="searchExpanded">
            <el-form-item label="作者 ID" class="filter-item">
              <el-input-number
                v-model="searchForm.authorId"
                :min="1"
                class="filter-control"
                controls-position="right"
                placeholder="请输入作者 ID"
              />
            </el-form-item>
            <el-form-item label="可见范围" class="filter-item">
              <el-select
                v-model="searchForm.visibilityScope"
                class="filter-control"
                clearable
                placeholder="请选择可见范围"
              >
                <el-option
                  v-for="option in VISIBILITY_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="访问级别" class="filter-item">
              <el-select
                v-model="searchForm.accessLevel"
                class="filter-control"
                clearable
                placeholder="请选择访问级别"
              >
                <el-option
                  v-for="option in ACCESS_LEVEL_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="分类" class="filter-item">
              <el-select
                v-model="searchForm.categoryId"
                class="filter-control"
                clearable
                placeholder="请选择分类"
              >
                <el-option
                  v-for="category in flattenedCategories"
                  :key="category.id"
                  :label="category.label"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="标签" class="filter-item">
              <el-select
                v-model="searchForm.tagId"
                class="filter-control"
                clearable
                placeholder="请选择标签"
              >
                <el-option
                  v-for="tag in tagStore.tags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="是否置顶" class="filter-item">
              <el-select
                v-model="searchForm.isTop"
                class="filter-control"
                clearable
                placeholder="请选择置顶状态"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="发布时间" class="filter-item filter-item--range">
              <el-date-picker
                v-model="publishRange"
                type="datetimerange"
                class="filter-control filter-control--range"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                range-separator="至"
              />
            </el-form-item>
          </template>
          <el-form-item class="search-actions">
            <el-button v-permission="'content:article:query'" type="primary" @click="handleSearch">
              查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button link type="primary" @click="searchExpanded = !searchExpanded">
              {{ searchExpanded ? '收起' : '更多' }}
              <el-icon class="expand-icon" :class="{ 'is-expanded': searchExpanded }">
                <ArrowDown />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <DataTable
        title="文章列表"
        :data="articleStore.articles"
        :loading="articleStore.loading"
        :total="articleStore.total"
        :current-page="pagination.current"
        :page-size="pagination.size"
        :compact="isCompactTable"
        class="article-table"
        @update:current-page="handleCurrentChange"
        @update:page-size="handleSizeChange"
      >
        <template #header-extra>
          <el-button v-permission="'content:article:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增文章
          </el-button>
        </template>
          <el-table-column v-if="isCompactTable" label="文章信息" min-width="300" align="center">
            <template #default="{ row }">
              <div class="article-summary">
                <div class="article-summary__title">{{ row.title }}</div>
                <div class="article-summary__meta">
                  <span>{{ row.authorName || '-' }}</span>
                  <span>{{ formatArticleStatus(row.status) }}</span>
                  <span>{{ formatPublishTime(row.publishTime) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="!isCompactTable"
            prop="title"
            label="标题"
            min-width="240"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="article-title-cell">
                <span class="article-title-cell__text">{{ row.title }}</span>
                <el-tag v-if="row.isTop === 1" type="warning" size="small">置顶</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="!isCompactTable"
            prop="authorName"
            label="作者"
            min-width="100"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column v-if="!isCompactTable" label="状态" min-width="130" align="center">
            <template #default="{ row }">
              <el-switch
                v-permission.disable="'content:article:update'"
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                active-text="已发布"
                inactive-text="草稿"
                inline-prompt
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="审核" min-width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="reviewTagType(row.reviewStatus)" size="small">
                {{ reviewStatusLabel(row.reviewStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="访问级别" min-width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="getAccessTagType(row.accessLevel)" size="small">
                {{ formatAccessLevel(row.accessLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="互动" min-width="140" align="center">
            <template #default="{ row }">
              <span class="stats-text">
                浏{{ row.viewCount ?? 0 }} 赞{{ row.likeCount ?? 0 }}
                评{{ row.commentCount ?? 0 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="发布时间" min-width="160" align="center">
            <template #default="{ row }">
              {{ formatPublishTime(row.publishTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :min-width="isCompactTable ? 160 : 260"
            :fixed="isCompactTable ? false : 'right'"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button link type="primary" @click="handleViewDetail(row)">
                  详情
                </el-button>
                <el-button
                  v-permission="'content:article:update'"
                  link
                  type="primary"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'content:article:access'"
                  link
                  type="warning"
                  :disabled="row.accessLevel !== 4"
                  @click="handleAccess(row)"
                >
                  访问名单
                </el-button>
                <el-button
                  v-permission="'content:article:delete'"
                  link
                  type="danger"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
      </DataTable>
    </template>

    <ArticleAccessDialog
      v-model:visible="accessDialogVisible"
      :article-id="currentArticleId"
      :article-title="currentArticleTitle"
      @success="handleAccessSuccess"
    />

    <ArticleDetailDialog
      v-model:visible="detailDialogVisible"
      :detail="detailArticle"
      @edit="handleEditFromDetail"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import type { ArticleAdminVO, ArticleDetailVO, ArticleQueryRequest, CategoryAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useArticleStore, useCategoryStore, useTagStore } from '@/stores'
import {
  ACCESS_LEVEL_OPTIONS,
  ARTICLE_STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
  formatAccessLevel,
  formatArticleStatus,
  formatPublishTime,
} from '@/utils'
import ArticleAccessDialog from './components/ArticleAccessDialog.vue'
import ArticleDetailDialog from './components/ArticleDetailDialog.vue'
import ArticleEditorPage from './components/ArticleEditorPage.vue'

// 分类下拉选项结构
interface CategorySelectOption {
  id: number
  label: string
}

// Store 实例
const articleStore = useArticleStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const route = useRoute()
const router = useRouter()

// 搜索表单
const searchForm = reactive<ArticleQueryRequest>({
  current: 1,
  size: 10,
  keyword: undefined,
  authorId: undefined,
  status: undefined,
  accessLevel: undefined,
  categoryId: undefined,
  tagId: undefined,
  isTop: undefined,
  publishTimeStart: undefined,
  publishTimeEnd: undefined,
})

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
})

// 发布时间范围
const publishRange = ref<[string, string] | []>([])

// 搜索折叠
const searchExpanded = ref(true)

// 详情弹窗
const detailDialogVisible = ref(false)
const detailArticle = ref<ArticleDetailVO | null>(null)

// 访问权限弹窗
const accessDialogVisible = ref(false)
const currentArticleId = ref(0)
const currentArticleTitle = ref('')

// 表格高度自适应和分页布局
const { isCompactTable } = useContentAdmin()

/**
 * 将分类树扁平化为下拉选项列表
 * 格式为 "父分类 / 子分类" 的层级显示
 */
const flattenedCategories = computed<CategorySelectOption[]>(() => {
  const options: CategorySelectOption[] = []

  function walk(nodes: CategoryAdminVO[], prefix = ''): void {
    nodes.forEach(node => {
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      options.push({ id: node.id, label })
      if (node.children?.length) {
        walk(node.children, label)
      }
    })
  }

  walk(categoryStore.categories)
  return options
})

/**
 * 编辑器模式（列表/新建/编辑）
 * 根据路由 query 参数判断当前模式
 */
const editorMode = computed<'list' | 'create' | 'edit'>(() => {
  if (route.query.mode === 'create') {
    return 'create'
  }

  if (route.query.mode === 'edit') {
    const articleId = Number(route.query.id)
    // 只有有效的正整数 ID 才视为编辑模式
    return Number.isInteger(articleId) && articleId > 0 ? 'edit' : 'list'
  }

  return 'list'
})

/**
 * 编辑模式下的文章 ID
 * 仅在 edit 模式下返回有效的文章 ID
 */
const editorArticleId = computed<number | null>(() => {
  if (editorMode.value !== 'edit') {
    return null
  }

  const articleId = Number(route.query.id)
  return Number.isInteger(articleId) && articleId > 0 ? articleId : null
})

/**
 * 根据访问级别返回对应的 Tag 类型
 * @param accessLevel - 访问级别 0=公开, 2=vip, 3=付费, 4=指定用户
 */
function getAccessTagType(accessLevel: number): 'success' | 'info' | 'warning' | 'danger' {
  if (accessLevel === 0) return 'success'
  if (accessLevel === 4) return 'warning'
  if (accessLevel === 2 || accessLevel === 3) return 'danger'
  return 'info'
}

function reviewTagType(status: number): 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<number, 'info' | 'warning' | 'success' | 'danger'> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] ?? 'info'
}

function reviewStatusLabel(status: number): string {
  const map: Record<number, string> = { 0: '未送审', 1: '审核中', 2: '已通过', 3: '已拒绝' }
  return map[status] ?? '-'
}

// ==================== 数据获取 ====================

/**
 * 获取文章列表
 */
async function fetchArticles(): Promise<void> {
  const [publishTimeStart, publishTimeEnd] = publishRange.value

  await articleStore.fetchArticles({
    ...searchForm,
    current: pagination.current,
    size: pagination.size,
    publishTimeStart: publishTimeStart || undefined,
    publishTimeEnd: publishTimeEnd || undefined,
  })
}

/**
 * 加载分类和标签数据
 */
async function loadDependencies(): Promise<void> {
  await Promise.all([categoryStore.fetchCategoryTree(), tagStore.fetchTags()])
}

// ==================== 搜索和重置 ====================

/**
 * 搜索文章 - 重置到第一页
 */
function handleSearch(): void {
  pagination.current = 1
  void fetchArticles()
}

/**
 * 重置搜索条件
 */
function handleReset(): void {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    keyword: undefined,
    authorId: undefined,
    status: undefined,
    reviewStatus: undefined,
    accessLevel: undefined,
    visibilityScope: undefined,
    categoryId: undefined,
    tagId: undefined,
    isTop: undefined,
    publishTimeStart: undefined,
    publishTimeEnd: undefined,
  })
  publishRange.value = []
  pagination.current = 1
  pagination.size = 10
  void fetchArticles()
}

// ==================== 分页操作 ====================

/**
 * 每页条数变更
 * @param size - 新的每页条数
 */
function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchArticles()
}

/**
 * 页码变更
 * @param current - 新的页码
 */
function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchArticles()
}

// ==================== 表格操作 ====================

async function handleViewDetail(row: ArticleAdminVO) {
  const detail = await articleStore.fetchArticleById(row.id)
  detailArticle.value = detail
  detailDialogVisible.value = true
}

/**
 * 新增文章 - 跳转到编辑模式
 */
function handleAdd(): void {
  void router.push({
    path: route.path,
    query: {
      mode: 'create',
    },
  })
}

/**
 * 编辑文章 - 跳转到编辑模式并传入文章 ID
 * @param row - 文章行数据
 */
function handleEdit(row: ArticleAdminVO): void {
  void router.push({
    path: route.path,
    query: {
      mode: 'edit',
      id: String(row.id),
    },
  })
}

/**
 * 配置访问名单 - 仅对指定用户可见的文章有效
 * @param row - 文章行数据
 */
function handleAccess(row: ArticleAdminVO): void {
  // 仅 accessLevel === 4 (指定用户可见) 的文章可以配置访问名单
  if (row.accessLevel !== 4) {
    ElMessage.warning('仅指定用户可见的文章支持配置访问名单')
    return
  }

  currentArticleId.value = row.id
  currentArticleTitle.value = row.title
  accessDialogVisible.value = true
}

/**
 * 更新文章发布状态
 * @param row - 文章行数据
 */
async function handleStatusChange(row: ArticleAdminVO): Promise<void> {
  // 保存当前状态用于回滚
  const previousStatus = row.status === 1 ? 0 : 1

  try {
    const success = await articleStore.updateArticleStatus(row.id, { status: row.status })
    if (!success) {
      throw new Error('status update failed')
    }
    ElMessage.success('文章状态更新成功')
  } catch {
    // 失败时回滚状态
    row.status = previousStatus
    ElMessage.error('文章状态更新失败')
  }
}

/**
 * 删除文章
 * @param row - 文章行数据
 */
async function handleDelete(row: ArticleAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除文章 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await articleStore.deleteArticle(row.id)
    if (!success) {
      throw new Error('delete failed')
    }

    ElMessage.success('文章删除成功')
    void fetchArticles()
  } catch {
    // 用户取消或删除失败，不做处理
  }
}

// ==================== 编辑器回调 ====================

/**
 * 返回列表模式
 */
function handleBackToList(): void {
  void router.replace({
    path: route.path,
  })
}

/**
 * 编辑器保存成功回调
 */
function handleEditorSuccess(): void {
  handleBackToList()
  void fetchArticles()
}

/**
 * 访问权限配置成功回调
 */
function handleAccessSuccess(): void {
  void fetchArticles()
}

function handleEditFromDetail(detail: ArticleDetailVO): void {
  detailDialogVisible.value = false
  handleEdit(detail)
}

onMounted(async () => {
  await loadDependencies()
  await fetchArticles()
})
</script>

<style scoped>
.article-management-page {
  padding: 0;
  max-width: 1600px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.expand-icon {
  transition: transform 0.3s;
  margin-left: 2px;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 0;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-item {
  margin-right: 16px;
}

.filter-item--range {
  margin-right: 0;
}

.filter-control {
  width: 220px;
}

.filter-control--range {
  width: 360px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.article-table {
  width: 100%;
}

.article-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.article-title-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.article-title-cell__text {
  word-break: break-word;
}

.article-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.article-summary__title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.article-summary__meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--el-text-color-regular);
}

.stats-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.article-summary__line {
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 8px;
}

.table-actions--compact {
  flex-direction: column;
  align-items: center;
}

.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: 768px) {
  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control,
  .filter-control--range {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
