<template>
  <div class="layout-tabs">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.path"
        :label="tab.title"
        :name="tab.path"
        :closable="tab.closable !== false"
      >
        <template #label>
          <span
            class="tab-label"
            @contextmenu.prevent="handleContextMenu($event, tab)"
          >
            {{ tab.title }}
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenuVisible"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      class="context-menu"
      @click="hideContextMenu"
    >
      <li @click="handleContextMenuAction('refresh')">
        <el-icon><Refresh /></el-icon>
        <span>刷新页面</span>
      </li>
      <li @click="handleContextMenuAction('close-other')" :class="{ disabled: tabs.length <= 1 }">
        <el-icon><DCaret /></el-icon>
        <span>关闭其他</span>
      </li>
      <li @click="handleContextMenuAction('close-left')" :class="{ disabled: currentTabIndex <= 0 }">
        <el-icon><Back /></el-icon>
        <span>关闭左侧</span>
      </li>
      <li @click="handleContextMenuAction('close-right')" :class="{ disabled: currentTabIndex >= tabs.length - 1 }">
        <el-icon><Right /></el-icon>
        <span>关闭右侧</span>
      </li>
      <li class="divider"></li>
      <li @click="handleContextMenuAction('close-all')" :class="{ disabled: tabs.length <= 1 }">
        <el-icon><Close /></el-icon>
        <span>关闭全部</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { TabPaneName, TabsPaneContext } from 'element-plus'
import { useTabsStore } from '@/stores/tabs'
import type { TabItem } from '@/stores/tabs'
import {
  Refresh,
  DCaret,
  Back,
  Right,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (val) => tabsStore.setActiveTab(val)
})

// 当前右键菜单选中的标签索引
const currentTabIndex = computed(() => {
  return tabs.value.findIndex(t => t.path === contextMenuTab.value?.path)
})

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuTab = ref<TabItem | null>(null)

// 点击标签
function handleTabClick(pane: TabsPaneContext) {
  if (typeof pane.paneName === 'string') {
    void router.push(pane.paneName)
  }
}

// 移除标签
function handleTabRemove(targetPath: TabPaneName) {
  if (typeof targetPath !== 'string') {
    return
  }

  tabsStore.removeTab(targetPath)
  // 跳转到当前激活的标签
  if (tabsStore.activeTab) {
    void router.push(tabsStore.activeTab)
  }
}

// 执行命令
async function executeCommand(command: string, targetPath: string) {
  const index = tabs.value.findIndex(t => t.path === targetPath)

  switch (command) {
    case 'refresh':
      if (route.fullPath !== targetPath) {
        await router.push(targetPath)
      }
      router.go(0)
      break
    case 'close-other':
      tabsStore.closeOtherTabs(targetPath)
      if (route.fullPath !== targetPath) {
        await router.push(targetPath)
      }
      break
    case 'close-left':
      if (index > 0) {
        tabsStore.closeLeftTabs(targetPath)
      }
      if (route.fullPath !== targetPath) {
        await router.push(targetPath)
      }
      break
    case 'close-right':
      if (index < tabs.value.length - 1) {
        tabsStore.closeRightTabs(targetPath)
      }
      if (route.fullPath !== targetPath) {
        await router.push(targetPath)
      }
      break
    case 'close-all':
      tabsStore.closeAllTabs()
      if (route.fullPath !== '/admin/dashboard') {
        await router.push('/admin/dashboard')
      }
      break
  }
}

// 右键菜单
function handleContextMenu(event: MouseEvent, tab: TabItem) {
  event.preventDefault()
  contextMenuTab.value = tab
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
}

// 隐藏右键菜单
function hideContextMenu() {
  contextMenuVisible.value = false
}

// 右键菜单操作
function handleContextMenuAction(command: string) {
  const targetPath = contextMenuTab.value?.path
  if (targetPath) {
    void executeCommand(command, targetPath)
  }
  hideContextMenu()
}

// 点击页面其他地方隐藏右键菜单
function handleClickOutside() {
  hideContextMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.layout-tabs {
  position: sticky;
  top: 56px;
  z-index: 1001;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.layout-tabs :deep(.el-tabs) {
  flex: 1;
}

.layout-tabs :deep(.el-tabs__header) {
  margin: 0;
  border: none;
  display: flex;
  align-items: center;
  height: 40px;
}

.layout-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
}

.layout-tabs :deep(.el-tabs__nav) {
  border: none;
}

.layout-tabs :deep(.el-tabs__item) {
  height: 30px;
  line-height: 30px;
  padding: 0 14px;
  border: 1px solid #dcdfe6 !important;
  border-radius: 3px;
  margin-right: 6px;
  background-color: #f5f7fa;
  font-size: 12px;
  transition: all 0.3s;
}

.layout-tabs :deep(.el-tabs__item.is-active) {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff !important;
}

.layout-tabs :deep(.el-tabs__item:hover) {
  color: #409eff;
}

.layout-tabs :deep(.el-tabs__item.is-active:hover) {
  color: #fff;
}

.tab-label {
  display: inline-block;
  width: 100%;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 140px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.context-menu li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin: 0;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.context-menu li:hover:not(.disabled):not(.divider) {
  background-color: #ecf5ff;
  color: #409eff;
}

.context-menu li.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.context-menu li.divider {
  height: 1px;
  padding: 0;
  margin: 4px 0;
  background-color: #e4e7ed;
  cursor: default;
}

.context-menu li .el-icon {
  font-size: 16px;
}
</style>
