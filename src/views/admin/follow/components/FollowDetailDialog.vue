<template>
  <DetailDialog v-model="visible" title="关注关系详情" :detail="detail" width="620px">
    <div class="detail-users">
      <div class="detail-user-card">
        <span class="detail-user-card__label">关注者</span>
        <span class="detail-user-card__name">{{ detail!.followerNickname || detail!.followerUsername }}</span>
        <span class="detail-user-card__meta">@{{ detail!.followerUsername }} · ID {{ detail!.followerId }}</span>
        <el-tag size="small" :type="getUserStatusTagType(detail!.followerStatus, detail!.followerDeletedFlag)">
          {{ formatUserState(detail!.followerStatus, detail!.followerDeletedFlag) }}
        </el-tag>
      </div>
      <el-icon class="detail-arrow"><ArrowRight /></el-icon>
      <div class="detail-user-card">
        <span class="detail-user-card__label">被关注者</span>
        <span class="detail-user-card__name">{{ detail!.followingNickname || detail!.followingUsername }}</span>
        <span class="detail-user-card__meta">@{{ detail!.followingUsername }} · ID {{ detail!.followingId }}</span>
        <el-tag size="small" :type="getUserStatusTagType(detail!.followingStatus, detail!.followingDeletedFlag)">
          {{ formatUserState(detail!.followingStatus, detail!.followingDeletedFlag) }}
        </el-tag>
      </div>
    </div>

    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="关系 ID">{{ detail!.relationId }}</el-descriptions-item>
      <el-descriptions-item label="关系状态">
        <el-tag size="small" :type="getFollowStatusTagType(detail!.followStatus)">
          {{ formatFollowStatus(detail!.followStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="特别关注">
        <el-tag size="small" :type="detail!.isSpecialFollow === 1 ? 'warning' : 'info'">
          {{ detail!.isSpecialFollow === 1 ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="来源">{{ detail!.source || '—' }}</el-descriptions-item>
      <el-descriptions-item label="关注时间">{{ formatDate(detail!.followTime) }}</el-descriptions-item>
      <el-descriptions-item label="取关时间">{{ formatDate(detail!.unfollowTime) }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(detail!.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatDate(detail!.updatedAt) }}</el-descriptions-item>
      <el-descriptions-item v-if="detail!.remark" label="备注" :span="2">
        {{ detail!.remark }}
      </el-descriptions-item>
    </el-descriptions>
  </DetailDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import type { FollowAdminRelationVO } from '@/types/api-types'
import { formatFollowStatus } from '@/utils'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  detail: FollowAdminRelationVO | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return DateUtils.formatDate(value)
}

function formatUserState(status?: number, deletedFlag?: number): string {
  if (deletedFlag === 1) return '已删除'
  return status === 0 ? '已禁用' : '正常'
}

function getUserStatusTagType(status?: number, deletedFlag?: number): 'danger' | 'warning' | 'success' {
  if (deletedFlag === 1) return 'danger'
  return status === 0 ? 'warning' : 'success'
}

function getFollowStatusTagType(value: number): 'info' | 'success' | 'danger' {
  if (value === 1) return 'success'
  if (value === 2) return 'danger'
  return 'info'
}
</script>

<style scoped>
.detail-users {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.detail-user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 140px;
}

.detail-user-card__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-user-card__name {
  font-weight: 600;
  font-size: 15px;
}

.detail-user-card__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-arrow {
  font-size: 20px;
  color: var(--el-text-color-secondary);
  margin-top: 16px;
}
</style>
