<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑收藏夹' : '新建收藏夹'"
    width="420px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="80px" @submit.prevent="handleSubmit">
      <el-form-item label="名称">
        <el-input v-model="form.folderName" placeholder="收藏夹名称" maxlength="30" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="收藏夹描述（可选）"
          maxlength="200"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!form.folderName.trim()"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
/**
 * 新建/编辑收藏夹弹窗组件
 * @description 输入收藏夹名称和描述，创建或更新收藏夹
 * @module front/collection/components/FolderFormDialog
 */
import { ref, computed, watch } from 'vue'
import type { CollectionFolderVO } from '@/types/api-types'

const props = defineProps<{
  visible: boolean
  loading?: boolean
  editFolder?: CollectionFolderVO | null
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  submit: [data: { folderName: string; folderType: string; description?: string }]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const isEdit = computed(() => !!props.editFolder)

// 表单数据
const form = ref({ folderName: '', description: '' })

watch(
  () => props.visible,
  val => {
    if (val) {
      form.value = {
        folderName: props.editFolder?.folderName ?? '',
        description: props.editFolder?.description ?? '',
      }
    }
  }
)

function handleSubmit(): void {
  if (!form.value.folderName.trim()) return
  emit('submit', {
    folderName: form.value.folderName.trim(),
    folderType: 'article',
    description: form.value.description.trim() || undefined,
  })
}
</script>
