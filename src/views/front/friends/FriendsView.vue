<template>
  <div class="friends-page">
    <div class="page-header">
      <h1 class="page-title">友情链接</h1>
      <p class="page-desc">精选优质博客与网站推荐</p>
    </div>

    <div class="friends-grid">
      <el-card v-for="friend in friends" :key="friend.name" shadow="hover" class="friend-card">
        <div class="friend-content">
          <el-avatar :size="48" :src="friend.avatar">{{ friend.name[0] }}</el-avatar>
          <div class="friend-info">
            <div class="friend-name">{{ friend.name }}</div>
            <div class="friend-desc">{{ friend.desc }}</div>
          </div>
          <el-button type="primary" text @click="visitLink(friend.url)">
            访问
          </el-button>
        </div>
      </el-card>
    </div>

    <el-card shadow="never" class="apply-section">
      <h2 class="apply-title">申请友链</h2>
      <p class="apply-desc">
        如果您希望与本站交换友链，请通过以下方式联系站长：
      </p>
      <ul class="apply-list">
        <li>在评论区留言您的站点信息</li>
        <li>通过邮箱 admin@blog.com 联系</li>
        <li>在 GitHub 提交 Issue</li>
      </ul>
      <div class="apply-require">
        <h3 class="require-title">友链要求</h3>
        <el-tag v-for="req in requirements" :key="req" size="small" class="require-tag">{{ req }}</el-tag>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
const friends = [
  { name: '阮一峰的博客', desc: '科技爱好者周刊，分享技术与思想', url: 'https://www.ruanyifeng.com', avatar: '' },
  { name: '张鑫旭博客', desc: '专注前端技术，CSS 大神', url: 'https://www.zhangxinxu.com', avatar: '' },
  { name: '酷壳 CoolShell', desc: '陈皓的技术博客，编程艺术', url: 'https://coolshell.cn', avatar: '' },
  { name: '前端早读课', desc: '前端技术分享，每日更新', url: 'https://mp.weixin.qq.com', avatar: '' },
  { name: 'GitHub Trending', desc: '开源项目趋势，发现好项目', url: 'https://github.com/trending', avatar: '' },
  { name: 'V2EX', desc: '创意工作者社区', url: 'https://www.v2ex.com', avatar: '' },
]

const requirements = ['内容优质', '持续更新', '无违法内容', '友情互链']

function visitLink(url: string): void {
  window.open(url, '_blank')
}
</script>

<style scoped>
.friends-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.page-desc {
  margin: 0;
  font-size: 15px;
  color: var(--el-text-color-secondary);
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.friend-card {
  border-radius: 12px;
}

.friend-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.friend-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.apply-section {
  border-radius: 12px;
}

.apply-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.apply-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.apply-list {
  margin: 0 0 20px;
  padding-left: 20px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 2;
}

.require-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 500;
}

.require-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
