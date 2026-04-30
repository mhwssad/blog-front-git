/**
 * 菜单管理 Store
 * 基于 auth-api.md 文档 第4节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { MenuApi } from '@/api/sys/menu'
import type { SysMenuAdminVO, SysMenuSaveRequest } from '@/types/api-types'

export const useMenuStore = defineStore('menu', () => {
  // ==================== 状态 ====================

  /**
   * 菜单树
   */
  const menuTree = ref<SysMenuAdminVO[]>([])

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前编辑的菜单
   */
  const currentMenu = ref<SysMenuAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 查询菜单树
   */
  async function fetchMenuTree(): Promise<void> {
    loading.value = true
    try {
      const response = await MenuApi.getMenuTree()
      menuTree.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询菜单详情
   */
  async function fetchMenuById(id: number): Promise<SysMenuAdminVO | null> {
    try {
      const response = await MenuApi.getMenuById(id)
      currentMenu.value = response.data.data
      return currentMenu.value
    } catch {
      return null
    }
  }

  /**
   * 新增菜单
   */
  async function createMenu(data: SysMenuSaveRequest): Promise<boolean> {
    try {
      await MenuApi.createMenu(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改菜单
   */
  async function updateMenu(id: number, data: SysMenuSaveRequest): Promise<boolean> {
    try {
      await MenuApi.updateMenu(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除菜单
   */
  async function deleteMenu(id: number): Promise<boolean> {
    try {
      await MenuApi.deleteMenu(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空菜单树
   */
  function clearMenuTree(): void {
    menuTree.value = []
  }

  return {
    // 状态
    menuTree,
    loading,
    currentMenu,

    // 操作
    fetchMenuTree,
    fetchMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    clearMenuTree,
  }
})
