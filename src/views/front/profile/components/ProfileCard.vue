<template>
  <div class="profile-card">
    <el-avatar :size="64" :src="user.avatar ?? undefined">
      {{ user.nickname?.charAt(0) }}
    </el-avatar>
    <div class="profile-info">
      <div class="profile-name">{{ user.nickname ?? user.username }}</div>
      <div class="profile-stats">
        <span class="stat-item">
          <strong>{{ store.followCount.followingCount }}</strong> 关注
        </span>
        <span class="stat-item">
          <strong>{{ store.followCount.fanCount }}</strong> 粉丝
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserFollowStore } from '@/stores'

defineProps<{
  user: { username: string; nickname?: string; avatar?: string | null }
}>()

const store = useUserFollowStore()
</script>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.profile-info {
  min-width: 0;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-stats {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stat-item strong {
  color: var(--el-text-color-primary);
}
</style>
