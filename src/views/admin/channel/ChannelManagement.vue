<template>
  <div class="channel-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="频道名" class="filter-item">
          <el-input
            v-model="searchForm.keyword"
            class="filter-control"
            clearable
            placeholder="请输入频道名称"
          />
        </el-form-item>
        <el-form-item label="会话类型" class="filter-item">
          <el-select
            v-model="searchForm.conversationType"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option
              v-for="option in CHAT_CONVERSATION_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="群主ID" class="filter-item">
          <el-input-number
            v-model="searchForm.ownerId"
            class="filter-control"
            :min="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="成员ID" class="filter-item">
          <el-input-number
            v-model="searchForm.memberUserId"
            class="filter-control"
            :min="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="全站" class="filter-item">
          <el-select
            v-model="searchForm.isAllSite"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option
              v-for="option in BOOLEAN_TEXT_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      </el-card>

    <DataTable
      :data="chatStore.conversations"
      :loading="chatStore.conversationLoading"
      :total="chatStore.conversationTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      title="频道列表"
      :compact="isCompactTable"
      @page-change="fetchList"
      @size-change="() => { pagination.current = 1; fetchList() }"
    >
      <template #header-extra>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增主题频道
        </el-button>
      </template>

      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="频道信息" min-width="240" align="center">
        <template #default="{ row }">
          <div class="channel-info">
            <el-avatar :size="36" :src="row.avatar || undefined">
              {{ row.name?.slice(0, 1) || 'C' }}
            </el-avatar>
            <div class="channel-info__text">
              <div class="channel-info__name">{{ row.name || '未命名频道' }}</div>
              <div class="channel-info__sub">
                {{ formatOptionalText(row.notice) }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="会话类型" min-width="100" align="center">
        <template #default="{ row }">
          {{ formatChatConversationType(row.conversationType) }}
        </template>
      </el-table-column>
      <el-table-column label="场景类型" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getSceneTagType(row.sceneType)" effect="light">
            {{ formatSceneType(row.sceneType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="memberCount" label="成员数" min-width="90" align="center" />
      <el-table-column label="可见范围" min-width="100" align="center">
        <template #default="{ row }">
          {{ formatVisibilityScope(row.visibilityScope) }}
        </template>
      </el-table-column>
      <el-table-column label="加入规则" min-width="100" align="center">
        <template #default="{ row }">
          {{ formatJoinRule(row.joinRule) }}
        </template>
      </el-table-column>
      <el-table-column label="发言等级" min-width="90" align="center">
        <template #default="{ row }">
          {{ row.speakLevelLimit ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="慢速模式" min-width="90" align="center">
        <template #default="{ row }">
          {{ row.slowModeSeconds ? `${row.slowModeSeconds}s` : '关闭' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
            active-text="启用"
            inactive-text="禁用"
            @change="(val: string | number | boolean) => handleStatusChange(row, Number(val))"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="170" align="center">
        <template #default="{ row }">
          {{ formatCreatedAt(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        :min-width="isCompactTable ? 100 : 120"
        :fixed="isCompactTable ? false : 'right'"
        align="center"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑主题频道' : '新增主题频道'"
      width="560px"
    >
      <el-form :model="formData" label-width="90px">
        <el-form-item label="频道名称" required>
          <el-input v-model="formData.name" placeholder="请输入频道名称" />
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="formData.avatar" placeholder="请输入头像 URL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入频道描述"
          />
        </el-form-item>
        <el-form-item label="公告">
          <el-input
            v-model="formData.announcement"
            type="textarea"
            :rows="3"
            placeholder="请输入频道公告"
          />
        </el-form-item>
        <el-form-item label="分类编码">
          <el-input v-model="formData.categoryCode" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="可见范围">
          <el-select v-model="formData.visibilityScope" placeholder="请选择" style="width: 100%">
            <el-option label="公开" value="public" />
            <el-option label="成员可见" value="member" />
            <el-option label="私密" value="private" />
          </el-select>
        </el-form-item>
        <el-form-item label="加入规则">
          <el-select v-model="formData.joinRule" placeholder="请选择" style="width: 100%">
            <el-option label="自由加入" value="free" />
            <el-option label="审批加入" value="approval" />
            <el-option label="邀请加入" value="invite_only" />
          </el-select>
        </el-form-item>
        <el-form-item label="发言等级">
          <el-input-number v-model="formData.speakLevelLimit" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="成员上限">
          <el-input-number v-model="formData.memberLimit" :min="0" />
        </el-form-item>
        <el-form-item label="慢速模式">
          <el-input-number v-model="formData.slowModeSeconds" :min="0" />
          <span class="unit-text">秒</span>
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="formData.displaySort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import {
  BOOLEAN_TEXT_OPTIONS,
  CHAT_CONVERSATION_TYPE_OPTIONS,
  formatCreatedAt,
  formatChatConversationType,
  formatChatJoinRule,
  formatChatSceneType,
  formatChatVisibilityScope,
  formatOptionalText,
} from '@/utils'
import { useChatStore } from '@/stores'
import type { ChatConversationVO, SysTopicChannelSaveRequest } from '@/types/api-types'

const chatStore = useChatStore()

const searchForm = reactive({
  keyword: '',
  conversationType: '' as string,
  status: undefined as number | undefined,
  ownerId: undefined as number | undefined,
  memberUserId: undefined as number | undefined,
  isAllSite: undefined as number | undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const { isCompactTable, paginationLayout } = useContentAdmin()

const formDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)

const formData = reactive<SysTopicChannelSaveRequest>({
  name: '',
  avatar: '',
  description: '',
  announcement: '',
  categoryCode: '',
  visibilityScope: 'public',
  joinRule: 'free',
  speakLevelLimit: 0,
  memberLimit: 0,
  slowModeSeconds: 0,
  displaySort: 0,
})

// ==================== 格式化 ====================

function formatSceneType(sceneType?: string): string {
  return formatChatSceneType(sceneType)
}

function getSceneTagType(sceneType?: string): 'primary' | 'success' | 'warning' | 'info' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    single_chat: 'info',
    group_chat: 'primary',
    user_group: 'primary',
    hall_channel: 'success',
    topic_channel: 'primary',
    global_channel: 'warning',
    public_channel: 'warning',
  }
  return map[sceneType ?? ''] ?? 'info'
}

function formatJoinRule(joinRule?: string): string {
  return formatChatJoinRule(joinRule)
}

function formatVisibilityScope(scope?: string): string {
  return formatChatVisibilityScope(scope)
}

// ==================== 数据加载 ====================

async function fetchList(): Promise<void> {
  await chatStore.fetchConversations({
    current: pagination.current,
    size: pagination.size,
    keyword: searchForm.keyword || undefined,
    conversationType: searchForm.conversationType || undefined,
    status: searchForm.status,
    ownerId: searchForm.ownerId,
    memberUserId: searchForm.memberUserId,
    isAllSite: searchForm.isAllSite,
  })
}

function handleSearch(): void {
  pagination.current = 1
  void fetchList()
}

function handleReset(): void {
  searchForm.keyword = ''
  searchForm.conversationType = ''
  searchForm.status = undefined
  searchForm.ownerId = undefined
  searchForm.memberUserId = undefined
  searchForm.isAllSite = undefined
  pagination.current = 1
  pagination.size = 10
  void fetchList()
}

// ==================== 状态切换 ====================

async function handleStatusChange(row: ChatConversationVO, value: number): Promise<void> {
  const previous = value === 1 ? 0 : 1
  const success = await chatStore.updateConversationStatus(row.id, { status: value })
  if (!success) {
    row.status = previous
    ElMessage.error('状态更新失败')
    return
  }
  ElMessage.success('状态更新成功')
}

// ==================== 表单对话框 ====================

function resetFormData(): void {
  formData.name = ''
  formData.avatar = ''
  formData.description = ''
  formData.announcement = ''
  formData.categoryCode = ''
  formData.visibilityScope = 'public'
  formData.joinRule = 'free'
  formData.speakLevelLimit = 0
  formData.memberLimit = 0
  formData.slowModeSeconds = 0
  formData.displaySort = 0
}

function handleAdd(): void {
  isEdit.value = false
  editingId.value = null
  resetFormData()
  formDialogVisible.value = true
}

function handleEdit(row: ChatConversationVO): void {
  isEdit.value = true
  editingId.value = row.id
  formData.name = row.name ?? ''
  formData.avatar = row.avatar ?? ''
  formData.description = ''
  formData.announcement = row.notice ?? ''
  formData.categoryCode = row.channelCategoryCode ?? ''
  formData.visibilityScope = row.visibilityScope ?? 'public'
  formData.joinRule = row.joinRule ?? 'free'
  formData.speakLevelLimit = row.speakLevelLimit ?? 0
  formData.memberLimit = row.memberLimit ?? 0
  formData.slowModeSeconds = row.slowModeSeconds ?? 0
  formData.displaySort = row.displaySort ?? 0
  formDialogVisible.value = true
}

async function handleSubmit(): Promise<void> {
  if (!formData.name.trim()) {
    ElMessage.warning('请输入频道名称')
    return
  }

  submitting.value = true
  try {
    const success = isEdit.value
      ? await chatStore.updateTopicChannel(editingId.value!, { ...formData })
      : await chatStore.createTopicChannel({ ...formData })

    if (!success) {
      ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
      return
    }

    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    formDialogVisible.value = false
    void fetchList()
  } finally {
    submitting.value = false
  }
}

// ==================== 初始化 ====================

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.channel-management-page {
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
  gap: 12px 0;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-item {
  margin-right: 16px;
}

.filter-control {
  width: 180px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.channel-info__text {
  min-width: 0;
}

.channel-info__name {
  font-weight: 500;
}

.channel-info__sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.unit-text {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
