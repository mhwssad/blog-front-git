import type { Ref, ComputedRef } from 'vue'

export function useSelection<T extends { id: number }>(tableRef?: Ref<any>) {
  const selectedRows = ref<T[]>([]) as Ref<T[]>
  const selectedIds = computed(() => selectedRows.value.map((r) => r.id))
  const selectedCount = computed(() => selectedRows.value.length)

  function handleSelectionChange(rows: T[]): void {
    selectedRows.value = rows
  }

  function clearSelection(): void {
    tableRef?.value?.tableRef?.clearSelection?.()
    selectedRows.value = []
  }

  return { selectedRows, selectedIds, selectedCount, handleSelectionChange, clearSelection }
}
