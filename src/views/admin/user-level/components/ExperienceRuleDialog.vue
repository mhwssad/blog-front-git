<template>
  <el-dialog
    v-model="dialogVisible"
    title="配置经验来源规则"
    width="560px"
    :close-on-click-modal="false"
  >
    <div v-loading="experienceStore.configLoading">
      <el-form label-width="140px">
        <el-divider content-position="left">经验来源配置</el-divider>
        <el-form-item v-for="item in ruleList" :key="item.configKey" :label="item.configKey">
          <el-input v-model="item.configValue" placeholder="请输入配置值" style="width: 240px" />
        </el-form-item>
        <el-empty v-if="ruleList.length === 0" description="暂无配置项" />
      </el-form>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useExperienceStore } from '@/stores'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const experienceStore = useExperienceStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const saving = ref(false)
const ruleList = ref<{ configKey: string; configValue: string }[]>([])

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return
    try {
      await experienceStore.fetchConfig()
      ruleList.value = experienceStore.configs.map((c) => ({ ...c }))
    } catch {
      ElMessage.error('获取配置失败')
    }
  },
)

async function handleSave() {
  saving.value = true
  try {
    for (const item of ruleList.value) {
      const success = await experienceStore.updateConfig({
        configKey: item.configKey,
        configValue: item.configValue,
      })
      if (!success) {
        ElMessage.error(`保存配置 ${item.configKey} 失败`)
        return
      }
    }
    ElMessage.success('规则保存成功')
    dialogVisible.value = false
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>
