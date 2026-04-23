import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTableHeight } from './useTableHeight'

interface UseContentAdminOptions {
  minHeight?: number
  bottomOffset?: number
  compactBreakpoint?: number
}

/**
 * 为后台内容管理页统一提供表格高度和分页布局的响应式能力。
 * 页面只需要绑定返回的 ref，就能复用一致的列表区体验。
 */
export function useContentAdmin(options: UseContentAdminOptions = {}) {
  const tableWrapperRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)
  const isCompactTable = ref(false)

  const { tableHeight, updateTableHeight } = useTableHeight(tableWrapperRef, paginationRef, {
    minHeight: options.minHeight ?? 360,
    bottomOffset: options.bottomOffset ?? 16,
  })

  const paginationLayout = computed(() =>
    isCompactTable.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
  )

  function updateViewportState(): void {
    if (typeof window === 'undefined') {
      return
    }

    isCompactTable.value = window.innerWidth <= (options.compactBreakpoint ?? 992)
    updateTableHeight()
  }

  onMounted(() => {
    // 除了切换分页布局，还会顺带触发表格高度重算，避免移动端首屏高度不正确。
    updateViewportState()
    window.addEventListener('resize', updateViewportState)
  })

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.removeEventListener('resize', updateViewportState)
  })

  return {
    tableWrapperRef,
    paginationRef,
    isCompactTable,
    paginationLayout,
    tableHeight,
    updateTableHeight,
    updateViewportState,
  }
}
