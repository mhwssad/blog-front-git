import { http } from '../request'
import type {
  FollowAdminQueryRequest,
  FollowAdminRelationVO,
  FollowRelationCleanRequest,
  PageResult,
} from '../types'

export const sysFollowApi = {
  getFollows: (params?: FollowAdminQueryRequest) =>
    http.get<PageResult<FollowAdminRelationVO>>('/sys/follows', params),

  cleanFollows: (data: FollowRelationCleanRequest) =>
    http.delete<number>('/sys/follows/clean', undefined, { data }),
}

export default sysFollowApi
