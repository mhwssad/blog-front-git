<template>
  <div class="profile-page">
    <ProfileCard :user="authStore.currentUser ?? { username: '' }" />

    <div class="profile-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="关注" name="follow">
          <template #label>
            关注 ({{ store.followCount.followingCount }})
          </template>
          <div class="tab-toolbar">
            <el-checkbox v-model="specialOnly" label="只看特别关注" @change="loadFollows" />
          </div>
          <div v-if="store.loading" class="loading-area">
            <el-skeleton :rows="4" animated />
          </div>
          <template v-else-if="store.follows.length">
            <FollowUserItem
              v-for="user in store.follows"
              :key="user.userId"
              :user="user"
              :is-follow-tab="true"
              @unfollow="handleUnfollow"
              @toggle-special="handleToggleSpecial"
              @edit-remark="openRemarkDialog"
            />
            <div v-if="store.followTotal > store.followSize" class="pagination-area">
              <el-pagination
                v-model:current-page="followPage"
                :page-size="store.followSize"
                :total="store.followTotal"
                layout="prev, pager, next"
                small
                @current-change="loadFollows"
              />
            </div>
          </template>
          <el-empty v-else description="暂无关注" :image-size="64" />
        </el-tab-pane>

        <el-tab-pane label="粉丝" name="fan">
          <template #label>
            粉丝 ({{ store.followCount.fanCount }})
          </template>
          <div v-if="store.loading" class="loading-area">
            <el-skeleton :rows="4" animated />
          </div>
          <template v-else-if="store.fans.length">
            <FollowUserItem
              v-for="user in store.fans"
              :key="user.userId"
              :user="user"
              :is-follow-tab="false"
              @follow="handleFollow"
            />
            <div v-if="store.fanTotal > store.fanSize" class="pagination-area">
              <el-pagination
                v-model:current-page="fanPage"
                :page-size="store.fanSize"
                :total="store.fanTotal"
                layout="prev, pager, next"
                small
                @current-change="loadFans"
              />
            </div>
          </template>
          <el-empty v-else description="暂无粉丝" :image-size="64" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <RemarkEditDialog
      v-model:visible="remarkVisible"
      :current-remark="remarkUser?.remark"
      @save="handleSaveRemark"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore, useUserFollowStore } from '@/stores'
import type { UserFollowUserVO } from '@/api/types'
import ProfileCard from './components/ProfileCard.vue'
import FollowUserItem from './components/FollowUserItem.vue'
import RemarkEditDialog from './components/RemarkEditDialog.vue'

const authStore = useAuthStore()
const store = useUserFollowStore()

const activeTab = ref('follow')
const specialOnly = ref(false)
const followPage = ref(1)
const fanPage = ref(1)

const remarkVisible = ref(false)
const remarkUser = ref<UserFollowUserVO | null>(null)

async function loadFollows(): Promise<void> {
  await store.fetchMyFollows({
    current: followPage.value,
    size: store.followSize,
    specialOnly: specialOnly.value || undefined,
  })
}

async function loadFans(): Promise<void> {
  await store.fetchMyFans({ current: fanPage.value, size: store.fanSize })
}

async function handleUnfollow(userId: number): Promise<void> {
  const success = await store.unfollowUser(userId)
  if (success) {
    ElMessage.success('已取关')
    await Promise.all([loadFollows(), store.fetchFollowCount()])
  }
}

async function handleFollow(userId: number): Promise<void> {
  const success = await store.followUser(userId)
  if (success) {
    ElMessage.success('已关注')
    await Promise.all([loadFans(), store.fetchFollowCount()])
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

watch(activeTab, (tab) => {
  if (tab === 'follow') loadFollows()
  else loadFans()
})

onMounted(() => {
  store.fetchFollowCount()
  loadFollows()
})
</script>

<style scoped>
.profile-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.profile-tabs {
  margin-top: 20px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
}

.tab-toolbar {
  margin-bottom: 12px;
}

.loading-area {
  padding: 16px 0;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
