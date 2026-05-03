<template>
  <el-dialog v-model="dialogVisible" title="调整等级" width="440px" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="用户ID" required>
        <el-input-number
          v-model="form.userId"
          :min="1"
          placeholder="请输入用户ID"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="调整方式" required>
        <el-radio-group v-model="form.adjustType">
          <el-radio value="level">调整等级</el-radio>
          <el-radio value="experience">调整经验</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="form.adjustType === 'level' ? '新等级' : '新经验值'" required>
        <el-input-number
          v-model="form.newValue"
          :min="0"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="原因">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入调整原因"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useExperienceStore } from '@/stores'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; success: [] }>()

const experienceStore = useExperienceStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const loading = ref(false)

const form = reactive({
  userId: undefined as number | undefined,
  adjustType: 'level' as 'level' | 'experience',
  newValue: 0,
  reason: '',
})

function resetForm() {
  form.userId = undefined
  form.adjustType = 'level'
  form.newValue = 0
  form.reason = ''
}

async function handleSubmit() {
  if (!form.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (form.newValue < 0) {
    ElMessage.warning('请输入有效的数值')
    return
  }

  loading.value = true
  try {
    const success = await experienceStore.adjustUserLevel(form.userId, {
      adjustType: form.adjustType,
      newValue: form.newValue,
      reason: form.reason || undefined,
    })
    if (success) {
      ElMessage.success('调整成功')
      dialogVisible.value = false
      resetForm()
      emit('success')
    } else {
      ElMessage.error('调整失败')
    }
  } catch {
    ElMessage.error('调整失败')
  } finally {
    loading.value = false
  }
}
</script>
