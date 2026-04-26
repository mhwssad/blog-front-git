<template>
  <el-dialog
    v-model="modalVisible"
    :title="dialogTitle"
    width="540px"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    center
  >
    <ElForm ref="formRef" class="category-form" :model="formState" :rules="formRules" label-width="120px">
      <el-form-item label="上级分类">
        <el-tree-select
          v-model="formState.parentId"
          :data="parentCategoryOptions"
          :props="parentCategoryProps"
          node-key="id"
          check-strictly
          default-expand-all
          :render-after-expand="false"
          placeholder="请选择上级分类"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formState.name" placeholder="请输入分类名称" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="formState.code" placeholder="请输入分类编码" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input v-model="formState.type" disabled />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formState.sortOrder" :min="0" :controls="false" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="formState.icon" placeholder="可输入字体图标或图标名" maxlength="64" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formState.description"
          type="textarea"
          :rows="3"
          placeholder="分类描述，可选"
          maxlength="200"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="formState.status"
          :active-value="1"
          :inactive-value="0"
          inline-prompt
          active-text="正常"
          inactive-text="停用"
        />
      </el-form-item>
    </ElForm>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        v-permission="submitPermission"
        @click="handleSubmit"
      >
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch, type PropType } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { useCategoryStore } from '@/stores'
import type { CategoryAdminVO, CategorySaveRequest } from '@/api/types'

const props = defineProps({
  visible: Boolean,
  parentId: {
    type: Number,
    default: 0,
  },
  categoryTree: {
    type: Array as PropType<CategoryAdminVO[]>,
    default: () => [],
  },
  category: {
    type: Object as PropType<CategoryAdminVO | null>,
    default: null,
  },
})

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'success'): void
}>()

const categoryStore = useCategoryStore()
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const submitting = ref(false)

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
}

interface CategoryFormState {
  parentId: number
  name: string
  code: string
  type: string
  sortOrder: number
  icon: string
  description: string
  status: number
}

interface ParentCategoryOption {
  id: number
  label: string
  disabled?: boolean
  children?: ParentCategoryOption[]
}

const defaultState = (): CategoryFormState => ({
  parentId: props.parentId,
  name: '',
  code: '',
  type: 'article',
  sortOrder: 0,
  icon: '',
  description: '',
  status: 1,
})

const formState = reactive<CategoryFormState>(defaultState())

const isEdit = computed(() => Boolean(props.category?.id))
const dialogTitle = computed(() => (isEdit.value ? '编辑分类' : '新增分类'))
const submitPermission = computed(() =>
  isEdit.value ? 'content:category:update' : 'content:category:create'
)
const parentCategoryProps = {
  label: 'label',
  children: 'children',
  disabled: 'disabled',
}

const modalVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const parentCategoryOptions = computed<ParentCategoryOption[]>(() => {
  const forbiddenIds = props.category?.id
    ? collectDescendantIds(props.categoryTree, props.category.id)
    : new Set<number>()

  return [
    {
      id: 0,
      label: '根分类',
      children: buildParentCategoryOptions(props.categoryTree, forbiddenIds),
    },
  ]
})

function resetFormState(): void {
  const source = props.category
  Object.assign(formState, {
    parentId: source?.parentId ?? props.parentId,
    name: source?.name ?? '',
    code: source?.code ?? '',
    type: 'article',
    sortOrder: source?.sortOrder ?? 0,
    icon: source?.icon ?? '',
    description: source?.description ?? '',
    status: source?.status ?? 1,
  })

  formRef.value?.clearValidate()
}

function findCategoryNode(tree: CategoryAdminVO[], targetId: number): CategoryAdminVO | null {
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

function collectDescendantIds(tree: CategoryAdminVO[], targetId: number): Set<number> {
  const targetNode = findCategoryNode(tree, targetId)
  const ids = new Set<number>([targetId])

  const visit = (nodes: CategoryAdminVO[] = []) => {
    nodes.forEach(node => {
      ids.add(node.id)
      visit(node.children ?? [])
    })
  }

  visit(targetNode?.children ?? [])
  return ids
}

function buildParentCategoryOptions(
  tree: CategoryAdminVO[],
  forbiddenIds: Set<number>
): ParentCategoryOption[] {
  return tree.map(node => ({
    id: node.id,
    label: node.name,
    disabled: forbiddenIds.has(node.id),
    children: buildParentCategoryOptions(node.children ?? [], forbiddenIds),
  }))
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      resetFormState()
    }
  },
  { immediate: true }
)

watch(
  () => props.category,
  () => {
    if (props.visible) {
      resetFormState()
    }
  }
)

watch(
  () => props.parentId,
  () => {
    if (!props.category && props.visible) {
      formState.parentId = props.parentId
    }
  }
)

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  const payload: CategorySaveRequest = {
    parentId: formState.parentId ?? 0,
    name: formState.name.trim(),
    code: formState.code.trim(),
    type: formState.type,
    sortOrder: formState.sortOrder,
    icon: formState.icon.trim() || undefined,
    description: formState.description.trim() || undefined,
    status: formState.status,
  }

  const success = isEdit.value
    ? await categoryStore.updateCategory(props.category!.id, payload)
    : await categoryStore.createCategory(payload)

  submitting.value = false

  if (!success) {
    ElMessage.error(isEdit.value ? '更新分类失败' : '创建分类失败')
    return
  }

  ElMessage.success(isEdit.value ? '分类信息已更新' : '分类创建成功')
  emit('success')
  emit('update:visible', false)
}

function handleCancel(): void {
  emit('update:visible', false)
}
</script>

<style scoped>
.category-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
