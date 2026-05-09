/**
 * 聊天模块类型定义
 * @module chat
 * @see docs/api文档/chat-api.md
 */

/**
 * 聊天文件消息详情
 * @description 包含文件的完整元数据，用于消息中的文件展示
 */
export interface ChatMessageFileVO {
  /** 关联业务ID */
  businessId: number
  /** 文件ID */
  fileId: number
  /** 文件名 */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件访问URL */
  fileUrl: string
  /** 文件大小（字节） */
  fileSize: number
  /** 文件类型 */
  fileType: string
  /** MIME类型 */
  mimeType?: string | null
  /** 预览URL（图片/视频） */
  previewUrl?: string | null
  /** 缩略图URL */
  thumbnailUrl?: string | null
  /** 图片宽度 */
  width?: number | null
  /** 图片高度 */
  height?: number | null
  /** 音视频时长（秒） */
  durationSeconds?: number | null
  /** 音频波形数据 */
  waveform?: number[] | null
  /** 转码状态: source=原文件, pending=转码中, ready=可播放, failed=失败 */
  transcodeStatus?: string
}

/**
 * 引用回复消息快照
 * @description 被引用消息的快照副本，即使原消息被删除或撤回，快照仍保留
 */
export interface ChatReplySnapshotVO {
  /** 消息ID */
  id: number
  /** 发送者用户ID */
  senderId: number
  /** 发送者用户名 */
  senderUsername?: string | null
  /** 发送者昵称 */
  senderNickname?: string | null
  /** 发送者头像URL */
  senderAvatar?: string | null
  /** 消息类型: text=文本, file=文件, image=图片, voice=语音 */
  messageType: string
  /** 被回复的消息ID */
  replyToMessageId?: number | null
  /** 消息文本内容 */
  content?: string | null
  /** 消息附带文件 */
  file?: ChatMessageFileVO | null
  /** 是否已撤回 */
  revoked: boolean
  /** 是否已删除 */
  deleted?: boolean
  /** 消息状态: normal=正常, revoked=已撤回, unavailable=不可用 */
  state?: string
  /** 创建时间 */
  createdAt: string
}

/**
 * 聊天消息
 * @description 完整的聊天消息结构，包含发送者信息、内容、附件和状态
 */
export interface ChatMessageVO {
  /** 消息ID */
  id: number
  /** 所属会话ID */
  conversationId: number
  /** 发送者用户ID */
  senderId: number
  /** 发送者用户名 */
  senderUsername?: string | null
  /** 发送者昵称 */
  senderNickname?: string | null
  /** 发送者头像URL */
  senderAvatar?: string | null
  /** 消息类型: text=文本, file=文件, image=图片, voice=语音 */
  messageType: string
  /** 消息文本内容 */
  content?: string | null
  /** 消息附带文件 */
  file?: ChatMessageFileVO | null
  /** 回复的消息ID */
  replyMessageId?: number | null
  /** 被回复消息的快照 */
  reply?: ChatReplySnapshotVO | null
  /** 客户端消息ID（用于去重） */
  clientMessageId?: string | null
  /** 是否为当前用户发送的消息 */
  self?: boolean
  /** 投递状态: 0=发送中, 1=已投递, 2=已读 */
  deliveryStatus?: number
  /** 当前用户是否已读 */
  readByCurrentUser?: boolean
  /** 当前用户读到该消息的时间 */
  readAt?: string | null
  /** 撤回状态: 0=正常, 1=已撤回 */
  revokeStatus?: number
  /** 撤回人用户ID */
  revokedBy?: number | null
  /** 撤回时间 */
  revokedAt?: string | null
  /** 总接收者数量（群聊） */
  totalRecipientCount?: number
  /** 已投递数量 */
  deliveredRecipientCount?: number
  /** 已读数量 */
  readRecipientCount?: number
  /** 是否已撤回 */
  revoked: boolean
  /** 是否已编辑 */
  edited: boolean
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string | null
}

/**
 * 聊天会话
 * @description 包含单聊、群聊、大厅频道、主题频道等不同场景的会话信息
 */
