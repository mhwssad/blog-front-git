<template>
  <div class="editor-settings">
    <el-collapse v-model="activeSections" class="settings-collapse">
      <!-- 发布配置 -->
      <el-collapse-item name="publish">
        <template #title>
          <div class="section-title">
            <el-icon size="16"><Promotion /></el-icon>
            <span>发布配置</span>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">作者</span>
            <span class="info-value">{{ authorName }}</span>
          </div>
          <div v-if="currentStatus >= 0" class="info-item">
            <span class="info-label">状态</span>
            <el-tag :type="statusTagType" size="small" round>{{ statusLabel }}</el-tag>
          </div>
        </div>

        <el-divider />

        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="publishTimeValue"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择时间直接发布，或选择未来时间定时发布"
            style="width: 100%"
            clearable
            @change="handlePublishTimeChange"
          />
          <div v-if="formData.scheduledPublishTime" class="schedule-hint">
            定时发布：{{ formData.scheduledPublishTime }}，到期后自动发布
          </div>
        </el-form-item>

        <el-form-item label="访问级别" prop="accessLevel">
          <el-select v-model="formData.accessLevel" placeholder="请选择">
            <el-option
              v-for="o in ACCESS_LEVEL_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="可见范围" prop="visibilityScope">
          <el-select v-model="formData.visibilityScope" placeholder="请选择">
            <el-option
              v-for="o in VISIBILITY_SCOPE_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="isAdmin" label="置顶" prop="isTop">
          <el-radio-group v-model="formData.isTop">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="属性" prop="isOriginal">
          <el-radio-group v-model="formData.isOriginal">
            <el-radio :value="1">原创</el-radio>
            <el-radio :value="0">转载</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.isOriginal === 0" label="转载地址" prop="sourceUrl">
          <el-input v-model="formData.sourceUrl" maxlength="512" placeholder="请输入转载来源地址" />
        </el-form-item>

        <el-form-item label="封面" prop="coverImage">
          <ImageUpload v-model="formData.coverImage" mode="cover" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            maxlength="256"
            show-word-limit
            resize="vertical"
            placeholder="请输入备注"
          />
        </el-form-item>

        <el-alert
          v-if="formData.accessLevel === 4 || formData.visibilityScope === 2"
          type="info"
          :closable="false"
          title="当前文章为指定用户可见，保存后请回到列表页单独维护访问名单。"
        />
      </el-collapse-item>

      <!-- 分类 -->
      <el-collapse-item name="category">
        <template #title>
          <div class="section-title">
            <el-icon size="16"><FolderOpened /></el-icon>
            <span>分类</span>
            <el-tag v-if="formData.categoryIds?.length" size="small" type="info" round class="section-count">
              {{ formData.categoryIds.length }}
            </el-tag>
          </div>
        </template>

        <div class="category-list">
          <el-checkbox-group v-model="formData.categoryIds">
            <div
              v-for="item in flatCategories"
              :key="item.id"
              class="category-item"
              :style="{ paddingLeft: `${item.depth * 20 + 8}px` }"
            >
              <el-checkbox :value="item.id" :label="item.name" />
            </div>
          </el-checkbox-group>
          <div v-if="!flatCategories.length" class="empty-hint">暂无分类</div>
        </div>
      </el-collapse-item>

      <!-- 标签 -->
      <el-collapse-item name="tag">
        <template #title>
          <div class="section-title">
            <el-icon size="16"><CollectionTag /></el-icon>
            <span>标签</span>
            <el-tag v-if="formData.tagIds?.length" size="small" type="info" round class="section-count">
              {{ formData.tagIds.length }}
            </el-tag>
          </div>
        </template>

        <div class="tag-input-wrap">
          <el-input
            ref="tagInputRef"
            v-model="tagQuery"
            placeholder="输入标签名，回车确认"
            maxlength="32"
            clearable
            @keyup.enter="handleTagConfirm"
            @focus="tagDropdownVisible = true"
            @blur="onTagInputBlur"
          />

          <Transition name="tag-dropdown">
            <div v-if="tagDropdownVisible && filteredSuggestions.length" class="tag-suggestions">
              <div
                v-for="tag in filteredSuggestions"
                :key="tag.id"
                class="tag-suggestion-item"
                :class="{ 'is-selected': formData.tagIds?.includes(tag.id) }"
                @mousedown.prevent="toggleTag(tag.id)"
              >
                <span class="tag-suggestion-name">{{ tag.name }}</span>
                <el-icon v-if="formData.tagIds?.includes(tag.id)" size="14"><Check /></el-icon>
              </div>
            </div>
          </Transition>
        </div>

        <div v-if="tagQuery && !filteredSuggestions.length" class="tag-create-hint">
          回车创建「{{ tagQuery }}」
        </div>

        <div v-if="selectedTagChips.length" class="tag-chips">
          <el-tag
            v-for="chip in selectedTagChips"
            :key="chip.id"
            closable
            size="default"
            @close="removeTag(chip.id)"
          >
            {{ chip.name }}
          </el-tag>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts" setup>
import type { ArticleSaveRequest, CategoryAdminVO, TagVO } from '@/types/api-types'
import { ACCESS_LEVEL_OPTIONS } from '@/utils'
import { computed, ref } from 'vue'
import { Promotion, FolderOpened, CollectionTag, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore, useTagStore } from '@/stores'
import ImageUpload from '@/components/common/ImageUpload.vue'

const VISIBILITY_SCOPE_OPTIONS = [
  { label: '公开', value: 0 },
  { label: '仅自己可见', value: 1 },
  { label: '白名单可见', value: 2 },
  { label: '登录可见', value: 3 },
] as const

