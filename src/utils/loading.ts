import { ElLoading, type LoadingInstance } from 'element-plus'

let loadingInstance: LoadingInstance | null = null
let loadingCount = 0

/**
 * 显示全屏加载动画
 */
export function showFullScreenLoading() {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  loadingCount++
}

/**
 * 尝试隐藏全屏加载动画
 */
export function tryHideFullScreenLoading() {
  if (loadingCount <= 0) {
    return
  }
  loadingCount--
  if (loadingCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/**
 * 强制关闭全屏加载动画
 */
export function forceHideFullScreenLoading() {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
  loadingCount = 0
}
