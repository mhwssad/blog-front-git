/**
 * API 通用类型定义
 * 基于 auth-api.md 与 content-api.md 文档
 */

// ==================== 通用响应结构 ====================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: number
}

export interface PageResult<T> {
  total: number
  current: number
  size: number
  records: T[]
  pages?: number
}

export interface ApiError extends Error {
  code?: number
  response?: {
    data: ApiResponse
    status: number
    statusText: string
  }
  config?: unknown
}

export interface TokenStorage {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// ==================== 认证模块类型 ====================

export interface AuthenticationToken {
  tokenType: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface EmailLoginRequest {
  email: string
  code: string
}

export interface SendEmailCodeRequest {
  email: string
}

export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthUserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  status: number
  userLevel: number
  experiencePoints: number
  roles: string[]
  permissions: string[]
}

export interface AuthMenuInfo {
  id: number
  parentId: number
  routeName?: string
  routePath?: string
  name: string
  component?: string | null
  perm?: string | null
  redirect?: string | null
  alwaysShow?: number
  keepAlive?: number
  icon?: string | null
  type: 'C' | 'M' | 'B' | string
  sort: number
  visible: number
  params?: Record<string, string> | null
  children?: AuthMenuInfo[]
}

// ==================== 系统用户管理类型 ====================

export interface UserQueryRequest {
  current?: number
  size?: number
  username?: string
  nickname?: string
  email?: string
  phone?: string
  status?: number
}

export interface SysUserAdminVO {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  gender?: number
  birthday?: string
  status: number
  userLevel: number
  experiencePoints: number
  levelUpdatedAt?: string
  lastLoginTime?: string
  lastLoginIp?: string
  remark?: string
  roleIds?: number[]
  createTime: string
  updateTime?: string
}

export interface SysUserSaveRequest {
  username: string
  password?: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  gender?: number
  birthday?: string
  status?: number
  remark?: string
}

export interface StatusUpdateRequest {
  status: number
}

export interface PasswordResetRequest {
  password: string
}

export interface UserRoleAssignRequest {
  roleIds: number[]
}

// ==================== 角色管理类型 ====================

export interface RoleQueryRequest {
  current?: number
  size?: number
  name?: string
  code?: string
  status?: number
}

export interface SysRoleAdminVO {
  id: number
  name: string
  code: string
  sort: number
  status: number
  dataScope?: number
  menuIds?: number[]
  remark?: string
  createTime: string
}

export interface SysRoleSaveRequest {
  name: string
  code: string
  sort?: number
  status?: number
  dataScope?: number
  menuIds?: number[]
  remark?: string
}

export interface RoleMenuAssignRequest {
  menuIds: number[]
}

// ==================== 菜单管理类型 ====================

export interface SysMenuAdminVO {
  id: number
  parentId: number
  treePath?: string
  name: string
  routeName?: string
  routePath?: string
  component?: string | null
  perm?: string | null
  alwaysShow?: number
  keepAlive?: number
  icon?: string | null
  type: 'C' | 'M' | 'B' | string
  sort: number
  visible: number
  redirect?: string | null
  params?: Record<string, string> | null
  status?: number
  children?: SysMenuAdminVO[]
}

export interface SysMenuSaveRequest {
  parentId: number
  treePath?: string
  name: string
  type: 'C' | 'M' | 'B' | string
  routeName?: string
  routePath?: string
  component?: string
  perm?: string
  alwaysShow?: number
  keepAlive?: number
  icon?: string
  sort?: number
  visible?: number
  redirect?: string
  params?: Record<string, string> | null
}

// ==================== 配置管理类型 ====================

export interface ConfigQueryRequest {
  current?: number
  size?: number
  configName?: string
  configKey?: string
  createTimeStart?: string
  createTimeEnd?: string
}

export interface SysConfigAdminVO {
  id: number
  configName: string
  configKey: string
  configValue: string
  isSystem: number
  remark?: string
  createTime: string
  updateTime?: string
}

export interface SysConfigSaveRequest {
  configName: string
  configKey: string
  configValue: string
  remark?: string
}

// ==================== 通知管理类型 ====================

export interface NoticeQueryRequest {
  current?: number
  size?: number
  title?: string
  type?: number
  publishStatus?: number
  targetType?: number
}

export interface SysNoticeAdminVO {
  id: number
  title: string
  content: string
  type: number
  level?: string
  targetType?: number
  targetUserIds?: number[]
  publisherId?: number
  status: number
  publishStatus?: number
  publishTime?: string
  revokeTime?: string
  createTime: string
  updateTime?: string
}

export interface SysNoticeSaveRequest {
  title: string
  content: string
  type?: number
  level?: string
  targetType?: number
  targetUserIds?: number[]
}

export interface UserNoticeQueryRequest {
  current?: number
  size?: number
  title?: string
  isRead?: number
}

export interface UserNoticeVO {
  id: number
  noticeId: number
  title: string
  content: string
  type?: number
  level?: string
  publishTime?: string
  isRead: number
  readTime?: string
  createTime: string
}

// ==================== 日志管理类型 ====================

export interface LogQueryRequest {
  current?: number
  size?: number
  module?: string
  action?: string
  username?: string
  requestMethod?: string
  requestUri?: string
  ip?: string
  createBy?: number
  startTime?: string
  endTime?: string
  createTimeStart?: string
  createTimeEnd?: string
}

export interface SysLogAdminVO {
  id: number
  module: string
  action: string
  description: string
  username: string
  ip: string
  location: string
  userAgent: string
  requestMethod: string
  requestUrl: string
  requestUri?: string
  requestParams?: string
  responseContent?: string
  content?: string
  method?: string
  province?: string
  city?: string
  executionTime?: number
  browser?: string
  browserVersion?: string
  os?: string
  createBy?: number
  executeTime: number
  status: number
  createTime: string
}

export interface SysLogCleanRequest {
  module?: string
  requestMethod?: string
  requestUri?: string
  ip?: string
  createBy?: number
  startTime?: string
  endTime?: string
  createTimeStart?: string
  createTimeEnd?: string
}

// ==================== 内容域后台管理类型 ====================

export interface ArticleQueryRequest {
  current?: number
  size?: number
  keyword?: string
  authorId?: number
  status?: number
  reviewStatus?: number
  accessLevel?: number
  visibilityScope?: number
  categoryId?: number
  tagId?: number
  isTop?: number
  publishTimeStart?: string
  publishTimeEnd?: string
}

export interface ArticleAccessItem {
  userId: number
  accessType: number
  expireTime?: string | null
  grantReason?: string | null
}

export interface ArticleAdminVO {
  id: number
  title: string
  summary?: string | null
  coverImage?: string | null
  authorId: number
  authorName: string
  isTop: number
  isOriginal: number
  status: number
  reviewStatus: number
  accessLevel: number
  visibilityScope?: number
  viewCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  shareCount: number
  publishTime?: string | null
  scheduledPublishTime?: string | null
  createdAt: string
  updatedAt?: string | null
  remark?: string | null
}

export interface ArticleDetailVO extends ArticleAdminVO {
  content?: string | null
  sourceUrl?: string | null
  categoryIds?: number[]
  tagIds?: number[]
  accessList?: ArticleAccessItem[]
}

export interface ArticleSaveRequest {
  title: string
  authorId: number
  summary?: string
  content?: string
  coverImage?: string
  isTop?: number
  isOriginal?: number
  sourceUrl?: string
  status?: number
  scheduledPublishTime?: string
  publishTime?: string
  accessLevel?: number
  visibilityScope?: number
  remark?: string
  categoryIds?: number[]
  tagIds?: number[]
  accessList?: ArticleAccessItem[]
}

export interface ArticleAccessSaveRequest {
  accessList: ArticleAccessItem[]
}

export interface CategorySaveRequest {
  parentId: number
  name: string
  code: string
  type: string
  sortOrder?: number
  icon?: string
  description?: string
  status?: number
}

export interface CategoryAdminVO {
  id: number
  parentId: number
  name: string
  code: string
  type: string
  ancestors?: string
  level?: number
  sortOrder?: number
  icon?: string | null
  description?: string | null
  status: number
  createdAt?: string
  updatedAt?: string
  children?: CategoryAdminVO[]
}

export interface TagVO {
  id: number
  name: string
  color?: string | null
  createdAt?: string
}

export interface TagSaveRequest {
  name: string
  color?: string
}

export interface CommentQueryRequest {
  current?: number
  size?: number
  targetId?: number
  targetType?: string
  userId?: number
  rootId?: number
  parentId?: number
  status?: number
}

export interface CommentVO {
  id: number
  targetId: number
  targetType: string
  content: string
  images?: string[]
  userId: number
  userNickname: string
  userAvatar?: string | null
  rootId?: number
  parentId?: number
  likeCount: number
  replyCount: number
  status: number
  createdAt: string
  liked?: boolean
  children?: CommentVO[]
}

export interface CollectionFolderQueryRequest {
  current?: number
  size?: number
  userId?: number
  folderId?: number
  targetId?: number
  targetType?: string
}

export interface CollectionFolderVO {
  id: number
  userId: number
  folderName: string
  folderType: string
  description?: string | null
  isPublic: number
  isDefault: number
  sortOrder: number
  collectionCount: number
  createdAt?: string
  updatedAt?: string
}

export interface CollectionVO {
  id: number
  userId: number
  folderId: number
  targetId: number
  targetType: string
  remark?: string | null
  targetTitle?: string | null
  targetUrl?: string | null
  createdAt: string
}

export interface InteractionQueryRequest {
  current?: number
  size?: number
  userId?: number
  targetId?: number
  targetType?: string
  actionType?: string
}

export interface InteractionVO {
  id: number
  userId: number
  targetId: number
  targetType: string
  actionType: string
  createdAt: string
}

export interface FootprintQueryRequest {
  current?: number
  size?: number
  userId?: number
  targetId?: number
  targetType?: string
  visitedAtStart?: string
  visitedAtEnd?: string
}

export interface FootprintVO {
  id: number
  userId: number
  targetId: number
  targetType: string
  targetTitle?: string | null
  targetUrl?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  visitedAt: string
}

// ==================== 前台公开内容类型 ====================

export interface PublicArticleQueryRequest {
  current?: number
  size?: number
  keyword?: string
  categoryId?: number
  tagId?: number
  sort?: 'latest' | 'top' | 'hot'
}

export interface PublicArticleCardVO {
  id: number
  title: string
  summary?: string | null
  coverImage?: string | null
  authorId: number
  authorName: string
  isTop: number
  accessLevel: number
  viewCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  publishTime?: string | null
}

export interface PublicTagQueryRequest {
  targetType?: string
}

export interface PublicTagVO {
  id: number
  name: string
  color?: string | null
}

export interface PublicCategoryTreeVO {
  id: number
  parentId: number
  name: string
  code: string
  type: string
  level?: number
  sortOrder?: number
  icon?: string | null
  description?: string | null
  children?: PublicCategoryTreeVO[]
}

export interface PublicArticleDetailVO {
  id: number
  title: string
  summary?: string | null
  content?: string | null
  coverImage?: string | null
  authorId: number
  authorName: string
  isTop: number
  isOriginal: number
  sourceUrl?: string | null
  accessLevel: number
  visibilityScope: number
  viewCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  shareCount: number
  publishTime?: string | null
  categories?: PublicCategoryTreeVO[]
  tags?: PublicTagVO[]
  liked?: boolean
  collected?: boolean
  canComment?: boolean
  seriesList?: ArticleSeriesSummaryVO[]
}

export interface ArticleSeriesSummaryVO {
  id: number
  title: string
  coverImage: string | null
  articleCount: number
  sortOrder: number
  visibilityScope: number
}

export interface PublicCommentQueryRequest {
  current?: number
  size?: number
  targetType?: string
  targetId?: number
}

export interface PublicCommentVO extends CommentVO {}

// ==================== 用户内容行为类型 ====================

export interface CommentSaveRequest {
  targetType: string
  targetId: number
  content: string
  images?: string[]
  rootId?: number
  parentId?: number
}

export interface CollectionFolderSaveRequest {
  folderName: string
  folderType: string
  description?: string
  isPublic?: number
  isDefault?: number
  sortOrder?: number
}

export interface CollectionSaveRequest {
  folderId?: number
  targetId: number
  targetType: string
  remark?: string
}

export interface UserCollectionQueryRequest {
  current?: number
  size?: number
}

export interface UserFootprintQueryRequest {
  current?: number
  size?: number
  targetType?: string
}

export interface UserFootprintVO {
  id: number
  targetId: number
  targetType: string
  targetTitle?: string | null
  targetUrl?: string | null
  visitedAt: string
}

// ==================== 关注关系类型 ====================

export interface UserFollowPageQueryRequest {
  current?: number
  size?: number
  specialOnly?: boolean
}

export interface PublicFollowPageQueryRequest {
  current?: number
  size?: number
}

export interface UserFollowUserVO {
  relationId: number
  userId: number
  username: string
  nickname: string
  avatar?: string | null
  isSpecialFollow: number
  remark?: string | null
  mutualFollow: number
  followTime: string
}

export interface PublicFollowUserVO {
  userId: number
  username: string
  nickname: string
  avatar?: string | null
  followTime: string
}

export interface UserFollowMutualVO {
  targetUserId: number
  following: boolean
  followedBy: boolean
  mutualFollow: boolean
}

export interface UserFollowCountVO {
  followingCount: number
  fanCount: number
}

export interface UserFollowSpecialUpdateRequest {
  specialFollow: number
}

export interface UserFollowRemarkUpdateRequest {
  remark?: string | null
}

export interface FollowAdminQueryRequest {
  current?: number
  size?: number
  followerId?: number
  followingId?: number
  followStatus?: number
  specialFollow?: number
  source?: string
  keyword?: string
}

export interface FollowAdminRelationVO {
  relationId: number
  followerId: number
  followerUsername: string
  followerNickname: string
  followerStatus?: number
  followerDeletedFlag?: number
  followingId: number
  followingUsername: string
  followingNickname: string
  followingStatus?: number
  followingDeletedFlag?: number
  followStatus: number
  isSpecialFollow: number
  source?: string | null
  remark?: string | null
  followTime?: string | null
  unfollowTime?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface FollowRelationCleanRequest {
  cleanInactive: boolean
  cleanDeletedUsers: boolean
  cleanDisabledUsers: boolean
}

// ==================== 文件与上传类型 ====================

export interface FileUploadInitRequest {
  originalName: string
  fileSize: number
  fileMd5?: string
  mimeType?: string
  referenceType?: string
  referenceId?: number
  category?: string
  isPublic?: number
  totalChunks?: number
  chunkSize?: number
  remark?: string
}

export interface FileUploadInitVO {
  taskId: number
  uploadId: string
  uploadMode: number
  quickUploadAvailable: boolean
  completed: boolean
  totalChunks?: number
  chunkSize?: number
  taskStatus: number
  fileId?: number
  fileUrl?: string | null
  businessId?: number
}

export interface FileUploadResultVO {
  uploadId: string
  taskId: number
  fileId?: number
  businessId?: number
  quickUpload: boolean
  taskStatus: number
  fileUrl?: string | null
  referenceCount?: number
}

export interface ChunkUploadVO {
  uploadId: string
  chunkNumber: number
  uploadedChunks: number
  totalChunks: number
  taskStatus: number
}

export interface UserFilePageQueryRequest {
  current?: number
  size?: number
  keyword?: string
  status?: number
  category?: string
  referenceType?: string
}

export interface UserFileVO {
  businessId: number
  fileId: number
  fileName: string
  originalName: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType?: string | null
  category?: string | null
  referenceType?: string | null
  referenceId?: number
  isPublic: number
  status: number
  createdAt: string
}

export interface UserFileTaskPageQueryRequest {
  current?: number
  size?: number
  taskStatus?: number
  isQuickUpload?: number
  isChunked?: number
}

export interface UserFileTaskVO {
  id: number
  uploadId: string
  fileId?: number
  originalName: string
  fileSize: number
  isQuickUpload: number
  isChunked: number
  chunkSize?: number
  totalChunks?: number
  uploadedChunks?: number
  taskStatus: number
  errorCode?: string | null
  errorMessage?: string | null
  startTime?: string | null
  completeTime?: string | null
  createdAt: string
}

export interface FileAdminPageQueryRequest {
  current?: number
  size?: number
  keyword?: string
  uploadUserId?: number
  status?: number
  category?: string
  referenceType?: string
  isPublic?: number
}

export interface FileAdminVO {
  id: number
  fileName: string
  originalName: string
  filePath?: string | null
  fileUrl: string
  storageKey?: string | null
  fileSize: number
  fileType: string
  mimeType?: string | null
  fileExtension?: string | null
  uploadUserId?: number
  isPublic: number
  category?: string | null
  status: number
  referenceCount?: number
  createdAt: string
}

export interface FileReferenceVO {
  id: number
  userId: number
  referenceType: string
  referenceId?: number
  isPublic: number
  category?: string | null
  remark?: string | null
  createdAt: string
}

export interface FileTaskAdminVO {
  id: number
  uploadId: string
  fileId?: number
  uploadUserId?: number
  originalName: string
  fileSize: number
  storageKey?: string | null
  isQuickUpload: number
  isChunked: number
  uploadedChunks?: number
  totalChunks?: number
  taskStatus: number
  errorCode?: string | null
  errorMessage?: string | null
  createdAt: string
  completeTime?: string | null
}

export interface FileDetailVO extends FileAdminVO {
  references?: FileReferenceVO[]
  tasks?: FileTaskAdminVO[]
}

export interface FileTaskPageQueryRequest {
  current?: number
  size?: number
  uploadUserId?: number
  taskStatus?: number
  isQuickUpload?: number
  isChunked?: number
}

export interface FileStatusUpdateRequest {
  status: number
}

// ==================== 前台公开关注类型 ====================

export interface PublicFollowUserListVO extends PublicFollowUserVO {}

// ==================== 聊天类型 ====================

export interface UserChatConversationQueryRequest {
  current?: number
  size?: number
  keyword?: string
}

export interface UserChatMessageQueryRequest {
  current?: number
  size?: number
  beforeMessageId?: number
}

export interface ChatMessageFileVO {
  businessId: number
  fileId: number
  fileName: string
  originalName: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType?: string | null
  previewUrl?: string | null
  thumbnailUrl?: string | null
  width?: number | null
  height?: number | null
  durationSeconds?: number | null
  waveform?: number[] | null
  transcodeStatus?: 'source' | 'pending' | 'ready' | 'failed' | string
}

export interface ChatReplySnapshotVO {
  id: number
  senderId: number
  senderUsername?: string | null
  senderNickname?: string | null
  senderAvatar?: string | null
  messageType: 'text' | 'file' | 'image' | 'voice' | string
  replyToMessageId?: number | null
  content?: string | null
  file?: ChatMessageFileVO | null
  revoked: boolean
  deleted?: boolean
  state?: 'normal' | 'revoked' | 'unavailable' | string
  createdAt: string
}

export interface ChatMessageVO {
  id: number
  conversationId: number
  senderId: number
  senderUsername?: string | null
  senderNickname?: string | null
  senderAvatar?: string | null
  messageType: 'text' | 'file' | 'image' | 'voice' | string
  content?: string | null
  file?: ChatMessageFileVO | null
  replyMessageId?: number | null
  reply?: ChatReplySnapshotVO | null
  clientMessageId?: string | null
  deliveryStatus?: number
  readByCurrentUser?: boolean
  revokeStatus?: number
  revokedBy?: number | null
  revokedAt?: string | null
  totalRecipientCount?: number
  deliveredRecipientCount?: number
  readRecipientCount?: number
  revoked: boolean
  edited: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ChatConversationVO {
  id: number
  conversationType: 'single' | 'group' | 'global' | string
  sceneType?: 'single_chat' | 'user_group' | 'hall_channel' | 'topic_channel' | 'global_channel' | string
  name?: string | null
  avatar?: string | null
  notice?: string | null
  visibilityScope?: 'public' | 'member' | 'private' | string
  allowGuestView?: number
  requireJoinToSpeak?: number
  joinRule?: 'free' | 'approval' | 'invite_only' | string
  speakLevelLimit?: number
  memberLimit?: number
  slowModeSeconds?: number
  displaySort?: number
  channelCategoryCode?: string | null
  selfRole?: 'owner' | 'admin' | 'member' | string
  ownerId?: number | null
  memberCount?: number
  unreadCount?: number
  status?: number
  isAllSite?: number
  targetUserId?: number | null
  targetUsername?: string | null
  targetNickname?: string | null
  lastMessage?: ChatMessageVO | null
  createdAt?: string
  updatedAt?: string
}

export interface ChatSingleConversationCreateRequest {
  targetUserId: number
}

export interface ChatSendTextRequest {
  conversationId?: number
  targetUserId?: number
  content: string
  clientMessageId?: string
  replyMessageId?: number
}

export interface ChatSendFileRequest {
  conversationId?: number
  targetUserId?: number
  businessId: number
  clientMessageId?: string
  replyMessageId?: number
}

export interface ChatMessageEditRequest {
  content: string
}

export interface ChatConversationReadRequest {
  readMessageId: number
}

export interface ChatConversationReadVO {
  conversationId: number
  userId: number
  readMessageId: number
  readAt?: string | null
  deliveredMessageId?: number | null
  deliveredAt?: string | null
  unreadCount: number
}

export interface ChatGroupCreateRequest {
  name: string
  avatar?: string | null
  description?: string | null
  announcement?: string | null
  categoryCode?: string | null
  visibilityScope?: 'public' | 'private' | string
  joinRule?: 'free' | 'approval' | 'invite_only' | string
  speakLevelLimit?: number
  memberLimit?: number
  slowModeSeconds?: number
  memberUserIds: number[]
}

export interface ChatGroupOwnerTransferRequest {
  targetUserId: number
}

export interface ChatGroupMuteRequest {
  muteUntil?: string | null
}

export interface ChatGroupNoticeUpdateRequest {
  notice?: string | null
}

export interface ChatGroupMemberInviteRequest {
  memberUserIds: number[]
}

export interface ChatGroupMemberVO {
  userId: number
  username?: string | null
  nickname?: string | null
  avatar?: string | null
  role: 'owner' | 'admin' | 'member' | string
  status?: number
  muteUntil?: string | null
  joinedAt?: string | null
}

export interface SysChatConversationQueryRequest {
  current?: number
  size?: number
  keyword?: string
  conversationType?: 'single' | 'group' | 'global' | string
  status?: number
  ownerId?: number
  memberUserId?: number
  isAllSite?: number
}

export interface SysChatMessageQueryRequest {
  current?: number
  size?: number
  beforeMessageId?: number
  senderId?: number
  messageType?: 'text' | 'file' | 'image' | 'voice' | string
  keyword?: string
}

export interface SysChatReceiptQueryRequest {
  current?: number
  size?: number
  recipientUserId?: number
  deliveryStatus?: number
  visibleStatus?: number
}

export interface SysChatReceiptVO {
  recipientUserId: number
  recipientUsername?: string | null
  recipientNickname?: string | null
  receiveType?: string | null
  deliveryStatus: number
  deliveredAt?: string | null
  readAt?: string | null
  visibleStatus: number
}

export interface SysChatMemberRoleUpdateRequest {
  role: 'owner' | 'admin' | 'member' | string
}

export interface SysChatMemberStatusUpdateRequest {
  status: number
}

export interface SysChatConversationStatusUpdateRequest {
  status: number
}

// ==================== AI 模块类型 ====================

export interface AiSessionCreateRequest {
  channelConfigId?: number
  title?: string
  sceneType?: string
}

export interface AiSessionVO {
  id: number
  title: string
  channelConfigId: number
  sceneType: string
  status: number
  lastMessageAt?: string
  createdAt: string
  updatedAt?: string
}

export interface AiSessionDetailVO extends AiSessionVO {
  channelName: string
  modelName: string
}

export interface AiMessageVO {
  id: number
  roleType: 'user' | 'assistant' | 'system' | string
  content: string
  tokenCount?: number
  responseStatus: number
  errorMessage?: string | null
  createdAt: string
}

export interface AiMessageSendRequest {
  content: string
  requestSceneType?: string
  requestTargetId?: number
}

export interface AiQuotaVO {
  dailyLimit: number
  usedToday: number
  remainingToday: number
}

export interface AiChannelConfigVO {
  id: number
  channelCode: string
  channelName: string
  provider: string
  modelName: string
  apiBaseUrl?: string
  apiKeyEncrypted?: string
  dailyQuota: number
  userDailyQuota: number
  maxContextTokens: number
  dataScopeJson?: string
  systemPromptTemplate?: string
  status: number
  isDefault: number
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt?: string
}

export interface AiChannelConfigSaveRequest {
  channelCode: string
  channelName: string
  provider: string
  modelName: string
  apiBaseUrl?: string
  apiKeyEncrypted?: string
  dailyQuota?: number
  userDailyQuota?: number
  maxContextTokens?: number
  dataScopeJson?: string
  systemPromptTemplate?: string
  status?: number
  isDefault?: number
  mfaTicket?: string
}

export interface AiChannelStatusRequest {
  status: number
}

export interface AiSessionAdminVO {
  id: number
  userId: number
  username: string
  nickname: string
  channelConfigId: number
  channelName: string
  title: string
  sceneType: string
  status: number
  lastMessageAt?: string
  createdAt: string
  updatedAt?: string
}

export interface AiUsageLogVO {
  id: number
  userId: number
  channelConfigId: number
  sessionId: number
  requestSceneType: string
  requestTokens: number
  responseTokens: number
  totalTokens: number
  quotaCost: number
  successStatus: number
  errorCode?: string
  createdAt: string
}

export interface AiUsageStatsVO {
  totalCalls: number
  successCalls: number
  failedCalls: number
  totalTokens: number
  totalQuotaCost: number
}

// ==================== 举报模块类型 ====================

export interface ReportCreateRequest {
  targetType: 'article' | 'comment' | 'user' | 'chat_message' | string
  targetId: number
  reasonCode: string
  reasonDetail?: string
}

export interface ReportVO {
  id: number
  targetType: string
  targetId: number
  reasonCode: string
  reasonDetail?: string | null
  status: number
  reportedAt: string
}

export interface ReportAdminVO {
  id: number
  reportTargetType: string
  reportTargetId: number
  reporterUserId: number
  reporterUsername: string
  reasonCode: string
  reasonDetail?: string | null
  status: number
  handlerUserId?: number
  handlerUsername?: string
  resultType?: string
  punishmentType?: string
  reportedAt: string
  handledAt?: string
  createdAt: string
}

export interface ReportHandleRequest {
  resultType: 'delete_content' | 'revoke_message' | 'mute_user' | 'ban_user' | 'record_only' | string
  punishmentType?: string
  remark?: string
}

export interface ReportRejectRequest {
  remark?: string
}

export interface ReportHandleLogVO {
  id: number
  fromStatus: number
  toStatus: number
  actionType: string
  actionResult?: string
  operatorUserId: number
  operatorUsername: string
  actionRemark?: string
  createdAt: string
}

// ==================== 公开作者主页类型 ====================

export interface PublicAuthorProfileVO {
  userId: number
  username: string
  nickname: string
  avatar: string
  userLevel: number
  author: boolean
  authorBadge: string | null
  publicArticleCount: number
  publicSeriesCount: number
  showcaseArticleIds: number[]
  representativeArticleIds: number[]
  featuredSeriesIds: number[]
  featuredColumnIds: number[]
}

// ==================== 用户等级与经验类型 ====================

export interface UserLevelInfoVO {
  level: number
  currentExperience: number
  nextLevelExperience: number
  levelTitle: string
  progress: number
  dailyExperienceLimit: number
  dailyExperienceUsed: number
  dailyExperienceRemaining: number
}

export interface UserExperienceSummaryVO {
  userId: number
  username: string
  nickname: string
  level: number
  currentExperience: number
  nextLevelExperience: number
  dailySummary: Record<string, unknown>
}

export interface ExperienceLogVO {
  id: number
  userId: number
  sourceType: string
  sourceTypeLabel: string
  experienceChange: number
  experienceBefore: number
  experienceAfter: number
  levelBefore: number
  levelAfter: number
  description: string
  createdAt: string
}

export interface UserLevelAdjustRequest {
  adjustType: 'level' | 'experience'
  newValue: number
  reason?: string
}

// ==================== 作者申请类型 ====================

export interface UserAuthorApplicationSubmitRequest {
  applyReason: string
  contentDirection: string
  introduction?: string
  sampleLinks?: string[]
}

export interface UserAuthorApplicationVO {
  id: number
  applyStatus: number
  applyStatusLabel: string
  applyReason: string
  contentDirection: string
  introduction?: string | null
  sampleLinks?: string[]
  reviewerId?: number
  reviewComment?: string | null
  submittedAt: string
  reviewedAt?: string
}

export interface SysAuthorApplicationAdminPageQuery {
  current?: number
  size?: number
  userId?: number
  applyStatus?: number
  keyword?: string
}

export interface SysAuthorApplicationAdminVO {
  id: number
  userId: number
  username: string
  nickname: string
  applyStatus: number
  applyStatusLabel: string
  applyReason: string
  contentDirection: string
  introduction?: string | null
  sampleLinks?: string[]
  reviewerId?: number
  reviewerUsername?: string
  reviewerNickname?: string
  reviewComment?: string | null
  submittedAt: string
  reviewedAt?: string
}

export interface SysAuthorApplicationAdminReviewRequest {
  reviewStatus: 1 | 2 | 3
  reviewComment?: string
}

export interface SysAuthorApplicationRepairRequest {
  targetStatus: 0 | 1 | 2 | 3
  reviewComment: string
}

// ==================== 通知设置类型 ====================

export interface UserNotificationSettingItemVO {
  type: string
  label: string
  enabled: boolean
}

export interface UserNotificationSettingBatchUpdateRequest {
  settings: Array<{
    type: string
    enabled: boolean
  }>
}

export interface UserNotificationSettingStatusUpdateRequest {
  enabled: boolean
}

// ==================== 2FA 相关类型 ====================

export interface MfaVerifyRequest {
  code: string
}

export interface MfaVerifyResponse {
  ticket: string
  expiresIn: number
}

export interface BanUserRequest {
  mfaTicket: string
  banReason?: string
  unbanReason?: string
}

export interface AdjustLevelRequest {
  level: number
  mfaTicket: string
}

export interface AdjustExperienceRequest {
  experience: number
  mfaTicket: string
}

export interface AccountTakeoverRequest {
  targetUserId: number
  mfaTicket: string
}

export interface AccountTakeoverResponse {
  takeoverToken: string
  expiresIn: number
}

export interface TakeoverLoginRequest {
  takeoverToken: string
}

export interface UserRoleAuditAssignRequest {
  roleIds: number[]
  mfaTicket: string
}

// ==================== 经验来源配置类型 ====================

export interface ExperienceSourceConfigVO {
  configKey: string
  configValue: string
}

export interface ExperienceSourceConfigRequest {
  configKey: string
  configValue: string
}

// ==================== 文章审核相关类型 ====================

export interface ArticleReviewLogVO {
  id: number
  articleId: number
  actionType: string
  actionTypeLabel: string
  fromReviewStatus: number
  fromReviewStatusLabel: string
  toReviewStatus: number
  toReviewStatusLabel: string
  operatorUserId: number
  operatorUsername: string
  operatorNickname: string
  reviewComment?: string | null
  operatedAt: string
}

export interface ArticleReviewSubmitRequest {
  reviewComment?: string
}

export interface ArticleReviewDecisionRequest {
  reviewComment?: string
}

export interface ArticleReviewRepairRequest {
  targetReviewStatus: number
  reviewComment: string
}

export interface ArticleReviewAdminDetailVO {
  article: ArticleDetailVO
  reviewLogs: ArticleReviewLogVO[]
}

// ==================== 文章系列相关类型 ====================

export interface ArticleSeriesSaveRequest {
  title: string
  description?: string
  coverImage?: string
  status?: number
  visibilityScope?: number
  sortOrder?: number
}

export interface ArticleSeriesArticleRequest {
  articleId: number
}

export interface ArticleSeriesSortRequest {
  articleIds: number[]
}

export interface PublicArticleSeriesVO {
  id: number
  title: string
  description: string | null
  coverImage: string | null
  ownerUserId: number
  ownerName: string
  visibilityScope: number
  articleCount: number
  sortOrder: number
  createdAt: string
  updatedAt?: string
}

export interface PublicArticleSeriesDetailVO extends PublicArticleSeriesVO {
  articles: ArticleSeriesArticleVO[]
}

export interface ArticleSeriesArticleVO {
  id: number
  title: string
  summary: string | null
  coverImage: string | null
  status: number
  reviewStatus: number
  visibilityScope: number
  publishTime: string | null
  seqNo: number
}

export interface UserArticleSeriesVO extends PublicArticleSeriesVO {}

export interface UserArticleSeriesDetailVO extends PublicArticleSeriesDetailVO {}

export interface ArticleAccessAssignRequest {
  accessList: ArticleAccessItem[]
}

// ==================== 补充后台通知类型 ====================

export interface SysNoticePublishRequest {
  // 发布通知接口可能需要
}

export interface SysNoticeRevokeRequest {
  // 撤回通知接口可能需要
}

// ==================== 补充会话类型字段 (chat-api.md) ====================

export interface ChatLobbyMessageVO {
  id: number
  senderId: number
  senderUsername: string
  senderNickname: string
  senderAvatar: string
  content: string
  messageType: 'text' | 'file' | 'image' | 'voice' | string
  createdAt: string
}

export interface ChatGroupSearchRequest {
  current?: number
  size?: number
  keyword?: string
  categoryCode?: string
}

export interface ChatGroupSearchVO {
  id: number
  name: string
  description: string | null
  notice: string | null
  visibilityScope: 'public' | 'private' | string
  joinRule: 'free' | 'approval' | 'invite_only' | string
  memberLimit: number
  memberCount: number
  joined: boolean
  selfRole: string | null
}

export interface ChannelApplicationRequest {
  desiredName: string
  desiredSceneType: 'topic_channel' | string
  desiredCategoryCode: string
  description?: string
}

export interface ChannelApplicationVO {
  id: number
  desiredName: string
  desiredSceneType: string
  desiredCategoryCode: string
  description?: string | null
  applyStatus: number
  reviewComment?: string | null
  createdAt: string
  reviewedAt?: string
}

export interface ForumLinkRequest {
  forumPostId: number
  conversationId: number
}

export interface ForumLinkVO {
  id: number
  forumPostId: number
  conversationId: number
  conversationName: string
  createdAt: string
}

export interface GroupJoinApplicationRequest {
  applyMessage?: string
}

export interface GroupJoinApplicationVO {
  id: number
  conversationId: number
  userId: number
  username: string
  nickname: string
  applyMessage?: string | null
  applyStatus: number
  reviewComment?: string | null
  createdAt: string
  reviewedAt?: string
}

export interface GroupJoinApplicationReviewRequest {
  reviewStatus: 1 | 2
  reviewComment?: string
}

export interface GroupInviteLinkCreateRequest {
  expireAt?: string
  maxUseCount?: number
}

export interface GroupInviteLinkVO {
  id: number
  conversationId: number
  inviteToken: string
  expireAt?: string | null
  maxUseCount: number
  usedCount: number
  status: number
  createdAt: string
}

export interface SysChannelApplicationQueryRequest {
  current?: number
  size?: number
  applyStatus?: number
  keyword?: string
}

export interface SysChannelApplicationVO {
  id: number
  userId: number
  username: string
  nickname: string
  desiredName: string
  desiredSceneType: string
  desiredCategoryCode: string
  description?: string | null
  applyStatus: number
  reviewComment?: string | null
  reviewerId?: number
  reviewerUsername?: string
  reviewerNickname?: string
  createdAt: string
  reviewedAt?: string
}

export interface SysChannelApplicationReviewRequest {
  reviewStatus: 1 | 2 | 3
  reviewComment?: string
}

export interface SysTopicChannelSaveRequest {
  name: string
  avatar?: string
  description?: string
  announcement?: string
  categoryCode?: string
  visibilityScope?: 'public' | 'member' | 'private' | string
  joinRule?: 'free' | 'approval' | 'invite_only' | string
  speakLevelLimit?: number
  memberLimit?: number
  slowModeSeconds?: number
  displaySort?: number
  ownerId?: number
}

// ==================== 公开频道类型 ====================

export interface PublicChannelVO {
  id: number
  name: string
  avatar: string | null
  description: string | null
  memberCount: number
  messageCount: number
  categoryCode: string | null
  categoryName: string | null
  visibilityScope: string
  createdAt: string
}

export interface PublicChannelDetailVO {
  id: number
  name: string
  avatar: string | null
  description: string | null
  announcement: string | null
  memberCount: number
  messageCount: number
  categoryCode: string | null
  categoryName: string | null
  visibilityScope: string
  joinRule: string
  speakLevelLimit: number
  createdAt: string
}

// ==================== 后台数据看板类型 ====================

export interface DashboardRangeVO {
  startTime: string | null
  endTime: string | null
  rangeType: string
}

export interface DashboardOverviewVO {
  range: DashboardRangeVO
  registeredUserCount: number
  activeUserCount: number
  authorCount: number
  articleCount: number
  pendingArticleReviewCount: number
  commentCount: number
  chatMessageCount: number
  aiCallCount: number
  reportCount: number
  pendingReportCount: number
}

export interface DashboardContentVO {
  range: DashboardRangeVO
  articleCount: number
  pendingArticleReviewCount: number
  commentCount: number
  likeCount: number
  collectCount: number
}

export interface DashboardCommunityVO {
  range: DashboardRangeVO
  chatMessageCount: number
  lobbyMessageCount: number
  groupCount: number
}

export interface DashboardAiVO {
  range: DashboardRangeVO
  aiCallCount: number
  aiSuccessCallCount: number
  aiFailedCallCount: number
}

export interface DashboardGovernanceVO {
  range: DashboardRangeVO
  reportCount: number
  pendingReportCount: number
  processingReportCount: number
  handledReportCount: number
  rejectedReportCount: number
}

export interface DashboardQueryRequest {
  rangeType?: 'today' | 'week' | 'month' | 'all' | 'custom'
  startTime?: string
  endTime?: string
}

// ==================== 用户文章类型 ====================

export interface UserArticleQueryRequest {
  current?: number
  size?: number
  keyword?: string
  status?: number
  reviewStatus?: number
  visibilityScope?: number
  categoryId?: number
  tagId?: number
}

export interface UserArticleVO {
  id: number
  title: string
  summary?: string | null
  coverImage?: string | null
  isTop: number
  isOriginal: number
  status: number
  reviewStatus: number
  accessLevel: number
  visibilityScope?: number
  viewCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  shareCount: number
  publishTime?: string | null
  scheduledPublishTime?: string | null
  createdAt: string
  updatedAt?: string | null
  remark?: string | null
}

export interface UserArticleDetailVO extends UserArticleVO {
  content?: string | null
  authorId: number
  authorName: string
  sourceUrl?: string | null
  categoryIds?: number[]
  tagIds?: number[]
  accessList?: ArticleAccessItem[]
  seriesList?: ArticleSeriesSummaryVO[]
}

// ==================== 大厅管理类型 ====================

export interface ChatLobbySettingsUpdateRequest {
  announcement?: string | null
  speakLevelLimit?: number
  slowModeSeconds?: number
  memberLimit?: number
}

export interface ChatLobbyPinnedMessageVO {
  id: number
  messageId: number
  conversationId: number
  pinnedBy: number
  pinnedAt: string
  message?: ChatMessageVO
}

