<template>
  <div class="article-section">
    <div class="section-header">
      <span class="section-title">文章</span>
      <el-select :model-value="selectedSort" size="small" style="width: 120px" @change="(v: string | number) => emit('sort-change', v as SortOption['value'])">
        <el-option v-for="opt in sortOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </div>

    <div v-if="loading" class="section-loading">
      <el-skeleton :rows="4" animated />
    </div>

    <template v-else-if="articles.length">
      <HomeArticleCard v-for="article in articles" :key="article.id" :article="article" />

      <div class="section-pagination">
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
</template>

<script lang="ts" setup>
import HomeArticleCard from './HomeArticleCard.vue'
import type { PublicArticleCardVO } from '@/types/api-types'
import type { SortOption } from '../types'

defineProps<{
  loading?: boolean
  articles: PublicArticleCardVO[]
  total: number
  current: number
  size: number
  sortOptions: SortOption[]
  selectedSort: SortOption['value']
}>()

const emit = defineEmits<{
  'sort-change': [value: SortOption['value']]
  'page-change': [page: number]
}>()
</script>

<style scoped>
.article-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-loading {
  padding: 16px 0;
}

.section-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
