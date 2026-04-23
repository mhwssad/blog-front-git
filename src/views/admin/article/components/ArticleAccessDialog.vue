<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`访问名单 - ${articleTitle || '文章'}`"
    width="820px"
    class="article-access-dialog"
    :close-on-click-modal="false"
    align-center
    center
    @closed="handleClosed"
  >
    <div v-loading="loading">
      <div class="access-toolbar">
        <el-button type="primary" plain @click="handleAddRow">新增名单项</el-button>
        <el-alert
          type="info"
          :closable="false"
          title="仅对 accessLevel=4 的文章生效。accessType: 1 白名单，2 黑名单。"
        />
      </div>

      <el-table :data="formData.accessList" border stripe table-layout="auto" class="access-table">
        <el-table-column label="用户 ID" min-width="140" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.userId" :min="1" controls-position="right" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="名单类型" min-width="140" align="center">
          <template #default="{ row }">
            <el-select v-model="row.accessType" style="width: 100%">
              <el-option
                v-for="option in ACCESS_TYPE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" min-width="220" align="center">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.expireTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="长期有效"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="授权原因" min-width="220" align="center">
          <template #default="{ row }">
            <el-input v-model="row.grantReason" maxlength="256" placeholder="请输入授权原因" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="110" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" @click="handleRemoveRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-permission="'content:article:access'" type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ArticleAccessItem, ArticleAccessSaveRequest } from '@/api/types'
import { articleApi } from '@/api/sys/article'
import { ACCESS_TYPE_OPTIONS } from '@/utils'

interface Props {
  visible: boolean
  articleId: number
  articleTitle: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const formData = reactive<ArticleAccessSaveRequest>({
  accessList: [],
})

function createRow(): ArticleAccessItem {
  return {
    userId: 1,
    accessType: 1,
    expireTime: null,
    grantReason: '',
  }
}

function resetForm(): void {
  formData.accessList = []
}

async function loadAccessList(): Promise<void> {
  if (!props.articleId) {
    return
  }

  loading.value = true
  try {
    const response = await articleApi.getArticleById(props.articleId)
    const detail = response.data.data
    formData.accessList = (detail.accessList ?? []).map(item => ({
      userId: item.userId,
      accessType: item.accessType,
      expireTime: item.expireTime ?? null,
      grantReason: item.grantReason ?? '',
    }))
  } catch {
    ElMessage.error('获取访问名单失败')
  } finally {
    loading.value = false
  }
}

function handleAddRow(): void {
  formData.accessList.push(createRow())
}

function handleRemoveRow(index: number): void {
  formData.accessList.splice(index, 1)
}

async function handleSubmit(): Promise<void> {
  const invalidRow = formData.accessList.some(item => !item.userId || !item.accessType)
  if (invalidRow) {
    ElMessage.warning('请完善名单项中的用户 ID 和名单类型')
    return
  }

  submitting.value = true
  try {
    await articleApi.updateArticleAccess(props.articleId, {
      accessList: formData.accessList.map(item => ({
        userId: Number(item.userId),
        accessType: Number(item.accessType),
        expireTime: item.expireTime || null,
        grantReason: item.grantReason?.trim() || null,
      })),
    })
    ElMessage.success('访问名单保存成功')
    emit('success')
    dialogVisible.value = false
  } catch {
    ElMessage.error('访问名单保存失败')
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => props.visible,
  async visible => {
    if (!visible) {
      return
    }

    resetForm()
    await loadAccessList()
  },
  { immediate: true }
)
</script>

<style scoped>
.access-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.access-table {
  width: 100%;
}

:deep(.article-access-dialog) {
  max-width: calc(100vw - 32px);
  margin: 0 auto;
}

:deep(.article-access-dialog .el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  :deep(.article-access-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
