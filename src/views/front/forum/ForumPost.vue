<template>
  <div class="forum-post-page">
    <FeaturePlaceholder
      title="论坛帖子详情"
      summary="帖子详情页已补基础路由和参数展示，后续再接正文、回复流、点赞收藏和频道分享能力。"
      :route-meta="[{ label: 'postId', value: String(postId) }]"
      :api-refs="['GET /api/forum/posts/{id}', 'GET /api/forum/posts/{postId}/replies']"
      :doc-refs="['docs/api文档/forum-api.md', 'docs/需求文档/论坛与频道交互草案.md']"
      :next-steps="[
        '补帖子正文和作者信息',
        '补回复列表和回复编辑',
        '补点赞、收藏和分享至频道'
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'

const route = useRoute()
const postId = computed(() => Number(route.params.postId ?? 0))
</script>

<style scoped>
.forum-post-page {
  padding: 0;
}
</style>
