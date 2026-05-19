<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  model: Record<string, any>
  expanded?: boolean
  showExpand?: boolean
}>(), {
  expanded: false,
  showExpand: false,
})

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  search: []
  reset: []
}>()

const expandedModel = computed({
  get: () => props.expanded,
  set: (val) => emit('update:expanded', val),
})
</script>

<template>
  <el-card shadow="never" class="search-filter">
    <el-form :model="model" inline class="search-filter__form">
      <slot />
      <div v-if="expandedModel" class="search-filter__expanded">
        <slot name="expanded" />
      </div>
      <el-form-item class="search-filter__actions">
        <slot name="actions">
          <el-button type="primary" @click="emit('search')">查询</el-button>
          <el-button @click="emit('reset')">重置</el-button>
          <el-button
            v-if="showExpand"
            link
            type="primary"
            @click="expandedModel = !expandedModel"
          >
            {{ expandedModel ? '收起' : '展开' }}
            <el-icon
              class="search-filter__expand-icon"
              :class="{ 'is-expanded': expandedModel }"
            >
              <ArrowDown />
            </el-icon>
          </el-button>
        </slot>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.search-filter {
  margin-bottom: 16px;
}

.search-filter__form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.search-filter__expanded {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.search-filter__actions {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.filter-item) {
  margin-right: 16px;
  margin-bottom: 0;
}

:deep(.filter-control) {
  width: 220px;
}

:deep(.filter-control--status) {
  width: 160px;
}

.search-filter__expand-icon {
  transition: transform 0.3s;
  margin-left: 4px;
}

.search-filter__expand-icon.is-expanded {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  :deep(.filter-item) {
    margin-right: 0;
    margin-bottom: 12px;
    width: 100%;
  }

  :deep(.filter-control),
  :deep(.filter-control--status) {
    width: 100%;
  }
}
</style>
