<template>
  <div class="forum-edit-page">
    <FeaturePlaceholder
      title="编辑帖子"
      summary="编辑页已补路由参数解析，后续可直接接入我的帖子详情接口和更新接口。"
      status-label="待接表单"
      :route-meta="[{ label: 'postId', value: String(postId) }]"
      :api-refs="['GET /api/user/forum/posts/{id}', 'PUT /api/user/forum/posts/{id}']"
      :doc-refs="['docs/api文档/forum-api.md']"
      :next-steps="[
        '拉取当前帖子详情并回填表单',
        '补正文编辑和提交校验',
        '处理未发布和无权限编辑场景'
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
.forum-edit-page {
  padding: 0;
}
</style>
