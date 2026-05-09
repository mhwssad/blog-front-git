<template>
  <el-dialog
    v-model="dialogVisible"
    title="菜单详情"
    class="menu-detail-dialog"
    width="560px"
    destroy-on-close
    align-center
    @close="handleClose"
  >
    <div v-if="loading" class="detail-loading">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <template v-else-if="detail">
      <div class="detail-header">
        <div class="detail-header__info">
          <div class="detail-header__name">
            <el-icon v-if="detail.icon" class="detail-header__icon"><component :is="detail.icon" /></el-icon>
            {{ detail.name }}
          </div>
          <div class="detail-header__sub">
            ID {{ detail.id }} · {{ formatMenuType(detail.type) }}
          </div>
        </div>
        <el-tag :type="detail.status === 1 ? 'success' : 'danger'" size="small">
          {{ detail.status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </div>

      <el-descriptions :column="2" border size="small" class="detail-section">
        <el-descriptions-item label="菜单名称">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ formatMenuType(detail.type) }}</el-descriptions-item>
        <el-descriptions-item label="父菜单ID">{{
          detail.parentId || '根菜单'
        }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detail.sort }}</el-descriptions-item>
        <el-descriptions-item label="路由名称" :span="2">{{
          detail.routeName || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="路由路径" :span="2">{{
          detail.routePath || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="组件路径" :span="2">{{
          detail.component || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="权限标识" :span="2">{{
          detail.perm || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="图标">
          <template v-if="detail.icon">
            <el-icon class="detail-icon-preview"><component :is="detail.icon" /></el-icon>
            <span class="detail-icon-name">{{ detail.icon }}</span>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="重定向">{{ detail.redirect || '-' }}</el-descriptions-item>
        <el-descriptions-item label="显示">{{
          detail.visible === 1 ? '显示' : '隐藏'
        }}</el-descriptions-item>
        <el-descriptions-item label="始终显示">{{
          detail.alwaysShow === 1 ? '是' : '否'
        }}</el-descriptions-item>
        <el-descriptions-item label="缓存">{{
          detail.keepAlive === 1 ? '是' : '否'
        }}</el-descriptions-item>
        <el-descriptions-item label="路由参数">{{
          formatParams(detail.params)
        }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions
        v-if="detail.treePath"
        :column="1"
        border
        size="small"
        class="detail-section"
      >
        <el-descriptions-item label="树路径">{{ treePathNames }}</el-descriptions-item>
      </el-descriptions>
    </template>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { MenuApi } from '@/api/sys/menu'
import { useMenuStore } from '@/stores'
import { formatMenuType } from '@/utils'
import type { SysMenuAdminVO } from '@/types/api-types'

interface Props {
  visible: boolean
  menu: SysMenuAdminVO | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const loading = ref(false)
const detail = ref<SysMenuAdminVO | null>(null)
const menuStore = useMenuStore()

const treePathNames = computed(() => {
  if (!detail.value?.treePath) return '-'
  const idToName = buildIdNameMap(menuStore.menuTree)
  return detail.value.treePath
    .split(',')
    .map(id => idToName[Number(id)] ?? id)
    .join(' / ')
})

function buildIdNameMap(tree: SysMenuAdminVO[]): Record<number, string> {
  const map: Record<number, string> = {}
  function walk(nodes: SysMenuAdminVO[]) {
    for (const node of nodes) {
      map[node.id] = node.name
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tree)
  return map
}

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

function formatParams(params?: Record<string, string> | null): string {
  if (!params || Object.keys(params).length === 0) return '-'
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
}

watch(
  () => props.visible,
  async visible => {
    if (!visible || !props.menu) return
    loading.value = true
    try {
      const resp = await MenuApi.getMenuById(props.menu.id)
      detail.value = resp.data.data
    } catch {
      detail.value = props.menu
    } finally {
      loading.value = false
    }
  }
)

function handleClose() {
  detail.value = null
  emit('update:visible', false)
}
</script>

<style scoped>
.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-header__info {
  flex: 1;
  min-width: 0;
}

.detail-header__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-header__icon {
  margin-right: 4px;
  font-size: 18px;
  color: var(--el-color-primary);
  vertical-align: middle;
}

.detail-header__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-icon-preview {
  font-size: 16px;
  margin-right: 6px;
  color: var(--el-color-primary);
  vertical-align: middle;
}

.detail-icon-name {
  font-size: 13px;
  vertical-align: middle;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

:deep(.menu-detail-dialog) {
  max-width: calc(100vw - 24px);
  overflow-x: hidden;
}

:deep(.menu-detail-dialog .el-dialog__body) {
  padding-top: 12px;
  overflow-x: hidden;
}

:deep(.menu-detail-dialog .el-descriptions__body .el-descriptions__table) {
  table-layout: fixed;
  width: 100%;
}

:deep(.menu-detail-dialog .el-descriptions__cell) {
  word-break: break-all;
}

@media (max-width: 768px) {
  :deep(.menu-detail-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
