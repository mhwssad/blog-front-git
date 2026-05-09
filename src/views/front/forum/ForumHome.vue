<template>
  <div class="forum-home-page">
    <FeaturePlaceholder
      title="论坛首页"
      summary="论坛公开接口已经定义完成，当前先补入口页和路由壳，后续再落版块概览、最新帖子和热门内容。"
      :api-refs="['GET /api/forum/sections', 'GET /api/forum/posts']"
      :doc-refs="['docs/api文档/forum-api.md', 'docs/api文档/README.md']"
      :next-steps="[
        '补版块列表和热门帖子流',
        '补关键词搜索和排序切换',
        '补登录后发帖入口'
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'
</script>

<style scoped>
.forum-home-page {
  padding: 0;
}
</style>
