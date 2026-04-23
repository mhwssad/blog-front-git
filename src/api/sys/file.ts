import { http } from '../request'
import type {
  FileAdminPageQueryRequest,
  FileAdminVO,
  FileDetailVO,
  FileStatusUpdateRequest,
  FileTaskAdminVO,
  FileTaskPageQueryRequest,
  PageResult,
} from '../types'

export const sysFileApi = {
  getFiles: (params?: FileAdminPageQueryRequest) =>
    http.get<PageResult<FileAdminVO>>('/sys/files', params),

  getFileById: (id: number) =>
    http.get<FileDetailVO>(`/sys/files/${id}`),

  updateFileStatus: (id: number, data: FileStatusUpdateRequest) =>
    http.put<void>(`/sys/files/${id}/status`, data),

  deleteFile: (id: number) =>
    http.delete<void>(`/sys/files/${id}`),

  getUploadTasks: (params?: FileTaskPageQueryRequest) =>
    http.get<PageResult<FileTaskAdminVO>>('/sys/files/upload-tasks', params),
}

export default sysFileApi
