<template>
  <div class="series-page">
    <div class="page-header">
      <h1 class="page-title">我的系列</h1>
      <el-button type="primary" @click="openCreateDialog">创建系列</el-button>
    </div>

    <template v-if="seriesList.length">
      <el-row :gutter="20">
        <el-col v-for="item in seriesList" :key="item.id" :span="8">
          <div class="series-card" @click="goDetail(item.id)">
            <div class="series-cover">
              <el-icon :size="40" color="#ccc"><Picture /></el-icon>
            </div>
            <div class="series-info">
              <div class="series-name">{{ item.name }}</div>
              <div class="series-meta">
                <span>{{ item.articleCount }} 篇文章</span>
                <span>{{ item.totalRead }} 阅读</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </template>
    <el-empty v-else description="暂无系列" />

    <el-dialog v-model="dialogVisible" title="创建系列" width="480" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="系列名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入系列名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dialogForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入系列描述（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface SeriesItem {
  id: number
  name: string
  description: string
  articleCount: number
  totalRead: number
}

const router = useRouter()

const seriesList = ref<SeriesItem[]>([])
const dialogVisible = ref(false)
const dialogFormRef = ref<FormInstance>()

const dialogForm = reactive({
  name: '',
  description: '',
})

const dialogRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入系列名称', trigger: 'blur' }],
})

function loadSeries(): void {
  seriesList.value = []
}

function openCreateDialog(): void {
  dialogForm.name = ''
  dialogForm.description = ''
  dialogVisible.value = true
}

async function handleCreate(): Promise<void> {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  ElMessage.success('系列创建成功')
  dialogVisible.value = false
}

function goDetail(id: number): void {
  router.push(`/series/${id}`)
}

onMounted(loadSeries)
</script>

<style scoped>
.series-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.series-card {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.series-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.series-cover {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
}

.series-info {
  padding: 12px 16px;
}

.series-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.series-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
