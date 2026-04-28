<template>
  <div class="user-profile-page">
    <div class="profile-card">
      <el-avatar :size="64">{{ userId }}</el-avatar>
      <div class="profile-info">
        <div class="profile-name">
          用户 {{ userId }}
          <UserLevelBadge :level="3" size="small" />
        </div>
        <div class="profile-actions">
          <el-button size="small" type="primary">关注</el-button>
          <el-button size="small" plain>私信</el-button>
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
            <div v-for="user in users" :key="user.userId" class="user-item">
              <div class="user-main">
                <el-avatar :size="36" :src="user.avatar ?? undefined">
                  {{ user.nickname?.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ user.nickname }}</span>
              </div>
              <span class="user-time">{{ user.followTime }}</span>
            </div>
            <div v-if="total > pageSize" class="pagination-area">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="total"
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
            <div v-for="user in users" :key="user.userId" class="user-item">
              <div class="user-main">
                <el-avatar :size="36" :src="user.avatar ?? undefined">
                  {{ user.nickname?.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ user.nickname }}</span>
              </div>
              <span class="user-time">{{ user.followTime }}</span>
            </div>
            <div v-if="total > pageSize" class="pagination-area">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="total"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FollowApi } from '@/api/follow'
import type { PublicFollowUserVO } from '@/api/types'
import UserLevelBadge from '@/components/common/UserLevelBadge.vue'

const route = useRoute()
const userId = computed(() => Number(route.params.userId))

const activeTab = ref('follow')
const users = ref<PublicFollowUserVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)

async function loadData(): Promise<void> {
  loading.value = true
  try {
    const params = { current: currentPage.value, size: pageSize }
    const response =
      activeTab.value === 'follow'
        ? await FollowApi.getUserFollows(userId.value, params)
        : await FollowApi.getUserFans(userId.value, params)
    users.value = response.data.data.records
    total.value = response.data.data.total
  } catch {
    users.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => {
  currentPage.value = 1
  loadData()
})

onMounted(loadData)
</script>

<style scoped>
.user-profile-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
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

.loading-area {
  padding: 16px 0;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
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
