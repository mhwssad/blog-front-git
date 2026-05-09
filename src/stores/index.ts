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
export { useDashboardStore } from './modules/dashboard'
export { useAdminOpsStore } from './modules/admin'
export { useAuthorApplicationStore } from './modules/authorApplication'
export { useExperienceStore } from './modules/experience'
export { useReportStore } from './modules/report'
export { useAuditLogStore } from './modules/auditLog'
export { useFriendLinkStore } from './modules/friendLink'
export { useMigrationStore } from './modules/migration'
export { useForumAdminStore } from './modules/forumAdmin'

// ==================== 用户中心 Stores ====================
export { useProfileStore } from './modules/profile'
export { useUserForumStore } from './modules/userForum'
export { useUserNoticeStore } from './modules/userNotice'
export { useUserFollowStore } from './modules/userFollow'
export { useUserFileStore } from './modules/userFile'
export { useUserChatStore } from './modules/userChat'
export { useUserAuthorApplicationStore } from './modules/userAuthorApplication'
export { useNotificationSettingsStore } from './modules/notificationSettings'
export { useUserExperienceStore } from './modules/userExperience'

// ==================== AI 模块 Stores ====================
export { useAiChannelStore } from './modules/aiChannel'
export { useAiUsageStore } from './modules/aiUsage'
export { useAiKnowledgeStore } from './modules/aiKnowledge'
export { useAiAgentStore } from './modules/aiAgent'
export { useAiToolStore } from './modules/aiTool'
export { useAiMcpStore } from './modules/aiMcp'
export { useUserAiStore } from './modules/userAi'
