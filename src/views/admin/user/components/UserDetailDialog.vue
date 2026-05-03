<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户详情"
    class="user-detail-dialog"
    width="620px"
    destroy-on-close
    align-center
    @close="handleClose"
  >
    <div v-if="loading" class="detail-loading">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <template v-else-if="user">
      <!-- 头部：头像 + 基本信息 -->
      <div class="detail-header">
        <el-avatar :src="user.avatar" :size="64">
          {{ (user.nickname || user.username).charAt(0) }}
        </el-avatar>
        <div class="detail-header__info">
          <div class="detail-header__name">
            <span>{{ user.nickname || '-' }}</span>
            <el-icon v-if="user.gender === 1" :size="16" color="#409eff"><Male /></el-icon>
            <el-icon v-else-if="user.gender === 2" :size="16" color="#f56c6c"><Female /></el-icon>
            <UserLevelBadge :level="user.userLevel" />
          </div>
          <div class="detail-header__sub">@{{ user.username }} · ID {{ user.id }}</div>
        </div>
        <el-tag :type="user.status === 1 ? 'success' : 'danger'" size="small">
          {{ user.status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </div>

      <!-- 账号信息 -->
      <el-descriptions :column="2" border size="small" class="detail-section">
        <el-descriptions-item label="邮箱" :span="2">{{ user.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderText }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ user.birthday || '-' }}</el-descriptions-item>
        <el-descriptions-item label="经验值">{{ user.experiencePoints }} XP</el-descriptions-item>
      </el-descriptions>

      <!-- 登录与时间 -->
      <el-descriptions :column="2" border size="small" class="detail-section">
        <el-descriptions-item label="最后登录">{{ user.lastLoginTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录 IP">{{ user.lastLoginIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ user.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ user.updateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="user.levelUpdatedAt" label="等级更新">
          {{ user.levelUpdatedAt }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 备注 -->
      <el-descriptions
        v-if="user.remark"
        :column="1"
        border
        size="small"
        class="detail-section"
      >
        <el-descriptions-item label="备注">{{ user.remark }}</el-descriptions-item>
      </el-descriptions>
    </template>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Loading, Male, Female } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import UserLevelBadge from '@/components/common/UserLevelBadge.vue'
import type { SysUserAdminVO } from '@/types/api-types'

interface Props {
  visible: boolean
  user: SysUserAdminVO | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()
const loading = ref(false)
const detailUser = ref<SysUserAdminVO | null>(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const user = computed(() => detailUser.value || props.user)

const genderText = computed(() => {
  if (!user.value) return '-'
  const map: Record<number, string> = { 0: '保密', 1: '男', 2: '女' }
  return map[user.value.gender ?? 0] ?? '-'
})

watch(
  () => props.visible,
  async (visible) => {
    if (!visible || !props.user) return
    loading.value = true
    try {
      const result = await userStore.fetchUserById(props.user.id)
      detailUser.value = result
    } catch {
      detailUser.value = null
    } finally {
      loading.value = false
    }
  },
)

function handleClose() {
  detailUser.value = null
  emit('update:visible', false)
}
</script>

<style scoped>
.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-header__info {
  flex: 1;
  min-width: 0;
}

.detail-header__name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-header__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

:deep(.user-detail-dialog .el-dialog__body) {
  padding-top: 12px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  :deep(.user-detail-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
