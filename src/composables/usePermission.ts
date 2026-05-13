import { computed } from 'vue'
import { useAuthStore } from '@/stores'
import {
  checkPermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isSuperAdmin as checkSuperAdmin,
  type PermissionCheckOptions,
  type PermissionRequirement,
} from '@/utils/permission'

export function usePermission() {
  const authStore = useAuthStore()
  const permissions = computed(() => authStore.currentUser?.permissions ?? [])

  return {
    permissions,
    isSuperAdmin: () => checkSuperAdmin(permissions.value),
    hasPermission: (permission: string) => hasPermission(permissions.value, permission),
    hasAnyPermission: (requiredPermissions: PermissionRequirement) =>
      hasAnyPermission(permissions.value, requiredPermissions),
    hasAllPermissions: (requiredPermissions: PermissionRequirement) =>
      hasAllPermissions(permissions.value, requiredPermissions),
    can: (requirement: PermissionRequirement | PermissionCheckOptions) =>
      checkPermissions(permissions.value, requirement),
  }
}
