/**
 * 论坛模块类型
 * @module api-types/forum
 * @see docs/api文档/forum-api.md
 */

// ==================== 版块 ====================

export interface ForumSectionVO {
  id: number
  name: string
  description: string
  sortOrder: number
  visibilityScope: number
  postLevelLimit: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface ForumSectionSaveRequest {
  name: string
  description?: string
  sortOrder?: number
  visibilityScope?: number
  postLevelLimit?: number
  status?: number
}

export interface ForumSectionQueryRequest {
  current?: number
  size?: number
  keyword?: string
  status?: number
  visibilityScope?: number
}

// ==================== 帖子 ====================

export interface ForumPostVO {
  id: number
  sectionId: number
  sectionName: string
  authorId: number
  authorName: string
  title: string
  status: number
  visibilityScope: number
  isTop: number
  isEssence: number
  viewCount: number
  likeCount: number
  replyCount: number
  collectCount: number
  shareCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ForumPostDetailVO extends ForumPostVO {
  content: string
  liked: boolean
  collected: boolean
  canReply: boolean
  linkedChannel: ForumLinkedChannelVO | null
}

export interface ForumLinkedChannelVO {
  id: number
  forumPostId: number
  conversationId: number
  channelName: string
  linkType: string
  linkedBy: number
  linkedAt: string
}

export interface ForumPostSaveRequest {
  sectionId: number
  title: string
  content?: string
  status?: number
  visibilityScope?: number
}

export interface ForumPostQueryRequest {
  current?: number
  size?: number
  keyword?: string
  sectionId?: number
  authorId?: number
  createdAtStart?: string
  createdAtEnd?: string
  sort?: 'latest' | 'hot'
}

export interface ForumPostUserQueryRequest {
  current?: number
  size?: number
  keyword?: string
  sectionId?: number
  status?: number
}

export interface ForumPostAdminQueryRequest {
  current?: number
  size?: number
  keyword?: string
  sectionId?: number
  authorId?: number
  status?: number
  isTop?: number
  isEssence?: number
  createdAtStart?: string
  createdAtEnd?: string
}

export interface ForumPostAdminVO extends ForumPostVO {
  statusName: string
}

export interface ForumPostAdminDetailVO extends ForumPostAdminVO {
  content: string
}

// ==================== 回复 ====================

export interface ForumReplyVO {
  id: number
  postId: number
  parentId?: number | null
  rootId?: number | null
  userId: number
  userName: string
  content: string
  status: number
  floorNo: number
  likeCount: number
  replyCount: number
  createdAt: string
  updatedAt: string
  children?: ForumReplyVO[]
}

export interface ForumReplySaveRequest {
  parentId?: number
  content: string
}

export interface ForumReplyAdminQueryRequest {
  current?: number
  size?: number
  keyword?: string
  postId?: number
  userId?: number
  status?: number
}

export interface ForumReplyAdminVO {
  id: number
  postId: number
  postTitle: string
  parentId?: number
  rootId?: number
  userId: number
  userName: string
  content: string
  status: number
  statusName: string
  floorNo: number
  likeCount: number
  replyCount: number
  createdAt: string
  updatedAt: string
}

// ==================== 收藏帖子 ====================

export interface ForumCollectionRequest {
  folderId?: number
  remark?: string
}

// ==================== 频道分享 ====================

export interface ForumChannelShareRequest {
  conversationId: number
}

export interface ForumChannelShareVO {
  id: number
  forumPostId: number
  conversationId: number
  channelName: string
  linkType: string
  linkedBy: number
  linkedAt: string
}
