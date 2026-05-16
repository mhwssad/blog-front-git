<template>
  <div class="user-card">
    <div class="card-avatar">
      <el-avatar :size="60" :src="user.avatar ?? undefined">
        {{ user.nickname?.charAt(0) }}
      </el-avatar>
      <el-icon v-if="user.isSpecialFollow === 1" class="special-badge" :size="14">
        <StarFilled />
      </el-icon>
    </div>

    <div class="card-info">
      <div class="card-name">
        <span class="nickname">{{ user.remark ?? user.nickname }}</span>
        <el-tag v-if="user.remark" size="small" type="info" effect="plain" round>备注</el-tag>
        <el-tag v-if="user.mutualFollow === 1" size="small" type="success" effect="plain" round>
          互关
        </el-tag>
      </div>
      <div class="card-time">{{ user.followTime }}</div>
    </div>

    <div class="card-actions">
      <template v-if="isFollowTab">
        <el-button size="small" text @click="emit('toggle-special', user)">
          {{ user.isSpecialFollow === 1 ? '取消特别关注' : '设为特别关注' }}
        </el-button>
        <el-button size="small" text @click="emit('edit-remark', user)"> 编辑备注 </el-button>
        <el-button size="small" text type="danger" @click="emit('unfollow', user.userId)">
          取关
        </el-button>
      </template>
      <template v-else>
        <el-button
          v-if="user.mutualFollow !== 1"
          size="small"
          type="primary"
          plain
          round
          @click="emit('follow', user.userId)"
        >
          回关
        </el-button>
        <el-tag v-else size="small" type="info" effect="plain" round>已互关</el-tag>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { StarFilled } from '@element-plus/icons-vue'
import type { UserFollowUserVO } from '@/types/api-types'

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
.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.user-card:hover {
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-border-color);
}

.card-avatar {
  position: relative;
  margin-bottom: 12px;
}

.special-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  color: var(--el-color-warning);
  background: var(--el-bg-color);
  border-radius: 50%;
  padding: 2px;
}

.card-info {
  text-align: center;
  min-width: 0;
  width: 100%;
}

.card-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.nickname {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.card-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 14px;
  flex-wrap: wrap;
}
</style>