export interface ChatConversationVO {
  /** 会话ID */
  id: number
  /** 会话类型: single=单聊, group=群聊, global=全局（大厅） */
  conversationType: string
  /** 场景类型: single_chat=单聊, user_group=用户群, hall_channel=大厅频道, topic_channel=主题频道, global_channel=全局频道 */
  sceneType?: string
  /** 会话名称（群聊/频道名称） */
  name?: string | null
  /** 会话头像 */
  avatar?: string | null
  /** 群公告/频道公告 */
  notice?: string | null
  /** 可见范围: public=公开, member=成员可见, private=私密 */
  visibilityScope?: string
  /** 是否允许游客查看 */
  allowGuestView?: number
  /** 是否需要加入才能发言 */
  requireJoinToSpeak?: number
  /** 加入规则: free=自由加入, approval=需要审批, invite_only=仅限邀请 */
  joinRule?: string
  /** 发言等级限制（用户等级 >= 此值才能发言） */
  speakLevelLimit?: number
  /** 成员数量上限 */
  memberLimit?: number
  /** 慢模式间隔（秒，0=关闭） */
  slowModeSeconds?: number
  /** 显示排序 */
  displaySort?: number
  /** 频道分类编码 */
  channelCategoryCode?: string | null
  /** 当前用户在会话中的角色: owner=群主, admin=管理员, member=普通成员 */
  selfRole?: string
  /** 群主/创建者用户ID */
  ownerId?: number | null
  /** 成员数量 */
  memberCount?: number
  /** 未读消息数量 */
  unreadCount?: number
  /** 会话状态: 0=正常, 1=禁用 */
  status?: number
  /** 是否全站会话（大堂） */
  isAllSite?: number
  /** 目标用户ID（单聊时） */
  targetUserId?: number | null
  /** 目标用户名 */
  targetUsername?: string | null
  /** 目标用户昵称 */
  targetNickname?: string | null
  /** 最后一条消息快照 */
  lastMessage?: ChatMessageVO | null
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 用户聊天会话查询请求
 * @description 分页查询当前用户的会话列表
 */
export interface UserChatConversationQueryRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 关键词搜索（搜索会话名称/成员昵称） */
  keyword?: string
}

/**
 * 用户聊天消息查询请求
 * @description 分页查询会话中的消息历史
 */
export interface UserChatMessageQueryRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 查询此消息ID之前的消息（游标翻页） */
  beforeMessageId?: number
}

/**
 * 创建单聊会话请求
 * @description 向指定用户发起单聊，若已存在则返回已有会话
 */
export interface ChatSingleConversationCreateRequest {
  /** 目标用户ID */
  targetUserId: number
}

/**
 * 发送文本消息请求
 * @description 支持单聊和群聊，可指定会话ID或目标用户ID
 */
export interface ChatSendTextRequest {
  /** 会话ID（群聊时必填） */
  conversationId?: number
  /** 目标用户ID（单聊时可选，若有conversationId则忽略） */
  targetUserId?: number
  /** 消息文本内容 */
  content: string
  /** 客户端消息ID（用于去重和追踪） */
  clientMessageId?: string
  /** 回复的消息ID */
  replyMessageId?: number
}

/**
 * 发送文件消息请求
 * @description 文件消息需要先上传文件获得businessId
 */
export interface ChatSendFileRequest {
  /** 会话ID */
  conversationId?: number
  /** 目标用户ID */
  targetUserId?: number
  /** 文件业务ID（上传后获得） */
  businessId: number
  /** 客户端消息ID */
  clientMessageId?: string
  /** 回复的消息ID */
  replyMessageId?: number
}

/**
 * 编辑消息请求
 * @description 仅支持编辑文本消息的内容
 */
export interface ChatMessageEditRequest {
  /** 新的文本内容 */
  content: string
}

/**
 * 会话已读确认请求
 * @description 将会话内指定消息及之前的消息标记为已读
 */
export interface ChatConversationReadRequest {
  /** 已读确认的消息ID */
  readMessageId: number
}

