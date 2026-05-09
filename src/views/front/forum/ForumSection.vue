<template>
  <div class="forum-section-page">
    <FeaturePlaceholder
      title="论坛版块"
      summary="版块帖子列表页已补路由落点，后续再接帖子分页、排序和版块信息头部。"
      :route-meta="[{ label: 'sectionId', value: String(sectionId) }]"
      :api-refs="['GET /api/forum/posts']"
      :doc-refs="['docs/api文档/forum-api.md']"
      :next-steps="[
        '按版块 ID 拉取帖子列表',
        '补最新/热门排序切换',
        '补版块描述和发帖入口'
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'

const route = useRoute()
const sectionId = computed(() => Number(route.params.sectionId ?? 0))
</script>

<style scoped>
.forum-section-page {
  padding: 0;
}
</style>
