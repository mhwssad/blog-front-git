<template>
  <el-card v-if="items.length" shadow="never" class="panel-card">
    <template #header>
      <div class="panel-header">
        <span>快捷入口</span>
        <span class="panel-tip">仅展示当前账号可访问模块</span>
      </div>
    </template>

    <div class="shortcut-scroll">
      <button
        v-for="item in visibleItems"
        :key="item.path"
        class="shortcut-card"
        type="button"
        @click="router.push(item.path)"
      >
        <div class="shortcut-icon" :style="{ background: item.background }">
          <el-icon :size="16" :color="item.color">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="shortcut-title">{{ item.title }}</div>
      </button>

      <el-popover v-if="overflowItems.length" placement="bottom" :width="320" trigger="hover">
        <template #reference>
          <button class="shortcut-card shortcut-more" type="button">
            <div class="shortcut-icon shortcut-more-icon">
              <el-icon :size="16"><More /></el-icon>
            </div>
            <div class="shortcut-title">更多</div>
          </button>
        </template>
        <div class="more-list">
          <button
            v-for="item in overflowItems"
            :key="item.path"
            class="more-item"
            type="button"
            @click="router.push(item.path)"
          >
            <div class="shortcut-icon" :style="{ background: item.background }">
              <el-icon :size="14" :color="item.color">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <span>{{ item.title }}</span>
          </button>
        </div>
      </el-popover>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { More } from '@element-plus/icons-vue'
import type { ShortcutItem } from '@/types/ui'

const props = defineProps<{
  items: ShortcutItem[]
}>()

const router = useRouter()

const MAX_VISIBLE = 18

const visibleItems = computed(() => {
  if (props.items.length <= MAX_VISIBLE + 1) return props.items
  return props.items.slice(0, MAX_VISIBLE)
})

const overflowItems = computed(() => {
  if (props.items.length <= MAX_VISIBLE + 1) return []
  return props.items.slice(MAX_VISIBLE)
})
</script>

<style scoped>
.panel-card {
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.panel-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.shortcut-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  min-width: 110px;
  white-space: nowrap;
  background: #fff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.shortcut-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.shortcut-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.shortcut-title {
  font-size: 14px;
  font-weight: 600;
}

.shortcut-more-icon {
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.more-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.more-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-primary);
  transition: background 0.15s;
}

.more-item:hover {
  background: var(--el-fill-color-light);
}

.more-item .shortcut-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
</style>