/**
 * 会话已读状态响应
 * @description 包含已读确认的详细信息和当前未读数
 */
export interface ChatConversationReadVO {
  /** 会话ID */
  conversationId: number
  /** 用户ID */
  userId: number
  /** 已读确认的消息ID */
  readMessageId: number
  /** 已读时间 */
  readAt?: string | null
  /** 已投递消息ID（用于统计） */
  deliveredMessageId?: number | null
  /** 投递时间 */
  deliveredAt?: string | null
  /** 更新后的未读数量 */
  unreadCount: number
}

/**
 * 创建群聊请求
 * @description 创建用户群组，可设置加入规则、成员上限等参数
 */
export interface ChatGroupCreateRequest {
  /** 群名称 */
  name: string
  /** 群头像URL */
  avatar?: string | null
  /** 群描述 */
  description?: string | null
  /** 群公告 */
  announcement?: string | null
  /** 分类编码 */
  categoryCode?: string | null
  /** 可见范围: public=公开, private=私密 */
  visibilityScope?: string
  /** 加入规则: free=自由加入, approval=审批, invite_only=仅邀请 */
  joinRule?: string
  /** 发言等级限制 */
  speakLevelLimit?: number
  /** 成员数量上限 */
  memberLimit?: number
  /** 慢模式间隔（秒） */
  slowModeSeconds?: number
  /** 初始成员用户ID列表 */
  memberUserIds: number[]
}

/**
 * 转让群主请求
 */
export interface ChatGroupOwnerTransferRequest {
  /** 目标用户ID（将成为新群主） */
  targetUserId: number
}

/**
 * 群组禁言请求
 * @description 设置整个群组的发言限制
 */
export interface ChatGroupMuteRequest {
  /** 禁言截止时间（null=解除禁言） */
  muteUntil?: string | null
}

/**
 * 更新群公告请求
 */
export interface ChatGroupNoticeUpdateRequest {
  /** 群公告内容（null=清除公告） */
  notice?: string | null
}

/**
 * 邀请成员入群请求
 */
export interface ChatGroupMemberInviteRequest {
  /** 待邀请的用户ID列表 */
  memberUserIds: number[]
}

/**
 * 群组成员信息
 * @description 包含成员基本信息和在群组中的角色状态
 */
export interface ChatGroupMemberVO {
  /** 用户ID */
  userId: number
  /** 用户名 */
  username?: string | null
  /** 昵称 */
  nickname?: string | null
  /** 头像URL */
  avatar?: string | null
  /** 角色: owner=群主, admin=管理员, member=普通成员 */
  role: string
  /** 状态: 0=正常, 1=被禁言 */
  status?: number
  /** 禁言截止时间 */
  muteUntil?: string | null
  /** 加入时间 */
  joinedAt?: string | null
}

/**
 * 后台会话查询请求
 * @description 后台管理员分页筛选聊天会话
 */
export interface SysChatConversationQueryRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 关键词搜索 */
  keyword?: string
  /** 会话类型: single=单聊, group=群聊, global=全局 */
  conversationType?: string
  /** 会话状态 */
  status?: number
  /** 群主用户ID */
  ownerId?: number
  /** 成员用户ID */
  memberUserId?: number
  /** 是否全站会话 */
  isAllSite?: number
}

/**
 * 后台消息查询请求
 * @description 后台管理员分页查询会话消息历史
 */
export interface SysChatMessageQueryRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 查询此消息ID之前的消息 */
  beforeMessageId?: number
  /** 发送者用户ID */
  senderId?: number
  /** 消息类型过滤 */
  messageType?: string
  /** 内容关键词搜索 */
  keyword?: string
}

/**
 * 后台消息回执查询请求
 * @description 查询消息在各接收者处的投递/已读状态
 */
export interface SysChatReceiptQueryRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 接收者用户ID */
  recipientUserId?: number
  /** 投递状态 */
  deliveryStatus?: number
  /** 可见状态 */
  visibleStatus?: number
}

/**
 * 消息回执详情
 * @description 单条消息在特定接收者处的状态
 */
