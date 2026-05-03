/**
 * 文件与上传类型
 * @module api-types/file
 * @see docs/api文档/file-api.md
 */

// ==================== 用户上传请求 ====================

/**
 * 初始化上传任务请求
 * @description 任何上传流程的第一步
 * @interface FileUploadInitRequest
 * @see POST /api/user/files/upload-tasks/init - 请求体
 */
export interface FileUploadInitRequest {
  /** 原始文件名 */
  originalName: string
  /** 文件大小，字节 */
  fileSize: number
  /** 文件MD5，默认开启MD5校验时必填 */
  fileMd5?: string
  /** MIME类型 */
  mimeType?: string
  /** 引用类型：avatar/article_attachment/comment_image/temp */
  referenceType?: string
  /** 引用对象ID，未传按0处理 */
  referenceId?: number
  /** 业务分类：avatar/attachment/comment/temp */
  category?: string
  /** 是否公开：0-私有，1-公开 */
  isPublic?: number
  /** 分片上传时传总分片数 */
  totalChunks?: number
  /** 分片大小，字节 */
  chunkSize?: number
  /** 备注 */
  remark?: string
}

/**
 * 上传任务初始化响应
 * @description 初始化上传任务返回的信息
 * @interface FileUploadInitVO
 * @see POST /api/user/files/upload-tasks/init - 响应
 */
export interface FileUploadInitVO {
  /** 上传任务ID */
  taskId: number
  /** 上传标识，后续所有上传接口都依赖它 */
  uploadId: string
  /** 上传模式：1-秒传，2-分片上传，3-全量上传 */
  uploadMode: number
  /** 是否具备秒传条件 */
  quickUploadAvailable: boolean
  /** 是否已在初始化阶段直接完成（通常为秒传命中） */
  completed: boolean
  /** 总分片数 */
  totalChunks?: number
  /** 分片大小，字节 */
  chunkSize?: number
  /** 任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus: number
  /** 已命中的文件ID（秒传成功时） */
  fileId?: number
  /** 文件访问地址（秒传成功时） */
  fileUrl?: string | null
  /** 业务引用ID */
  businessId?: number
}

/**
 * 上传结果视图对象
 * @description 秒传检测、普通上传、完成上传的响应
 * @interface FileUploadResultVO
 * @see POST /api/user/files/upload-tasks/{uploadId}/quick-check - 响应
 * @see POST /api/user/files/upload-tasks/{uploadId}/file - 响应
 * @see POST /api/user/files/upload-tasks/{uploadId}/complete - 响应
 */
export interface FileUploadResultVO {
  /** 上传标识 */
  uploadId: string
  /** 任务ID */
  taskId: number
  /** 文件ID */
  fileId?: number
  /** 业务引用ID */
  businessId?: number
  /** 是否通过秒传完成 */
  quickUpload: boolean
  /** 任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus: number
  /** 文件访问地址 */
  fileUrl?: string | null
  /** 当前引用数 */
  referenceCount?: number
}

/**
 * 分片上传响应
 * @description 上传单个分片的响应
 * @interface ChunkUploadVO
 * @see POST /api/user/files/upload-tasks/{uploadId}/chunks/{chunkNumber} - 响应
 */
export interface ChunkUploadVO {
  /** 上传标识 */
  uploadId: string
  /** 当前分片序号 */
  chunkNumber: number
  /** 已上传分片数 */
  uploadedChunks: number
  /** 总分片数 */
  totalChunks: number
  /** 当前任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus: number
}

// ==================== 用户文件查询 ====================

/**
 * 用户文件分页查询请求
 * @description 查询我的文件列表
 * @interface UserFilePageQueryRequest
 * @see GET /api/user/files - 查询参数
 */
export interface UserFilePageQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 文件名关键字 */
  keyword?: string
  /** 文件状态 */
  status?: number
  /** 业务分类：avatar/attachment/comment/temp */
  category?: string
  /** 引用类型：avatar/article_attachment/comment_image/temp */
  referenceType?: string
}

/**
 * 用户文件视图对象
 * @description 用户查看自己的文件记录
 * @interface UserFileVO
 * @see GET /api/user/files - 响应项
 */
export interface UserFileVO {
  /** 业务引用ID */
  businessId: number
  /** 文件ID */
  fileId: number
  /** 文件名（存储名） */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件地址 */
  fileUrl: string
  /** 文件大小，字节 */
  fileSize: number
  /** 文件类型：image/video/document/other */
  fileType: string
  /** MIME类型 */
  mimeType?: string | null
  /** 业务分类：avatar/attachment/comment/temp */
  category?: string | null
  /** 引用类型：avatar/article_attachment/comment_image/temp */
  referenceType?: string | null
  /** 引用对象ID */
  referenceId?: number
  /** 是否公开：0-私有，1-公开 */
  isPublic: number
  /** 文件状态：0-已删除，1-正常，2-审核中，3-违规下架 */
  status: number
  /** 引用创建时间 */
  createdAt: string
}

/**
 * 用户上传任务分页查询请求
 * @description 查询我的上传任务列表
 * @interface UserFileTaskPageQueryRequest
 * @see GET /api/user/files/upload-tasks - 查询参数
 */
export interface UserFileTaskPageQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus?: number
  /** 是否秒传：0/1 */
  isQuickUpload?: number
  /** 是否分片：0/1 */
  isChunked?: number
}

/**
 * 用户上传任务视图对象
 * @description 用户查看自己的上传任务记录
 * @interface UserFileTaskVO
 * @see GET /api/user/files/upload-tasks - 响应项
 */
