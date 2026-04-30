<template>
  <div class="chat-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" class="filter-control" clearable placeholder="会话名 / 目标用户" />
        </el-form-item>
        <el-form-item label="会话类型">
          <el-select v-model="searchForm.conversationType" clearable class="filter-control" placeholder="全部">
            <el-option
              v-for="option in CHAT_CONVERSATION_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable class="filter-control" placeholder="全部">
            <el-option
              v-for="option in CHAT_CONVERSATION_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="群主 ID">
          <el-input-number v-model="searchForm.ownerId" :min="1" class="filter-control" />
        </el-form-item>
        <el-form-item label="成员 ID">
          <el-input-number v-model="searchForm.memberUserId" :min="1" class="filter-control" />
        </el-form-item>
        <el-form-item label="全站会话">
          <el-select v-model="searchForm.isAllSite" clearable class="filter-control" placeholder="全部">
            <el-option
              v-for="option in BOOLEAN_TEXT_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:chat:query'" type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>会话治理</span>
          <el-button v-permission="'content:chat:query'" link type="primary" @click="fetchConversations">
            刷新
          </el-button>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="chatStore.conversationLoading"
          :data="chatStore.conversations"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          border
          stripe
          table-layout="auto"
        >
          <el-table-column prop="id" label="会话 ID" min-width="90" align="center" />
          <el-table-column label="会话信息" min-width="220" align="center">
            <template #default="{ row }">
              <div>{{ resolveConversationName(row) }}</div>
              <div class="sub-text">{{ formatOptionalText(row.notice) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="类型" min-width="96" align="center">
            <template #default="{ row }">
              {{ formatChatConversationType(row.conversationType) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="96" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'">
                {{ formatChatConversationStatus(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="memberCount" label="成员数" min-width="90" align="center" />
          <el-table-column label="群主" min-width="96" align="center">
            <template #default="{ row }">#{{ row.ownerId ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="最近消息" min-width="220" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatLastMessage(row.lastMessage) }}
            </template>
          </el-table-column>
          <el-table-column label="全站" min-width="70" align="center">
            <template #default="{ row }">
              {{ formatBooleanText(row.isAllSite) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="168" align="center">
            <template #default="{ row }">
              {{ formatCreatedAt(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" :min-width="isCompactTable ? 180 : 220" align="center">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" @click="handleSelectConversation(row.id)">进入治理</el-button>
                <el-button
                  v-permission="'content:chat:update'"
                  link
                  :type="row.status === 1 ? 'warning' : 'success'"
                  @click="handleConversationStatusChange(row.id, row.status === 1 ? 0 : 1)"
                >
                  {{ row.status === 1 ? '冻结' : '启用' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div ref="paginationRef" class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="chatStore.conversationTotal"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-alert
      v-if="!selectedConversationId"
      title="请选择一个会话进入治理视图。"
      type="info"
      show-icon
      :closable="false"
    />

    <template v-else>
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>会话详情</span>
            <div class="table-actions">
              <el-button link type="primary" @click="handleSelectConversation(selectedConversationId)">刷新</el-button>
              <el-button
                v-permission="'content:chat:update'"
                :disabled="!selectedConversation"
                type="warning"
                plain
                @click="toggleSelectedConversationStatus"
              >
                {{ selectedConversation?.status === 1 ? '冻结会话' : '启用会话' }}
              </el-button>
            </div>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="会话名称">
            {{ resolveConversationName(selectedConversation) }}
          </el-descriptions-item>
          <el-descriptions-item label="会话类型">
            {{ formatChatConversationType(selectedConversation?.conversationType) }}
          </el-descriptions-item>
          <el-descriptions-item label="会话状态">
            {{ formatChatConversationStatus(selectedConversation?.status) }}
          </el-descriptions-item>
          <el-descriptions-item label="成员数">
            {{ selectedConversation?.memberCount ?? 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="群主 ID">#{{ selectedConversation?.ownerId ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="全站会话">
            {{ formatBooleanText(selectedConversation?.isAllSite) }}
          </el-descriptions-item>
          <el-descriptions-item label="公告" :span="2">
            {{ formatOptionalText(selectedConversation?.notice) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-row :gutter="16" class="detail-row">
        <el-col :lg="10" :span="24">
          <el-card class="detail-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>成员管理</span>
                <el-button link type="primary" @click="refreshMembers">刷新</el-button>
              </div>
            </template>

            <el-table v-loading="chatStore.memberLoading" :data="chatStore.members" border stripe table-layout="auto">
              <el-table-column prop="userId" label="用户 ID" min-width="90" align="center" />
              <el-table-column label="成员信息" min-width="160" align="center">
                <template #default="{ row }">
                  <div>{{ row.nickname || row.username || '-' }}</div>
                  <div class="sub-text">{{ row.username || '-' }}</div>
                </template>
              </el-table-column>
              <el-table-column label="角色" min-width="140" align="center">
                <template #default="{ row }">
                  <el-select
                    v-permission.disable="'content:chat:update'"
                    :model-value="row.role"
                    class="inline-select"
                    @change="value => handleMemberRoleChange(row.userId, String(value))"
                  >
                    <el-option
                      v-for="option in CHAT_MEMBER_ROLE_OPTIONS"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="状态" min-width="120" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-permission.disable="'content:chat:update'"
                    :model-value="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="value => handleMemberStatusChange(row.userId, Number(value))"
                  />
                </template>
              </el-table-column>
              <el-table-column label="禁言至" min-width="160" align="center">
                <template #default="{ row }">
                  {{ formatCreatedAt(row.muteUntil) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="120" align="center">
                <template #default="{ row }">
                  <el-button v-permission="'content:chat:update'" link type="warning" @click="handleMemberMute(row.userId, row.muteUntil ? null : '24h')">
                    {{ row.muteUntil ? '解除禁言' : '禁言 24h' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :lg="14" :span="24">
          <el-card class="detail-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>消息管理</span>
                <el-button link type="primary" @click="refreshMessages">刷新</el-button>
              </div>
            </template>

            <el-form :model="messageSearchForm" inline class="inner-search-form">
              <el-form-item label="发送者">
                <el-input-number v-model="messageSearchForm.senderId" :min="1" class="inner-control" />
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="messageSearchForm.messageType" clearable class="inner-control" placeholder="全部">
                  <el-option
                    v-for="option in CHAT_MESSAGE_TYPE_OPTIONS"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="messageSearchForm.keyword" class="inner-control" clearable placeholder="消息内容" />
              </el-form-item>
              <el-form-item class="search-actions">
                <el-button type="primary" @click="handleMessageSearch">查询</el-button>
                <el-button @click="handleMessageReset">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table v-loading="chatStore.messageLoading" :data="chatStore.messages" border stripe table-layout="auto">
              <el-table-column prop="id" label="消息 ID" min-width="90" align="center" />
              <el-table-column label="发送者" min-width="140" align="center">
                <template #default="{ row }">
                  #{{ row.senderId }} / {{ row.senderNickname || row.senderUsername || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="类型" min-width="100" align="center">
                <template #default="{ row }">
                  {{ formatChatMessageType(row.messageType) }}
                </template>
              </el-table-column>
              <el-table-column label="内容" min-width="220" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ formatMessagePreview(row) }}
                </template>
              </el-table-column>
              <el-table-column label="回执" min-width="120" align="center">
                <template #default="{ row }">
                  {{ row.readRecipientCount ?? 0 }}/{{ row.totalRecipientCount ?? 0 }}
                </template>
              </el-table-column>
              <el-table-column label="状态" min-width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.revoked ? 'danger' : 'success'">
                    {{ row.revoked ? '已撤回' : '正常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="已编辑" min-width="70" align="center">
                <template #default="{ row }">
                  {{ row.edited ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column label="发送时间" min-width="168" align="center">
                <template #default="{ row }">
                  {{ formatCreatedAt(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="180" align="center">
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button link type="primary" @click="handleViewMessageDetail(row.id)">详情</el-button>
                    <el-button link type="success" @click="handleViewReceipts(row.id)">回执</el-button>
                    <el-button
                      v-permission="'content:chat:revoke'"
                      link
                      type="danger"
                      :disabled="row.revoked"
                      @click="handleRevokeMessage(row.id)"
                    >
                      撤回
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="messagePagination.current"
                v-model:page-size="messagePagination.size"
                :total="chatStore.messageTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @current-change="handleMessagePageChange"
                @size-change="handleMessageSizeChange"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>消息回执</span>
            <span class="sub-text">
              {{ selectedMessageId ? `当前消息 #${selectedMessageId}` : '请选择消息查看回执' }}
            </span>
          </div>
        </template>

        <el-empty v-if="!selectedMessageId" description="从上方消息列表选择一条消息查看回执" />

        <template v-else>
          <el-form :model="receiptSearchForm" inline class="inner-search-form">
            <el-form-item label="接收人">
              <el-input-number v-model="receiptSearchForm.recipientUserId" :min="1" class="inner-control" />
            </el-form-item>
            <el-form-item label="送达状态">
              <el-select v-model="receiptSearchForm.deliveryStatus" clearable class="inner-control" placeholder="全部">
                <el-option
                  v-for="option in CHAT_DELIVERY_STATUS_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="可见状态">
              <el-select v-model="receiptSearchForm.visibleStatus" clearable class="inner-control" placeholder="全部">
                <el-option
                  v-for="option in CHAT_VISIBLE_STATUS_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="search-actions">
              <el-button type="primary" @click="handleReceiptSearch">查询</el-button>
              <el-button @click="handleReceiptReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table v-loading="chatStore.receiptLoading" :data="chatStore.receipts" border stripe table-layout="auto">
            <el-table-column prop="recipientUserId" label="接收人 ID" min-width="96" align="center" />
            <el-table-column label="接收人" min-width="160" align="center">
              <template #default="{ row }">
                {{ row.recipientNickname || row.recipientUsername || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="送达状态" min-width="110" align="center">
              <template #default="{ row }">
                {{ formatChatDeliveryStatus(row.deliveryStatus) }}
              </template>
            </el-table-column>
            <el-table-column label="可见状态" min-width="110" align="center">
              <template #default="{ row }">
                {{ formatChatVisibleStatus(row.visibleStatus) }}
              </template>
            </el-table-column>
            <el-table-column label="送达时间" min-width="168" align="center">
              <template #default="{ row }">
                {{ formatCreatedAt(row.deliveredAt) }}
              </template>
            </el-table-column>
            <el-table-column label="阅读时间" min-width="168" align="center">
              <template #default="{ row }">
                {{ formatCreatedAt(row.readAt) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="receiptPagination.current"
              v-model:page-size="receiptPagination.size"
              :total="chatStore.receiptTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @current-change="handleReceiptPageChange"
              @size-change="handleReceiptSizeChange"
            />
          </div>
        </template>
      </el-card>
    </template>

    <ChatMessageDetailDrawer
      v-model="messageDetailVisible"
      :message="chatStore.messageDetail"
      :loading="chatStore.detailLoading"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ChatConversationVO, ChatMessageVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useChatStore } from '@/stores'
import {
  BOOLEAN_TEXT_OPTIONS,
  CHAT_CONVERSATION_STATUS_OPTIONS,
  CHAT_CONVERSATION_TYPE_OPTIONS,
  CHAT_DELIVERY_STATUS_OPTIONS,
  CHAT_MEMBER_ROLE_OPTIONS,
  CHAT_MESSAGE_TYPE_OPTIONS,
  CHAT_VISIBLE_STATUS_OPTIONS,
  formatBooleanText,
  formatChatConversationStatus,
  formatChatConversationType,
  formatChatDeliveryStatus,
  formatChatMessageType,
  formatChatVisibleStatus,
  formatCreatedAt,
  formatOptionalText,
} from '@/utils'
import ChatMessageDetailDrawer from './components/ChatMessageDetailDrawer.vue'

const chatStore = useChatStore()
const selectedConversationId = ref<number | null>(null)
const selectedMessageId = ref<number | null>(null)
const messageDetailVisible = ref(false)

const searchForm = reactive({
  keyword: '',
  conversationType: '' as string | undefined,
  status: undefined as number | undefined,
  ownerId: undefined as number | undefined,
  memberUserId: undefined as number | undefined,
  isAllSite: undefined as number | undefined,
})

const messageSearchForm = reactive({
  senderId: undefined as number | undefined,
  messageType: '' as string | undefined,
  keyword: '',
})

const receiptSearchForm = reactive({
  recipientUserId: undefined as number | undefined,
  deliveryStatus: undefined as number | undefined,
  visibleStatus: undefined as number | undefined,
})

const pagination = reactive({ current: 1, size: 10 })
const messagePagination = reactive({ current: 1, size: 10 })
const receiptPagination = reactive({ current: 1, size: 10 })

const { tableWrapperRef, paginationRef, tableHeight, paginationLayout, isCompactTable } =
  useContentAdmin({
    minHeight: 340,
    bottomOffset: 24,
  })

const selectedConversation = computed(() => chatStore.conversationDetail)

function buildConversationQuery() {
  return {
    current: pagination.current,
    size: pagination.size,
    keyword: searchForm.keyword.trim() || undefined,
    conversationType: searchForm.conversationType || undefined,
    status: searchForm.status,
    ownerId: searchForm.ownerId,
    memberUserId: searchForm.memberUserId,
    isAllSite: searchForm.isAllSite,
  }
}

function buildMessageQuery() {
  return {
    current: messagePagination.current,
    size: messagePagination.size,
    senderId: messageSearchForm.senderId,
    messageType: messageSearchForm.messageType || undefined,
    keyword: messageSearchForm.keyword.trim() || undefined,
  }
}

function buildReceiptQuery() {
  return {
    current: receiptPagination.current,
    size: receiptPagination.size,
    recipientUserId: receiptSearchForm.recipientUserId,
    deliveryStatus: receiptSearchForm.deliveryStatus,
    visibleStatus: receiptSearchForm.visibleStatus,
  }
}

async function fetchConversations(): Promise<void> {
  await chatStore.fetchConversations(buildConversationQuery())
}

async function refreshMembers(): Promise<void> {
  if (selectedConversationId.value) {
    await chatStore.fetchConversationMembers(selectedConversationId.value)
  }
}

async function refreshMessages(): Promise<void> {
  if (selectedConversationId.value) {
    await chatStore.fetchMessages(selectedConversationId.value, buildMessageQuery())
  }
}

async function refreshReceipts(): Promise<void> {
  if (selectedConversationId.value && selectedMessageId.value) {
    await chatStore.fetchReceipts(selectedConversationId.value, selectedMessageId.value, buildReceiptQuery())
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchConversations()
}

function handleReset(): void {
  searchForm.keyword = ''
  searchForm.conversationType = ''
  searchForm.status = undefined
  searchForm.ownerId = undefined
  searchForm.memberUserId = undefined
  searchForm.isAllSite = undefined
  pagination.current = 1
  void fetchConversations()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchConversations()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchConversations()
}

async function handleSelectConversation(conversationId: number): Promise<void> {
  selectedConversationId.value = conversationId
  selectedMessageId.value = null
  messagePagination.current = 1
  receiptPagination.current = 1
  chatStore.clearConversationContext()

  await Promise.all([
    chatStore.fetchConversationDetail(conversationId),
    chatStore.fetchConversationMembers(conversationId),
    chatStore.fetchMessages(conversationId, buildMessageQuery()),
  ])
}

async function handleConversationStatusChange(conversationId: number, status: number): Promise<void> {
  const success = await chatStore.updateConversationStatus(conversationId, { status })
  if (!success) {
    ElMessage.error('会话状态更新失败')
    return
  }

  ElMessage.success(`会话已${status === 1 ? '启用' : '冻结'}`)
  await fetchConversations()

  if (selectedConversationId.value === conversationId) {
    await chatStore.fetchConversationDetail(conversationId)
  }
}

function toggleSelectedConversationStatus(): void {
  if (!selectedConversationId.value || !selectedConversation.value) {
    return
  }

  void handleConversationStatusChange(
    selectedConversationId.value,
    selectedConversation.value.status === 1 ? 0 : 1
  )
}

async function handleMemberRoleChange(memberUserId: number, role: string): Promise<void> {
  if (!selectedConversationId.value) {
    return
  }

  const success = await chatStore.updateMemberRole(selectedConversationId.value, memberUserId, { role })
  if (!success) {
    ElMessage.error('成员角色更新失败')
    return
  }

  ElMessage.success('成员角色已更新')
  await refreshMembers()
}

async function handleMemberStatusChange(memberUserId: number, status: number): Promise<void> {
  if (!selectedConversationId.value) {
    return
  }

  const success = await chatStore.updateMemberStatus(selectedConversationId.value, memberUserId, { status })
  if (!success) {
    ElMessage.error('成员状态更新失败')
    return
  }

  ElMessage.success(`成员已${status === 1 ? '启用' : '禁用'}`)
  await refreshMembers()
}

async function handleMemberMute(memberUserId: number, strategy: '24h' | null): Promise<void> {
  if (!selectedConversationId.value) {
    return
  }

  const muteUntil =
    strategy === '24h' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null

  const success = await chatStore.updateMemberMute(selectedConversationId.value, memberUserId, {
    muteUntil,
  })
  if (!success) {
    ElMessage.error('成员禁言状态更新失败')
    return
  }

  ElMessage.success(strategy ? '成员已禁言 24 小时' : '成员禁言已解除')
  await refreshMembers()
}

function handleMessageSearch(): void {
  messagePagination.current = 1
  void refreshMessages()
}

function handleMessageReset(): void {
  messageSearchForm.senderId = undefined
  messageSearchForm.messageType = ''
  messageSearchForm.keyword = ''
  messagePagination.current = 1
  void refreshMessages()
}

function handleMessagePageChange(current: number): void {
  messagePagination.current = current
  void refreshMessages()
}

function handleMessageSizeChange(size: number): void {
  messagePagination.size = size
  messagePagination.current = 1
  void refreshMessages()
}

async function handleViewMessageDetail(messageId: number): Promise<void> {
  if (!selectedConversationId.value) {
    return
  }

  messageDetailVisible.value = true
  await chatStore.fetchMessageDetail(selectedConversationId.value, messageId)
}

async function handleViewReceipts(messageId: number): Promise<void> {
  if (!selectedConversationId.value) {
    return
  }

  selectedMessageId.value = messageId
  receiptPagination.current = 1
  await chatStore.fetchReceipts(selectedConversationId.value, messageId, buildReceiptQuery())
}

async function handleRevokeMessage(messageId: number): Promise<void> {
  if (!selectedConversationId.value) {
    return
  }

  const success = await chatStore.revokeMessage(selectedConversationId.value, messageId)
  if (!success) {
    ElMessage.error('消息撤回失败')
    return
  }

  ElMessage.success('消息已撤回')
  await refreshMessages()

  if (selectedMessageId.value === messageId) {
    await refreshReceipts()
  }
}

function handleReceiptSearch(): void {
  receiptPagination.current = 1
  void refreshReceipts()
}

function handleReceiptReset(): void {
  receiptSearchForm.recipientUserId = undefined
  receiptSearchForm.deliveryStatus = undefined
  receiptSearchForm.visibleStatus = undefined
  receiptPagination.current = 1
  void refreshReceipts()
}

function handleReceiptPageChange(current: number): void {
  receiptPagination.current = current
  void refreshReceipts()
}

function handleReceiptSizeChange(size: number): void {
  receiptPagination.size = size
  receiptPagination.current = 1
  void refreshReceipts()
}

function resolveConversationName(conversation?: ChatConversationVO | null): string {
  if (!conversation) {
    return '-'
  }

  return (
    conversation.name ||
    conversation.targetNickname ||
    conversation.targetUsername ||
    `会话 #${conversation.id}`
  )
}

function formatLastMessage(message?: ChatMessageVO | null): string {
  if (!message) {
    return '-'
  }

  if (message.revoked) {
    return '[已撤回]'
  }

  return message.content || (message.file?.originalName ? `[附件] ${message.file.originalName}` : '-')
}

function formatMessagePreview(message: ChatMessageVO): string {
  return message.content || (message.file?.originalName ? `[附件] ${message.file.originalName}` : '-')
}

onMounted(() => {
  void fetchConversations()
})
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form,
.inner-search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 0;
}

.search-card :deep(.el-form-item),
.inner-search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-control,
.inner-control,
.inline-select {
  width: 220px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 500;
}

.table-wrapper {
  min-height: 0;
}

.detail-row {
  margin: 0;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.sub-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .filter-control,
  .inner-control,
  .inline-select {
    width: 100%;
  }

  .search-card :deep(.el-form-item),
  .inner-search-form :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
