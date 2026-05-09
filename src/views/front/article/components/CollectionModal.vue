<template>
  <el-dialog
    v-model="dialogVisible"
    title="收藏到收藏夹"
    width="420px"
    :close-on-click-modal="false"
  >
    <div v-if="loading" class="folder-loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="folders.length" class="folder-list">
      <div
        v-for="folder in folders"
        :key="folder.id"
        class="folder-item"
        @click="handleCollect(folder.id)"
      >
        <div class="folder-info">
          <el-icon><Folder /></el-icon>
          <span class="folder-name">{{ folder.folderName }}</span>
        </div>
        <span class="folder-count">{{ folder.collectionCount }} 篇</span>
      </div>
    </div>
    <el-empty v-else description="暂无收藏夹">
      <el-button size="small" type="primary" @click="showCreateForm = true">新建收藏夹</el-button>
    </el-empty>

    <div v-if="showCreateForm" class="create-form">
      <el-divider />
      <el-input v-model="newFolderName" size="small" placeholder="收藏夹名称" maxlength="30">
        <template #append>
          <el-button :disabled="!newFolderName.trim()" @click="handleCreateFolder">创建</el-button>
        </template>
      </el-input>
    </div>

    <template #footer>
      <el-button size="small" @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? '取消' : '新建收藏夹' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
/**
 * 收藏到收藏夹弹窗组件
 * @description 允许用户将文章收藏到已有的收藏夹，或新建收藏夹
 * @module front/article/components/CollectionModal
 * @see ../../api/content.ts
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Folder } from '@element-plus/icons-vue'
import { useUserContentStore } from '@/stores'
import type { CollectionFolderVO } from '@/types/api-types'

const props = defineProps<{
  visible: boolean
  folders: CollectionFolderVO[]
  targetId: number
  targetType: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  collect: [folderId: number]
}>()

const userContentStore = useUserContentStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

// 新建收藏夹表单是否显示
const showCreateForm = ref(false)
// 新建收藏夹名称
const newFolderName = ref('')

function handleCollect(folderId: number): void {
  emit('collect', folderId)
}

/** 创建收藏夹 */
async function handleCreateFolder(): Promise<void> {
  if (!newFolderName.value.trim()) return
  const success = await userContentStore.createCollectionFolder({
    folderName: newFolderName.value.trim(),
    folderType: 'article',
  })
  if (success) {
    ElMessage.success('创建成功')
    newFolderName.value = ''
    showCreateForm.value = false
    await userContentStore.fetchCollectionFolders()
  }
}
</script>

<style scoped>
.folder-loading {
  padding: 8px 0;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.folder-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.folder-item:hover {
  background: var(--el-fill-color-light);
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.folder-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.folder-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.create-form {
  margin-top: 4px;
}
</style>
