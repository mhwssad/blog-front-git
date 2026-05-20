<template>
  <div class="forum-posts-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词" class="filter-item">
          <el-input
            v-model="searchForm.keyword"
            class="filter-control"
            clearable
            placeholder="请输入标题或内容"
          />
        </el-form-item>
        <el-form-item label="版块" class="filter-item">
          <el-select
            v-model="searchForm.sectionId"
            class="filter-control"
            clearable
            filterable
            placeholder="全部"
          >
            <el-option
              v-for="section in sectionOptions"
              :key="section.id"
              :label="section.name"
              :value="section.id"
            />
          </el-select>
        </el-form-item>
        <template v-if="searchExpanded">
          <el-form-item label="作者ID" class="filter-item">
            <el-input-number
              v-model="searchForm.authorId"
              :min="1"
              controls-position="right"
              class="filter-control"
            />
          </el-form-item>
          <el-form-item label="状态" class="filter-item">
            <el-select
              v-model="searchForm.status"
              class="filter-control"
              clearable
              placeholder="全部"
            >
              <el-option label="草稿" :value="0" />
              <el-option label="已发布" :value="1" />
              <el-option label="隐藏" :value="5" />
            </el-select>
          </el-form-item>
          <el-form-item label="置顶" class="filter-item">
            <el-select
              v-model="searchForm.isTop"
              class="filter-control"
              clearable
              placeholder="全部"
            >
              <el-option label="否" :value="0" />
              <el-option label="是" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="精华" class="filter-item">
            <el-select
              v-model="searchForm.isEssence"
              class="filter-control"
              clearable
              placeholder="全部"
            >
              <el-option label="否" :value="0" />
              <el-option label="是" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间" class="filter-item filter-item--range">
            <el-date-picker
              v-model="publishTimeRange"
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
          <el-button v-permission="'content:forum:query'" type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
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
      class="post-table"
      title="论坛帖子列表"
      :data="forumStore.posts"
      :loading="forumStore.postLoading"
      :total="forumStore.postTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #header-extra>
        <span class="header-count">{{ forumStore.postTotal }} 条</span>
        <el-button link type="primary" @click="handleRefresh">
          <el-icon><RefreshRight /></el-icon>
          刷新
        </el-button>
      </template>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="帖子信息" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cell-stack">
              <span>{{ row.title }}</span>
              <span class="cell-subtext">版块：{{ row.sectionName }} / #{{ row.sectionId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="作者" min-width="150" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cell-stack">
              <span>{{ row.authorName }}</span>
              <span class="cell-subtext">ID: {{ row.authorId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getPostStatusTagType(row.status)" effect="light" size="small">
              {{ row.statusName || getPostStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可见范围" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getVisibilityTagType(row.visibilityScope)" effect="light" size="small">
              {{ formatVisibility(row.visibilityScope) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标记" min-width="150" align="center">
          <template #default="{ row }">
            <div class="tag-group">
              <el-tag v-if="row.isTop === 1" type="warning" effect="light" size="small">
                置顶
              </el-tag>
              <el-tag v-if="row.isEssence === 1" type="success" effect="light" size="small">
                精华
              </el-tag>
              <span v-if="row.isTop !== 1 && row.isEssence !== 1" class="cell-subtext">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数据统计" min-width="220" align="center">
          <template #default="{ row }">
            <div class="stat-grid">
              <span>浏览 {{ row.viewCount }}</span>
              <span>点赞 {{ row.likeCount }}</span>
              <span>回复 {{ row.replyCount }}</span>
              <span>收藏 {{ row.collectCount }}</span>
              <span>分享 {{ row.shareCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ formatPublishTime(row.publishedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ formatCreatedAt(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ formatUpdatedAt(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          :min-width="isCompactTable ? 220 : 280"
          :fixed="isCompactTable ? false : 'right'"
          class-name="action-column"
          align="center"
        >
          <template #default="{ row }">
            <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
              <el-button
                v-permission="'content:forum:query'"
                link
                type="primary"
                @click="handleView(row)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status === 5"
                v-permission="'content:forum:update'"
                link
                type="success"
                @click="handleRestore(row)"
              >
                恢复
              </el-button>
              <el-button
                v-else-if="row.status === 1"
                v-permission="'content:forum:update'"
                link
                type="warning"
                @click="handleHide(row)"
              >
                隐藏
              </el-button>
              <el-button
                v-permission="'content:forum:update'"
                link
                :type="row.isTop === 1 ? 'warning' : 'primary'"
                @click="handleToggleTop(row)"
              >
                {{ row.isTop === 1 ? '取消置顶' : '置顶' }}
              </el-button>
              <el-button
                v-permission="'content:forum:update'"
                link
                :type="row.isEssence === 1 ? 'warning' : 'success'"
                @click="handleToggleEssence(row)"
              >
                {{ row.isEssence === 1 ? '取消精华' : '精华' }}
              </el-button>
              <el-button
                v-permission="'content:forum:delete'"
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

    <el-drawer v-model="detailVisible" title="帖子详情" size="640px" destroy-on-close>
      <el-skeleton v-if="detailLoading" animated :rows="8" />
      <template v-else-if="currentPost">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ currentPost.id }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ currentPost.title }}</el-descriptions-item>
          <el-descriptions-item label="版块">
            {{ currentPost.sectionName }} / #{{ currentPost.sectionId }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ currentPost.authorName }} / #{{ currentPost.authorId }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getPostStatusTagType(currentPost.status)" effect="light">
              {{ currentPost.statusName || getPostStatusText(currentPost.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可见范围">
            <el-tag :type="getVisibilityTagType(currentPost.visibilityScope)" effect="light">
              {{ formatVisibility(currentPost.visibilityScope) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标记">
            <div class="tag-group">
              <el-tag v-if="currentPost.isTop === 1" type="warning" effect="light" size="small">
                置顶
              </el-tag>
              <el-tag
                v-if="currentPost.isEssence === 1"
                type="success"
                effect="light"
                size="small"
              >
                精华
              </el-tag>
              <span v-if="currentPost.isTop !== 1 && currentPost.isEssence !== 1">-</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ formatPublishTime(currentPost.publishedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatCreatedAt(currentPost.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatUpdatedAt(currentPost.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <div class="detail-section__title">正文内容</div>
          <div class="detail-content">{{ currentPost.content || '-' }}</div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, RefreshRight, Search } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { useForumAdminStore } from '@/stores'
import type {
  ForumPostAdminVO,
  ForumPostAdminQueryRequest,
  ForumSectionVO,
} from '@/types/api-types'
import { formatCreatedAt, formatPublishTime, formatUpdatedAt, formatVisibility } from '@/utils'

const forumStore = useForumAdminStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const searchForm = reactive<ForumPostAdminQueryRequest>({
  keyword: undefined,
  sectionId: undefined,
  authorId: undefined,
  status: undefined,
  isTop: undefined,
  isEssence: undefined,
  createdAtStart: undefined,
  createdAtEnd: undefined,
})

const { pagination, fetch: fetchPosts, handleSearch, handleSizeChange, handleCurrentChange } = useAdminPagination({
  fetchFn: forumStore.fetchPosts,
  buildParams: () => {
    const [createdAtStart, createdAtEnd] = publishTimeRange.value
    return {
      keyword: searchForm.keyword?.trim() || undefined,
      sectionId: searchForm.sectionId,
      authorId: searchForm.authorId,
      status: searchForm.status,
      isTop: searchForm.isTop,
      isEssence: searchForm.isEssence,
      createdAtStart: createdAtStart || undefined,
      createdAtEnd: createdAtEnd || undefined,
    }
  },
  persistSizeKey: 'forum-posts-page-size',
})

const publishTimeRange = ref<[string, string] | []>([])
const searchExpanded = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)

const currentPost = computed(() => forumStore.currentPost)
const sectionOptions = computed<ForumSectionVO[]>(() => forumStore.sections)

function getPostStatusText(value?: number): string {
  switch (value) {
    case 0:
      return '草稿'
    case 5:
      return '隐藏'
    default:
      return '已发布'
  }
}

function getPostStatusTagType(value?: number): 'success' | 'warning' | 'danger' | 'info' {
  switch (value) {
    case 0:
      return 'info'
    case 5:
      return 'danger'
    default:
      return 'success'
  }
}

function getVisibilityTagType(value?: number): 'success' | 'info' {
  return value === 1 ? 'success' : 'info'
}

async function fetchSections(): Promise<void> {
  await forumStore.fetchSections({ current: 1, size: 1000 })
}

function handleReset(): void {
  Object.assign(searchForm, {
    keyword: undefined,
    sectionId: undefined,
    authorId: undefined,
    status: undefined,
    isTop: undefined,
    isEssence: undefined,
    createdAtStart: undefined,
    createdAtEnd: undefined,
  })
  publishTimeRange.value = []
  void fetchPosts()
}

async function handleRefresh(): Promise<void> {
  await Promise.all([fetchSections(), fetchPosts()])
}

async function handleView(row: ForumPostAdminVO): Promise<void> {
  detailLoading.value = true
  detailVisible.value = true
  try {
    const detail = await forumStore.fetchPostById(row.id)
    if (!detail) {
      ElMessage.error('获取帖子详情失败')
      detailVisible.value = false
      return
    }
  } finally {
    detailLoading.value = false
  }
}

async function updatePostAndRefresh(
  action: () => Promise<boolean>,
  successText: string,
  failureText: string,
): Promise<boolean> {
  const success = await action()
  if (!success) {
    ElMessage.error(failureText)
    return false
  }

  ElMessage.success(successText)
  await fetchPosts()
  if (detailVisible.value && currentPost.value) {
    void forumStore.fetchPostById(currentPost.value.id)
  }

  return true
}

async function handleHide(row: ForumPostAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要隐藏帖子「${row.title}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await updatePostAndRefresh(() => forumStore.hidePost(row.id), '帖子已隐藏', '帖子隐藏失败')
  } catch {
    // cancelled or failed
  }
}

async function handleRestore(row: ForumPostAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要恢复帖子「${row.title}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await updatePostAndRefresh(() => forumStore.restorePost(row.id), '帖子已恢复', '帖子恢复失败')
  } catch {
    // cancelled or failed
  }
}

async function handleToggleTop(row: ForumPostAdminVO): Promise<void> {
  await updatePostAndRefresh(
    () => forumStore.togglePostTop(row.id, row.isTop !== 1),
    row.isTop === 1 ? '已取消置顶' : '已置顶',
    row.isTop === 1 ? '取消置顶失败' : '置顶失败',
  )
}

async function handleToggleEssence(row: ForumPostAdminVO): Promise<void> {
  await updatePostAndRefresh(
    () => forumStore.togglePostEssence(row.id, row.isEssence !== 1),
    row.isEssence === 1 ? '已取消精华' : '已设为精华',
    row.isEssence === 1 ? '取消精华失败' : '设置精华失败',
  )
}

async function handleDelete(row: ForumPostAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除帖子「${row.title}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await updatePostAndRefresh(() => forumStore.deletePost(row.id), '帖子删除成功', '帖子删除失败')
  } catch {
    // cancelled or failed
  }
}

onMounted(() => {
  void fetchSections()
})
</script>

<style scoped>
.forum-posts-page {
  padding: 0;
  max-width: 1680px;
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

.expand-icon {
  transition: transform 0.3s;
  margin-left: 2px;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.header-count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.post-table {
  width: 100%;
}

.post-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.post-table :deep(.action-column) {
  border-left: 2px solid var(--el-border-color);
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

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-subtext {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.2;
}

.tag-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 8px;
  justify-items: center;
}

.detail-section {
  margin-top: 20px;
}

.detail-section__title {
  margin-bottom: 10px;
  font-weight: 500;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
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
