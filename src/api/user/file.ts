import { http } from '../request'
import type {
  ChunkUploadVO,
  FileUploadInitRequest,
  FileUploadInitVO,
  FileUploadResultVO,
  PageResult,
  UserFilePageQueryRequest,
  UserFileTaskPageQueryRequest,
  UserFileTaskVO,
  UserFileVO,
} from '../types'

const multipartHeaders = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}

export const userFileApi = {
  initUploadTask: (data: FileUploadInitRequest) =>
    http.post<FileUploadInitVO>('/user/files/upload-tasks/init', data),

  quickCheckUploadTask: (uploadId: string) =>
    http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/quick-check`),

  uploadFile: (uploadId: string, data: FormData) =>
    http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/file`, data, multipartHeaders),

  uploadChunk: (uploadId: string, chunkNumber: number, data: FormData) =>
    http.post<ChunkUploadVO>(
      `/user/files/upload-tasks/${uploadId}/chunks/${chunkNumber}`,
      data,
      multipartHeaders
    ),

  completeUploadTask: (uploadId: string) =>
    http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/complete`),

  getMyFiles: (params?: UserFilePageQueryRequest) =>
    http.get<PageResult<UserFileVO>>('/user/files', params),

  getMyUploadTasks: (params?: UserFileTaskPageQueryRequest) =>
    http.get<PageResult<UserFileTaskVO>>('/user/files/upload-tasks', params),

  deleteMyFile: (businessId: number) =>
    http.delete<void>(`/user/files/${businessId}`),
}

export default userFileApi
