export type PermissionMode = 'all' | 'any'
export type PermissionRequirement = string | string[]

export interface PermissionCheckOptions {
  permissions: PermissionRequirement
  mode?: PermissionMode
}

function normalizePermissionList(permissions?: string[] | null): string[] {
  return (permissions ?? []).map(permission => permission.trim()).filter(Boolean)
}

function normalizeRequiredPermissions(requirement: PermissionRequirement): string[] {
  return (Array.isArray(requirement) ? requirement : [requirement])
    .map(permission => permission.trim())
    .filter(Boolean)
}

function matchesPermission(grantedPermission: string, requiredPermission: string): boolean {
  if (grantedPermission === '*' || grantedPermission === '*:*:*') {
    return true
  }

  if (grantedPermission === requiredPermission) {
    return true
  }

  const grantedSegments = grantedPermission.split(':')
  const requiredSegments = requiredPermission.split(':')

  if (grantedSegments.length !== requiredSegments.length) {
    return false
  }

  return grantedSegments.every((segment, index) => {
    if (segment === '*') {
      return true
    }

    return segment === requiredSegments[index]
  })
}

export function hasPermission(grantedPermissions: string[] | null | undefined, permission: string): boolean {
  const requiredPermission = permission.trim()

  if (!requiredPermission) {
    return false
  }

  return normalizePermissionList(grantedPermissions).some(grantedPermission =>
    matchesPermission(grantedPermission, requiredPermission)
  )
}

export function hasAnyPermission(
  grantedPermissions: string[] | null | undefined,
  permissions: PermissionRequirement
): boolean {
  const requiredPermissions = normalizeRequiredPermissions(permissions)

  if (requiredPermissions.length === 0) {
    return false
  }

  return requiredPermissions.some(permission => hasPermission(grantedPermissions, permission))
}

export function hasAllPermissions(
  grantedPermissions: string[] | null | undefined,
  permissions: PermissionRequirement
): boolean {
  const requiredPermissions = normalizeRequiredPermissions(permissions)

  if (requiredPermissions.length === 0) {
    return false
  }

  return requiredPermissions.every(permission => hasPermission(grantedPermissions, permission))
}

export function checkPermissions(
  grantedPermissions: string[] | null | undefined,
  requirement: PermissionRequirement | PermissionCheckOptions
): boolean {
  if (typeof requirement === 'string' || Array.isArray(requirement)) {
    return hasAllPermissions(grantedPermissions, requirement)
  }

  return requirement.mode === 'any'
    ? hasAnyPermission(grantedPermissions, requirement.permissions)
    : hasAllPermissions(grantedPermissions, requirement.permissions)
}
