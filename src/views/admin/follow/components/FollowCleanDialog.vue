<template>
  <el-dialog v-model="visible" title="异常关注清理" width="420px" destroy-on-close align-center>
    <el-alert
      title="清理会直接移除异常关系，用于后台治理操作。"
      type="warning"
      show-icon
      :closable="false"
    />
    <el-checkbox v-model="cleanInactive" class="clean-option">清理已取关或异常关系</el-checkbox>
    <el-checkbox v-model="cleanDeletedUsers" class="clean-option">清理已删除用户关系</el-checkbox>
    <el-checkbox v-model="cleanDisabledUsers" class="clean-option">清理已禁用用户关系</el-checkbox>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        v-permission="'content:follow:clean'"
        type="primary"
        :loading="loading"
        @click="handleClean"
      >
        确认清理
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useFollowStore } from '@/stores'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const followStore = useFollowStore()
const loading = computed(() => followStore.cleaning)

const cleanInactive = ref(true)
const cleanDeletedUsers = ref(true)
const cleanDisabledUsers = ref(false)

async function handleClean(): Promise<void> {
  const cleanedCount = await followStore.cleanFollows({
    cleanInactive: cleanInactive.value,
    cleanDeletedUsers: cleanDeletedUsers.value,
    cleanDisabledUsers: cleanDisabledUsers.value,
  })
  visible.value = false

  if (cleanedCount > 0) {
    ElMessage.success(`已清理 ${cleanedCount} 条异常关系`)
  } else {
    ElMessage.info('没有匹配到可清理的异常关系')
  }
}
</script>

<style scoped>
.clean-option {
  display: flex;
  margin-top: 16px;
}
</style>
