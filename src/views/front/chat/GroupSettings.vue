<template>
  <div v-loading="pageLoading" class="group-settings-page">
    <div class="page-header">
      <div class="page-header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">群设置</h2>
      </div>
      <el-button type="primary" :loading="saving" :disabled="!isOwnerOrAdmin" @click="handleSave">
        保存设置
      </el-button>
    </div>

    <template v-if="conversation">
      <div class="settings-section">
        <h3 class="section-title">基本信息</h3>
        <el-form label-width="100px" style="max-width: 600px">
          <el-form-item label="群名称">
            <el-input :model-value="conversation.name" disabled />
          </el-form-item>
          <el-form-item label="群公告">
            <el-input
              v-model="noticeText"
              type="textarea"
              :rows="4"
              placeholder="请输入群公告"
              :disabled="!isOwnerOrAdmin"
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="settings-section">
        <h3 class="section-title">群类型与权限</h3>
        <el-form label-width="100px" style="max-width: 600px">
          <el-form-item label="群可见性">
            <el-tag :type="visibilityTagType">
              {{ visibilityLabel }}
            </el-tag>
          </el-form-item>
          <el-form-item label="入群方式">
            <el-tag :type="joinRuleTagType">
              {{ joinRuleLabel }}
            </el-tag>
          </el-form-item>
          <el-form-item label="成员数量">
            <span>{{ conversation.memberCount ?? 0 }}</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="settings-section">
        <h3 class="section-title">群管理</h3>
        <div v-loading="membersLoading" class="admin-list">
          <div v-for="member in ownerAndAdmins" :key="member.userId" class="admin-item">
            <el-avatar :size="32" :src="member.avatar ?? undefined">
              {{ (member.nickname ?? member.username ?? '?').charAt(0) }}
            </el-avatar>
            <span class="admin-name">{{ member.nickname || member.username }}</span>
            <el-tag size="small" :type="member.role === 'owner' ? 'danger' : 'warning'">
              {{ member.role === 'owner' ? '群主' : '管理员' }}
            </el-tag>
            <el-popconfirm
              v-if="isOwner && member.role === 'admin'"
              title="确定要移除该管理员吗？"
              @confirm="handleRemoveAdmin(member.userId)"
            >
              <template #reference>
                <el-button size="small" type="danger" link>移除</el-button>
              </template>
            </el-popconfirm>
          </div>
          <el-empty
            v-if="ownerAndAdmins.length === 0 && !membersLoading"
            description="暂无管理数据"
            :image-size="60"
          />
        </div>
        <el-button
          v-if="isOwner"
          type="primary"
          link
          style="margin-top: 12px"
          @click="addAdminDialogVisible = true"
        >
          添加管理员
        </el-button>
      </div>

      <div v-if="isOwner" class="settings-section danger-section">
        <h3 class="section-title">危险操作</h3>
        <el-popconfirm title="确定要解散群聊吗？此操作不可恢复。" @confirm="handleDissolve">
          <template #reference>
            <el-button type="danger" :loading="dissolving">解散群聊</el-button>
          </template>
        </el-popconfirm>
      </div>
    </template>

    <el-empty v-else-if="!pageLoading" description="未找到群信息" />

    <!-- Add Admin Dialog -->
    <el-dialog v-model="addAdminDialogVisible" title="添加管理员" width="500px" destroy-on-close>
      <div v-loading="membersLoading" class="add-admin-list">
        <div v-for="member in promotableMembers" :key="member.userId" class="admin-item">
          <el-avatar :size="28" :src="member.avatar ?? undefined">
            {{ (member.nickname ?? member.username ?? '?').charAt(0) }}
          </el-avatar>
          <span class="admin-name">{{ member.nickname || member.username }}</span>
          <el-button size="small" type="primary" @click="handleSetAdmin(member.userId)">
            设为管理员
          </el-button>
        </div>
        <el-empty
          v-if="promotableMembers.length === 0 && !membersLoading"
          description="没有可提升的成员"
          :image-size="60"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
