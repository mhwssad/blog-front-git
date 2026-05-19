<script lang="ts" setup>
import EmptyState from './EmptyState.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    data: any[]
    loading?: boolean
    total?: number
    currentPage?: number
    pageSize?: number
    pageSizes?: number[]
    paginationLayout?: string
    title?: string
    showCard?: boolean
    compact?: boolean
    border?: boolean
    stripe?: boolean
    tableLayout?: 'auto' | 'fixed'
    rowKey?: string | ((row: any) => string)
    emptyText?: string
    emptyImageSize?: number
  }>(),
  {
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    pageSizes: () => [10, 20, 50, 100],
    paginationLayout: 'total, sizes, prev, pager, next, jumper',
    showCard: true,
    compact: false,
    border: true,
    stripe: true,
    tableLayout: 'auto',
    emptyText: '暂无数据',
    emptyImageSize: 100,
  },
)

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'update:pageSize': [value: number]
  'page-change': [page: number]
  'size-change': [size: number]
  'selection-change': [selection: any[]]
  'sort-change': [event: any]
}>()

const slots = useSlots()
const tableRef = ref<any>(null)

const hasHeader = computed(
  () => props.title || slots.header || slots['header-extra'],
)

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val),
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val),
})

defineExpose({ tableRef })
</script>

<template>
  <el-card
    shadow="never"
    :class="['data-table', { 'data-table--plain': !showCard }]"
  >
    <template v-if="showCard && hasHeader" #header>
      <div class="data-table__header">
        <slot name="header">
          <span v-if="title" class="data-table__title">{{ title }}</span>
        </slot>
        <div v-if="$slots['header-extra']" class="data-table__header-extra">
          <slot name="header-extra" />
        </div>
      </div>
    </template>

    <slot name="toolbar" />

    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data"
      v-loading="loading"
      :border="border"
      :stripe="stripe"
      :row-key="rowKey"
      :table-layout="tableLayout"
      @selection-change="(val: any[]) => emit('selection-change', val)"
      @sort-change="(val: any) => emit('sort-change', val)"
    >
      <slot />
      <template #empty>
        <slot name="empty">
          <EmptyState :description="emptyText" :image-size="emptyImageSize" />
        </slot>
      </template>
    </el-table>

    <div v-if="total > 0" class="data-table__pagination">
      <el-pagination
        v-model:current-page="currentPageModel"
        v-model:page-size="pageSizeModel"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :small="compact"
        @size-change="(val: number) => emit('size-change', val)"
        @current-change="(val: number) => emit('page-change', val)"
      />
      <slot name="pagination-extra" />
    </div>
  </el-card>
</template>

<style scoped>
.data-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-weight: 500;
}

.data-table__pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 12px 0 8px;
}

.data-table--plain {
  border: none;
  box-shadow: none;
}

.data-table--plain :deep(.el-card__body) {
  padding: 0;
}

@media (max-width: 768px) {
  .data-table__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .data-table__pagination {
    flex-wrap: wrap;
  }
}
</style>
