<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom-start"
    :width="400"
    trigger="click"
  >
    <template #reference>
      <el-input
        :model-value="modelValue"
        placeholder="点击选择图标"
        readonly
        :clearable="clearable"
        class="icon-picker-input"
        @clear="handleClear"
      >
        <template v-if="modelValue" #prefix>
          <el-icon class="icon-picker-preview"><component :is="iconComponent" /></el-icon>
        </template>
      </el-input>
    </template>

    <div class="icon-picker">
      <el-input
        v-model="keyword"
        placeholder="搜索图标..."
        clearable
        size="small"
        class="icon-picker-search"
      />

      <el-tabs v-if="!keyword" v-model="activeCategory" class="icon-picker-tabs">
        <el-tab-pane
          v-for="(icons, category) in validCategories"
          :key="category"
          :label="categoryLabels[category] ?? category"
          :name="category"
        >
          <div class="icon-picker-grid">
            <div
              v-for="{ name, component } in icons"
              :key="name"
              class="icon-picker-item"
              :class="{ active: modelValue === name }"
              :title="name"
              @click="handleSelect(name)"
            >
              <el-icon :size="20"><component :is="component" /></el-icon>
              <span class="icon-picker-item-name">{{ name }}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div v-else class="icon-picker-grid icon-picker-search-result">
        <div
          v-for="{ name, component } in filteredIcons"
          :key="name"
          class="icon-picker-item"
          :class="{ active: modelValue === name }"
          :title="name"
          @click="handleSelect(name)"
        >
          <el-icon :size="20"><component :is="component" /></el-icon>
          <span class="icon-picker-item-name">{{ name }}</span>
        </div>
        <el-empty v-if="filteredIcons.length === 0" description="未找到图标" :image-size="60" />
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { IconUtils } from '@/utils/iconUtils'

interface IconEntry {
  name: string
  component: ReturnType<typeof IconUtils.getIcon>
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    clearable?: boolean
  }>(),
  {
    modelValue: '',
    clearable: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const popoverVisible = ref(false)
const keyword = ref('')
const activeCategory = ref('basic')

function resolveIcons(names: string[]): IconEntry[] {
  return names
    .map(name => ({ name, component: IconUtils.getIcon(name) }))
    .filter((e): e is IconEntry & { component: NonNullable<IconEntry['component']> } => e.component != null)
}

const validCategories = computed(() => {
  const raw = IconUtils.getIconsByCategory()
  const result: Record<string, IconEntry[]> = {}
  for (const [cat, names] of Object.entries(raw)) {
    const resolved = resolveIcons(names)
    if (resolved.length > 0) result[cat] = resolved
  }
  return result
})

const categoryLabels: Record<string, string> = {
  basic: '基础',
  direction: '方向',
  operation: '操作',
  data: '数据',
  media: '媒体',
  file: '文件',
  user: '用户',
  communication: '通信',
  time: '时间',
  location: '地点',
  status: '状态',
  other: '其他',
}

const iconComponent = computed(() => {
  const comp = IconUtils.getIcon(props.modelValue)
  return comp ?? props.modelValue
})

const filteredIcons = computed(() => resolveIcons(IconUtils.searchIcons(keyword.value)))

function handleSelect(name: string) {
  emit('update:modelValue', name)
  popoverVisible.value = false
}

function handleClear() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.icon-picker-input {
  cursor: pointer;
}

.icon-picker-preview {
  color: var(--el-color-primary);
}

.icon-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icon-picker-search {
  margin-bottom: 4px;
}

.icon-picker-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.icon-picker-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  max-height: 260px;
  overflow-y: auto;
}

.icon-picker-search-result {
  max-height: 320px;
}

.icon-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.icon-picker-item:hover {
  background: var(--el-fill-color);
}

.icon-picker-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.icon-picker-item-name {
  width: 100%;
  overflow: hidden;
  font-size: 10px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
}

.icon-picker-item.active .icon-picker-item-name {
  color: var(--el-color-primary);
}
</style>
