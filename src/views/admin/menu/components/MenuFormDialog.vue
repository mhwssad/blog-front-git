<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="760px"
    class="menu-form-dialog"
    :close-on-click-modal="false"
    align-center
    center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="menu-form"
    >
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="上级菜单">
            <el-tree-select
              v-model="formData.parentId"
              :data="parentMenuOptions"
              :props="parentMenuProps"
              node-key="id"
              check-strictly
              default-expand-all
              :render-after-expand="false"
              placeholder="请选择上级菜单"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="formData.name" maxlength="64" placeholder="请输入菜单名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="8">
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="formData.type" class="menu-type-group">
              <el-radio
                v-for="option in MENU_TYPE_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" :max="9999" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="是否显示" prop="visible">
            <el-radio-group v-model="formData.visible" class="menu-type-group">
              <el-radio :value="1">显示</el-radio>
              <el-radio :value="0">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="formData.type !== 'B'" :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="路由名称" prop="routeName">
            <el-input v-model="formData.routeName" maxlength="64" placeholder="如 AdminUsers" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="路由路径" prop="routePath">
            <el-input v-model="formData.routePath" maxlength="128" placeholder="如 /admin/users" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="formData.type !== 'B'" :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="组件路径" prop="component">
            <el-input
              v-model="formData.component"
              maxlength="128"
              :placeholder="formData.type === 'C' ? '如 layouts/RouteView' : '如 admin/user/Users'"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="重定向" prop="redirect">
            <el-input
              v-model="formData.redirect"
              maxlength="128"
              placeholder="可选，如 /admin/users"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="权限标识" prop="perm">
            <el-input
              v-model="formData.perm"
              maxlength="128"
              :placeholder="
                formData.type === 'B' ? '如 sys:user:create' : '可选，如 sys:user:query'
              "
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type !== 'B'" :xs="24" :md="12">
          <el-form-item label="图标" prop="icon">
            <el-input v-model="formData.icon" maxlength="64" placeholder="请输入图标名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="formData.type !== 'B'" :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="始终显示" prop="alwaysShow">
            <el-radio-group v-model="formData.alwaysShow" class="menu-type-group">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="页面缓存" prop="keepAlive">
            <el-radio-group v-model="formData.keepAlive" class="menu-type-group">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="路由参数">
        <div class="params-editor">
          <div v-if="paramsEntries.length === 0" class="params-empty">暂无参数</div>
          <div v-for="(item, index) in paramsEntries" :key="index" class="params-row">
            <el-input v-model="item.key" placeholder="参数名" />
            <el-input v-model="item.value" placeholder="参数值" />
            <el-button link type="danger" @click="handleRemoveParam(index)">删除</el-button>
          </div>
          <el-button type="primary" plain @click="handleAddParam">新增参数</el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-permission="submitPermission"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { MenuApi } from '@/api/sys/menu'
import type { SysMenuAdminVO, SysMenuSaveRequest } from '@/types/api-types'
import { MENU_TYPE_OPTIONS } from '@/utils'

interface ParamEntry {
  key: string
  value: string
}

