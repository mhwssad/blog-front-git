<template>
  <el-dialog
    v-model="dialogVisible"
    title="角色详情"
    class="role-detail-dialog"
    width="520px"
    destroy-on-close
    align-center
    @close="handleClose"
  >
    <div v-if="loading" class="detail-loading">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <template v-else-if="role">
      <!-- 头部：角色名 + 状态 -->
      <div class="detail-header">
        <div class="detail-header__info">
          <div class="detail-header__name">{{ role.name }}</div>
          <div class="detail-header__sub">{{ role.code }} · ID {{ role.id }}</div>
        </div>
        <el-tag :type="role.status === 1 ? 'success' : 'danger'" size="small">
          {{ role.status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </div>

      <!-- 基本信息 -->
      <el-descriptions :column="2" border size="small" class="detail-section">
        <el-descriptions-item label="角色编码" :span="2">{{ role.code }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ role.sort }}</el-descriptions-item>
        <el-descriptions-item label="数据权限">{{ dataScopeText }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ role.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 备注 -->
      <el-descriptions
        v-if="role.remark"
        :column="1"
        border
        size="small"
        class="detail-section"
      >
        <el-descriptions-item label="备注">{{ role.remark }}</el-descriptions-item>
      </el-descriptions>

      <!-- 已分配菜单 -->
      <el-descriptions
        v-if="menuNames.length"
        :column="1"
        border
        size="small"
        class="detail-section"
      >
        <el-descriptions-item label="已分配菜单">
          <div class="menu-tags">
            <el-tag
              v-for="name in menuNames"
              :key="name"
              size="small"
              effect="plain"
              class="menu-tag"
            >
              {{ name }}
            </el-tag>
          </div>
        </el-descriptions-item>
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
import { RoleApi } from '@/api/sys/role'
import { MenuApi } from '@/api/sys/menu'
import type { SysRoleAdminVO, SysMenuAdminVO } from '@/types/api-types'

interface Props {
  visible: boolean
  role: SysRoleAdminVO | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const loading = ref(false)
const detailRole = ref<SysRoleAdminVO | null>(null)
const menuNames = ref<string[]>([])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const role = computed(() => detailRole.value || props.role)

const dataScopeText = computed(() => {
  const map: Record<number, string> = { 1: '全部数据', 2: '自定义', 3: '本部门', 4: '本部门及以下', 5: '仅本人' }
  return map[role.value?.dataScope ?? 0] ?? '-'
})

function flattenMenus(tree: SysMenuAdminVO[]): Map<number, string> {
  const map = new Map<number, string>()
  const walk = (nodes: SysMenuAdminVO[]) => {
    for (const node of nodes) {
      map.set(node.id, node.name)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tree)
  return map
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible || !props.role) return
    loading.value = true
    try {
      const [roleResp, menusResp, menuTreeResp] = await Promise.all([
        RoleApi.getRoleById(props.role.id),
        RoleApi.getRoleMenus(props.role.id),
        MenuApi.getMenuTree(),
      ])
      detailRole.value = roleResp.data.data
      const ids: number[] = menusResp.data.data ?? []
      const nameMap = flattenMenus(menuTreeResp.data.data ?? [])
      menuNames.value = ids.map((id: number) => nameMap.get(id) ?? `未知菜单 #${id}`)
    } catch {
      detailRole.value = null
      menuNames.value = []
    } finally {
      loading.value = false
    }
  },
)

function handleClose() {
  detailRole.value = null
  menuNames.value = []
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

.detail-header__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.menu-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.menu-tag {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.role-detail-dialog .el-dialog__body) {
  padding-top: 12px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  :deep(.role-detail-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