/**
 * 群聊设置页面
 * @description 群主/管理员可修改群公告、设置管理员、解散群聊
 * @module front/chat/GroupSettings
 * @see ../../api/user/chat.ts
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserChatStore, useAuthStore } from '@/stores'
import { UserChatApi } from '@/api/user/chat'
import type { ChatConversationVO, ChatGroupMemberVO } from '@/types/api-types'

const route = useRoute()
const router = useRouter()
const chatStore = useUserChatStore()
const authStore = useAuthStore()

const groupId = Number(route.params.id)

const pageLoading = ref(false)
const saving = ref(false)
const dissolving = ref(false)
const membersLoading = ref(false)
const addAdminDialogVisible = ref(false)

const conversation = ref<ChatConversationVO | null>(null)
const members = ref<ChatGroupMemberVO[]>([])
const noticeText = ref('')

const isOwner = computed(() => conversation.value?.selfRole === 'owner')
// 是否为群主或管理员（有权限修改设置）
const isOwnerOrAdmin = computed(() => {
  const role = conversation.value?.selfRole
  return role === 'owner' || role === 'admin'
})

const ownerAndAdmins = computed(() =>
  members.value.filter(m => m.role === 'owner' || m.role === 'admin')
)

// 可提升为管理员的普通成员
const promotableMembers = computed(() => members.value.filter(m => m.role === 'member'))

const visibilityLabel = computed(() => {
  const map: Record<string, string> = {
    public: '公开',
    member: '仅成员可见',
    private: '私有',
  }
  return map[conversation.value?.visibilityScope ?? ''] ?? '未知'
})

const visibilityTagType = computed((): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    public: 'success',
    member: 'warning',
    private: 'info',
  }
  return map[conversation.value?.visibilityScope ?? ''] ?? 'info'
})

const joinRuleLabel = computed(() => {
  const map: Record<string, string> = {
    free: '自由加入',
    approval: '审批后加入',
    invite_only: '仅邀请',
  }
  return map[conversation.value?.joinRule ?? ''] ?? '未知'
})

const joinRuleTagType = computed((): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    free: 'success',
    approval: 'warning',
    invite_only: 'info',
  }
  return map[conversation.value?.joinRule ?? ''] ?? 'info'
})

async function loadGroupDetail(): Promise<void> {
  pageLoading.value = true
  try {
    const response = await UserChatApi.getGroupById(groupId)
    conversation.value = response.data.data
    noticeText.value = conversation.value?.notice ?? ''
  } catch {
    ElMessage.error('加载群信息失败')
  } finally {
    pageLoading.value = false
  }
}

async function loadMembers(): Promise<void> {
  membersLoading.value = true
  try {
    const response = await UserChatApi.getGroupMembers(groupId)
    members.value = response.data.data
  } catch {
    ElMessage.error('加载成员列表失败')
  } finally {
    membersLoading.value = false
  }
}

async function handleSave(): Promise<void> {
  if (!conversation.value) return

  saving.value = true
  try {
    await UserChatApi.updateGroupNotice(groupId, { notice: noticeText.value })
    ElMessage.success('设置已保存')
    // Refresh conversation data
    const response = await UserChatApi.getGroupById(groupId)
    conversation.value = response.data.data
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function handleSetAdmin(userId: number): Promise<void> {
  try {
    await UserChatApi.setGroupAdmin(groupId, userId)
    ElMessage.success('已设为管理员')
    await loadMembers()
  } catch {
    ElMessage.error('设置管理员失败')
  }
}

async function handleRemoveAdmin(userId: number): Promise<void> {
  try {
    await UserChatApi.removeGroupAdmin(groupId, userId)
    ElMessage.success('已移除管理员')
    await loadMembers()
  } catch {
    ElMessage.error('移除管理员失败')
  }
}

async function handleDissolve(): Promise<void> {
  dissolving.value = true
  try {
    await UserChatApi.dissolveGroup(groupId)
    ElMessage.success('群聊已解散')
    // Clear cached conversation if it matches
    if (chatStore.currentConversation?.id === groupId) {
      chatStore.currentConversation = null
    }
    router.back()
  } catch {
    ElMessage.error('解散群聊失败')
  } finally {
    dissolving.value = false
  }
}

onMounted(async () => {
  if (!groupId || Number.isNaN(groupId)) {
    ElMessage.error('无效的群组ID')
    router.back()
    return
  }
  await Promise.all([loadGroupDetail(), loadMembers()])
})
</script>

<style scoped>
.group-settings-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-name {
  font-size: 14px;
  min-width: 80px;
}

.add-admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.danger-section {
  border-bottom: none;
}
</style>
