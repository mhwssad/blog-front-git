<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑通知' : '新增通知'"
    width="680px"
    class="notice-form-dialog"
    :close-on-click-modal="false"
    align-center
    center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="通知标题" prop="title">
        <el-input v-model="formData.title" maxlength="120" placeholder="请输入通知标题" />
      </el-form-item>
      <el-form-item label="通知类型" prop="type">
        <el-radio-group v-model="formData.type" class="notice-type-group">
          <el-radio v-for="option in NOTICE_TYPE_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="通知内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="8"
          placeholder="请输入通知内容"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-permission="submitPermission" type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { noticeApi } from '@/api/sys/notice'
import type { SysNoticeSaveRequest } from '@/api/types'
import { NOTICE_TYPE_OPTIONS } from '@/utils'

interface Props {
  visible: boolean
  noticeId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.noticeId)
const submitPermission = computed(() => (isEdit.value ? 'sys:notice:update' : 'sys:notice:create'))

const formData = reactive<SysNoticeSaveRequest>({
  title: '',
  content: '',
  type: 1,
})

const formRules: FormRules<SysNoticeSaveRequest> = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    title: '',
    content: '',
    type: 1,
  })
  formRef.value?.clearValidate()
}

async function loadNoticeDetail(noticeId: number): Promise<void> {
  detailLoading.value = true
  try {
    const response = await noticeApi.getNoticeById(noticeId)
    const detail = response.data.data
    Object.assign(formData, {
      title: detail.title,
      content: detail.content,
      type: detail.type ?? 1,
    })
  } catch {
    ElMessage.error('获取通知详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: SysNoticeSaveRequest = {
      title: formData.title.trim(),
      content: formData.content,
      type: formData.type ?? 1,
    }

    if (isEdit.value && props.noticeId) {
      await noticeApi.updateNotice(props.noticeId, payload)
      ElMessage.success('通知更新成功')
    } else {
      await noticeApi.createNotice(payload)
      ElMessage.success('通知创建成功')
    }

    emit('success')
    dialogVisible.value = false
  } catch {
    // 校验失败或请求失败
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => [props.visible, props.noticeId] as const,
  async ([visible, noticeId]) => {
    if (!visible) {
      return
    }

    resetForm()

    if (noticeId) {
      await loadNoticeDetail(noticeId)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.notice-type-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.notice-type-group .el-radio) {
  margin-right: 0;
}
</style>