export interface SysChatReceiptVO {
  /** 接收者用户ID */
  recipientUserId: number
  /** 接收者用户名 */
  recipientUsername?: string | null
  /** 接收者昵称 */
  recipientNickname?: string | null
  /** 接收类型 */
  receiveType?: string | null
  /** 投递状态: 0=发送中, 1=已投递 */
  deliveryStatus: number
  /** 投递时间 */
  deliveredAt?: string | null
  /** 已读时间 */
  readAt?: string | null
  /** 可见状态: 0=可见, 1=不可见 */
  visibleStatus: number
}

/**
 * 后台更新成员角色请求
 */
export interface SysChatMemberRoleUpdateRequest {
  /** 新角色: owner=群主, admin=管理员, member=普通成员 */
  role: string
}

/**
 * 后台更新成员状态请求
 */
export interface SysChatMemberStatusUpdateRequest {
  /** 状态值: 0=正常, 1=禁言 */
  status: number
}

/**
 * 后台更新会话状态请求
 */
export interface SysChatConversationStatusUpdateRequest {
  /** 会话状态: 0=正常, 1=禁用 */
  status: number
}

/**
 * 大厅消息
 * @description 大堂频道的公开消息，任何人都可以查看
 */
export interface ChatLobbyMessageVO {
  /** 消息ID */
  id: number
  /** 发送者用户ID */
  senderId: number
  /** 发送者用户名 */
  senderUsername: string
  /** 发送者昵称 */
  senderNickname: string
  /** 发送者头像URL */
  senderAvatar: string
  /** 消息内容 */
  content: string
  /** 消息类型: text=文本, file=文件, image=图片, voice=语音 */
  messageType: string
  /** 发送时间 */
  createdAt: string
}

/**
 * 大厅设置更新请求
 * @description 超级管理员或厅主可更新大厅基本设置
 */
export interface ChatLobbySettingsUpdateRequest {
  /** 发言等级限制 */
  speakLevelLimit?: number
  /** 慢模式间隔（秒） */
  slowModeSeconds?: number
  /** 是否允许游客发言 */
  allowGuestSpeak?: boolean
}

/**
 * 大厅置顶消息
 * @description 大堂频道被置顶的消息，会显示在频道顶部
 */
export interface ChatLobbyPinnedMessageVO {
  /** 置顶记录ID */
  id: number
  /** 消息ID */
  messageId: number
  /** 所属会话ID */
  conversationId: number
  /** 置顶操作人用户ID */
  pinnedBy: number
  /** 置顶时间 */
  pinnedAt: string
  /** 消息详情快照 */
  message?: ChatMessageVO
}

/**
 * 群组搜索请求
 * @description 搜索和筛选用户群组
 */
export interface ChatGroupSearchRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 关键词搜索（群名称/描述） */
  keyword?: string
  /** 分类编码过滤 */
  categoryCode?: string
}

/**
 * 群组搜索结果
 * @description 返回搜索到的群组基本信息
 */
export interface ChatGroupSearchVO {
  /** 群组ID */
  id: number
  /** 群名称 */
  name: string
  /** 群描述 */
  description: string | null
  /** 群公告 */
  notice: string | null
  /** 可见范围: public=公开, private=私密 */
  visibilityScope: string
  /** 加入规则: free=自由, approval=审批, invite_only=邀请 */
  joinRule: string
  /** 成员数量上限 */
  memberLimit: number
  /** 当前成员数 */
  memberCount: number
  /** 当前用户是否已加入 */
  joined: boolean
  /** 当前用户在群中的角色 */
  selfRole: string | null
}

/**
 * 频道创建申请请求
 * @description 用户申请创建新的主题频道
 */
export interface ChannelApplicationRequest {
  /** 期望的频道名称 */
  desiredName: string
  /** 期望的场景类型: topic_channel=主题频道 */
  desiredSceneType: string
  /** 期望的分类编码 */
  desiredCategoryCode: string
  /** 申请说明 */
  description?: string
}

