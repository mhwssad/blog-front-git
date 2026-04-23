/**
 * Pinia Stores 入口文件
 * 统一导出所有 stores
 */

// ==================== 核心 Stores ====================
export { useAuthStore } from './auth'
export { useTabsStore } from './tabs'
export { useFrontContentStore } from './modules/frontContent'
export { useUserContentStore } from './modules/userContent'

// ==================== 系统管理模块 Stores ====================
export { useUserStore } from './modules/user'
export { useRoleStore } from './modules/role'
export { useMenuStore } from './modules/menu'
export { useConfigStore } from './modules/config'
export { useNoticeStore } from './modules/notice'
export { useLogStore } from './modules/log'
export { useArticleStore } from './modules/article'
export { useCategoryStore } from './modules/category'
export { useTagStore } from './modules/tag'
export { useCommentStore } from './modules/comment'
export { useCollectionStore } from './modules/collection'
export { useInteractionStore } from './modules/interaction'
export { useFootprintStore } from './modules/footprint'
export { useFollowStore } from './modules/follow'
export { useFileStore } from './modules/file'
export { useChatStore } from './modules/chat'

// ==================== 用户中心 Stores ====================
export { useUserNoticeStore } from './modules/userNotice'
