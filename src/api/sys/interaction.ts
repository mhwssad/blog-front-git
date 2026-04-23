import { http } from '../request'
import type { InteractionQueryRequest, InteractionVO, PageResult } from '../types'

export const interactionApi = {
  getInteractions: (params?: InteractionQueryRequest) =>
    http.get<PageResult<InteractionVO>>('/sys/interactions', params),

  deleteInteraction: (id: number) =>
    http.delete<void>(`/sys/interactions/${id}`),
}

export default interactionApi
