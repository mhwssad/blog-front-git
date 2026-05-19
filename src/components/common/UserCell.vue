<script lang="ts" setup>
withDefaults(defineProps<{
  avatar?: string | null
  nickname: string
  size?: number
  showName?: boolean
  sub?: string
}>(), {
  size: 36,
  showName: true,
})
</script>

<template>
  <slot>
    <div class="user-cell">
      <el-avatar :size="size" :src="avatar || undefined">
        {{ nickname.charAt(0) }}
      </el-avatar>
      <div v-if="showName" class="user-cell__info">
        <span class="user-cell__name">
          <slot name="name">{{ nickname }}</slot>
        </span>
        <span v-if="sub" class="user-cell__sub">{{ sub }}</span>
      </div>
    </div>
  </slot>
</template>

<style scoped>
.user-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.user-cell__info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-cell__name {
  font-size: 14px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell__sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
