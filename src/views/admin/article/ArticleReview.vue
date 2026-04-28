<template>
  <div class="article-review-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 160px">
            <el-option label="待审核" value="pending" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
        <el-table-column prop="title" label="标题" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" min-width="120" align="center" />
        <el-table-column prop="category" label="分类" min-width="100" align="center" />
        <el-table-column prop="submitTime" label="提交时间" min-width="180" align="center" />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" link type="primary" @click="handleReview(row)">
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
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题" :span="2">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentRow.author }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentRow.category }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <el-tag v-for="tag in currentRow.tags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ currentRow.submitTime }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 16px">
        <div style="font-weight: 500; margin-bottom: 8px">内容预览</div>
        <div class="content-preview">{{ currentRow.content }}</div>
      </div>
      <div v-if="isReviewMode" style="margin-top: 16px">
        <el-form-item label="审核意见">
          <el-input
            v-model="reviewOpinion"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <template v-if="isReviewMode">
          <el-button type="danger" @click="handleRejectArticle">拒绝</el-button>
          <el-button type="success" @click="handleApproveArticle">通过</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface ArticleReview {
  id: number
  title: string
  author: string
  category: string
  tags: string[]
  submitTime: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  content: string
}

const query = reactive({
  status: '' as string,
  dateRange: null as [string, string] | null,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<ArticleReview[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const isReviewMode = ref(false)
const currentRow = ref<ArticleReview>({} as ArticleReview)
const reviewOpinion = ref('')

function statusTagType(status: string): 'info' | 'warning' | 'success' | 'danger' | 'primary' {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'primary'> = {
    pending: 'warning',
    reviewing: 'primary',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return map[status] || status
}

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: 'Vue 3 Composition API 最佳实践', author: '张三', category: '前端', tags: ['Vue', 'TypeScript'], submitTime: '2026-04-20 10:00:00', status: 'pending', content: '本文将介绍 Vue 3 Composition API 的核心概念和最佳实践...' },
      { id: 2, title: 'Spring Boot 微服务架构设计', author: '李四', category: '后端', tags: ['Java', 'Spring'], submitTime: '2026-04-19 15:30:00', status: 'reviewing', content: '微服务架构是一种将应用程序构建为一套小型服务的方法...' },
      { id: 3, title: 'CSS Grid 布局完全指南', author: '王五', category: '前端', tags: ['CSS', '布局'], submitTime: '2026-04-18 09:20:00', status: 'approved', content: 'CSS Grid 是一种强大的二维布局系统...' },
      { id: 4, title: 'Docker 容器化部署实战', author: '赵六', category: '运维', tags: ['Docker', 'DevOps'], submitTime: '2026-04-17 14:10:00', status: 'rejected', content: '本文将带你从零开始学习 Docker 容器化部署...' },
      { id: 5, title: 'React 19 新特性解析', author: '孙七', category: '前端', tags: ['React'], submitTime: '2026-04-16 11:45:00', status: 'pending', content: 'React 19 带来了许多令人兴奋的新特性...' },
    ]
    pagination.total = 5
    loading.value = false
  }, 300)
}

function handleReset() {
  query.status = ''
  query.dateRange = null
  pagination.current = 1
  handleQuery()
}

function handleReview(row: ArticleReview) {
  currentRow.value = { ...row }
  isReviewMode.value = true
  reviewOpinion.value = ''
  detailVisible.value = true
}

function handleView(row: ArticleReview) {
  currentRow.value = { ...row }
  isReviewMode.value = false
  detailVisible.value = true
}

function handleApproveArticle() {
  const target = tableData.value.find((item) => item.id === currentRow.value.id)
  if (target) {
    target.status = 'approved'
  }
  detailVisible.value = false
  ElMessage.success('审核通过')
}

function handleRejectArticle() {
  const target = tableData.value.find((item) => item.id === currentRow.value.id)
  if (target) {
    target.status = 'rejected'
  }
  detailVisible.value = false
  ElMessage.success('已拒绝')
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
