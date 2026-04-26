<template>
  <div class="action-bar">
    <el-button
      :type="article.liked ? 'primary' : 'default'"
      round
      :loading="actionLoading"
      @click="emit('like')"
    >
      <el-icon><Star /></el-icon>
      {{ article.liked ? '已点赞' : '点赞' }} {{ article.likeCount }}
    </el-button>

    <el-button
      v-if="article.collected"
      type="warning"
      round
      :loading="actionLoading"
      @click="emit('uncollect')"
    >
      <el-icon><StarFilled /></el-icon>
      已收藏 {{ article.collectCount }}
    </el-button>
    <el-button
      v-else
      round
      :loading="actionLoading"
      :disabled="!loggedIn"
      @click="emit('collect')"
    >
      <el-icon><Star /></el-icon>
      收藏 {{ article.collectCount }}
    </el-button>

    <el-button round @click="scrollToTop">
      <el-icon><Top /></el-icon>
      回到顶部
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { Star, StarFilled, Top } from '@element-plus/icons-vue'
import type { PublicArticleDetailVO } from '@/api/types'

defineProps<{
  article: PublicArticleDetailVO
  actionLoading: boolean
  loggedIn: boolean
}>()

const emit = defineEmits<{
  like: []
  collect: []
  uncollect: []
}>()

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 0;
  margin: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
