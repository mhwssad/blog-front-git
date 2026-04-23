<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="collapse"
    :unique-opened="false"
    background-color="#001529"
    text-color="rgba(255, 255, 255, 0.65)"
    active-text-color="#fff"
    mode="vertical"
    class="sidebar-menu-inner"
    @select="handleSelect"
    @open="handleMenuOpen"
    @close="handleMenuClose"
  >
    <SidebarMenuItem
      v-for="item in menuList"
      :key="item.id"
      :item="item"
      :get-icon-component="getIconComponent"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { computed, markRaw, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { MenuInstance } from 'element-plus'
import { useAuthStore } from '@/stores'
import { filterVisibleMenus, getAdminMenus, type AppMenuInfo } from '@/router/menu'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import SidebarMenuItem from './SidebarMenuItem.vue'

interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: false
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// el-menu 组件引用
const menuRef = ref<MenuInstance>()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 菜单列表
const menuList = computed(() => filterVisibleMenus(getAdminMenus(authStore.userMenus)))

// 菜单展开状态 - 使用 localStorage 持久化
const MENU_OPENED_KEY = 'sidebar_menu_opened'
const defaultOpeneds = ref<string[]>([])
const openedMenus = ref<Set<string>>(new Set())

function collectSubMenuIndexes(menus: AppMenuInfo[]): string[] {
  return menus.flatMap(menu => {
    if (!menu.children?.length) {
      return []
    }

    return [String(menu.id), ...collectSubMenuIndexes(menu.children)]
  })
}

// 从 localStorage 恢复展开状态
function restoreOpenState(): void {
  try {
    const saved = localStorage.getItem(MENU_OPENED_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as string[]
      defaultOpeneds.value = parsed
      openedMenus.value = new Set(parsed)
    }
  } catch {
    defaultOpeneds.value = []
    openedMenus.value = new Set()
  }
}

// 保存展开状态到 localStorage
function saveOpenState(openeds: string[]): void {
  try {
    localStorage.setItem(MENU_OPENED_KEY, JSON.stringify(openeds))
  } catch {
    // ignore
  }
}

// 菜单展开事件
function handleMenuOpen(index: string): void {
  openedMenus.value.add(index)
  defaultOpeneds.value = Array.from(openedMenus.value)
  saveOpenState(defaultOpeneds.value)
}

// 菜单收起事件
function handleMenuClose(index: string): void {
  openedMenus.value.delete(index)
  defaultOpeneds.value = Array.from(openedMenus.value)
  saveOpenState(defaultOpeneds.value)
}

// 监听菜单列表变化，在重新渲染后恢复展开状态
watch(menuList, async (newVal, oldVal) => {
  const availableIndexes = new Set(collectSubMenuIndexes(newVal))
  openedMenus.value = new Set([...openedMenus.value].filter(index => availableIndexes.has(index)))
  defaultOpeneds.value = Array.from(openedMenus.value)

  // 如果是第一次加载或内容没有实际变化，不处理
  if (!oldVal || newVal === oldVal) {
    saveOpenState(defaultOpeneds.value)
    return
  }

  // 使用 nextTick 等待 DOM 更新
  await nextTick()
  // 再等待一帧确保 el-menu 组件完全渲染
  await nextTick()
  // 恢复展开状态
  if (menuRef.value && openedMenus.value.size > 0) {
    // 使用 setTimeout 确保在下一帧执行
    setTimeout(() => {
      openedMenus.value.forEach(index => {
        // 检查菜单项是否存在再展开
        if (menuRef.value?.open) {
          menuRef.value.open(index)
        }
      })
    }, 0)
  }
}, { flush: 'post' })

// 初始化时恢复展开状态
restoreOpenState()

// 图标名称到组件的映射
const iconMap: Record<string, any> = {
  Home: markRaw(ElementPlusIcons.House),
  User: markRaw(ElementPlusIcons.User),
  Lock: markRaw(ElementPlusIcons.Lock),
  Menu: markRaw(ElementPlusIcons.Menu),
  Setting: markRaw(ElementPlusIcons.Setting),
  Bell: markRaw(ElementPlusIcons.Bell),
  Document: markRaw(ElementPlusIcons.Document),
  Files: markRaw(ElementPlusIcons.Folder),
  DataAnalysis: markRaw(ElementPlusIcons.DataAnalysis),
}

// 获取图标组件
function getIconComponent(iconName: string) {
  return iconMap[iconName] || iconMap.Menu
}

// 菜单选择事件
function handleSelect(index: string) {
  if (/^(https?:)?\/\//i.test(index)) {
    window.open(index, '_blank', 'noopener,noreferrer')
    return
  }

  router.push(index)
}
</script>

<style scoped>
.sidebar-menu-inner {
  border-right: none;
  height: 100%;
}

.sidebar-menu-inner:not(.el-menu--collapse) {
  width: 240px;
}

.sidebar-menu-inner.el-menu--collapse {
  width: 64px;
}

/* 菜单项样式覆盖 */
.sidebar-menu-inner :deep(.el-menu-item),
.sidebar-menu-inner :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

.sidebar-menu-inner :deep(.el-menu-item:hover),
.sidebar-menu-inner :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.sidebar-menu-inner :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

.sidebar-menu-inner.el-menu--collapse :deep(.el-menu-item),
.sidebar-menu-inner.el-menu--collapse :deep(.el-sub-menu__title) {
  padding: 0 20px;
}

.sidebar-menu-inner.el-menu--collapse :deep(.el-sub-menu__icon-arrow) {
  display: none;
}
</style>
