<template>
  <div class="collections-page">
    <h1 class="page-title">我的收藏</h1>

    <div class="collections-layout">
      <aside class="collections-sidebar">
        <FolderList
          :folders="store.collectionFolders"
          :selected-id="selectedFolderId"
          :loading="store.collectionFolderLoading"
          @select="handleFolderSelect"
          @create="openFolderForm('create')"
          @edit="openFolderForm('edit', $event)"
          @delete="handleDeleteFolder"
        />
      </aside>

      <main class="collections-main">
        <CollectionRecordList
          :records="filteredRecords"
          :folder-name="selectedFolderName"
          :total="filteredRecords.length"
          :loading="store.collectionLoading"
          :page-size="store.collectionSize"
          @delete="handleDeleteCollection"
        />
      </main>
    </div>

    <FolderFormDialog
      v-model:visible="folderFormVisible"
      :edit-folder="editingFolder"
      :loading="store.actionLoading"
      @submit="handleFolderSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserContentStore } from '@/stores'
import type { CollectionFolderVO } from '@/types/api-types'
import FolderList from './components/FolderList.vue'
import CollectionRecordList from './components/CollectionRecordList.vue'
import FolderFormDialog from './components/FolderFormDialog.vue'

const store = useUserContentStore()

const selectedFolderId = ref<number | undefined>(undefined)
const folderFormVisible = ref(false)
const editingFolder = ref<CollectionFolderVO | null>(null)

const selectedFolderName = computed(() => {
  if (!selectedFolderId.value) return undefined
  return store.collectionFolders.find((f) => f.id === selectedFolderId.value)?.folderName
})

const filteredRecords = computed(() => {
  if (!selectedFolderId.value) return store.collections
  return store.collections.filter((c) => c.folderId === selectedFolderId.value)
})

async function loadData(): Promise<void> {
  await Promise.all([store.fetchCollectionFolders(), store.fetchCollections()])
}

function handleFolderSelect(id: number): void {
  selectedFolderId.value = selectedFolderId.value === id ? undefined : id
}

function openFolderForm(mode: 'create' | 'edit', folder?: CollectionFolderVO): void {
  editingFolder.value = mode === 'edit' ? folder ?? null : null
  folderFormVisible.value = true
}

async function handleFolderSubmit(data: {
  folderName: string
  folderType: string
  description?: string
}): Promise<void> {
  if (editingFolder.value) {
    const success = await store.updateCollectionFolder(editingFolder.value.id, data)
    if (success) {
      ElMessage.success('更新成功')
      folderFormVisible.value = false
      await store.fetchCollectionFolders()
    }
  } else {
    const success = await store.createCollectionFolder(data)
    if (success) {
      ElMessage.success('创建成功')
      folderFormVisible.value = false
      await store.fetchCollectionFolders()
    }
  }
}

async function handleDeleteFolder(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定删除该收藏夹？收藏夹内的记录不会被删除。', '提示', {
      type: 'warning',
    })
    const success = await store.deleteCollectionFolder(id)
    if (success) {
      ElMessage.success('删除成功')
      if (selectedFolderId.value === id) selectedFolderId.value = undefined
      await store.fetchCollectionFolders()
    }
  } catch {
    // cancelled
  }
}

async function handleDeleteCollection(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定取消该收藏？', '提示', { type: 'warning' })
    const success = await store.deleteCollection(id)
    if (success) {
      ElMessage.success('已取消收藏')
      await store.fetchCollections()
    }
  } catch {
    // cancelled
  }
}

onMounted(loadData)
</script>

<style scoped>
.collections-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.collections-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.collections-sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.collections-main {
  flex: 1;
  min-width: 0;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}
</style>
