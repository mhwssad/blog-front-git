<template>
  <div class="sidebar-stack">
    <HomeSidebarHot :articles="hotArticles" />
    <HomeSidebarCategories
      :categories="categories"
      @select-category="value => emit('select-category', value)"
    />
    <HomeSidebarTags :tags="tags" @select-tag="value => emit('select-tag', value)" />
    <HomeSidebarComments :comments="comments" :format-date="formatDate" />
  </div>
</template>

<script lang="ts" setup>
import type {
  PublicArticleCardVO,
  PublicCategoryTreeVO,
  PublicCommentVO,
  PublicTagVO,
} from '@/api/types'
import HomeSidebarCategories from './HomeSidebarCategories.vue'
import HomeSidebarComments from './HomeSidebarComments.vue'
import HomeSidebarHot from './HomeSidebarHot.vue'
import HomeSidebarTags from './HomeSidebarTags.vue'

defineProps<{
  hotArticles: PublicArticleCardVO[]
  categories: PublicCategoryTreeVO[]
  tags: PublicTagVO[]
  comments: PublicCommentVO[]
  formatDate: (value?: string | null) => string
}>()

const emit = defineEmits<{
  (e: 'select-category', value: number): void
  (e: 'select-tag', value: number): void
}>()
</script>

<style scoped>
.sidebar-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>
