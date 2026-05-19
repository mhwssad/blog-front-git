<template>
  <el-dialog
    :model-value="modelValue"
    title="举报"
    width="480px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form label-position="top">
      <el-form-item label="举报类型">
        <el-select v-model="form.type" placeholder="请选择举报类型" style="width: 100%">
          <el-option
            v-for="item in reportTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="补充说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请描述举报原因"
        />
      </el-form-item>

      <el-form-item label="截图证据（可选）">
        <el-upload
          v-model:file-list="form.screenshots"
          action="#"
          :auto-upload="false"
          accept="image/*"
          list-type="picture-card"
          :limit="3"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :disabled="!form.type" @click="handleSubmit">
        提交举报
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ReportUserApi } from '@/api/user/report'
import type { UploadUserFile } from 'element-plus'

interface Props {
  modelValue: boolean
  targetType: 'article' | 'comment' | 'message'
  targetId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const reportTypes = [
  { label: '垃圾广告', value: 'spam' },
  { label: '恶意刷屏', value: 'flood' },
  { label: '侮辱谩骂', value: 'abuse' },
  { label: '违法违规', value: 'illegal' },
  { label: '传播虚假信息', value: 'misinformation' },
  { label: '其他', value: 'other' },
]

const form = reactive({
  type: '',
  description: '',
  screenshots: [] as UploadUserFile[],
})

function resetForm() {
  form.type = ''
  form.description = ''
  form.screenshots = []
}

function handleCancel() {
  resetForm()
  emit('update:modelValue', false)
}

async function handleSubmit() {
  try {
    await ReportUserApi.createReport({
      targetType: props.targetType === 'message' ? 'chat_message' : props.targetType,
      targetId: props.targetId,
      reasonCode: form.type,
      reasonDetail: form.description || undefined,
    })
    ElMessage.success('举报已提交，我们会尽快处理')
    resetForm()
    emit('update:modelValue', false)
  } catch {
    ElMessage.error('举报提交失败，请稍后重试')
  }
}
</script>