/**
 * 频道创建申请记录
 * @description 用户提交的主题频道创建申请
 */
export interface ChannelApplicationVO {
  /** 申请ID */
  id: number
  /** 期望的频道名称 */
  desiredName: string
  /** 期望的场景类型 */
  desiredSceneType: string
  /** 期望的分类编码 */
  desiredCategoryCode: string
  /** 申请说明 */
  description?: string | null
  /** 申请状态: 0=待审核, 1=通过, 2=拒绝 */
  applyStatus: number
  /** 审核评论 */
  reviewComment?: string | null
  /** 创建时间 */
  createdAt: string
  /** 审核时间 */
  reviewedAt?: string
}

/**
 * 后台频道申请查询请求
 */
export interface SysChannelApplicationQueryRequest {
  /** 当前页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 申请状态过滤 */
  applyStatus?: number
  /** 关键词搜索 */
  keyword?: string
}

/**
 * 后台频道申请详情
 * @description 包含申请用户信息和申请内容
 */
export interface SysChannelApplicationVO {
  /** 申请ID */
  id: number
  /** 申请人用户ID */
  userId: number
  /** 申请人用户名 */
  username: string
  /** 申请人昵称 */
  nickname: string
  /** 期望的频道名称 */
  desiredName: string
  /** 期望的场景类型 */
  desiredSceneType: string
  /** 期望的分类编码 */
  desiredCategoryCode: string
  /** 申请说明 */
  description?: string | null
  /** 申请状态: 0=待审核, 1=通过, 2=拒绝 */
  applyStatus: number
  /** 审核评论 */
  reviewComment?: string | null
  /** 审核人用户ID */
  reviewerId?: number
  /** 审核人用户名 */
  reviewerUsername?: string
  /** 审核人昵称 */
  reviewerNickname?: string
  /** 创建时间 */
  createdAt: string
  /** 审核时间 */
  reviewedAt?: string
}

/**
 * 后台审核频道申请请求
 */
export interface SysChannelApplicationReviewRequest {
  /** 是否通过 */
  approved: boolean
  /** 审核备注 */
  reviewRemark?: string
}

/**
 * 后台保存主题频道请求
 * @description 创建或更新主题频道
 */
export interface SysTopicChannelSaveRequest {
  /** 频道名称 */
  name: string
  /** 频道头像 */
  avatar?: string
  /** 频道描述 */
  description?: string
  /** 频道公告 */
  announcement?: string
  /** 分类编码 */
  categoryCode?: string
  /** 可见范围: public=公开, member=成员, private=私密 */
  visibilityScope?: string
  /** 加入规则: free=自由, approval=审批, invite_only=邀请 */
  joinRule?: string
  /** 发言等级限制 */
  speakLevelLimit?: number
  /** 成员数量上限 */
  memberLimit?: number
  /** 慢模式间隔（秒） */
  slowModeSeconds?: number
  /** 显示排序 */
  displaySort?: number
}

/**
 * 论坛帖子关联频道请求
 * @description 将帖子与频道进行关联
 */
export interface ForumLinkRequest {
  /** 论坛帖子ID */
  forumPostId: number
  /** 会话ID（频道） */
  conversationId: number
}

/**
 * 论坛帖子关联记录
 */
export interface ForumLinkVO {
  /** 记录ID */
  id: number
  /** 论坛帖子ID */
  forumPostId: number
  /** 会话ID */
  conversationId: number
  /** 会话名称 */
  conversationName: string
  /** 创建时间 */
  createdAt: string
}

/**
 * 入群申请请求
 * @description 用户申请加入需要审批的群组
 */
export interface GroupJoinApplicationRequest {
  /** 申请留言 */
  applyMessage?: string
}

/**
 * 入群申请记录
 * @description 用户提交的加群申请
 */
