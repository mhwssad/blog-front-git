<template>
  <div class="article-content-wrapper">
    <div v-if="content" ref="contentRef" class="article-content markdown-body" v-html="content" />
    <el-empty v-else description="暂无内容" />
  </div>
</template>

<script lang="ts" setup>
/**
 * 文章内容渲染组件
 * @description 渲染 Markdown 内容并提取目录结构（h2/h3/h4）
 * @module front/article/components/ArticleContent
 */
import { onMounted, onUpdated, ref, watch } from 'vue'
import type { TocHeading } from '@/types/ui'

const props = defineProps<{
  /** 文章 HTML 内容 */
  content?: string | null
}>()

const emit = defineEmits<{
  headingsExtracted: [headings: TocHeading[]]
}>()

const contentRef = ref<HTMLElement | null>(null)

function extractHeadings(): void {
  if (!contentRef.value) return
  const headings: TocHeading[] = []
  const elements = contentRef.value.querySelectorAll('h2, h3, h4')
  elements.forEach((el, index) => {
    const id = `heading-${index}`
    el.id = id
    headings.push({
      id,
      text: el.textContent ?? '',
      level: Number(el.tagName[1]),
    })
  })
  emit('headingsExtracted', headings)
}

watch(
  () => props.content,
  () => {
    onUpdated(() => extractHeadings())
  }
)

onMounted(() => {
  extractHeadings()
})
</script>

<style scoped>
.article-content-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  line-height: 1.8;
}

.article-content {
  font-size: 16px;
  color: var(--el-text-color-primary);
  word-break: break-word;
}

.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  scroll-margin-top: 80px;
}

.article-content :deep(h2) {
  font-size: 22px;
}

.article-content :deep(h3) {
  font-size: 19px;
}

.article-content :deep(h4) {
  font-size: 17px;
}

.article-content :deep(p) {
  margin: 12px 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.article-content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  border-left: 4px solid var(--el-color-primary);
  background: var(--el-fill-color-light);
  border-radius: 4px;
  color: var(--el-text-color-regular);
}

.article-content :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  border-radius: 8px;
  background: #1e293b;
  color: #e2e8f0;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
}

.article-content :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color);
  font-size: 14px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

.article-content :deep(pre code) {
  padding: 0;
  background: none;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 12px 0;
}

.article-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  text-align: left;
}

.article-content :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
}
</style>
