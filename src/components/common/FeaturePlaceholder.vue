<template>
  <div class="feature-placeholder">
    <el-card class="placeholder-card" shadow="never">
      <div class="hero">
        <div class="hero-tags">
          <el-tag size="small" effect="plain">{{ scopeLabel }}</el-tag>
          <el-tag size="small" type="warning">{{ statusLabel }}</el-tag>
        </div>
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-summary">{{ summary }}</p>
      </div>

      <div v-if="routeMeta.length" class="section">
        <div class="section-title">当前上下文</div>
        <div class="meta-grid">
          <div v-for="item in routeMeta" :key="item.label" class="meta-item">
            <span class="meta-label">{{ item.label }}</span>
            <span class="meta-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div v-if="permissions.length" class="section">
        <div class="section-title">权限标识</div>
        <div class="tag-list">
          <el-tag v-for="item in permissions" :key="item" size="small" effect="plain" type="info">
            {{ item }}
          </el-tag>
        </div>
      </div>

      <div v-if="apiRefs.length" class="section">
        <div class="section-title">相关接口</div>
        <ul class="text-list">
          <li v-for="item in apiRefs" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div v-if="docRefs.length" class="section">
        <div class="section-title">参考文档</div>
        <ul class="text-list">
          <li v-for="item in docRefs" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div v-if="nextSteps.length" class="section">
        <div class="section-title">后续落地</div>
        <ul class="text-list">
          <li v-for="item in nextSteps" :key="item">{{ item }}</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface MetaItem {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    title: string
    summary: string
    scope?: 'admin' | 'front'
    statusLabel?: string
    routeMeta?: MetaItem[]
    permissions?: string[]
    apiRefs?: string[]
    docRefs?: string[]
    nextSteps?: string[]
  }>(),
  {
    scope: 'front',
    statusLabel: '占位页',
    routeMeta: () => [],
    permissions: () => [],
    apiRefs: () => [],
    docRefs: () => [],
    nextSteps: () => [],
  }
)

const scopeLabel = computed(() => (props.scope === 'admin' ? '后台页面' : '前台页面'))
</script>

<style scoped>
.feature-placeholder {
  width: 100%;
}

.placeholder-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.3;
  color: var(--el-text-color-primary);
}

.hero-summary {
  margin: 0;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.meta-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.meta-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.text-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
}

.text-list li + li {
  margin-top: 6px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 20px;
  }
}
</style>
