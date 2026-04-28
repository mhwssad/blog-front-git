<template>
  <el-dialog
    :model-value="modelValue"
    title="分享到频道"
    width="460px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="currentChannel" class="current-bind">
      <el-alert type="info" :closable="false">
        <template #title>
          该文章已挂接到频道 <strong>#{{ currentChannel.name }}</strong>
        </template>
      </el-alert>
      <div class="unbind-action">
        <el-button size="small" type="danger" plain @click="handleUnbind">取消挂接</el-button>
      </div>
    </div>

    <template v-else>
      <div class="share-desc">选择目标频道分享此文章，一个文章只能挂接一个频道。</div>

      <el-form label-position="top">
        <el-form-item label="选择频道">
          <el-select
            v-model="selectedChannelId"
            placeholder="请选择频道"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="ch in channels"
              :key="ch.id"
              :label="'# ' + ch.name"
              :value="ch.id"
            >
              <div class="channel-option">
                <span># {{ ch.name }}</span>
                <span class="channel-members">{{ ch.memberCount }} 人</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button
        v-if="!currentChannel"
        type="primary"
        :disabled="!selectedChannelId"
        @click="handleShare"
      >
        确认分享
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Channel {
  id: number
  name: string
  memberCount: number
}

defineProps<{
  modelValue: boolean
  currentChannel?: { id: number; name: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  share: [channelId: number]
  unbind: []
}>()

const selectedChannelId = ref<number | undefined>(undefined)

const channels = ref<Channel[]>([
  { id: 1, name: '前端交流', memberCount: 200 },
  { id: 2, name: '后端交流', memberCount: 150 },
  { id: 3, name: '技术杂谈', memberCount: 120 },
  { id: 4, name: '资源共享', memberCount: 80 },
])

function handleShare(): void {
  if (!selectedChannelId.value) return
  emit('share', selectedChannelId.value)
  ElMessage.success('文章已分享到频道')
  emit('update:modelValue', false)
  selectedChannelId.value = undefined
}

function handleUnbind(): void {
  emit('unbind')
  ElMessage.success('已取消挂接')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.share-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}

.channel-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.channel-members {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.current-bind {
  margin-bottom: 12px;
}

.unbind-action {
  margin-top: 12px;
  text-align: right;
}
</style>
