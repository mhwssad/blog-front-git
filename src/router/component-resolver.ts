/**
 * 路由组件解析器
 * 根据后端返回的菜单配置（component 字段）解析为实际的 Vue 组件
 * 规范参考：docs/code-writing-convention.md（Router 规范章节）
 */

import type { AuthMenuInfo } from '@/types/api-types'
import type { RouteRecordRaw } from 'vue-router'
import { defineComponent, h } from 'vue'
import { RouterView } from 'vue-router'

// ==================== 类型定义 ====================

type RouteComponent = NonNullable<RouteRecordRaw['component']>
type ViewModuleLoader = () => Promise<unknown>

// ==================== 模块注册 ====================

/**
 * 使用 Vite 的 import.meta.glob 批量注册所有视图组件
 * key 格式: ../views/**//*.vue
 */
const viewModules = import.meta.glob('../views/**/*.vue')

/**
 * 后台布局路由视图的标识键
 * 当菜单类型为目录(C)时，使用此键匹配路由视图组件
 */
const routeViewComponentKey = 'layouts/routeview'

/**
 * 后台路由视图组件（用于渲染嵌套子路由）
 */
const backendRouteView = defineComponent({
  name: 'BackendRouteView',
  setup() {
    return () => h(RouterView)
  },
})

// ==================== 组件查找 ====================

const viewModuleLookup = createViewModuleLookup(viewModules)

/**
 * 规范化组件路径键
 * 将各种格式的组件路径转为统一的查找键
 * 例如: ../views/admin/user/Users.vue -> admin/user/users
 */
function normalizeLookupKey(value?: string | null): string {
  if (!value) {
    return ''
  }

  return value
    .replace(/\\/g, '/')
    .replace(/^@\//, '')
    .replace(/^\.\.\//, '')
    .replace(/^src\//, '')
    .replace(/^views\//, '')
    .replace(/^\/+/, '')
    .replace(/\.vue$/i, '')
    .replace(/\/index$/i, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase()
}

/**
 * 创建视图模块查找映射
 * 将模块路径规范化后存入 Map，提升查找效率
 */
function createViewModuleLookup(
  modules: Record<string, ViewModuleLoader>
): Map<string, ViewModuleLoader> {
  const lookup = new Map<string, ViewModuleLoader>()

  for (const [modulePath, loader] of Object.entries(modules)) {
    const normalizedKey = normalizeLookupKey(modulePath)
    if (normalizedKey && !lookup.has(normalizedKey)) {
      lookup.set(normalizedKey, loader)
    }
  }

  return lookup
}

// ==================== 导出接口 ====================

export interface ResolvedMenuComponent {
  /** 解析后的组件（可直接用于 RouteRecordRaw.component） */
  component: RouteComponent
  /** 组件在查找表中的键 */
  resolvedKey: string
}

// ==================== 核心函数 ====================

/**
 * 根据菜单配置解析对应组件
 * @param menu - 菜单信息（只取 component、routePath、type 字段）
 * @returns 解析后的组件及其键
 * @throws 当找不到对应组件时抛出错误
 */
export function resolveMenuComponent(
  menu: Pick<AuthMenuInfo, 'component' | 'routePath' | 'type'>
): ResolvedMenuComponent {
  const componentKey = normalizeLookupKey(menu.component)

  // 目录类型菜单使用通用的路由视图组件
  if (menu.type === 'C' && componentKey === routeViewComponentKey) {
    return {
      component: backendRouteView,
      resolvedKey: 'route-view',
    }
  }

  // 尝试从查找表获取组件加载器
  const loader = viewModuleLookup.get(componentKey)
  if (loader) {
    return {
      component: loader,
      resolvedKey: componentKey,
    }
  }

  // 找不到组件时抛出有意义的错误信息
  throw new Error(
    `Failed to resolve menu component "${menu.component ?? ''}" for route "${menu.routePath ?? ''}".`
  )
}
