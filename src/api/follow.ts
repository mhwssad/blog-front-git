import { http } from './request'
import type {
  PageResult,
  PublicFollowPageQueryRequest,
  PublicFollowUserVO,
} from './types'

export const followApi = {
  getUserFollows: (userId: number, params?: PublicFollowPageQueryRequest) =>
    http.get<PageResult<PublicFollowUserVO>>(`/users/${userId}/follows`, params),

  getUserFans: (userId: number, params?: PublicFollowPageQueryRequest) =>
    http.get<PageResult<PublicFollowUserVO>>(`/users/${userId}/fans`, params),
}

export default followApi
