<template>
  <div class="sidebar-stack">
    <div class="sidebar-card">
      <HomeSidebarHot :articles="hotArticles" />
    </div>
    <div class="sidebar-card">
      <HomeSidebarTags :tags="tags" @select-tag="(value: number) => emit('select-tag', value)" />
    </div>
    <div class="sidebar-card">
      <HomeSidebarComments :comments="comments" :format-date="formatDate" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  PublicArticleCardVO,
  PublicCommentVO,
  PublicTagVO,
} from '@/api/types'
import HomeSidebarComments from './HomeSidebarComments.vue'
import HomeSidebarHot from './HomeSidebarHot.vue'
import HomeSidebarTags from './HomeSidebarTags.vue'

defineProps<{
  hotArticles: PublicArticleCardVO[]
  tags: PublicTagVO[]
  comments: PublicCommentVO[]
  formatDate: (value?: string | null) => string
}>()

const emit = defineEmits<{
  'select-tag': [value: number]
}>()
</script>

<style scoped>
.sidebar-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}
</style>
