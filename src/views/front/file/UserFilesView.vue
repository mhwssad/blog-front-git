<template>
  <div class="user-files-page">
    <div class="page-header">
      <h1 class="page-title">我的文件</h1>
      <el-button type="primary" @click="uploadVisible = true">上传文件</el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索文件名"
        clearable
        size="small"
        style="width: 200px"
        @clear="loadFiles"
        @keyup.enter="loadFiles"
      />
      <el-button size="small" @click="loadFiles">搜索</el-button>
    </div>

    <div v-if="store.loading" class="loading-area">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else-if="store.files.length">
      <el-table :data="store.files" stripe>
        <el-table-column prop="originalName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="fileSize" label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            {{ row.category ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" type="primary" @click="copyUrl(row.fileUrl)">
              复制链接
            </el-button>
            <el-button link size="small" type="danger" @click="handleDelete(row.businessId)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="store.fileTotal > store.fileSize" class="pagination-area">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="store.fileSize"
          :total="store.fileTotal"
          layout="prev, pager, next"
          @current-change="loadFiles"
        />
      </div>
    </template>

    <el-empty v-else description="暂无文件" />

    <FileUploadDialog v-model:visible="uploadVisible" @success="handleUploadSuccess" />
  </div>
</template>

<script lang="ts" setup>
/**
 * 我的文件页面
 * @description 展示用户上传的文件列表，支持搜索、上传、删除和链接复制
 * @module front/file/UserFilesView
 * @see ../../api/user/file.ts
 */
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserFileStore } from '@/stores'
import FileUploadDialog from './components/FileUploadDialog.vue'

const store = useUserFileStore()

// 搜索关键词
const keyword = ref('')
const currentPage = ref(1)
// 上传弹窗是否显示
const uploadVisible = ref(false)

async function loadFiles(): Promise<void> {
  await store.fetchFiles({
    current: currentPage.value,
    size: store.fileSize,
    keyword: keyword.value || undefined,
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function copyUrl(url: string): void {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('已复制链接')
  })
}

async function handleDelete(businessId: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定删除该文件？', '提示', { type: 'warning' })
    const success = await store.deleteFile(businessId)
    if (success) {
      ElMessage.success('已删除')
      await loadFiles()
    }
  } catch {
    // cancelled
  }
}

async function handleUploadSuccess(): Promise<void> {
  uploadVisible.value = false
  currentPage.value = 1
  await loadFiles()
}

onMounted(loadFiles)
</script>

<style scoped>
.user-files-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.loading-area {
  padding: 16px 0;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
