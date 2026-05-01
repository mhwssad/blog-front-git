<template>
  <div class="home-banner">
    <div class="banner-top">
      <div class="banner-text">
        <h1 class="banner-title">探索与思考</h1>
        <p class="banner-desc">记录技术成长，分享实践心得</p>
      </div>
      <div class="banner-search">
        <el-input
          :model-value="keyword"
          clearable
          placeholder="搜索文章..."
          @update:model-value="emit('update:keyword', $event)"
          @keyup.enter="emit('search')"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" :loading="loading" @click="emit('search')">
          搜索
        </el-button>
      </div>
    </div>

    <div v-if="categories.length" class="category-nav">
      <router-link to="/" class="nav-item" :class="{ active: !selectedCategoryId }">
        全部
      </router-link>
      <router-link
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.id}`"
        class="nav-item"
        :class="{ active: selectedCategoryId === cat.id }"
      >
        {{ cat.label }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import type { CategoryOption } from '@/types/ui'

defineProps<{
  keyword: string
  loading?: boolean
  categories: CategoryOption[]
  selectedCategoryId?: number
}>()

const emit = defineEmits<{
  'update:keyword': [value: string]
  search: []
}>()
</script>

<style scoped>
.home-banner {
  padding: 32px 0 0;
}

.banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.banner-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.banner-desc {
  margin: 4px 0 0;
  font-size: 15px;
  color: var(--el-text-color-secondary);
}

.banner-search {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.banner-search .el-input {
  width: 260px;
}

.category-nav {
  display: flex;
  gap: 4px;
  padding: 20px 0 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.nav-item {
  flex-shrink: 0;
  padding: 8px 18px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.15s;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.nav-item.active {
  color: #fff;
  background: var(--el-color-primary);
}

@media (max-width: 768px) {
  .banner-top {
    flex-direction: column;
    align-items: stretch;
  }

  .banner-search .el-input {
    width: auto;
    flex: 1;
  }
}
</style>
