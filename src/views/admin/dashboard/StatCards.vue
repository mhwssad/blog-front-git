<template>
  <el-row :gutter="12" class="stat-grid">
    <el-col v-for="card in stats" :key="card.title" :lg="4" :md="8" :span="12">
      <el-card shadow="hover" class="stat-card" :class="{ clickable: card.link }" @click="handleClick(card)">
        <div class="stat-card-inner">
          <div>
            <div class="stat-label">{{ card.title }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
          <div class="stat-icon" :style="{ background: card.background }">
            <el-icon :size="18" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import type { DashboardStat } from '@/types/ui'

defineProps<{
  stats: DashboardStat[]
}>()

const router = useRouter()

function handleClick(card: DashboardStat) {
  if (card.link) {
    router.push(card.link)
  }
}
</script>

<style scoped>
.stat-grid {
  margin: 0;
}

.stat-card {
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
}

.stat-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
}
</style>
