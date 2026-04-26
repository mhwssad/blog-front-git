<template>
  <el-dialog v-model="dialogVisible" title="上传文件" width="480px" :close-on-click-modal="false">
    <el-upload
      ref="uploadRef"
      drag
      :auto-upload="false"
      :limit="1"
      :on-change="handleFileChange"
      :on-exceed="() => {}"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
    </el-upload>

    <el-progress v-if="uploading" :percentage="uploadProgress" :status="uploadStatus" />

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="uploading"
        :disabled="!selectedFile"
        @click="handleUpload"
      >
        上传
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile as ElUploadFile } from 'element-plus'
import { useUserFileStore } from '@/stores'

const store = useUserFileStore()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  success: []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<'' | 'success' | 'exception' | 'warning'>('')

function handleFileChange(file: ElUploadFile): void {
  selectedFile.value = file.raw ?? null
  uploadProgress.value = 0
  uploadStatus.value = ''
}

async function handleUpload(): Promise<void> {
  if (!selectedFile.value) return

  uploading.value = true
  uploadProgress.value = 10
  uploadStatus.value = ''

  try {
    const initResult = await store.initUpload({
      originalName: selectedFile.value.name,
      fileSize: selectedFile.value.size,
      mimeType: selectedFile.value.type || undefined,
    })

    if (!initResult) {
      uploadStatus.value = 'exception'
      ElMessage.error('初始化上传失败')
      return
    }

    uploadProgress.value = 30

    if (initResult.completed) {
      uploadProgress.value = 100
      uploadStatus.value = 'success'
      ElMessage.success('文件已秒传')
      emit('success')
      dialogVisible.value = false
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const result = await store.uploadFile(initResult.uploadId, formData)

    uploadProgress.value = 80

    if (result) {
      const completed = await store.completeUpload(initResult.uploadId)
      uploadProgress.value = 100
      uploadStatus.value = 'success'
      ElMessage.success('上传成功')
      emit('success')
      dialogVisible.value = false
    } else {
      uploadStatus.value = 'exception'
      ElMessage.error('上传失败')
    }
  } catch {
    uploadStatus.value = 'exception'
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}
</script>
