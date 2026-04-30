/**
 * 角色管理 Store
 * 基于 auth-api.md 文档 第3节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { RoleApi } from '@/api/sys/role'
import type {
  RoleQueryRequest,
  SysRoleAdminVO,
  SysRoleSaveRequest,
  StatusUpdateRequest,
  RoleMenuAssignRequest,
} from '@/types/api-types'

export const useRoleStore = defineStore('role', () => {
  // ==================== 状态 ====================

  /**
   * 角色列表
   */
  const roles = ref<SysRoleAdminVO[]>([])

  /**
   * 角色总数
   */
  const total = ref(0)

  /**
   * 当前页
   */
  const current = ref(1)

  /**
   * 每页数量
   */
  const size = ref(10)

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前编辑的角色
   */
  const currentRole = ref<SysRoleAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 分页查询角色
   */
  async function fetchRoles(params?: RoleQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await RoleApi.getRoles(params)
      const data = response.data.data

      roles.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询角色详情
   */
  async function fetchRoleById(id: number): Promise<SysRoleAdminVO | null> {
    try {
      const response = await RoleApi.getRoleById(id)
      currentRole.value = response.data.data
      return currentRole.value
    } catch {
      return null
    }
  }

  /**
   * 新增角色
   */
  async function createRole(data: SysRoleSaveRequest): Promise<boolean> {
    try {
      await RoleApi.createRole(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改角色
   */
  async function updateRole(id: number, data: SysRoleSaveRequest): Promise<boolean> {
    try {
      await RoleApi.updateRole(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改角色状态
   */
  async function updateRoleStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await RoleApi.updateRoleStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除角色
   */
  async function deleteRole(id: number): Promise<boolean> {
    try {
      await RoleApi.deleteRole(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 查询角色菜单
   */
  async function fetchRoleMenus(id: number): Promise<number[]> {
    try {
      const response = await RoleApi.getRoleMenus(id)
      return response.data.data
    } catch {
      return []
    }
  }

  /**
   * 分配角色菜单
   */
  async function assignRoleMenus(id: number, data: RoleMenuAssignRequest): Promise<boolean> {
    try {
      await RoleApi.assignRoleMenus(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空列表
   */
  function clearRoles(): void {
    roles.value = []
    total.value = 0
    current.value = 1
  }

  return {
    // 状态
    roles,
    total,
    current,
    size,
    loading,
    currentRole,

    // 操作
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    updateRoleStatus,
    deleteRole,
    fetchRoleMenus,
    assignRoleMenus,
    clearRoles
  }
})