export interface UserFileTaskVO {
  /** 任务ID */
  id: number
  /** 上传标识 */
  uploadId: string
  /** 文件ID（完成后） */
  fileId?: number
  /** 原始文件名 */
  originalName: string
  /** 文件大小，字节 */
  fileSize: number
  /** 是否秒传：0-否，1-是 */
  isQuickUpload: number
  /** 是否分片：0-否，1-是 */
  isChunked: number
  /** 分片大小，字节 */
  chunkSize?: number
  /** 总分片数 */
  totalChunks?: number
  /** 已上传分片数 */
  uploadedChunks?: number
  /** 任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus: number
  /** 错误码 */
  errorCode?: string | null
  /** 错误信息 */
  errorMessage?: string | null
  /** 开始时间 */
  startTime?: string | null
  /** 完成时间 */
  completeTime?: string | null
  /** 创建时间 */
  createdAt: string
}

// ==================== 后台文件管理 ====================

/**
 * 后台文件分页查询请求
 * @description 后台分页查询文件列表
 * @interface FileAdminPageQueryRequest
 * @see GET /api/sys/files - 查询参数
 */
export interface FileAdminPageQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 文件名/原始文件名关键字 */
  keyword?: string
  /** 上传用户ID */
  uploadUserId?: number
  /** 文件状态：0-已删除，1-正常，2-审核中，3-违规下架 */
  status?: number
  /** 业务分类：avatar/attachment/comment/temp */
  category?: string
  /** 引用类型：avatar/article_attachment/comment_image/temp */
  referenceType?: string
  /** 是否公开：0-私有，1-公开 */
  isPublic?: number
}

/**
 * 后台文件视图对象
 * @description 后台文件列表项
 * @interface FileAdminVO
 * @see GET /api/sys/files - 响应项
 * @see GET /api/sys/files/{id} - 响应
 */
export interface FileAdminVO {
  /** 文件ID */
  id: number
  /** 文件名（存储名） */
  fileName: string
  /** 原始文件名 */
  originalName: string
  /** 文件路径 */
  filePath?: string | null
  /** 文件地址 */
  fileUrl: string
  /** 存储节点标识 */
  storageKey?: string | null
  /** 文件大小，字节 */
  fileSize: number
  /** 文件类型：image/video/document/other */
  fileType: string
  /** MIME类型 */
  mimeType?: string | null
  /** 扩展名 */
  fileExtension?: string | null
  /** 上传用户ID */
  uploadUserId?: number
  /** 是否公开：0-私有，1-公开 */
  isPublic: number
  /** 业务分类：avatar/attachment/comment/temp */
  category?: string | null
  /** 文件状态：0-已删除，1-正常，2-审核中，3-违规下架 */
  status: number
  /** 引用数 */
  referenceCount?: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 文件引用视图对象
 * @description 文件的业务引用记录
 * @interface FileReferenceVO
 * @see FileDetailVO.references
 */
export interface FileReferenceVO {
  /** 引用ID */
  id: number
  /** 用户ID */
  userId: number
  /** 引用类型：avatar/article_attachment/comment_image/temp */
  referenceType: string
  /** 引用对象ID */
  referenceId?: number
  /** 是否公开：0-私有，1-公开 */
  isPublic: number
  /** 业务分类：avatar/attachment/comment/temp */
  category?: string | null
  /** 备注 */
  remark?: string | null
  /** 创建时间 */
  createdAt: string
}

/**
 * 后台上传任务视图对象
 * @description 后台查看的上传任务详情
 * @interface FileTaskAdminVO
 * @see FileDetailVO.tasks
 * @see GET /api/sys/files/upload-tasks - 响应项
 */
export interface FileTaskAdminVO {
  /** 任务ID */
  id: number
  /** 上传标识 */
  uploadId: string
  /** 文件ID（完成后） */
  fileId?: number
  /** 上传用户ID */
  uploadUserId?: number
  /** 原始文件名 */
  originalName: string
  /** 文件大小，字节 */
  fileSize: number
  /** 存储节点标识 */
  storageKey?: string | null
  /** 是否秒传：0-否，1-是 */
  isQuickUpload: number
  /** 是否分片：0-否，1-是 */
  isChunked: number
  /** 已上传分片数 */
  uploadedChunks?: number
  /** 总分片数 */
  totalChunks?: number
  /** 任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus: number
  /** 错误码 */
  errorCode?: string | null
  /** 错误信息 */
  errorMessage?: string | null
  /** 创建时间 */
  createdAt: string
  /** 完成时间 */
  completeTime?: string | null
}

/**
 * 文件详情视图对象
 * @description 后台文件详情，包含引用列表和任务列表
 * @interface FileDetailVO
 * @extends FileAdminVO
 * @see GET /api/sys/files/{id} - 响应
 */
export interface FileDetailVO extends FileAdminVO {
  /** 引用列表 */
  references?: FileReferenceVO[]
  /** 上传任务列表 */
  tasks?: FileTaskAdminVO[]
}

/**
 * 后台上传任务查询请求
 * @description 后台分页查询上传任务
 * @interface FileTaskPageQueryRequest
 * @see GET /api/sys/files/upload-tasks - 查询参数
 */
export interface FileTaskPageQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 上传用户ID */
  uploadUserId?: number
  /** 任务状态：0-初始化，1-上传中，2-合并中，3-已完成，4-失败，5-已取消 */
  taskStatus?: number
  /** 是否秒传：0/1 */
  isQuickUpload?: number
  /** 是否分片：0/1 */
  isChunked?: number
}

/**
 * 更新文件状态请求
 * @description 后台更新文件状态
 * @interface FileStatusUpdateRequest
 * @see PUT /api/sys/files/{id}/status - 请求体
 */
export interface FileStatusUpdateRequest {
  /** 文件状态：1-正常，2-审核中，3-违规下架（不支持设置为0已删除） */
  status: number
}