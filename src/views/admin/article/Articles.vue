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
            />
          </el-form-item>
          <el-form-item label="作者 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.authorId"
              :min="1"
              class="filter-control"
              controls-position="right"
              placeholder="请输入作者 ID"
            />
          </el-form-item>
          <el-form-item label="状态" class="filter-item">
            <el-select v-model="searchForm.status" class="filter-control" clearable placeholder="请选择状态">
              <el-option
                v-for="option in ARTICLE_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态" class="filter-item">
            <el-select v-model="searchForm.reviewStatus" class="filter-control" clearable placeholder="请选择审核状态">
              <el-option label="待审核" :value="1" />
              <el-option label="已通过" :value="2" />
              <el-option label="已拒绝" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="可见范围" class="filter-item">
            <el-select v-model="searchForm.visibilityScope" class="filter-control" clearable placeholder="请选择可见范围">
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
            <el-select v-model="searchForm.categoryId" class="filter-control" clearable placeholder="请选择分类">
              <el-option
                v-for="category in flattenedCategories"
                :key="category.id"
                :label="category.label"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="标签" class="filter-item">
            <el-select v-model="searchForm.tagId" class="filter-control" clearable placeholder="请选择标签">
              <el-option v-for="tag in tagStore.tags" :key="tag.id" :label="tag.name" :value="tag.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否置顶" class="filter-item">
            <el-select v-model="searchForm.isTop" class="filter-control" clearable placeholder="请选择置顶状态">
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
          <el-form-item class="search-actions">
            <el-button v-permission="'content:article:query'" type="primary" @click="handleSearch">
              查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="table-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>文章列表</span>
            <el-button v-permission="'content:article:create'" type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增文章
            </el-button>
          </div>
        </template>

          <el-table
            v-loading="articleStore.loading"
            :data="articleStore.articles"
            :size="isCompactTable ? 'small' : 'default'"
            table-layout="auto"
            class="article-table"
            border
            stripe
          >
          <el-table-column v-if="isCompactTable" label="文章信息" min-width="360" align="center">
            <template #default="{ row }">
              <div class="article-summary">
                <div class="article-summary__title">{{ row.title }}</div>
                <div class="article-summary__meta">
                  <span>作者：{{ row.authorName || '-' }}</span>
                  <span>状态：{{ formatArticleStatus(row.status) }}</span>
                  <span>访问：{{ formatAccessLevel(row.accessLevel) }}</span>
                </div>
                <div class="article-summary__line">发布时间：{{ formatPublishTime(row.publishTime) }}</div>
                <div class="article-summary__line">更新时间：{{ formatUpdatedAt(row.updatedAt) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="!isCompactTable"
            prop="title"
            label="标题"
            min-width="260"
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
            min-width="120"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column v-if="!isCompactTable" label="状态" min-width="140" align="center">
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
          <el-table-column v-if="!isCompactTable" label="访问级别" min-width="130" align="center">
            <template #default="{ row }">
              <el-tag :type="getAccessTagType(row.accessLevel)" effect="light">
                {{ formatAccessLevel(row.accessLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="可见范围" min-width="100" align="center">
            <template #default="{ row }">
              {{ formatVisibility(row.visibilityScope) }}
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="原创" min-width="92" align="center">
            <template #default="{ row }">
              {{ formatBooleanText(row.isOriginal) }}
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="浏览" min-width="88" align="center">
            <template #default="{ row }">{{ row.viewCount ?? 0 }}</template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="点赞" min-width="88" align="center">
            <template #default="{ row }">{{ row.likeCount ?? 0 }}</template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="评论" min-width="88" align="center">
            <template #default="{ row }">{{ row.commentCount ?? 0 }}</template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="收藏" min-width="88" align="center">
            <template #default="{ row }">{{ row.collectCount ?? 0 }}</template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="分享" min-width="88" align="center">
            <template #default="{ row }">{{ row.shareCount ?? 0 }}</template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="发布时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatPublishTime(row.publishTime) }}
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="更新时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatUpdatedAt(row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="!isCompactTable"
            prop="remark"
            label="备注"
            min-width="200"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ formatOptionalText(row.remark) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :min-width="isCompactTable ? 180 : 220"
            :fixed="isCompactTable ? false : 'right'"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button v-permission="'content:article:update'" link type="primary" @click="handleEdit(row)">
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
                <el-button v-permission="'content:article:delete'" link type="danger" @click="handleDelete(row)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
          </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="articleStore.total"
            :page-sizes="[10, 20, 50, 100]"
            :layout="paginationLayout"
            :small="isCompactTable"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </template>

    <ArticleAccessDialog
      v-model:visible="accessDialogVisible"
      :article-id="currentArticleId"
      :article-title="currentArticleTitle"
      @success="handleAccessSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { ArticleAdminVO, ArticleQueryRequest, CategoryAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useArticleStore, useCategoryStore, useTagStore } from '@/stores'
import {
  ACCESS_LEVEL_OPTIONS,
  ARTICLE_STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
  formatAccessLevel,
  formatArticleStatus,
  formatBooleanText,
  formatOptionalText,
  formatPublishTime,
  formatVisibility,
  formatUpdatedAt,
} from '@/utils'
import ArticleAccessDialog from './components/ArticleAccessDialog.vue'
import ArticleEditorPage from './components/ArticleEditorPage.vue'

interface CategorySelectOption {
  id: number
  label: string
}

const articleStore = useArticleStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const route = useRoute()
const router = useRouter()

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

const pagination = reactive({
  current: 1,
  size: 10,
})

const publishRange = ref<[string, string] | []>([])
const accessDialogVisible = ref(false)
const currentArticleId = ref(0)
const currentArticleTitle = ref('')

const { isCompactTable, paginationLayout } = useContentAdmin()

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

const editorMode = computed<'list' | 'create' | 'edit'>(() => {
  if (route.query.mode === 'create') {
    return 'create'
  }

  if (route.query.mode === 'edit') {
    const articleId = Number(route.query.id)
    return Number.isInteger(articleId) && articleId > 0 ? 'edit' : 'list'
  }

  return 'list'
})

const editorArticleId = computed<number | null>(() => {
  if (editorMode.value !== 'edit') {
    return null
  }

  const articleId = Number(route.query.id)
  return Number.isInteger(articleId) && articleId > 0 ? articleId : null
})

function getAccessTagType(accessLevel: number): 'success' | 'info' | 'warning' | 'danger' {
  if (accessLevel === 0) {
    return 'success'
  }
  if (accessLevel === 4) {
    return 'warning'
  }
  if (accessLevel === 2 || accessLevel === 3) {
    return 'danger'
  }
  return 'info'
}

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

async function loadDependencies(): Promise<void> {
  await Promise.all([categoryStore.fetchCategoryTree(), tagStore.fetchTags()])
}

function handleSearch(): void {
  pagination.current = 1
  void fetchArticles()
}

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

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchArticles()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchArticles()
}

function handleAdd(): void {
  void router.push({
    path: route.path,
    query: {
      mode: 'create',
    },
  })
}

function handleEdit(row: ArticleAdminVO): void {
  void router.push({
    path: route.path,
    query: {
      mode: 'edit',
      id: String(row.id),
    },
  })
}

function handleAccess(row: ArticleAdminVO): void {
  if (row.accessLevel !== 4) {
    ElMessage.warning('仅指定用户可见的文章支持配置访问名单')
    return
  }

  currentArticleId.value = row.id
  currentArticleTitle.value = row.title
  accessDialogVisible.value = true
}

async function handleStatusChange(row: ArticleAdminVO): Promise<void> {
  const previousStatus = row.status === 1 ? 0 : 1

  try {
    const success = await articleStore.updateArticleStatus(row.id, { status: row.status })
    if (!success) {
      throw new Error('status update failed')
    }
    ElMessage.success('文章状态更新成功')
  } catch {
    row.status = previousStatus
    ElMessage.error('文章状态更新失败')
  }
}

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
    // 用户取消或删除失败
  }
}

function handleBackToList(): void {
  void router.replace({
    path: route.path,
  })
}

function handleEditorSuccess(): void {
  handleBackToList()
  void fetchArticles()
}

function handleAccessSuccess(): void {
  void fetchArticles()
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-weight: 500;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
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
