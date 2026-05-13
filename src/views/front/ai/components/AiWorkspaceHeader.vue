<template>
  <header class="workspace-header">
    <div class="workspace-header__left">
      <el-button class="mobile-menu-btn" :icon="Menu" text @click="$emit('toggleMobileMenu')" />
      <div class="workspace-header__main">
        <div class="workspace-title">{{ headerTitle }}</div>
        <div class="workspace-meta">
          <el-tag v-if="session" size="small" effect="plain">{{ modelLabel }}</el-tag>
          <el-tag v-if="session" size="small" effect="plain">
            {{ session.sceneType || sceneType }}
          </el-tag>
          <el-tag v-if="session?.status === 0" size="small" type="info" effect="plain">
            已关闭
          </el-tag>
        </div>
      </div>
    </div>

    <div class="workspace-header__right">
      <template v-if="quota">
        <el-progress
          :percentage="quotaPercent"
          :stroke-width="6"
          :show-text="false"
          class="quota-bar"
        />
        <el-tag size="small" :type="quotaTagType" effect="plain">
          今日 {{ quota.usedToday }} / {{ quota.dailyLimit }}
        </el-tag>
      </template>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import type { AiSessionDetailVO, AiQuotaVO } from '@/types/api-types'

const props = defineProps<{
  session: AiSessionDetailVO | null
  sceneType: string
  quota: AiQuotaVO | null
}>()

defineEmits<{
  toggleMobileMenu: []
}>()

const headerTitle = computed(() => props.session?.title || 'AI 助手')

const modelLabel = computed(() => {
  if (!props.session) return '默认渠道'
  return props.session.modelName || props.session.channelName || '默认渠道'
})

const quotaPercent = computed(() => {
  if (!props.quota || props.quota.dailyLimit <= 0) return 0
  return Math.min(100, Math.round((props.quota.usedToday / props.quota.dailyLimit) * 100))
})

const quotaTagType = computed(() => {
  if (!props.quota) return 'info'
  return props.quota.remainingToday <= 5 ? 'danger' : 'info'
})
</script>

<style scoped>
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.workspace-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.workspace-header__main {
  min-width: 0;
}

.workspace-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.workspace-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.quota-bar {
  width: 80px;
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 960px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .workspace-header {
    padding: 10px 12px;
  }

  .quota-bar {
    display: none;
  }
}
</style>
