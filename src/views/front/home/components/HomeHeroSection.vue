<template>
  <section class="hero-section">
    <div class="hero-backdrop hero-backdrop-left"></div>
    <div class="hero-backdrop hero-backdrop-right"></div>

    <div class="hero-topbar">
      <div class="brand-block">
        <div class="brand-mark">B</div>
        <div>
          <div class="brand-title">Blog Front</div>
          <div class="brand-subtitle">公开内容首页</div>
        </div>
      </div>

      <div class="topbar-actions">
        <el-button plain size="large" @click="emit('browse')">浏览内容</el-button>
        <el-button type="primary" size="large" @click="emit('entry')">
          {{ isLoggedIn ? '进入后台' : '登录 / 注册' }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="24" class="hero-grid">
      <el-col :xs="24" :lg="15">
        <el-card shadow="never" class="hero-card hero-copy-card">
          <el-space direction="vertical" :size="18" fill>
            <el-tag effect="plain" type="primary" round>Public Content Hub</el-tag>
            <div class="hero-title">把公开文章、分类、标签和评论，落成真实首页。</div>
            <div class="hero-description">
              首页数据直接来自 `content-api.md` 定义的公开接口。你可以按关键字、分类、标签和热度筛选当前内容。
            </div>

            <div class="hero-search">
              <el-input
                v-model="keywordModel"
                size="large"
                clearable
                placeholder="搜索标题或摘要"
                @keyup.enter="emit('search')"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" size="large" :loading="loading" @click="emit('search')">
                搜索内容
              </el-button>
            </div>

            <el-row :gutter="14" class="stats-row">
              <el-col :xs="12" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <el-statistic title="文章总量" :value="articleTotal" />
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <el-statistic title="分类节点" :value="categoryTotal" />
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <el-statistic title="标签数量" :value="tagTotal" />
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <el-statistic title="最新评论" :value="commentTotal" />
                </el-card>
              </el-col>
            </el-row>
          </el-space>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="9">
        <el-card shadow="never" class="hero-card hero-feature-card">
          <template #header>
            <div class="feature-header">
              <el-tag type="warning" effect="light" round>置顶推荐</el-tag>
              <span class="feature-time">{{ featuredArticle?.publishTime || '待发布' }}</span>
            </div>
          </template>

          <template v-if="featuredArticle">
            <div class="feature-title">{{ featuredArticle.title }}</div>
            <div class="feature-summary">
              {{ featuredArticle.summary || '这篇文章没有摘要，点击文章页后可查看完整内容。' }}
            </div>

            <div class="feature-tags">
              <el-tag v-if="featuredArticle.isTop === 1" type="danger" effect="light" round>
                置顶
              </el-tag>
              <el-tag round effect="plain">作者 {{ featuredArticle.authorName }}</el-tag>
              <el-tag round effect="plain">访问等级 {{ featuredArticle.accessLevel }}</el-tag>
            </div>

            <el-row :gutter="12" class="feature-stats">
              <el-col :span="12">
                <div class="feature-stat">
                  <el-icon><View /></el-icon>
                  <span>{{ featuredArticle.viewCount }} 浏览</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="feature-stat">
                  <el-icon><Star /></el-icon>
                  <span>{{ featuredArticle.likeCount }} 点赞</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="feature-stat">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ featuredArticle.commentCount }} 评论</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="feature-stat">
                  <el-icon><CollectionTag /></el-icon>
                  <span>{{ featuredArticle.collectCount }} 收藏</span>
                </div>
              </el-col>
            </el-row>
          </template>

          <el-skeleton v-else animated :rows="6" />
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ChatDotRound, CollectionTag, Search, Star, View } from '@element-plus/icons-vue'
import type { PublicArticleCardVO } from '@/api/types'

interface Props {
  keyword: string
  loading?: boolean
  isLoggedIn?: boolean
  articleTotal: number
  categoryTotal: number
  tagTotal: number
  commentTotal: number
  featuredArticle: PublicArticleCardVO | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isLoggedIn: false,
})

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'search'): void
  (e: 'browse'): void
  (e: 'entry'): void
}>()

const keywordModel = computed({
  get: () => props.keyword,
  set: value => emit('update:keyword', value),
})
</script>

<style scoped>
.hero-section {
  position: relative;
  padding: 32px 32px 16px;
  overflow: hidden;
}

.hero-backdrop {
  position: absolute;
  border-radius: 999px;
  filter: blur(20px);
  opacity: 0.5;
}

.hero-backdrop-left {
  top: -120px;
  left: -80px;
  width: 320px;
  height: 320px;
  background: rgba(59, 130, 246, 0.24);
}

.hero-backdrop-right {
  top: 60px;
  right: -100px;
  width: 360px;
  height: 360px;
  background: rgba(249, 115, 22, 0.18);
}

.hero-topbar,
.hero-grid {
  position: relative;
  z-index: 1;
  width: min(1280px, 100%);
  margin: 0 auto;
}

.hero-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a 0%, #2563eb 100%);
  box-shadow: 0 18px 36px rgba(37, 99, 235, 0.2);
  color: #fff;
  font-size: 24px;
  font-weight: 800;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
}

.brand-subtitle,
.feature-time,
.hero-description {
  color: #64748b;
}

.hero-grid {
  margin-top: 28px;
}

.hero-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(18px);
}

.hero-title {
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.hero-description {
  font-size: 16px;
  line-height: 1.8;
}

.hero-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.stats-row {
  margin-top: 4px;
}

.stat-card {
  border-radius: 20px;
}

.feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feature-title {
  font-size: 30px;
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
}

.feature-summary {
  margin-top: 16px;
  color: #475569;
  line-height: 1.8;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.feature-stats {
  margin-top: 18px;
}

.feature-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  color: #475569;
}

.topbar-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 900px) {
  .hero-section {
    padding-right: 20px;
    padding-left: 20px;
  }

  .hero-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-actions {
    width: 100%;
    flex-direction: column;
  }

  .hero-search {
    grid-template-columns: 1fr;
  }
}
</style>
