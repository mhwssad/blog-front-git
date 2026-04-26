<template>
  <div class="follow-user-item">
    <div class="user-main">
      <el-avatar :size="40" :src="user.avatar ?? undefined">
        {{ user.nickname?.charAt(0) }}
      </el-avatar>
      <div class="user-info">
        <div class="user-name">
          {{ user.remark ?? user.nickname }}
          <el-tag v-if="user.remark" size="small" type="info" effect="plain">备注</el-tag>
          <el-tag v-if="user.mutualFollow === 1" size="small" type="success" effect="plain">互关</el-tag>
          <el-icon
            v-if="user.isSpecialFollow === 1"
            class="special-icon"
          >
            <StarFilled />
          </el-icon>
        </div>
        <div class="user-time">关注于 {{ user.followTime }}</div>
      </div>
    </div>
    <div class="user-actions">
      <template v-if="isFollowTab">
        <el-button
          size="small"
          link
          @click="emit('toggle-special', user)"
        >
          {{ user.isSpecialFollow === 1 ? '取消特别关注' : '设为特别关注' }}
        </el-button>
        <el-button size="small" link @click="emit('edit-remark', user)">
          编辑备注
        </el-button>
        <el-button size="small" link type="danger" @click="emit('unfollow', user.userId)">
          取关
        </el-button>
      </template>
      <template v-else>
        <el-button
          v-if="user.mutualFollow !== 1"
          size="small"
          type="primary"
          plain
          @click="emit('follow', user.userId)"
        >
          关注
        </el-button>
        <el-tag v-else size="small" type="success" effect="plain">已互关</el-tag>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { StarFilled } from '@element-plus/icons-vue'
import type { UserFollowUserVO } from '@/api/types'

defineProps<{
  user: UserFollowUserVO
  isFollowTab: boolean
}>()

const emit = defineEmits<{
  unfollow: [userId: number]
  follow: [userId: number]
  'toggle-special': [user: UserFollowUserVO]
  'edit-remark': [user: UserFollowUserVO]
}>()
</script>

<style scoped>
.follow-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 12px;
}

.follow-user-item:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.user-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.user-info {
  min-width: 0;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.special-icon {
  color: var(--el-color-warning);
}

.user-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 2px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
</style>
