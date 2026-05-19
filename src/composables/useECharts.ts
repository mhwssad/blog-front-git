import { onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
])

export function useECharts() {
  const chartRef = shallowRef<echarts.ECharts | null>(null)
  let container: HTMLElement | null = null
  let observer: ResizeObserver | null = null

  function init(el: HTMLElement) {
    // 先销毁已有实例，支持重复调用 init（如组件重新激活）
    if (chartRef.value) {
      chartRef.value.dispose()
      chartRef.value = null
    }
    if (observer) {
      observer.disconnect()
      observer = null
    }

    container = el
    chartRef.value = echarts.init(el)
    observer = new ResizeObserver(() => {
      chartRef.value?.resize()
    })
    observer.observe(el)
  }

  function setOption(option: EChartsOption) {
    chartRef.value?.setOption(option, true)
  }

  onUnmounted(() => {
    observer?.disconnect()
    chartRef.value?.dispose()
    chartRef.value = null
  })

  return { init, setOption }
}
