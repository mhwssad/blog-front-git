<template>
  <section class="composer">
    <div v-if="attachmentDrafts.length" class="attachment-strip">
      <div v-for="draft in attachmentDrafts" :key="draft.id" class="attachment-item">
        <img :src="draft.previewUrl" :alt="draft.file.name" />
        <button class="attachment-item__remove" type="button" @click="removeAttachment(draft.id)">
          <el-icon><Close /></el-icon>
        </button>
        <div v-if="draft.uploading" class="attachment-item__mask">上传中</div>
      </div>
    </div>

    <div class="composer-toolbar">
      <div class="composer-toolbar__left">
        <el-select v-model="requestSceneType" size="small" class="scene-select">
          <el-option
            v-for="item in SCENE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-input-number
          v-model="requestTargetId"
          :min="0"
          :controls="false"
          size="small"
          placeholder="目标 ID"
          class="target-input"
        />

        <el-upload
          :show-file-list="false"
          :before-upload="handleAttachmentBeforeUpload"
          accept="image/*"
          multiple
        >
          <el-button text :icon="Paperclip" size="small">附件</el-button>
        </el-upload>
      </div>

      <div class="composer-toolbar__right">
        <el-button
          text
          :icon="Delete"
          size="small"
          :disabled="attachmentDrafts.length === 0"
          @click="clearAttachments"
        >
          清空
        </el-button>
      </div>
    </div>

    <el-input
      v-model="inputText"
      type="textarea"
      :rows="3"
      resize="none"
      placeholder="输入问题，Enter 发送，Shift+Enter 换行"
      :disabled="locked"
      @keydown.enter.exact.prevent="handleSend"
    />

    <div class="composer-footer">
      <span v-if="quota" class="composer-hint">
        今日剩余 {{ quota.remainingToday }} 次
        <template v-if="latestReferences.length"> · 最近引用 {{ latestReferences.length }} 条</template>
      </span>
      <span v-else />

      <el-button
        type="primary"
        :icon="Position"
        :loading="sending"
        :disabled="!canSend"
        @click="handleSend"
      >
        发送
      </el-button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Delete, Paperclip, Position } from '@element-plus/icons-vue'
import type { UploadRawFile } from 'element-plus'
import SparkMD5 from 'spark-md5'
import { UserFileApi } from '@/api/user/file'
import type { AiQuotaVO, AiRagReferenceVO, AiMessageSendRequest } from '@/types/api-types'
import { SCENE_OPTIONS } from './ai-helpers'

type AttachmentDraft = {
  id: string
  file: File
  previewUrl: string
  uploading: boolean
  fileId?: number
}

const props = defineProps<{
  sending: boolean
  locked: boolean
  quota: AiQuotaVO | null
  latestReferences: AiRagReferenceVO[]
}>()

const emit = defineEmits<{
  send: [payload: AiMessageSendRequest]
}>()

const inputText = ref('')
const requestSceneType = ref('general')
const requestTargetId = ref<number | undefined>()
const attachmentDrafts = ref<AttachmentDraft[]>([])

const canSend = computed(() => {
  return !!inputText.value.trim() && !props.sending && !props.locked
})

function removeAttachment(id: string): void {
  const index = attachmentDrafts.value.findIndex(item => item.id === id)
  if (index < 0) return
  const [draft] = attachmentDrafts.value.splice(index, 1)
  if (draft) URL.revokeObjectURL(draft.previewUrl)
}

function clearAttachments(): void {
  attachmentDrafts.value.forEach(draft => URL.revokeObjectURL(draft.previewUrl))
  attachmentDrafts.value = []
}

function handleAttachmentBeforeUpload(file: UploadRawFile): boolean {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('仅支持图片')
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 10MB')
    return false
  }
  if (attachmentDrafts.value.length >= 5) {
    ElMessage.warning('最多添加 5 张图片')
    return false
  }

  attachmentDrafts.value.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    uploading: false,
  })
  return false
}

async function computeFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const blockSize = 2 * 1024 * 1024
    const totalBlocks = Math.ceil(file.size / blockSize)
    let currentBlock = 0

    reader.onload = event => {
      if (!event.target?.result) return
      spark.append(event.target.result as ArrayBuffer)
      currentBlock += 1
      if (currentBlock < totalBlocks) {
        loadNext()
        return
      }
      resolve(spark.end())
    }

    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'))

    function loadNext(): void {
      const start = currentBlock * blockSize
      reader.readAsArrayBuffer(file.slice(start, Math.min(start + blockSize, file.size)))
    }

    loadNext()
  })
}

async function uploadAttachment(draft: AttachmentDraft): Promise<number> {
  if (draft.fileId) return draft.fileId

  const fileMd5 = await computeFileMD5(draft.file)
  const initResult = await UserFileApi.initUploadTask({
    originalName: draft.file.name,
    fileSize: draft.file.size,
    fileMd5,
    mimeType: draft.file.type || undefined,
    referenceType: 'temp',
    category: 'temp',
    isPublic: 0,
  })

  const initData = initResult.data.data
  if (initData.completed && initData.fileId) {
    draft.fileId = initData.fileId
    return initData.fileId
  }

  const formData = new FormData()
  formData.append('file', draft.file)
  const uploadResult = await UserFileApi.uploadFile(initData.uploadId, formData)
  const result = uploadResult.data.data
  const fileId = result.fileId ?? result.businessId
  if (!fileId) {
    throw new Error('上传结果缺少 fileId')
  }

  draft.fileId = fileId
  return fileId
}

async function handleSend(): Promise<void> {
  const content = inputText.value.trim()
  if (!content || props.sending || props.locked) return

  const attachments = [...attachmentDrafts.value]
  const attachmentFileIds: number[] = []

  try {
    for (const draft of attachments) {
      draft.uploading = true
      const fileId = await uploadAttachment(draft)
      attachmentFileIds.push(fileId)
    }
  } catch {
    ElMessage.error('附件上传失败')
    attachments.forEach(draft => {
      draft.uploading = false
    })
    return
  } finally {
    attachments.forEach(draft => {
      draft.uploading = false
    })
  }

  emit('send', {
    content,
    requestSceneType: requestSceneType.value,
    requestTargetId: requestTargetId.value,
    attachmentFileIds: attachmentFileIds.length ? attachmentFileIds : undefined,
  })
}

function clearInput(): void {
  inputText.value = ''
  clearAttachments()
}

function setInputText(text: string): void {
  inputText.value = text
}

function getSceneType(): string {
  return requestSceneType.value
}

function setSceneType(value: string): void {
  requestSceneType.value = value
}

defineExpose({ clearInput, setInputText, getSceneType, setSceneType })

onBeforeUnmount(() => {
  clearAttachments()
})
</script>

<style scoped>
.composer {
  padding: 10px 20px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.attachment-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.attachment-item {
  position: relative;
  width: 80px;
  height: 80px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.attachment-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-item__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-item__mask {
  position: absolute;
  inset: auto 0 0;
  padding: 3px 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  text-align: center;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.composer-toolbar__left,
.composer-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scene-select {
  width: 110px;
}

.target-input {
  width: 100px;
}

.composer :deep(.el-textarea__inner) {
  box-shadow: none;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.composer-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 640px) {
  .composer {
    padding: 8px 12px 12px;
  }

  .target-input {
    display: none;
  }
}
</style>
