<template>
  <div class="article-review-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="审核状态">
          <el-select
            v-model="query.reviewStatus"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option label="待审核" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>文章审核列表</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" min-width="120" align="center" />
        <el-table-column label="审核状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="reviewStatusTagType(row.reviewStatus)">
              {{ reviewStatusLabel(row.reviewStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="180" align="center" />
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.reviewStatus === 1"
              link
              type="primary"
              @click="handleReview(row)"
            >
              审核
            </el-button>
            <el-button v-else link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" :title="isReviewMode ? '文章审核' : '文章详情'" width="700px">
      <div v-loading="detailLoading">
        <el-descriptions v-if="detailData" :column="2" border>
          <el-descriptions-item label="标题" :span="2">
            {{ detailData.article.title }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ detailData.article.authorName }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="reviewStatusTagType(detailData.article.reviewStatus)">
              {{ reviewStatusLabel(detailData.article.reviewStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间" :span="2">
            {{ detailData.article.createdAt }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="detailData?.article.content" style="margin-top: 16px">
          <div style="font-weight: 500; margin-bottom: 8px">内容预览</div>
          <div class="content-preview">{{ detailData.article.content }}</div>
        </div>

        <div v-if="detailData?.reviewLogs?.length" style="margin-top: 16px">
          <div style="font-weight: 500; margin-bottom: 8px">审核记录</div>
          <el-timeline>
            <el-timeline-item
              v-for="log in detailData.reviewLogs"
              :key="log.id"
              :timestamp="log.operatedAt"
              placement="top"
            >
              <div>
                <span>{{ log.operatorNickname || log.operatorUsername }}</span>
                <span style="margin: 0 8px">{{ log.actionTypeLabel }}</span>
                <span style="color: var(--el-text-color-secondary)">
                  {{ log.fromReviewStatusLabel }} -> {{ log.toReviewStatusLabel }}
                </span>
              </div>
              <div v-if="log.reviewComment" style="color: var(--el-text-color-secondary); margin-top: 4px">
                {{ log.reviewComment }}
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <div v-if="isReviewMode" style="margin-top: 16px">
        <el-form-item label="审核意见">
          <el-input
            v-model="reviewComment"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <template v-if="isReviewMode">
          <el-button type="danger" :loading="actionLoading" @click="handleRejectArticle">
            拒绝
          </el-button>
          <el-button type="success" :loading="actionLoading" @click="handleApproveArticle">
            通过
          </el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArticleApi } from '@/api/sys/article'
import type {
  ArticleAdminVO,
  ArticleReviewAdminDetailVO,
} from '@/types/api-types'

const query = reactive({
  reviewStatus: undefined as number | undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<ArticleAdminVO[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const isReviewMode = ref(false)
const detailData = ref<ArticleReviewAdminDetailVO | null>(null)
const reviewComment = ref('')
const actionLoading = ref(false)

function reviewStatusTagType(
  status: number,
): 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return map[status] ?? 'info'
}

function reviewStatusLabel(status: number): string {
  const map: Record<number, string> = {
    0: '草稿',
    1: '待审核',
    2: '已通过',
    3: '已拒绝',
  }
  return map[status] ?? '未知'
}

async function handleQuery(): Promise<void> {
  loading.value = true
  try {
    const response = await ArticleApi.getArticleReviews({
      current: pagination.current,
      size: pagination.size,
      reviewStatus: query.reviewStatus,
    })
    const page = response.data.data
    tableData.value = page.records
    pagination.total = page.total
  } catch {
    ElMessage.error('查询审核列表失败')
  } finally {
    loading.value = false
  }
}

function handleReset(): void {
  query.reviewStatus = undefined
  pagination.current = 1
  handleQuery()
}

async function loadDetail(id: number): Promise<void> {
  detailLoading.value = true
  try {
    const response = await ArticleApi.getArticleReviewDetail(id)
    detailData.value = response.data.data
  } catch {
    ElMessage.error('加载审核详情失败')
    detailData.value = null
  } finally {
    detailLoading.value = false
  }
}

function handleReview(row: ArticleAdminVO): void {
  isReviewMode.value = true
  reviewComment.value = ''
  detailVisible.value = true
  loadDetail(row.id)
}

function handleView(row: ArticleAdminVO): void {
  isReviewMode.value = false
  detailVisible.value = true
  loadDetail(row.id)
}

async function handleApproveArticle(): Promise<void> {
  if (!detailData.value) return
  actionLoading.value = true
  try {
    await ArticleApi.approveArticleReview(detailData.value.article.id, {
      reviewComment: reviewComment.value || undefined,
    })
    ElMessage.success('审核通过')
    detailVisible.value = false
    handleQuery()
  } catch {
    ElMessage.error('审核操作失败')
  } finally {
    actionLoading.value = false
  }
}

async function handleRejectArticle(): Promise<void> {
  if (!detailData.value) return
  actionLoading.value = true
  try {
    await ArticleApi.rejectArticleReview(detailData.value.article.id, {
      reviewComment: reviewComment.value || undefined,
    })
    ElMessage.success('已拒绝')
    detailVisible.value = false
    handleQuery()
  } catch {
    ElMessage.error('审核操作失败')
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.article-review-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.content-preview {
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}
</style>
