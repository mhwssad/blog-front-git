<template>
  <div class="profile-card">
    <el-avatar :size="64" :src="user.avatar ?? undefined">
      {{ user.nickname?.charAt(0) }}
    </el-avatar>
    <div class="profile-info">
      <div class="profile-name">{{ user.nickname ?? user.username }}</div>
      <UserLevelBadge :level="5" size="small" />
      <ExperienceBar :current="320" :total="600" :level="5" :show-text="false" />
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
/**
 * 个人资料卡片组件
 * @description 展示用户头像、昵称、等级、经验值和关注/粉丝数
 * @module front/profile/components/ProfileCard
 */
import { useUserFollowStore } from '@/stores'
import UserLevelBadge from '@/components/common/UserLevelBadge.vue'
import ExperienceBar from '@/components/common/ExperienceBar.vue'

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
  background: var(--color-bg-base);
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

.profile-card :deep(.experience-bar) {
  margin-top: 8px;
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
