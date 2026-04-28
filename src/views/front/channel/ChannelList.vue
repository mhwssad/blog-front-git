<template>
  <div class="channel-list-page">
    <div class="page-header">
      <h2 class="page-title">频道列表</h2>
      <el-button type="primary" @click="$router.push('/channel/apply')">
        申请创建频道
      </el-button>
    </div>

    <el-input
      v-model="keyword"
      placeholder="搜索频道..."
      clearable
      style="margin-bottom: 24px"
    />

    <div class="section">
      <h3 class="section-title">我的频道</h3>
      <el-empty v-if="filteredMyChannels.length === 0" description="暂无加入的频道" />
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
              <span>{{ channel.memberCount }} 成员</span>
              <el-divider direction="vertical" />
              <span>{{ channel.onlineCount }} 在线</span>
            </div>
            <el-button size="small" type="primary" @click="enterChannel(channel.id)">
              进入
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="section">
      <h3 class="section-title">推荐频道</h3>
      <el-empty v-if="filteredRecommendChannels.length === 0" description="暂无推荐频道" />
      <el-row v-else :gutter="16">
        <el-col
          v-for="channel in filteredRecommendChannels"
          :key="channel.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card shadow="hover" class="channel-card">
            <div class="channel-name"># {{ channel.name }}</div>
            <div class="channel-meta">
              <span>{{ channel.memberCount }} 成员</span>
              <el-divider direction="vertical" />
              <span>{{ channel.onlineCount }} 在线</span>
            </div>
            <div class="channel-type">
              <el-tag size="small" :type="channel.type === 'public' ? undefined : 'warning'">
                {{ channel.type === 'public' ? '公开' : '私有' }}
              </el-tag>
            </div>
            <el-button
              v-if="channel.joined"
              size="small"
              disabled
            >
              已加入
            </el-button>
            <el-button
              v-else-if="channel.type === 'public'"
              size="small"
              type="primary"
              @click="joinChannel(channel)"
            >
              加入
            </el-button>
            <el-button
              v-else
              size="small"
              type="warning"
              @click="applyJoinChannel(channel)"
            >
              申请加入
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface Channel {
  id: number
  name: string
  memberCount: number
  onlineCount: number
  joined: boolean
  type: 'public' | 'private'
}

const router = useRouter()
const keyword = ref('')

const myChannels = ref<Channel[]>([
  { id: 1, name: '前端技术', memberCount: 128, onlineCount: 32, joined: true, type: 'public' },
  { id: 2, name: 'Vue爱好者', memberCount: 256, onlineCount: 64, joined: true, type: 'public' },
  { id: 3, name: '项目协作', memberCount: 15, onlineCount: 5, joined: true, type: 'private' },
])

const recommendChannels = ref<Channel[]>([
  { id: 4, name: 'TypeScript', memberCount: 512, onlineCount: 89, joined: false, type: 'public' },
  { id: 5, name: 'Node.js', memberCount: 340, onlineCount: 45, joined: false, type: 'public' },
  { id: 6, name: '设计模式', memberCount: 67, onlineCount: 12, joined: false, type: 'private' },
  { id: 7, name: '开源项目', memberCount: 200, onlineCount: 30, joined: false, type: 'public' },
  { id: 8, name: '面试交流', memberCount: 180, onlineCount: 55, joined: false, type: 'public' },
  { id: 9, name: '算法刷题', memberCount: 99, onlineCount: 20, joined: false, type: 'private' },
])

const filteredMyChannels = computed(() => {
  if (!keyword.value.trim()) return myChannels.value
  return myChannels.value.filter((c) => c.name.includes(keyword.value.trim()))
})

const filteredRecommendChannels = computed(() => {
  if (!keyword.value.trim()) return recommendChannels.value
  return recommendChannels.value.filter((c) => c.name.includes(keyword.value.trim()))
})

function enterChannel(id: number): void {
  router.push(`/channel/${id}`)
}

function joinChannel(channel: Channel): void {
  channel.joined = true
  ElMessage.success(`已加入频道 #${channel.name}`)
}

function applyJoinChannel(channel: Channel): void {
  ElMessage.success(`已发送加入 #${channel.name} 的申请`)
}
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

.channel-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.channel-type {
  margin-bottom: 12px;
}
</style>
