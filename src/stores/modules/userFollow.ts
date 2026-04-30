import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserFollowApi } from '@/api/user/follow'
import type {
  PageResult,
  UserFollowCountVO,
  UserFollowPageQueryRequest,
  UserFollowRemarkUpdateRequest,
  UserFollowSpecialUpdateRequest,
  UserFollowUserVO,
} from '@/types/api-types'

export const useUserFollowStore = defineStore('userFollow', () => {
  const follows = ref<UserFollowUserVO[]>([])
  const fans = ref<UserFollowUserVO[]>([])
  const followCount = ref<UserFollowCountVO>({ followingCount: 0, fanCount: 0 })
  const loading = ref(false)

  const followTotal = ref(0)
  const followCurrent = ref(1)
  const followSize = ref(10)

  const fanTotal = ref(0)
  const fanCurrent = ref(1)
  const fanSize = ref(10)

  function assignPage(data: PageResult<UserFollowUserVO>, target: 'follow' | 'fan'): void {
    if (target === 'follow') {
      follows.value = data.records
      followTotal.value = data.total
      followCurrent.value = data.current
      followSize.value = data.size
    } else {
      fans.value = data.records
      fanTotal.value = data.total
      fanCurrent.value = data.current
      fanSize.value = data.size
    }
  }

  async function fetchMyFollows(params?: UserFollowPageQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await UserFollowApi.getMyFollows(params)
      assignPage(response.data.data, 'follow')
    } finally {
      loading.value = false
    }
  }

  async function fetchMyFans(params?: Pick<UserFollowPageQueryRequest, 'current' | 'size'>): Promise<void> {
    loading.value = true
    try {
      const response = await UserFollowApi.getMyFans(params)
      assignPage(response.data.data, 'fan')
    } finally {
      loading.value = false
    }
  }

  async function fetchFollowCount(): Promise<void> {
    try {
      const response = await UserFollowApi.getFollowCount()
      followCount.value = response.data.data
    } catch {
      // keep defaults
    }
  }

  async function followUser(userId: number): Promise<boolean> {
    try {
      await UserFollowApi.followUser(userId)
      return true
    } catch {
      return false
    }
  }

  async function unfollowUser(userId: number): Promise<boolean> {
    try {
      await UserFollowApi.unfollowUser(userId)
      return true
    } catch {
      return false
    }
  }

  async function updateSpecial(userId: number, data: UserFollowSpecialUpdateRequest): Promise<boolean> {
    try {
      await UserFollowApi.updateSpecialFollow(userId, data)
      const item = follows.value.find((f) => f.userId === userId)
      if (item) item.isSpecialFollow = data.specialFollow
      return true
    } catch {
      return false
    }
  }

  async function updateRemark(userId: number, data: UserFollowRemarkUpdateRequest): Promise<boolean> {
    try {
      await UserFollowApi.updateFollowRemark(userId, data)
      const item = follows.value.find((f) => f.userId === userId)
      if (item) item.remark = data.remark
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    follows.value = []
    fans.value = []
    followCount.value = { followingCount: 0, fanCount: 0 }
    followTotal.value = 0
    followCurrent.value = 1
    fanTotal.value = 0
    fanCurrent.value = 1
  }

  return {
    follows,
    fans,
    followCount,
    loading,
    followTotal,
    followCurrent,
    followSize,
    fanTotal,
    fanCurrent,
    fanSize,
    fetchMyFollows,
    fetchMyFans,
    fetchFollowCount,
    followUser,
    unfollowUser,
    updateSpecial,
    updateRemark,
    clearState,
  }
})
