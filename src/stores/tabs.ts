/**
 * 标签页管理 Store
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TabItem } from '@/types/ui'

export type { TabItem }

const HOME_TAB: TabItem = {
  path: '/admin/dashboard',
  title: '首页',
  name: 'AdminDashboard',
  closable: false,
}

export const useTabsStore = defineStore('tabs', () => {
  // 已打开的标签页列表
  const tabs = ref<TabItem[]>([HOME_TAB])

  // 当前激活的标签
  const activeTab = ref(HOME_TAB.path)

  function isProtectedTab(tab: TabItem): boolean {
    return tab.closable === false
  }

  function ensureHomeTab(): void {
    const homeIndex = tabs.value.findIndex(tab => tab.path === HOME_TAB.path)

    if (homeIndex === -1) {
      tabs.value.unshift(HOME_TAB)
      return
    }

    if (homeIndex > 0) {
      const [homeTab] = tabs.value.splice(homeIndex, 1)
      tabs.value.unshift(homeTab!)
    }
  }

  /**
   * 添加标签页
   */
  function addTab(tab: TabItem): void {
    ensureHomeTab()

    // 检查是否已存在
    const existIndex = tabs.value.findIndex(t => t.path === tab.path)
    if (existIndex === -1) {
      tabs.value.push(tab)
    }
    activeTab.value = tab.path
  }

  /**
   * 移除标签页
   */
  function removeTab(targetPath: string): void {
    const index = tabs.value.findIndex(t => t.path === targetPath)
    if (index === -1) return
    if (isProtectedTab(tabs.value[index]!)) return

    tabs.value.splice(index, 1)
    ensureHomeTab()

    // 如果关闭的是当前激活的标签，激活前一个或后一个
    if (activeTab.value === targetPath) {
      if (tabs.value.length > 0) {
        const nextTab = tabs.value[Math.max(0, index - 1)]
        activeTab.value = nextTab?.path ?? ''
      } else {
        activeTab.value = ''
      }
    }
  }

  /**
   * 关闭其他标签
   */
  function closeOtherTabs(targetPath: string): void {
    tabs.value = tabs.value.filter(t => isProtectedTab(t) || t.path === targetPath)
    ensureHomeTab()
    activeTab.value = targetPath
  }

  /**
   * 关闭左侧标签
   */
  function closeLeftTabs(targetPath: string): void {
    const index = tabs.value.findIndex(t => t.path === targetPath)
    if (index > 0) {
      tabs.value = tabs.value.filter((tab, currentIndex) => isProtectedTab(tab) || currentIndex >= index)
      ensureHomeTab()
    }
  }

  /**
   * 关闭右侧标签
   */
  function closeRightTabs(targetPath: string): void {
    const index = tabs.value.findIndex(t => t.path === targetPath)
    if (index < tabs.value.length - 1) {
      tabs.value = tabs.value.filter((tab, currentIndex) => isProtectedTab(tab) || currentIndex <= index)
      ensureHomeTab()
    }
  }

  /**
   * 关闭所有标签
   */
  function closeAllTabs(): void {
    tabs.value = [HOME_TAB]
    activeTab.value = HOME_TAB.path
  }

  /**
   * 设置当前激活标签
   */
  function setActiveTab(path: string): void {
    activeTab.value = path
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    closeOtherTabs,
    closeLeftTabs,
    closeRightTabs,
    closeAllTabs,
    setActiveTab,
  }
})