export interface GroupJoinApplicationVO {
  /** 申请ID */
  id: number
  /** 目标会话ID */
  conversationId: number
  /** 申请人用户ID */
  userId: number
  /** 申请人用户名 */
  username: string
  /** 申请人昵称 */
  nickname: string
  /** 申请留言 */
  applyMessage?: string | null
  /** 申请状态: 0=待审核, 1=通过, 2=拒绝 */
  applyStatus: number
  /** 审核评论 */
  reviewComment?: string | null
  /** 申请时间 */
  createdAt: string
  /** 审核时间 */
  reviewedAt?: string
}

/**
 * 入群申请审核请求
 */
export interface GroupJoinApplicationReviewRequest {
  /** 审核状态: 1=通过, 2=拒绝 */
  reviewStatus: 1 | 2
  /** 审核评论 */
  reviewComment?: string
}

/**
 * 创建群邀请链接请求
 */
export interface GroupInviteLinkCreateRequest {
  /** 链接过期时间 */
  expireAt?: string
  /** 最大使用次数 */
  maxUseCount?: number
}

/**
 * 群邀请链接信息
 */
export interface GroupInviteLinkVO {
  /** 链接ID */
  id: number
  /** 关联的会话ID */
  conversationId: number
  /** 邀请Token（链接标识） */
  inviteToken: string
  /** 过期时间 */
  expireAt?: string | null
  /** 最大使用次数 */
  maxUseCount: number
  /** 已使用次数 */
  usedCount: number
  /** 链接状态: 0=有效, 1=失效 */
  status: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 公开频道基本信息
 * @description 用户可浏览和加入的公开频道列表项
 */
export interface PublicChannelVO {
  /** 频道ID */
  id: number
  /** 频道名称 */
  name: string
  /** 频道头像 */
  avatar: string | null
  /** 频道描述 */
  description: string | null
  /** 当前成员数 */
  memberCount: number
  /** 消息总数 */
  messageCount: number
  /** 分类编码 */
  categoryCode: string | null
  /** 分类名称 */
  categoryName: string | null
  /** 可见范围 */
  visibilityScope: string
  /** 创建时间 */
  createdAt: string
}

/**
 * 公开频道详情
 * @description 包含频道的完整信息和配置
 */
export interface PublicChannelDetailVO {
  /** 频道ID */
  id: number
  /** 频道名称 */
  name: string
  /** 频道头像 */
  avatar: string | null
  /** 频道描述 */
  description: string | null
  /** 频道公告 */
  announcement: string | null
  /** 当前成员数 */
  memberCount: number
  /** 消息总数 */
  messageCount: number
  /** 分类编码 */
  categoryCode: string | null
  /** 分类名称 */
  categoryName: string | null
  /** 可见范围 */
  visibilityScope: string
  /** 加入规则 */
  joinRule: string
  /** 发言等级限制 */
  speakLevelLimit: number
  /** 创建时间 */
  createdAt: string
}

// ==================== 后台禁言管理 ====================

/**
 * 创建禁言记录请求
 * @see POST /api/sys/chats/mutes - 请求体
 */
export interface ChatMuteCreateRequest {
  /** 被禁言用户ID */
  userId: number
  /** 会话ID */
  conversationId: number
  /** 禁言原因 */
  reason?: string
  /** 禁言截止时间 */
  muteUntil: string
}

/**
 * 禁言记录视图对象
 * @see GET /api/sys/chats/mutes - 响应项
 */
export interface ChatMuteVO {
  /** 禁言记录ID */
  id: number
  /** 被禁言用户ID */
  userId: number
  /** 被禁言用户名 */
  username?: string
  /** 被禁言昵称 */
  nickname?: string
  /** 会话ID */
  conversationId: number
  /** 会话名称 */
  conversationName?: string
  /** 禁言原因 */
  reason?: string
  /** 禁言截止时间 */
  muteUntil: string
  /** 是否已解除 */
  released?: boolean
  /** 解除时间 */
  releasedAt?: string
  /** 操作人ID */
  operatedBy?: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 禁言记录查询请求
 * @see GET /api/sys/chats/mutes - 查询参数
 */
export interface ChatMuteQueryRequest {
  current?: number
  size?: number
  /** 用户ID */
  userId?: number
  /** 会话ID */
  conversationId?: number
}
