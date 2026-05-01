<template>
  <div class="channel-list-page">
    <div class="page-header">
      <h2 class="page-title">频道列表</h2>
      <el-button type="primary" @click="router.push('/channel/apply')">
        申请创建频道
      </el-button>
    </div>

    <el-input
      v-model="keyword"
      placeholder="搜索频道..."
      clearable
      style="margin-bottom: 24px"
      @clear="handleSearch"
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>

    <!-- 我的频道 -->
    <div class="section">
      <h3 class="section-title">我的频道</h3>
      <div v-if="store.loading" style="text-align: center; padding: 24px 0">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      </div>
      <el-empty v-else-if="myChannels.length === 0" description="暂无加入的频道" />
      <el-row v-else :gutter="16">
        <el-col
          v-for="channel in filteredMyChannels"
          :key="channel.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card shadow="hover" class="channel-card">
            <div class="channel-name"># {{ channel.name }}</div>
            <div class="channel-meta">
              <span>{{ channel.memberCount ?? 0 }} 成员</span>
            </div>
            <el-tag v-if="channel.selfRole" size="small" style="margin-bottom: 12px">
              {{ roleLabel(channel.selfRole) }}
            </el-tag>
            <div>
              <el-button size="small" type="primary" @click="enterChannel(channel.id)">
                进入
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 发现频道 -->
    <div class="section">
      <h3 class="section-title">发现频道</h3>
      <div v-if="store.searchLoading" style="text-align: center; padding: 24px 0">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      </div>
      <el-empty v-else-if="discoverChannels.length === 0" description="暂无可加入的频道" />
      <el-row v-else :gutter="16">
        <el-col
          v-for="channel in filteredDiscoverChannels"
          :key="channel.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card shadow="hover" class="channel-card">
            <div class="channel-name"># {{ channel.name }}</div>
            <div v-if="channel.description" class="channel-desc">
              {{ channel.description }}
            </div>
            <div class="channel-meta">
              <span>{{ channel.memberCount ?? 0 }} 成员</span>
            </div>
            <div class="channel-type">
              <el-tag
                size="small"
                :type="channel.visibilityScope === 'public' ? undefined : 'warning'"
              >
                {{ channel.visibilityScope === 'public' ? '公开' : '私有' }}
              </el-tag>
            </div>
            <div>
              <el-button
                v-if="channel.joined"
                size="small"
                disabled
              >
                已加入
              </el-button>
              <el-button
                v-else-if="channel.joinRule === 'free'"
                size="small"
                type="primary"
                :loading="joiningId === channel.id"
                @click="handleJoin(channel)"
              >
                加入
              </el-button>
              <el-button
                v-else-if="channel.joinRule === 'approval'"
                size="small"
                type="warning"
                :loading="applyingId === channel.id"
                @click="handleApplyJoin(channel)"
              >
                申请加入
              </el-button>
              <el-button v-else size="small" disabled>
                仅限邀请
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import { useUserChatStore } from '@/stores'
import type { ChatGroupSearchVO } from '@/types/api-types'

const router = useRouter()
const store = useUserChatStore()

const keyword = ref('')
const joiningId = ref<number | null>(null)
const applyingId = ref<number | null>(null)

// My channels: from conversations list, filtered to channels with a selfRole
const myChannels = computed(() => {
  return store.conversations.filter(
    (c) =>
      c.selfRole &&
      (c.conversationType === 'group' ||
        c.sceneType === 'topic_channel' ||
        c.sceneType === 'hall_channel'),
  )
})

const filteredMyChannels = computed(() => {
  if (!keyword.value.trim()) return myChannels.value
  const kw = keyword.value.trim().toLowerCase()
  return myChannels.value.filter((c) => c.name?.toLowerCase().includes(kw))
})

// Discover channels: search results excluding already joined ones
const discoverChannels = computed(() => {
  return store.searchResults.filter((c) => !c.joined)
})

const filteredDiscoverChannels = computed(() => {
  if (!keyword.value.trim()) return discoverChannels.value
  const kw = keyword.value.trim().toLowerCase()
  return discoverChannels.value.filter((c) => c.name?.toLowerCase().includes(kw))
})

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    owner: '创建者',
    admin: '管理员',
    member: '成员',
  }
  return map[role] || role
}

async function loadData(): Promise<void> {
  await Promise.all([
    store.fetchConversations({ size: 200 }),
    store.searchGroups({ size: 200 }),
  ])
}

function handleSearch(): void {
  store.searchGroups({ keyword: keyword.value.trim() || undefined, size: 200 })
}

function enterChannel(id: number): void {
  router.push(`/channel/${id}`)
}

async function handleJoin(channel: ChatGroupSearchVO): Promise<void> {
  joiningId.value = channel.id
  try {
    const ok = await store.joinConversation(channel.id)
    if (ok) {
      ElMessage.success(`已加入频道 #${channel.name}`)
      channel.joined = true
    }
  } finally {
    joiningId.value = null
  }
}

async function handleApplyJoin(channel: ChatGroupSearchVO): Promise<void> {
  applyingId.value = channel.id
  try {
    const ok = await store.submitJoinApplication(channel.id)
    if (ok) {
      ElMessage.success(`已发送加入 #${channel.name} 的申请`)
    }
  } finally {
    applyingId.value = null
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.channel-list-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.channel-card {
  margin-bottom: 16px;
}

.channel-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.channel-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.channel-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.channel-type {
  margin-bottom: 12px;
}
</style>
