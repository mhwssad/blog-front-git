<template>
  <el-dialog v-model="dialogVisible" title="编辑备注" width="380px" :close-on-click-modal="false">
    <el-input v-model="remark" placeholder="输入备注名" maxlength="30" />

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  currentRemark?: string | null
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  save: [remark: string]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const remark = ref('')

watch(
  () => props.visible,
  (val) => {
    if (val) remark.value = props.currentRemark ?? ''
  },
)

function handleSave(): void {
  emit('save', remark.value.trim())
  dialogVisible.value = false
}
</script>
