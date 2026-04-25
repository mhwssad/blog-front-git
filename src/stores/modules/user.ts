/**
 * 用户管理 Store
 * 基于 auth-api.md 文档 第2节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserApi } from '@/api/sys/user'
import type {
  UserQueryRequest,
  SysUserAdminVO,
  SysUserSaveRequest,
  StatusUpdateRequest,
  PasswordResetRequest,
  UserRoleAssignRequest,
  PageResult
} from '@/api/types'

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================

  /**
   * 用户列表
   */
  const users = ref<SysUserAdminVO[]>([])

  /**
   * 用户总数
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
   * 当前编辑的用户
   */
  const currentUser = ref<SysUserAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 分页查询用户
   */
  async function fetchUsers(params?: UserQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await UserApi.getUsers(params)
      const data = response.data.data as PageResult<SysUserAdminVO>

      users.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询用户详情
   */
  async function fetchUserById(id: number): Promise<SysUserAdminVO | null> {
    try {
      const response = await UserApi.getUserById(id)
      currentUser.value = response.data.data
      return currentUser.value
    } catch {
      return null
    }
  }

  /**
   * 新增用户
   */
  async function createUser(data: SysUserSaveRequest): Promise<boolean> {
    try {
      await UserApi.createUser(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改用户
   */
  async function updateUser(id: number, data: SysUserSaveRequest): Promise<boolean> {
    try {
      await UserApi.updateUser(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改用户状态
   */
  async function updateUserStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await UserApi.updateUserStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 重置用户密码
   */
  async function resetUserPassword(id: number, data: PasswordResetRequest): Promise<boolean> {
    try {
      await UserApi.resetUserPassword(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除用户
   */
  async function deleteUser(id: number): Promise<boolean> {
    try {
      await UserApi.deleteUser(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 查询用户角色
   */
  async function fetchUserRoles(id: number): Promise<number[]> {
    try {
      const response = await UserApi.getUserRoles(id)
      return response.data.data
    } catch {
      return []
    }
  }

  /**
   * 分配用户角色
   */
  async function assignUserRoles(id: number, data: UserRoleAssignRequest): Promise<boolean> {
    try {
      await UserApi.assignUserRoles(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空列表
   */
  function clearUsers(): void {
    users.value = []
    total.value = 0
    current.value = 1
  }

  return {
    // 状态
    users,
    total,
    current,
    size,
    loading,
    currentUser,

    // 操作
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    updateUserStatus,
    resetUserPassword,
    deleteUser,
    fetchUserRoles,
    assignUserRoles,
    clearUsers
  }
})
