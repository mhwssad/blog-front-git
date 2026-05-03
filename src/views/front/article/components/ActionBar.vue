<template>
  <div class="action-bar">
    <el-tooltip content="点赞" placement="right">
      <el-button
        :type="article.liked ? 'primary' : 'default'"
        circle
        :loading="actionLoading"
        @click="emit('like')"
      >
        <el-icon><Star /></el-icon>
      </el-button>
    </el-tooltip>
    <span class="action-count">{{ article.likeCount }}</span>

    <el-tooltip :content="article.collected ? '取消收藏' : '收藏'" placement="right">
      <el-button
        v-if="article.collected"
        type="warning"
        circle
        :loading="actionLoading"
        @click="emit('uncollect')"
      >
        <el-icon><StarFilled /></el-icon>
      </el-button>
      <el-button
        v-else
        circle
        :loading="actionLoading"
        :disabled="!loggedIn"
        @click="emit('collect')"
      >
        <el-icon><Star /></el-icon>
      </el-button>
    </el-tooltip>
    <span class="action-count">{{ article.collectCount }}</span>

    <el-tooltip content="回到顶部" placement="right">
      <el-button
        v-show="showBackTop"
        circle
        @click="scrollToTop"
      >
        <el-icon><Top /></el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Star, StarFilled, Top } from '@element-plus/icons-vue'
import type { PublicArticleDetailVO } from '@/types/api-types'

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

const showBackTop = ref(false)

function onScroll(): void {
  showBackTop.value = window.scrollY > 400
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.action-bar {
  position: fixed;
  left: max(12px, calc((100vw - 1100px) / 2 - 64px));
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.action-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

@media (max-width: 1200px) {
  .action-bar {
    position: static;
    transform: none;
    flex-direction: row;
    gap: 12px;
    padding: 16px 0;
    border-top: 1px solid var(--el-border-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin: 8px 0;
  }

  .action-count {
    margin-bottom: 0;
  }
}
</style>
