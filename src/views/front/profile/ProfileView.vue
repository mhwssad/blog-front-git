<template>
  <div class="profile-page">
    <ProfileCard :user="authStore.currentUser ?? { username: '' }" />

    <div class="profile-body">
      <GroupSidebar
        v-model="activeGroup"
        :following-count="store.followCount.followingCount"
        :special-count="specialCount"
        :whisper-count="0"
        :fan-count="store.followCount.fanCount"
      />

      <div class="profile-main">
        <div v-if="store.loading" class="loading-area">
          <el-skeleton :rows="4" animated />
        </div>

        <template v-else-if="currentList.length">
          <div class="user-grid">
            <UserCard
              v-for="user in currentList"
              :key="user.userId"
              :user="user"
              :is-follow-tab="isFollowGroup"
              @unfollow="handleUnfollow"
              @follow="handleFollow"
              @toggle-special="handleToggleSpecial"
              @edit-remark="openRemarkDialog"
            />
          </div>
          <div v-if="currentTotal > currentSize" class="pagination-area">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="currentSize"
              :total="currentTotal"
              layout="prev, pager, next"
              small
              @current-change="loadCurrentGroup"
            />
          </div>
        </template>

        <el-empty v-else :description="emptyText" :image-size="80" />
      </div>
    </div>

    <RemarkEditDialog
      v-model:visible="remarkVisible"
      :current-remark="remarkUser?.remark"
      @save="handleSaveRemark"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore, useUserFollowStore } from '@/stores'
import type { UserFollowUserVO } from '@/types/api-types'
import ProfileCard from './components/ProfileCard.vue'
import GroupSidebar from './components/GroupSidebar.vue'
import UserCard from './components/UserCard.vue'
import RemarkEditDialog from './components/RemarkEditDialog.vue'

const authStore = useAuthStore()
const store = useUserFollowStore()

const activeGroup = ref('all')
const followPage = ref(1)
const fanPage = ref(1)

const remarkVisible = ref(false)
const remarkUser = ref<UserFollowUserVO | null>(null)

const isFollowGroup = computed(() => activeGroup.value !== 'fans')

const specialCount = computed(
  () => store.follows.filter((u) => u.isSpecialFollow === 1).length,
)

const currentList = computed(() => (isFollowGroup.value ? store.follows : store.fans))

const currentPage = computed({
  get: () => (isFollowGroup.value ? followPage.value : fanPage.value),
  set: (v) => {
    if (isFollowGroup.value) followPage.value = v
    else fanPage.value = v
  },
})

const currentTotal = computed(() =>
  isFollowGroup.value ? store.followTotal : store.fanTotal,
)

const currentSize = computed(() =>
  isFollowGroup.value ? store.followSize : store.fanSize,
)

const emptyText = computed(() => {
  const map: Record<string, string> = {
    all: '暂无关注',
    special: '暂无特别关注',
    whisper: '暂无悄悄关注',
    fans: '暂无粉丝',
  }
  return map[activeGroup.value] ?? '暂无数据'
})

async function loadCurrentGroup(): Promise<void> {
  if (isFollowGroup.value) {
    await store.fetchMyFollows({
      current: followPage.value,
      size: store.followSize,
      specialOnly: activeGroup.value === 'special' || undefined,
    })
  } else {
    await store.fetchMyFans({ current: fanPage.value, size: store.fanSize })
  }
}

async function handleUnfollow(userId: number): Promise<void> {
  const success = await store.unfollowUser(userId)
  if (success) {
    ElMessage.success('已取关')
    await Promise.all([loadCurrentGroup(), store.fetchFollowCount()])
  }
}

async function handleFollow(userId: number): Promise<void> {
  const success = await store.followUser(userId)
  if (success) {
    ElMessage.success('已关注')
    await Promise.all([loadCurrentGroup(), store.fetchFollowCount()])
  }
}

async function handleToggleSpecial(user: UserFollowUserVO): Promise<void> {
  const newSpecial = user.isSpecialFollow === 1 ? 0 : 1
  const success = await store.updateSpecial(user.userId, { specialFollow: newSpecial })
  if (success) {
    ElMessage.success(newSpecial === 1 ? '已设为特别关注' : '已取消特别关注')
  }
}

function openRemarkDialog(user: UserFollowUserVO): void {
  remarkUser.value = user
  remarkVisible.value = true
}

async function handleSaveRemark(remark: string): Promise<void> {
  if (!remarkUser.value) return
  const success = await store.updateRemark(remarkUser.value.userId, { remark })
  if (success) {
    ElMessage.success('备注已更新')
  }
}

watch(activeGroup, () => {
  currentPage.value = 1
  loadCurrentGroup()
})

onMounted(() => {
  store.fetchFollowCount()
  loadCurrentGroup()
})
</script>

<style scoped>
.profile-page {
  max-width: 1060px;
  margin: 0 auto;
  padding: 24px;
}

.profile-body {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.profile-main {
  flex: 1;
  min-width: 0;
  padding: 20px 24px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.loading-area {
  padding: 16px 0;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .profile-body {
    flex-direction: column;
    gap: 16px;
  }

  .user-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .user-grid {
    grid-template-columns: 1fr;
  }
}
</style>
