<template>
  <div class="forum-create-page">
    <FeaturePlaceholder
      title="发布帖子"
      summary="发帖页已预留登录态路由，后续直接对接用户论坛发帖接口和频道挂接能力。"
      status-label="待接表单"
      :route-meta="routeMeta"
      :api-refs="['POST /api/user/forum/posts']"
      :doc-refs="['docs/api文档/forum-api.md']"
      :next-steps="[
        '补版块选择、标题、正文和标签区域',
        '接入发帖保存和校验',
        '补发帖后跳转帖子详情页'
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'

const route = useRoute()

const routeMeta = computed(() => {
  const sectionId = route.query.sectionId
  return sectionId ? [{ label: 'sectionId', value: String(sectionId) }] : []
})
</script>

<style scoped>
.forum-create-page {
  padding: 0;
}
</style>
