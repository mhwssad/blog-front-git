<template>
  <div class="article-section">
    <div class="section-body">
      <aside class="category-tree">
        <div
          class="category-item"
          :class="{ 'category-item--active': !selectedCategoryId }"
          @click="emit('category-change', undefined)"
        >
          全部
        </div>
        <template v-for="cat in categories" :key="cat.id">
          <div
            class="category-item"
            :class="{ 'category-item--active': selectedCategoryId === cat.id }"
            @click="emit('category-change', cat.id)"
          >
            <el-icon v-if="cat.children?.length" size="14">
              <ArrowRight />
            </el-icon>
            {{ cat.name }}
          </div>
          <div
            v-for="child in cat.children"
            :key="child.id"
            class="category-item category-item--child"
            :class="{ 'category-item--active': selectedCategoryId === child.id }"
            @click="emit('category-change', child.id)"
          >
            {{ child.name }}
          </div>
        </template>
      </aside>

      <div class="article-list">
        <div class="list-header">
          <el-select
            :model-value="selectedSort"
            size="small"
            style="width: 120px"
            @change="(v: string | number) => emit('sort-change', v as SortOption['value'])"
          >
            <el-option
              v-for="opt in sortOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <div v-if="loading" class="list-loading">
          <el-skeleton :rows="5" animated />
        </div>

        <template v-else-if="articles.length">
          <HomeArticleCard v-for="article in articles" :key="article.id" :article="article" />

          <div class="list-pagination">
            <el-pagination
              :current-page="current"
              :page-size="size"
              :total="total"
              layout="prev, pager, next"
              @current-change="(page: number) => emit('page-change', page)"
            />
          </div>
        </template>

        <el-empty v-else description="暂无文章" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 文章列表区块组件
 * @description 包含分类侧边栏和文章列表，支持分类筛选和排序
 * @module front/home/components/HomeArticleSection
 */
import { ArrowRight } from '@element-plus/icons-vue'
import HomeArticleCard from './HomeArticleCard.vue'
import type { PublicArticleCardVO, PublicCategoryTreeVO } from '@/types/api-types'
import type { SortOption } from '@/types/ui'

defineProps<{
  loading?: boolean
  articles: PublicArticleCardVO[]
  total: number
  current: number
  size: number
  sortOptions: SortOption[]
  selectedSort: SortOption['value']
  categories: PublicCategoryTreeVO[]
  selectedCategoryId?: number | null
}>()

const emit = defineEmits<{
  'sort-change': [value: SortOption['value']]
  'page-change': [page: number]
  'category-change': [id: number | undefined]
}>()
</script>

<style scoped>
.article-section {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.section-body {
  display: flex;
}

.category-tree {
  width: 180px;
  flex-shrink: 0;
  padding: 16px 0;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.category-item {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition:
    color 0.2s,
    background 0.2s;
}

.category-item:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color);
}

.category-item--active {
  color: var(--el-color-primary);
  font-weight: 500;
  background: var(--el-color-primary-light-9);
  border-right: 2px solid var(--el-color-primary);
}

.category-item--child {
  padding-left: 32px;
}

.article-list {
  flex: 1;
  min-width: 0;
  padding: 20px 24px;
}

.list-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.list-loading {
  padding: 16px 0;
}

.list-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .section-body {
    flex-direction: column;
  }

  .category-tree {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 12px 16px;
  }

  .category-item {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
  }

  .category-item--active {
    border-right: none;
    border-radius: 4px;
  }

  .category-item--child {
    padding-left: 12px;
  }
}
</style>
