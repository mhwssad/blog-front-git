<template>
  <section class="hero-bar">
    <div class="hero-main">
      <div class="hero-brand">
        <span class="hero-badge">Admin</span>
        <h1 class="hero-title">后台总览</h1>
      </div>

      <div class="hero-controls">
        <div class="range-group">
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            class="range-btn"
            :class="{ active: props.rangeType === opt.value }"
            type="button"
            @click="emit('update:rangeType', opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
        <el-date-picker
          v-if="props.rangeType === 'custom'"
          :model-value="props.customRange"
          type="datetimerange"
          class="custom-range"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DDTHH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          @update:model-value="handleCustomRangeChange"
        />
      </div>
    </div>

    <div class="hero-meta">
      <span class="hero-time">
        <el-icon :size="13"><Clock /></el-icon>
        {{ currentTime }}
      </span>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Clock } from '@element-plus/icons-vue'

const props = defineProps<{
  rangeType: 'today' | 'week' | 'month' | 'all' | 'custom'
  customRange: [string, string] | []
}>()

const emit = defineEmits<{
  'update:rangeType': [value: 'today' | 'week' | 'month' | 'all' | 'custom']
  'update:customRange': [value: [string, string] | []]
}>()

const rangeOptions = [
  { label: '今日', value: 'today' as const },
  { label: '本周', value: 'week' as const },
  { label: '本月', value: 'month' as const },
  { label: '全部', value: 'all' as const },
  { label: '自定义', value: 'custom' as const },
]

const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function handleCustomRangeChange(value: [string, string] | [] | null): void {
  emit('update:customRange', Array.isArray(value) ? value : [])
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.hero-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 24px 18px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f766e 100%);
  color: #f8fafc;
}

.hero-bar::before {
  position: absolute;
  top: -40px;
  right: -20px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.12), transparent 70%);
  content: '';
  pointer-events: none;
}

.hero-bar::after {
  position: absolute;
  bottom: -60px;
  left: 30%;
  width: 300px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 116, 144, 0.1), transparent 70%);
  content: '';
  pointer-events: none;
}

.hero-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-badge {
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 6px;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.hero-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-group {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.range-btn {
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(248, 250, 252, 0.65);
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.range-btn:hover {
  color: rgba(248, 250, 252, 0.9);
}

.range-btn.active {
  color: #fff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.custom-range {
  width: 340px;
}

.hero-meta {
  position: relative;
  display: flex;
  align-items: center;
}

.hero-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(248, 250, 252, 0.55);
}

@media (max-width: 640px) {
  .hero-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .range-group,
  .custom-range {
    width: 100%;
  }

  .range-group {
    flex-wrap: wrap;
  }
}
</style>
