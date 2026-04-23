<template>
  <el-card shadow="never" class="resource-card">
    <template #header>
      <div class="card-header">
        <div>
          <div class="card-title">{{ title }}</div>
          <div v-if="description" class="card-description">{{ description }}</div>
        </div>
        <div class="card-summary">
          <span>总数</span>
          <strong>{{ total }}</strong>
        </div>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="rows"
      border
      stripe
      :row-key="rowKey"
      :tree-props="treeProps"
      :default-expand-all="tree"
      :empty-text="emptyText"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :min-width="column.minWidth"
        :width="column.width"
      />
    </el-table>
  </el-card>
</template>

<script lang="ts" setup>
interface ResourceColumn {
  prop: string
  label: string
  minWidth?: number
  width?: number
}

interface Props {
  title: string
  description?: string
  rows: unknown[]
  columns: ResourceColumn[]
  loading?: boolean
  total?: number
  rowKey?: string
  tree?: boolean
  emptyText?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  loading: false,
  total: 0,
  rowKey: 'id',
  tree: false,
  emptyText: '暂无数据',
})

const treeProps = {
  children: 'children',
}
</script>

<style scoped>
.resource-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-description {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.card-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: var(--color-text-secondary);
}

.card-summary strong {
  font-size: 20px;
  color: var(--color-text-primary);
}
</style>
