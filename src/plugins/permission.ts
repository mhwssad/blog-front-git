import type { App, DirectiveBinding, ObjectDirective } from 'vue'
import { useAuthStore } from '@/stores'
import {
  checkPermissions,
  type PermissionCheckOptions,
  type PermissionMode,
  type PermissionRequirement,
} from '@/utils/permission'

type PermissionDirectiveAction = 'hide' | 'disable'
type PermissionDirectiveValue = PermissionRequirement | PermissionDirectiveOptions

interface PermissionDirectiveOptions extends PermissionCheckOptions {
  action?: PermissionDirectiveAction
}

interface PermissionHTMLElement extends HTMLElement {
  __permissionDisplay?: string
  __permissionPointerEvents?: string
  __permissionOpacity?: string
  __permissionDisabled?: boolean
  __permissionDisabledTargets?: Array<{
    element: HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    disabled: boolean
  }>
}

function resolveDirectiveOptions(
  binding: DirectiveBinding<PermissionDirectiveValue>
): Required<PermissionDirectiveOptions> {
  const mode: PermissionMode = binding.modifiers.any ? 'any' : 'all'
  const action: PermissionDirectiveAction = binding.modifiers.disable ? 'disable' : 'hide'

  if (typeof binding.value === 'string' || Array.isArray(binding.value)) {
    return {
      permissions: binding.value,
      mode,
      action,
    }
  }

  return {
    permissions: binding.value?.permissions ?? [],
    mode: binding.value?.mode ?? mode,
    action: binding.value?.action ?? action,
  }
}

function applyHiddenState(element: PermissionHTMLElement, allowed: boolean): void {
  if (allowed) {
    if (element.__permissionDisplay !== undefined) {
      element.style.display = element.__permissionDisplay
      delete element.__permissionDisplay
    }
    return
  }

  if (element.__permissionDisplay === undefined) {
    element.__permissionDisplay = element.style.display
  }

  element.style.display = 'none'
}

function applyDisabledState(element: PermissionHTMLElement, allowed: boolean): void {
  const target = element as HTMLButtonElement
  const nestedTargets: Array<
    HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = Array.from(element.querySelectorAll('button, input, select, textarea'))

  if (allowed) {
    if (element.__permissionDisabled !== undefined) {
      target.disabled = element.__permissionDisabled
      delete element.__permissionDisabled
    }
    if (element.__permissionPointerEvents !== undefined) {
      element.style.pointerEvents = element.__permissionPointerEvents
      delete element.__permissionPointerEvents
    }
    if (element.__permissionOpacity !== undefined) {
      element.style.opacity = element.__permissionOpacity
      delete element.__permissionOpacity
    }
    if (element.__permissionDisabledTargets) {
      for (const item of element.__permissionDisabledTargets) {
        item.element.disabled = item.disabled
      }
      delete element.__permissionDisabledTargets
    }
    element.removeAttribute('aria-disabled')
    return
  }

  if (element.__permissionDisabled === undefined) {
    element.__permissionDisabled = target.disabled
  }
  if (element.__permissionPointerEvents === undefined) {
    element.__permissionPointerEvents = element.style.pointerEvents
  }
  if (element.__permissionOpacity === undefined) {
    element.__permissionOpacity = element.style.opacity
  }
  if (element.__permissionDisabledTargets === undefined) {
    element.__permissionDisabledTargets = nestedTargets.map(item => ({
      element: item,
      disabled: item.disabled,
    }))
  }

  target.disabled = true
  for (const item of nestedTargets) {
    item.disabled = true
  }
  element.setAttribute('aria-disabled', 'true')
  element.style.pointerEvents = 'none'
  element.style.opacity = '0.6'
}

function updatePermissionState(
  element: PermissionHTMLElement,
  binding: DirectiveBinding<PermissionDirectiveValue>
): void {
  const authStore = useAuthStore()
  const options = resolveDirectiveOptions(binding)
  const allowed = checkPermissions(authStore.currentUser?.permissions, options)

  if (options.action === 'disable') {
    applyDisabledState(element, allowed)
    return
  }

  applyHiddenState(element, allowed)
}

const permissionDirective: ObjectDirective<PermissionHTMLElement, PermissionDirectiveValue> = {
  mounted(element, binding) {
    updatePermissionState(element, binding)
  },
  updated(element, binding) {
    updatePermissionState(element, binding)
  },
}

export function registerPermissionDirective(app: App): void {
  app.directive('permission', permissionDirective)
}
