<template>
  <div class="folder-list">
    <div class="folder-header">
      <span class="folder-title">收藏夹</span>
      <el-button size="small" type="primary" link @click="emit('create')">新建</el-button>
    </div>

    <div v-if="loading" class="folder-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="folders.length" class="folder-items">
      <div
        v-for="folder in folders"
        :key="folder.id"
        class="folder-item"
        :class="{ active: selectedId === folder.id }"
        @click="emit('select', folder.id)"
      >
        <div class="folder-item-main">
          <el-icon><Folder /></el-icon>
          <span class="folder-name">{{ folder.folderName }}</span>
        </div>
        <div class="folder-meta">
          <span class="folder-count">{{ folder.collectionCount }}</span>
          <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, folder)">
            <el-icon class="folder-more" @click.stop><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item v-if="!folder.isDefault" command="delete" divided>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无收藏夹" :image-size="48" />
  </div>
</template>

<script lang="ts" setup>
/**
 * 收藏夹列表组件
 * @description 展示用户的收藏夹，支持选择、新建、编辑、删除操作
 * @module front/collection/components/FolderList
 */
import { Folder, MoreFilled } from '@element-plus/icons-vue'
import type { CollectionFolderVO } from '@/types/api-types'

defineProps<{
  folders: CollectionFolderVO[]
  selectedId?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  create: []
  edit: [folder: CollectionFolderVO]
  delete: [id: number]
}>()

// 处理下拉菜单命令（edit/delete）
function handleCommand(cmd: string, folder: CollectionFolderVO): void {
  if (cmd === 'edit') emit('edit', folder)
  else if (cmd === 'delete') emit('delete', folder.id)
}
</script>

<style scoped>
.folder-list {
  min-height: 200px;
}

.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.folder-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.folder-loading {
  padding: 8px 0;
}

.folder-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.folder-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.folder-item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.folder-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.folder-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.folder-more {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
}

.folder-more:hover {
  color: var(--el-text-color-regular);
}
</style>
