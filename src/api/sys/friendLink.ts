/**
 * 友情链接后台管理 API
 * @see docs/api文档/content-api.md - 九、友情链接
 */

import { http } from '../request'
import type { FriendLinkVO, FriendLinkSaveRequest, FriendLinkQueryRequest, PageResult } from '@/types/api-types'

export class FriendLinkSysApi {
  /** 分页查询友情链接 GET /api/sys/friend-links */
  static getFriendLinks(params?: FriendLinkQueryRequest) {
    return http.get<PageResult<FriendLinkVO>>('/sys/friend-links', params)
  }

  /** 查询友情链接详情 GET /api/sys/friend-links/{id} */
  static getFriendLinkById(id: number) {
    return http.get<FriendLinkVO>(`/sys/friend-links/${id}`)
  }

  /** 创建友情链接 POST /api/sys/friend-links */
  static createFriendLink(data: FriendLinkSaveRequest) {
    return http.post<FriendLinkVO>('/sys/friend-links', data)
  }

  /** 更新友情链接 PUT /api/sys/friend-links/{id} */
  static updateFriendLink(id: number, data: FriendLinkSaveRequest) {
    return http.put<FriendLinkVO>(`/sys/friend-links/${id}`, data)
  }

  /** 更新友情链接状态 PUT /api/sys/friend-links/{id}/status */
  static updateFriendLinkStatus(id: number, data: { status: number }) {
    return http.put<void>(`/sys/friend-links/${id}/status`, data)
  }

  /** 删除友情链接 DELETE /api/sys/friend-links/{id} */
  static deleteFriendLink(id: number) {
    return http.delete<void>(`/sys/friend-links/${id}`)
  }
}

export default FriendLinkSysApi
