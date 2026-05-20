<template>
  <div class="series-page">
    <div class="page-header">
      <h1 class="page-title">我的系列</h1>
      <el-button type="primary" @click="openCreateDialog">创建系列</el-button>
    </div>

    <div v-loading="store.seriesLoading">
      <template v-if="store.seriesList.length">
        <el-row :gutter="20">
          <el-col v-for="item in store.seriesList" :key="item.id" :span="8">
            <div class="series-card" @click="goDetail(item.id)">
              <div class="series-cover">
                <el-image
                  v-if="item.coverImage"
                  :src="item.coverImage"
                  fit="cover"
                  class="cover-img"
                />
                <el-icon v-else :size="40" color="#ccc"><Picture /></el-icon>
              </div>
              <div class="series-info">
                <div class="series-name">{{ item.title }}</div>
                <div class="series-desc" v-if="item.description">
                  {{ item.description }}
                </div>
                <div class="series-meta">
                  <span>{{ item.articleCount }} 篇文章</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </template>
      <el-empty v-else description="暂无系列" />
    </div>

    <el-dialog v-model="dialogVisible" title="创建系列" width="480" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="系列名称" prop="title">
          <el-input v-model="dialogForm.title" placeholder="请输入系列名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dialogForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入系列描述（选填）"
          />
        </el-form-item>
        <el-form-item label="封面" prop="coverImage">
          <el-input v-model="dialogForm.coverImage" placeholder="请输入封面图片 URL（选填）" />
        </el-form-item>
        <el-form-item label="可见性" prop="visibilityScope">
          <el-select v-model="dialogForm.visibilityScope" placeholder="请选择可见范围">
            <el-option label="公开" :value="0" />
            <el-option label="仅自己" :value="1" />
            <el-option label="登录可见" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="store.actionLoading" @click="handleCreate">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
/**
 * 我的系列页面
 * @description 展示用户创建的所有文章系列，支持创建新系列
 * @module front/series/SeriesList
 * @see ../../api/content.ts
 */
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserContentStore } from '@/stores'
import type { ArticleSeriesSaveRequest } from '@/types/api-types'

const router = useRouter()
const store = useUserContentStore()

// 创建系列弹窗是否显示
const dialogVisible = ref(false)
const dialogFormRef = ref<FormInstance>()

// 创建系列的表单数据
const dialogForm = reactive<ArticleSeriesSaveRequest>({
  title: '',
  description: '',
  coverImage: '',
  visibilityScope: 0,
})

// 表单验证规则：系列名称必填
const dialogRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入系列名称', trigger: 'blur' }],
})

// 打开创建系列弹窗（重置表单）
function openCreateDialog(): void {
  dialogForm.title = ''
  dialogForm.description = ''
  dialogForm.coverImage = ''
  dialogForm.visibilityScope = 0
  dialogVisible.value = true
}

/** 确认创建系列 */
async function handleCreate(): Promise<void> {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const success = await store.createSeries(dialogForm)
  if (success) {
    ElMessage.success('系列创建成功')
    dialogVisible.value = false
    await store.fetchMySeriesList()
  } else {
    ElMessage.error('创建失败，请重试')
  }
}

function goDetail(id: number): void {
  router.push(`/series/${id}`)
}

onMounted(() => {
  store.fetchMySeriesList()
})
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
  background: var(--color-bg-base);
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
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
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

.series-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
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