interface Props {
  visible: boolean
  menuId: number | null
  parentId: number
  menuTree: SysMenuAdminVO[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

interface ParentMenuOption {
  id: number
  label: string
  disabled?: boolean
  children?: ParentMenuOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const detailLoading = ref(false)
const paramsEntries = ref<ParamEntry[]>([])

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.menuId)
const submitPermission = computed(() => (isEdit.value ? 'sys:menu:update' : 'sys:menu:create'))
const parentMenuProps = {
  label: 'label',
  children: 'children',
  disabled: 'disabled',
}

const parentMenuOptions = computed<ParentMenuOption[]>(() => {
  const forbiddenIds = props.menuId
    ? collectDescendantIds(props.menuTree, props.menuId)
    : new Set<number>()

  return [
    {
      id: 0,
      label: '根菜单',
      children: buildParentMenuOptions(props.menuTree, forbiddenIds),
    },
  ]
})

const formData = reactive<SysMenuSaveRequest>({
  parentId: 0,
  name: '',
  type: 'M',
  routeName: '',
  routePath: '',
  component: '',
  perm: '',
  alwaysShow: 0,
  keepAlive: 0,
  icon: '',
  sort: 0,
  visible: 1,
  redirect: '',
  params: null,
})

const formRules: FormRules<SysMenuSaveRequest> = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  routeName: [
    {
      validator: (_, value, callback) => {
        if (formData.type !== 'B' && !String(value ?? '').trim()) {
          callback(new Error('请输入路由名称'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  routePath: [
    {
      validator: (_, value, callback) => {
        const routePath = String(value ?? '').trim()
        if (formData.type !== 'B' && !routePath) {
          callback(new Error('请输入路由路径'))
          return
        }
        if (formData.type !== 'B' && !routePath.startsWith('/admin')) {
          callback(new Error('路由路径必须以 /admin 开头'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  component: [
    {
      validator: (_, value, callback) => {
        if (formData.type === 'M' && !String(value ?? '').trim()) {
          callback(new Error('菜单类型必须填写组件路径'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  perm: [
    {
      validator: (_, value, callback) => {
        if (formData.type === 'B' && !String(value ?? '').trim()) {
          callback(new Error('按钮类型必须填写权限标识'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

function resetForm(): void {
  Object.assign(formData, {
    parentId: props.parentId,
    name: '',
    type: 'M',
    routeName: '',
    routePath: '',
    component: '',
    perm: '',
    alwaysShow: 0,
    keepAlive: 0,
    icon: '',
    sort: 0,
    visible: 1,
    redirect: '',
    params: null,
  })
  paramsEntries.value = []
  formRef.value?.clearValidate()
}

function normalizeParams(params?: Record<string, string> | null): ParamEntry[] {
  if (!params) {
    return []
  }

  return Object.entries(params).map(([key, value]) => ({
    key,
    value,
  }))
}

function collectDescendantIds(tree: SysMenuAdminVO[], targetId: number): Set<number> {
  const targetNode = findMenuNode(tree, targetId)
  const ids = new Set<number>([targetId])

  const visit = (nodes: SysMenuAdminVO[] = []) => {
    nodes.forEach(node => {
      ids.add(node.id)
      visit(node.children ?? [])
    })
  }

  visit(targetNode?.children ?? [])
  return ids
}

function findMenuNode(tree: SysMenuAdminVO[], targetId: number): SysMenuAdminVO | null {
  const queue = [...tree]

  while (queue.length) {
    const node = queue.shift()
    if (!node) {
      continue
    }

    if (node.id === targetId) {
      return node
    }

    if (node.children?.length) {
      queue.push(...node.children)
    }
  }

  return null
}

function buildParentMenuOptions(
  tree: SysMenuAdminVO[],
  forbiddenIds: Set<number>
): ParentMenuOption[] {
  return tree.map(node => ({
    id: node.id,
    label: node.name,
    disabled: forbiddenIds.has(node.id),
    children: buildParentMenuOptions(node.children ?? [], forbiddenIds),
  }))
}

async function loadMenuDetail(menuId: number): Promise<void> {
  detailLoading.value = true
  try {
    const response = await MenuApi.getMenuById(menuId)
    const detail = response.data.data
    Object.assign(formData, {
      parentId: detail.parentId,
      name: detail.name,
      type: detail.type,
      routeName: detail.routeName ?? '',
      routePath: detail.routePath ?? '',
      component: detail.component ?? '',
      perm: detail.perm ?? '',
      alwaysShow: detail.alwaysShow ?? 0,
      keepAlive: detail.keepAlive ?? 0,
      icon: detail.icon ?? '',
      sort: detail.sort ?? 0,
      visible: detail.visible ?? 1,
      redirect: detail.redirect ?? '',
      params: detail.params ?? null,
    })
    paramsEntries.value = normalizeParams(detail.params)
  } catch {
    ElMessage.error('获取菜单详情失败')
  } finally {
    detailLoading.value = false
  }
}

function handleAddParam(): void {
  paramsEntries.value.push({ key: '', value: '' })
}

function handleRemoveParam(index: number): void {
  paramsEntries.value.splice(index, 1)
}

function buildParamsObject(): Record<string, string> | null {
  const filteredEntries = paramsEntries.value
    .map(item => ({
      key: item.key.trim(),
      value: item.value.trim(),
    }))
    .filter(item => item.key)

  if (filteredEntries.length === 0) {
    return null
  }

  return Object.fromEntries(filteredEntries.map(item => [item.key, item.value]))
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const params = buildParamsObject()
    const payload: SysMenuSaveRequest = {
      parentId: formData.parentId ?? 0,
      name: formData.name.trim(),
      type: formData.type,
      routeName: formData.type === 'B' ? undefined : formData.routeName?.trim() || undefined,
      routePath: formData.type === 'B' ? undefined : formData.routePath?.trim() || undefined,
      component:
        formData.type === 'B'
          ? undefined
          : formData.component?.trim() || (formData.type === 'C' ? 'layouts/RouteView' : undefined),
      perm: formData.perm?.trim() || undefined,
      alwaysShow: formData.type === 'B' ? 0 : (formData.alwaysShow ?? 0),
      keepAlive: formData.type === 'B' ? 0 : (formData.keepAlive ?? 0),
      icon: formData.type === 'B' ? undefined : formData.icon?.trim() || undefined,
      sort: formData.sort ?? 0,
      visible: formData.visible ?? 1,
      redirect: formData.type === 'B' ? undefined : formData.redirect?.trim() || undefined,
      params,
    }

    if (isEdit.value && props.menuId) {
      await MenuApi.updateMenu(props.menuId, payload)
      ElMessage.success('菜单更新成功')
    } else {
      await MenuApi.createMenu(payload)
      ElMessage.success('菜单创建成功')
    }

    emit('success')
    dialogVisible.value = false
  } catch {
    // 表单校验失败或请求失败
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => [props.visible, props.menuId, props.parentId] as const,
  async ([visible, menuId, parentId]) => {
    if (!visible) {
      return
    }

    resetForm()
    formData.parentId = parentId

    if (menuId) {
      await loadMenuDetail(menuId)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.menu-form {
  padding: 0 12px;
}

.menu-type-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.menu-type-group .el-radio) {
  margin-right: 0;
}

.params-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.params-empty {
  color: var(--el-text-color-secondary);
}

.params-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}

@media (max-width: 768px) {
  .params-row {
    grid-template-columns: 1fr;
  }
}
</style>
