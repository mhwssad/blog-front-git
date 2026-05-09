<template>
  <div class="my-forum-posts-page">
    <FeaturePlaceholder
      title="我的帖子"
      summary="用户论坛管理页已补登录后入口，后续再接我的帖子列表、编辑和删除操作。"
      :api-refs="['GET /api/user/forum/posts', 'DELETE /api/user/forum/posts/{id}']"
      :doc-refs="['docs/api文档/forum-api.md']"
      :next-steps="[
        '补我的帖子筛选和分页',
        '补编辑、删除和状态展示',
        '补快捷跳转到发帖页'
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'
</script>

<style scoped>
.my-forum-posts-page {
  padding: 0;
}
</style>
