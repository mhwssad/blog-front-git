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
  status?: number
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
  accessLevel?: number
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
  accessLevel: number
  viewCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  shareCount: number
  publishTime?: string | null
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
  summary?: string
  content?: string
  coverImage?: string
  authorId?: number
  isTop?: number
  isOriginal?: number
  sourceUrl?: string
  status?: number
  publishTime?: string
  accessLevel?: number
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
  name?: string | null
  avatar?: string | null
  notice?: string | null
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
