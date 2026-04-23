<template>
  <el-card shadow="never" class="section-card">
    <template #header>
      <div class="section-heading">
        <div>
          <el-tag type="primary" effect="plain" round>文章列表</el-tag>
          <h2>按文档定义的查询参数筛选内容</h2>
        </div>

        <el-radio-group :model-value="selectedSort" size="large" @change="handleSortChange">
          <el-radio-button v-for="item in sortOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <el-card shadow="never" class="filter-panel">
      <div class="filter-group">
        <div class="filter-label">分类</div>
        <div class="filter-chips">
          <el-tag
            :effect="selectedCategoryId ? 'plain' : 'dark'"
            round
            class="clickable-tag"
            @click="emit('select-category', undefined)"
          >
            全部
          </el-tag>
          <el-tag
            v-for="category in categories"
            :key="category.id"
            :effect="selectedCategoryId === category.id ? 'dark' : 'plain'"
            round
            class="clickable-tag"
            @click="emit('select-category', category.id)"
          >
            {{ category.label }}
          </el-tag>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-label">标签</div>
        <div class="filter-chips">
          <el-tag
            :effect="selectedTagId ? 'plain' : 'dark'"
            round
            class="clickable-tag"
            @click="emit('select-tag', undefined)"
          >
            全部
          </el-tag>
          <el-tag
            v-for="tag in tags.slice(0, 12)"
            :key="tag.id"
            :effect="selectedTagId === tag.id ? 'dark' : 'plain'"
            round
            class="clickable-tag"
            @click="emit('select-tag', tag.id)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <div v-loading="loading" class="article-grid">
      <template v-if="articles.length > 0">
        <HomeArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </template>
      <el-empty v-else description="当前筛选条件下暂无公开文章" />
    </div>

    <div class="pagination-wrap">
      <el-pagination
        :current-page="current"
        :page-size="size"
        :total="total"
        :page-sizes="[6, 9, 12, 18]"
        layout="total, sizes, prev, pager, next"
        @size-change="size => emit('size-change', size)"
        @current-change="page => emit('page-change', page)"
      />
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import HomeArticleCard from './HomeArticleCard.vue'
import type { PublicArticleCardVO, PublicTagVO } from '@/api/types'
import type { CategoryOption, SortOption } from '../types'

interface Props {
  loading?: boolean
  articles: PublicArticleCardVO[]
  total: number
  current: number
  size: number
  sortOptions: SortOption[]
  selectedSort: SortOption['value']
  selectedCategoryId?: number
  selectedTagId?: number
  categories: CategoryOption[]
  tags: PublicTagVO[]
}

withDefaults(defineProps<Props>(), {
  loading: false,
  selectedCategoryId: undefined,
  selectedTagId: undefined,
})

const emit = defineEmits<{
  (e: 'sort-change', value: SortOption['value']): void
  (e: 'select-category', value?: number): void
  (e: 'select-tag', value?: number): void
  (e: 'size-change', value: number): void
  (e: 'page-change', value: number): void
}>()

function handleSortChange(value: string | number | boolean | undefined): void {
  if (!value) {
    return
  }

  emit('sort-change', value as SortOption['value'])
}
</script>

<style scoped>
.section-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-heading h2 {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.filter-panel {
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 0.86));
}

.filter-group + .filter-group {
  margin-top: 18px;
}

.filter-label {
  margin-bottom: 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.clickable-tag {
  cursor: pointer;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
  min-height: 220px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 900px) {
  .section-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