interface Props {
  formData: ArticleSaveRequest
  categories: CategoryAdminVO[]
  tags: TagVO[]
  authorName: string
  currentStatus?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'tagsUpdated'): void }>()
const authStore = useAuthStore()
const tagStore = useTagStore()
const isAdmin = computed(() => authStore.hasRole('admin'))

const publishTimeValue = computed({
  get: () => props.formData.scheduledPublishTime || props.formData.publishTime || '',
  set: () => {},
})

function handlePublishTimeChange(value: string | null): void {
  if (!value) {
    props.formData.publishTime = ''
    props.formData.scheduledPublishTime = ''
    return
  }
  const selected = new Date(value.replace(/-/g, '/'))
  if (selected.getTime() > Date.now()) {
    props.formData.scheduledPublishTime = value
    props.formData.publishTime = ''
  } else {
    props.formData.publishTime = value
    props.formData.scheduledPublishTime = ''
  }
}

const activeSections = ref(['publish', 'category', 'tag'])

const statusMap: Record<
  number,
  { label: string; type: 'success' | 'warning' | 'info' | 'danger' | 'primary' }
> = {
  0: { label: '草稿', type: 'info' },
  1: { label: '已发布', type: 'success' },
  2: { label: '待发布', type: 'warning' },
  3: { label: '已下架', type: 'danger' },
}

const currentStatus = computed(() => props.currentStatus ?? 0)
const statusLabel = computed(() => statusMap[currentStatus.value]?.label ?? '草稿')
const statusTagType = computed(
  () => statusMap[currentStatus.value]?.type ?? ('info' as const),
)

interface FlatCategory {
  id: number
  name: string
  depth: number
}

function flattenCategories(nodes: CategoryAdminVO[], depth = 0): FlatCategory[] {
  const result: FlatCategory[] = []
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, depth })
    if (node.children?.length) {
      result.push(...flattenCategories(node.children, depth + 1))
    }
  }
  return result
}

const flatCategories = computed(() => flattenCategories(props.categories))

// ---- 标签输入 ----
const tagInputRef = ref()
const tagQuery = ref('')
const tagDropdownVisible = ref(false)

const filteredSuggestions = computed(() => {
  const q = tagQuery.value.trim().toLowerCase()
  if (!q) return props.tags
  return props.tags.filter((t) => t.name.toLowerCase().includes(q))
})

const selectedTagChips = computed(() =>
  props.tags.filter((t) => props.formData.tagIds?.includes(t.id)),
)

function onTagInputBlur() {
  setTimeout(() => {
    tagDropdownVisible.value = false
  }, 150)
}

function toggleTag(id: number) {
  const ids = [...(props.formData.tagIds ?? [])]
  const idx = ids.indexOf(id)
  if (idx !== -1) {
    ids.splice(idx, 1)
  } else {
    ids.push(id)
  }
  props.formData.tagIds = ids
}

function removeTag(id: number) {
  props.formData.tagIds = (props.formData.tagIds ?? []).filter((i) => i !== id)
}

async function handleTagConfirm() {
  const name = tagQuery.value.trim()
  if (!name) return

  const existed = props.tags.find((t) => t.name === name)
  if (existed) {
    if (!props.formData.tagIds?.includes(existed.id)) {
      props.formData.tagIds = [...(props.formData.tagIds ?? []), existed.id]
    }
    tagQuery.value = ''
    return
  }

  const ok = await tagStore.createTag({ name })
  if (ok) {
    await tagStore.fetchTags()
    emit('tagsUpdated')
    const created = tagStore.tags.find((t) => t.name === name)
    if (created) {
      props.formData.tagIds = [...(props.formData.tagIds ?? []), created.id]
    }
    tagQuery.value = ''
  } else {
    ElMessage.warning(`标签「${name}」创建失败`)
  }
}
</script>

<style scoped>
.editor-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- Collapse 面板 ---- */
.settings-collapse {
  --el-collapse-header-bg-color: var(--color-white);
  --el-collapse-content-bg-color: var(--color-white);
  --el-collapse-header-height: 44px;
  --el-collapse-header-font-size: 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-small);
  overflow: hidden;
}

.settings-collapse :deep(.el-collapse-item__header) {
  padding: 0 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border-light);
}

.settings-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.settings-collapse :deep(.el-collapse-item__content) {
  padding: 16px;
}

/* ---- 分区标题 ---- */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
}

.section-count {
  margin-left: auto;
  font-size: 11px;
}

/* ---- 信息网格 (作者/状态) ---- */
.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* ---- 分类多选列表 ---- */
.category-list {
  max-height: 240px;
  overflow-y: auto;
}

.category-list :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.category-item {
  display: flex;
  align-items: center;
  height: 28px;
}

.category-item :deep(.el-checkbox) {
  margin-right: 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 12px 0;
}

/* ---- 表单项覆盖 ---- */
.editor-settings :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding-bottom: 4px;
}

.editor-settings :deep(.el-radio-group) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

.editor-settings :deep(.el-radio) {
  margin-right: 0;
}

.editor-settings :deep(.el-select),
.editor-settings :deep(.el-date-editor) {
  width: 100%;
}

.editor-settings :deep(.el-divider) {
  margin: 12px 0 16px;
}

.schedule-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
}

/* ---- 标签输入 ---- */
.tag-input-wrap {
  position: relative;
}

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  background: var(--color-white);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  box-shadow: var(--shadow-small);
}

.tag-suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.tag-suggestion-item:hover {
  background: var(--color-gray-50);
}

.tag-suggestion-item.is-selected {
  color: var(--el-color-primary);
}

.tag-suggestion-item .el-icon {
  color: var(--el-color-primary);
}

.tag-create-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

/* ---- 标签下拉动画 ---- */
.tag-dropdown-enter-active,
.tag-dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.tag-dropdown-enter-from,
.tag-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
