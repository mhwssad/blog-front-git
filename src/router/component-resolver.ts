import type { AuthMenuInfo } from '@/api/types'
import type { RouteRecordRaw } from 'vue-router'
import { defineComponent, h } from 'vue'
import { RouterView } from 'vue-router'

// Conventions are documented in docs/backend-menu-routing-convention.md.
type RouteComponent = NonNullable<RouteRecordRaw['component']>
type ViewModuleLoader = () => Promise<unknown>

const viewModules = import.meta.glob('../views/**/*.vue') as Record<string, ViewModuleLoader>
const routeViewComponentKey = 'layouts/routeview'

const backendRouteView = defineComponent({
  name: 'BackendRouteView',
  setup() {
    return () => h(RouterView)
  },
})

const viewModuleLookup = createViewModuleLookup(viewModules)

export interface ResolvedMenuComponent {
  component: RouteComponent
  resolvedKey: string
}

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

export function resolveMenuComponent(
  menu: Pick<AuthMenuInfo, 'component' | 'routePath' | 'type'>
): ResolvedMenuComponent {
  const componentKey = normalizeLookupKey(menu.component)

  if (menu.type === 'C' && componentKey === routeViewComponentKey) {
    return {
      component: backendRouteView,
      resolvedKey: 'route-view',
    }
  }

  const loader = viewModuleLookup.get(componentKey)
  if (loader) {
    return {
      component: loader,
      resolvedKey: componentKey,
    }
  }

  throw new Error(
    `Failed to resolve menu component "${menu.component ?? ''}" for route "${menu.routePath ?? ''}".`
  )
}
