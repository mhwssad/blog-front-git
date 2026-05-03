<template>
  <el-upload
    class="image-upload"
    :class="[`image-upload--${mode}`, { 'image-upload--disabled': disabled }]"
    action="#"
    :http-request="handleRequest"
    :before-upload="handleBeforeUpload"
    :show-file-list="false"
    :accept="accept"
    :disabled="disabled || uploading"
  >
    <template v-if="displayUrl">
      <img :src="displayUrl" class="image-upload__preview" />
      <div v-if="uploading" class="image-upload__overlay">
        <el-progress
          type="circle"
          :percentage="progress"
          :width="mode === 'avatar' ? 48 : 64"
          :show-text="false"
        />
        <span class="image-upload__pct">{{ progress }}%</span>
      </div>
      <div v-else-if="!disabled" class="image-upload__actions">
        <el-icon :size="20"><RefreshRight /></el-icon>
        <el-icon :size="20" @click.stop="handleRemove"><Delete /></el-icon>
      </div>
    </template>
    <div v-else class="image-upload__placeholder">
      <el-icon :size="mode === 'avatar' ? 24 : 32"><Plus /></el-icon>
      <span v-if="mode !== 'avatar'" class="image-upload__tip">点击上传</span>
    </div>
  </el-upload>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRawFile, UploadRequestOptions } from 'element-plus'
import { Delete, Plus, RefreshRight } from '@element-plus/icons-vue'
import { useFileUpload, type UploadResult } from '@/composables/useFileUpload'
import { FileUtils } from '@/utils/fileUtils'

type ImageUploadMode = 'avatar' | 'cover' | 'card'

const MODE_TO_REF_TYPE: Record<ImageUploadMode, string> = {
  avatar: 'avatar',
  cover: 'article_attachment',
  card: 'comment_image',
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    mode?: ImageUploadMode
    accept?: string
    maxSize?: number
    disabled?: boolean
    category?: string
    referenceType?: string
  }>(),
  {
    modelValue: null,
    mode: 'card',
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
    disabled: false,
    category: 'attachment',
    referenceType: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [url: string | null]
  success: [result: UploadResult]
  error: [err: Error]
}>()

const { uploading, progress, upload } = useFileUpload()

const previewUrl = ref<string | null>(props.modelValue)
const localPreviewUrl = ref<string | null>(null)

watch(
  () => props.modelValue,
  (url) => {
    previewUrl.value = url
  },
)

const displayUrl = computed(() => {
  if (uploading.value && localPreviewUrl.value) return localPreviewUrl.value
  return previewUrl.value
})

function revokeLocalPreview(): void {
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = null
  }
}

onBeforeUnmount(revokeLocalPreview)

function handleBeforeUpload(file: UploadRawFile): boolean {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return false
  }
  if (!FileUtils.validateFileSize(file, props.maxSize)) {
    ElMessage.warning(`图片大小不能超过 ${FileUtils.formatFileSize(props.maxSize)}`)
    return false
  }
  revokeLocalPreview()
  localPreviewUrl.value = URL.createObjectURL(file)
  return true
}

async function handleRequest(options: UploadRequestOptions): Promise<void> {
  try {
    const result = await upload(options.file as File, {
      category: props.category,
      referenceType: props.referenceType ?? MODE_TO_REF_TYPE[props.mode],
    })
    const url = result.fileUrl ?? null
    previewUrl.value = url
    emit('update:modelValue', url)
    emit('success', result)
    options.onSuccess(result)
  } catch (err) {
    const error = err instanceof Error ? err : new Error('上传失败')
    emit('error', error)
    options.onError(error)
  } finally {
    revokeLocalPreview()
  }
}

function handleRemove(): void {
  previewUrl.value = null
  emit('update:modelValue', null)
}
</script>

<style scoped>
.image-upload {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  transition:
    border-color 0.2s,
    background 0.2s;
}

.image-upload:hover {
  border-color: var(--el-color-primary);
}

.image-upload--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.image-upload--avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.image-upload--cover {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.image-upload--card {
  width: 104px;
  height: 104px;
}

.image-upload__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload__actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.image-upload:hover .image-upload__actions {
  opacity: 1;
}

.image-upload__actions .el-icon {
  color: #fff;
  cursor: pointer;
}

.image-upload__actions .el-icon:hover {
  color: var(--el-color-primary);
}

.image-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-placeholder);
}

.image-upload__tip {
  font-size: 12px;
}

.image-upload__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
}

.image-upload__pct {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
