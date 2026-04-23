import { http } from '../request'
import type {
  PageResult,
  UserFollowCountVO,
  UserFollowMutualVO,
  UserFollowPageQueryRequest,
  UserFollowRemarkUpdateRequest,
  UserFollowSpecialUpdateRequest,
  UserFollowUserVO,
} from '../types'

export const userFollowApi = {
  followUser: (userId: number) =>
    http.post<void>(`/user/follows/${userId}`),

  unfollowUser: (userId: number) =>
    http.delete<void>(`/user/follows/${userId}`),

  getMyFollows: (params?: UserFollowPageQueryRequest) =>
    http.get<PageResult<UserFollowUserVO>>('/user/follows', params),

  getMyFans: (params?: Pick<UserFollowPageQueryRequest, 'current' | 'size'>) =>
    http.get<PageResult<UserFollowUserVO>>('/user/fans', params),

  getMutualStatus: (targetUserId: number) =>
    http.get<UserFollowMutualVO>('/user/follows/mutual', { targetUserId }),

  getFollowCount: () =>
    http.get<UserFollowCountVO>('/user/follows/count'),

  updateSpecialFollow: (userId: number, data: UserFollowSpecialUpdateRequest) =>
    http.put<void>(`/user/follows/${userId}/special`, data),

  updateFollowRemark: (userId: number, data: UserFollowRemarkUpdateRequest) =>
    http.put<void>(`/user/follows/${userId}/remark`, data),
}

export default userFollowApi
