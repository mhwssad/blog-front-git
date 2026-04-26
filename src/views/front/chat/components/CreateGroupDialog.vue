<template>
  <el-dialog v-model="dialogVisible" title="创建群聊" width="420px" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="群名称">
        <el-input v-model="form.name" placeholder="输入群聊名称" maxlength="30" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :disabled="!form.name.trim()" @click="handleSubmit">
        创建
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  submit: [data: { name: string }]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const form = ref({ name: '' })

watch(
  () => props.visible,
  (val) => {
    if (val) form.value.name = ''
  },
)

function handleSubmit(): void {
  if (!form.value.name.trim()) return
  emit('submit', { name: form.value.name.trim() })
  dialogVisible.value = false
}
</script>
