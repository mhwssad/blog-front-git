import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

interface UseTableHeightOptions {
  minHeight?: number
  bottomOffset?: number
}

/**
 * 根据表格容器与分页器的位置，动态计算表格可用高度。
 * 这样列表页在不同视口下都能保持“内容区自适应、分页固定在底部”的布局体验。
 */
export function useTableHeight(
  tableWrapperRef: Ref<HTMLElement | null>,
  paginationRef?: Ref<HTMLElement | null>,
  options: UseTableHeightOptions = {}
) {
  const tableHeight = ref(options.minHeight ?? 360)

  async function updateTableHeight(): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    await nextTick()

    const tableWrapper = tableWrapperRef.value
    if (!tableWrapper) {
      return
    }

    const wrapperRect = tableWrapper.getBoundingClientRect()
    const paginationRect = paginationRef?.value?.getBoundingClientRect()
    const paginationStyles = paginationRef?.value ? window.getComputedStyle(paginationRef.value) : null
    const paginationHeight = paginationRect?.height ?? 0
    // 分页器通常有上边距，计算可用空间时需要一并扣掉，否则表格会轻微溢出。
    const paginationMarginTop = paginationStyles
      ? Number.parseFloat(paginationStyles.marginTop || '0') || 0
      : 0

    const bottomOffset = options.bottomOffset ?? 32
    const availableHeight =
      window.innerHeight - wrapperRect.top - paginationHeight - paginationMarginTop - bottomOffset

    tableHeight.value = Math.max(options.minHeight ?? 360, Math.floor(availableHeight))
  }

  function scheduleUpdate(): void {
    void updateTableHeight()
  }

  onMounted(() => {
    // 首屏渲染后和窗口尺寸变化时都重新计算，兼容抽屉/标签页切换后的布局抖动。
    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate)
  })

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.removeEventListener('resize', scheduleUpdate)
  })

  watch([tableWrapperRef, paginationRef ?? ref(null)], () => {
    scheduleUpdate()
  })

  return {
    tableHeight,
    updateTableHeight: scheduleUpdate,
  }
}
