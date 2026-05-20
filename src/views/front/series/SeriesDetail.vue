<template>
  <div class="series-detail-page">
    <div class="page-header">
      <div class="header-left">
        <router-link to="/series" class="back-link">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </router-link>
        <h1 class="page-title">{{ detail?.title ?? '系列详情' }}</h1>
      </div>
      <div v-if="detail" class="header-actions">
        <el-button type="primary" plain>编辑</el-button>
        <el-button type="danger" plain @click="handleDelete">删除</el-button>
      </div>
    </div>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="series-info-card">
          <el-skeleton-item variant="image" style="width: 160px; height: 120px" />
          <div class="info-body">
            <el-skeleton-item variant="text" style="width: 60%" />
            <el-skeleton-item variant="text" style="width: 40%" />
          </div>
        </div>
      </template>

      <template #default>
        <div v-if="detail" class="series-info-card">
          <div class="info-cover">
            <el-image
              v-if="detail.coverImage"
              :src="detail.coverImage"
              fit="cover"
              class="cover-img"
            />
            <el-icon v-else :size="48" color="#ccc"><Picture /></el-icon>
          </div>
          <div class="info-body">
            <div class="info-desc">{{ detail.description || '暂无描述' }}</div>
            <div class="info-meta">
              <span>作者：{{ detail.ownerName }}</span>
              <span>文章数：{{ detail.articleCount }}</span>
              <span>可见性：{{ visibilityLabel }}</span>
            </div>
          </div>
        </div>

        <div class="articles-section">
          <div class="section-title">文章列表</div>
          <div v-if="detail?.articles?.length" class="article-list">
            <div v-for="article in detail.articles" :key="article.id" class="article-row">
              <span class="article-index">{{ article.seqNo }}</span>
              <span class="article-title" @click="goArticle(article.id)">
                {{ article.title }}
              </span>
              <span class="article-date">{{ article.publishTime ?? '--' }}</span>
              <el-button type="primary" link size="small" @click="goArticle(article.id)">
                查看
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleRemoveArticle(article.id, article.title)"
              >
                移除
              </el-button>
            </div>
          </div>
          <el-empty v-else description="暂无文章" :image-size="64" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script lang="ts" setup>
/**
 * 系列详情页面
 * @description 展示系列的封面、描述、文章列表，支持编辑和删除
 * @module front/series/SeriesDetail
 * @see ../../api/content.ts
 */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import { useUserContentStore } from '@/stores'
import type { ArticleSeriesArticleVO } from '@/types/api-types'

const route = useRoute()
const router = useRouter()
const store = useUserContentStore()

const seriesId = Number(route.params.id)

const loading = computed(() => store.seriesLoading)
const detail = computed(() => store.currentSeries)

// 系列可见性标签文字
const visibilityLabel = computed(() => {
  if (!detail.value) return ''
  const map: Record<number, string> = {
    0: '私密',
    1: '公开',
    2: '仅粉丝',
  }
  return map[detail.value.visibilityScope] ?? '未知'
})

function goArticle(articleId: number): void {
  router.push('/articles/' + articleId)
}

async function handleDelete(): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该系列吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const ok = await store.deleteSeries(seriesId)
    if (ok) {
      ElMessage.success('删除成功')
      router.push('/series')
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleRemoveArticle(articleId: number, articleTitle: string): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要将文章「${articleTitle}」从系列中移除吗？`, '移除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const ok = await store.removeArticleFromSeries(seriesId, articleId)
    if (ok) {
      ElMessage.success('已移除')
      // Re-fetch to update article list
      await store.fetchMySeriesDetail(seriesId)
    } else {
      ElMessage.error('移除失败')
    }
  } catch {
    // user cancelled
  }
}

onMounted(() => {
  store.fetchMySeriesDetail(seriesId)
})
</script>

<style scoped>
.series-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--el-color-primary);
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.series-info-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 24px;
  background: var(--color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.info-cover {
  width: 160px;
  height: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.info-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.info-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.articles-section {
  padding: 20px;
  background: var(--color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.article-list {
  display: flex;
  flex-direction: column;
}

.article-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.article-row:last-child {
  border-bottom: none;
}

.article-index {
  width: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.article-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s;
}

.article-title:hover {
  color: var(--el-color-primary);
}

.article-date {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
