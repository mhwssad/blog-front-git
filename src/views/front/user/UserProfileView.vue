<template>
  <div class="user-profile-page">
    <div v-if="profileLoading" class="loading-area">
      <el-skeleton :rows="3" animated />
    </div>
    <template v-else>
      <div class="profile-card">
        <el-avatar :size="64" :src="profile.avatar ?? undefined">
          {{ profile.nickname?.charAt(0) ?? profile.username?.charAt(0) ?? '?' }}
        </el-avatar>
        <div class="profile-info">
          <div class="profile-name">
            {{ profile.nickname || profile.username || `用户 ${userId}` }}
          </div>
          <div class="profile-stats">
            <span>{{ followTotal }} 关注</span>
            <span>{{ fanTotal }} 粉丝</span>
          </div>
          <div v-if="!isSelf" class="profile-actions">
            <el-button
              size="small"
              :type="isFollowing ? 'default' : 'primary'"
              :loading="followLoading"
              @click="toggleFollow"
            >
              {{ isFollowing ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="profile-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="关注" name="follow">
            <div v-if="loading" class="loading-area">
              <el-skeleton :rows="4" animated />
            </div>
            <template v-else-if="users.length">
              <div
                v-for="user in users"
                :key="user.userId"
                class="user-item"
                @click="router.push(`/user/${user.userId}`)"
              >
                <div class="user-main">
                  <el-avatar :size="36" :src="user.avatar ?? undefined">
                    {{ user.nickname?.charAt(0) }}
                  </el-avatar>
                  <span class="user-name">{{ user.nickname }}</span>
                </div>
                <span class="user-time">{{ formatAiDate(user.followTime) }}</span>
              </div>
              <div v-if="followTotal > pageSize" class="pagination-area">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="followTotal"
                  layout="prev, pager, next"
                  small
                  @current-change="loadData"
                />
              </div>
            </template>
            <el-empty v-else description="暂无关注" :image-size="64" />
          </el-tab-pane>

          <el-tab-pane label="粉丝" name="fan">
            <div v-if="loading" class="loading-area">
              <el-skeleton :rows="4" animated />
            </div>
            <template v-else-if="users.length">
              <div
                v-for="user in users"
                :key="user.userId"
                class="user-item"
                @click="router.push(`/user/${user.userId}`)"
              >
                <div class="user-main">
                  <el-avatar :size="36" :src="user.avatar ?? undefined">
                    {{ user.nickname?.charAt(0) }}
                  </el-avatar>
                  <span class="user-name">{{ user.nickname }}</span>
                </div>
                <span class="user-time">{{ formatAiDate(user.followTime) }}</span>
              </div>
              <div v-if="fanTotal > pageSize" class="pagination-area">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="fanTotal"
                  layout="prev, pager, next"
                  small
                  @current-change="loadData"
                />
              </div>
            </template>
            <el-empty v-else description="暂无粉丝" :image-size="64" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * 用户个人主页
 * @description 展示指定用户的资料、关注列表和粉丝列表，支持关注/取关操作
 * @module front/user/UserProfileView
 * @see ../../api/follow.ts
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FollowApi } from '@/api/follow'
import { useUserFollowStore } from '@/stores'
import { useAuthStore } from '@/stores'
import { formatAiDate } from '@/utils'
import type { PublicFollowUserVO } from '@/types/api-types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const followStore = useUserFollowStore()

const userId = computed(() => Number(route.params.userId))
const isSelf = computed(() => authStore.currentUser?.id === userId.value)

// 当前页面类型（follow/fan）
const activeTab = ref('follow')
// 用户列表（关注或粉丝）
const users = ref<PublicFollowUserVO[]>([])
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
// 关注总数和粉丝总数
const followTotal = ref(0)
const fanTotal = ref(0)

// 用户资料（昵称、用户名、头像）
const profile = reactive({
  nickname: '',
  username: '',
  avatar: '' as string | null,
})
// 是否正在加载关注/粉丝数据
const profileLoading = ref(false)
// 当前是否已关注该用户
const isFollowing = ref(false)
// 是否正在执行关注/取关操作
const followLoading = ref(false)

// 从用户列表中提取第一个用户来补充 profile 信息（用于首次加载时显示头像）
function updateProfileFromUser(user: PublicFollowUserVO | undefined): void {
  if (!user) return
  if (!profile.nickname) {
    profile.nickname = user.nickname
    profile.username = user.username
    profile.avatar = user.avatar ?? null
  }
}

async function loadData(): Promise<void> {
  loading.value = true
  try {
    const params = { current: currentPage.value, size: pageSize }
    if (activeTab.value === 'follow') {
      const response = await FollowApi.getUserFollows(userId.value, params)
      users.value = response.data.data.records
      followTotal.value = response.data.data.total
      updateProfileFromUser(users.value[0])
    } else {
      const response = await FollowApi.getUserFans(userId.value, params)
      users.value = response.data.data.records
      fanTotal.value = response.data.data.total
      updateProfileFromUser(users.value[0])
    }
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

async function loadAllData(): Promise<void> {
  profileLoading.value = true
  loading.value = true
  try {
    const [followRes, fanRes] = await Promise.all([
      FollowApi.getUserFollows(userId.value, { current: 1, size: 1 }),
      FollowApi.getUserFans(userId.value, { current: 1, size: 1 }),
    ])
    followTotal.value = followRes.data.data.total
    fanTotal.value = fanRes.data.data.total
    profileLoading.value = false

    await loadData()
  } catch {
    profileLoading.value = false
  }
}

async function toggleFollow(): Promise<void> {
  followLoading.value = true
  try {
    if (isFollowing.value) {
      const success = await followStore.unfollowUser(userId.value)
      if (success) {
        isFollowing.value = false
        fanTotal.value = Math.max(0, fanTotal.value - 1)
        ElMessage.success('已取消关注')
      }
    } else {
      const success = await followStore.followUser(userId.value)
      if (success) {
        isFollowing.value = true
        fanTotal.value += 1
        ElMessage.success('已关注')
      }
    }
  } finally {
    followLoading.value = false
  }
}

watch(activeTab, () => {
  currentPage.value = 1
  void loadData()
})

watch(userId, () => {
  profile.nickname = ''
  profile.username = ''
  profile.avatar = null
  followTotal.value = 0
  fanTotal.value = 0
  currentPage.value = 1
  void loadAllData()
})

onMounted(() => {
  void loadAllData()
})
</script>

<style scoped>
.user-profile-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.loading-area {
  padding: 16px 0;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-stats {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.profile-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.profile-tabs {
  margin-top: 20px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  cursor: pointer;
}

.user-item:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.user-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
