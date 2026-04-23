<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goPrimary(): void {
  void router.replace('/')
}

function goBack(): void {
  const previousPath = window.history.state?.back as string | null | undefined

  if (previousPath && previousPath !== route.fullPath) {
    router.back()
    return
  }

  goPrimary()
}
</script>

<template>
  <section class="error-page error-page-404">
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <div class="error-shell">
      <div class="error-copy">
        <span class="error-badge">404 / Route Missing</span>
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面走丢了，但系统还在线。</h2>
        <p class="error-description">
          当前地址没有匹配到可用页面。可能是链接已变更、地址输入错误，或者页面还没有发布。
        </p>

        <div class="error-actions">
          <button class="action-button action-primary" @click="goPrimary">
            返回首页
          </button>
          <button class="action-button action-secondary" @click="goBack">
            返回上一页
          </button>
        </div>
      </div>

      <div class="error-panel">
        <div class="panel-card">
          <div class="panel-label">建议操作</div>
          <ul class="panel-list">
            <li>检查浏览器地址是否完整。</li>
            <li>如果是旧链接，返回导航重新进入。</li>
            <li>如果问题持续存在，联系管理员核对菜单和路由配置。</li>
          </ul>
        </div>
        <div class="panel-grid">
          <div class="grid-item">
            <strong>URL</strong>
            <span>未匹配</span>
          </div>
          <div class="grid-item">
            <strong>Status</strong>
            <span>Not Found</span>
          </div>
          <div class="grid-item">
            <strong>Mode</strong>
            <span>Client Route</span>
          </div>
          <div class="grid-item">
            <strong>Action</strong>
            <span>Recover</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.error-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.24), transparent 32%),
    radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.18), transparent 28%),
    linear-gradient(145deg, #f8fbff 0%, #edf4ff 46%, #fff7ed 100%);
}

.glow {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(12px);
  opacity: 0.55;
}

.glow-left {
  top: -120px;
  left: -100px;
  background: rgba(56, 189, 248, 0.28);
}

.glow-right {
  right: -120px;
  bottom: -140px;
  background: rgba(251, 146, 60, 0.24);
}

.error-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 420px);
  gap: 24px;
  width: min(1120px, 100%);
}

.error-copy,
.error-panel {
  position: relative;
  padding: 36px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.error-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.error-code {
  margin-top: 24px;
  font-size: clamp(92px, 18vw, 180px);
  line-height: 0.9;
  font-weight: 800;
  letter-spacing: -0.06em;
  color: #0f172a;
}

.error-title {
  margin-top: 20px;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.05;
  font-weight: 700;
  color: #0f172a;
}

.error-description {
  max-width: 560px;
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.8;
  color: #475569;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.action-button {
  min-width: 148px;
  padding: 14px 22px;
  border-radius: 14px;
  border: 1px solid transparent;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-primary {
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  box-shadow: 0 14px 32px rgba(29, 78, 216, 0.24);
  color: #fff;
}

.action-secondary {
  border-color: rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.88);
  color: #0f172a;
}

.panel-card {
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(37, 99, 235, 0.08));
}

.panel-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1d4ed8;
  text-transform: uppercase;
}

.panel-list {
  margin-top: 14px;
  padding-left: 18px;
  color: #334155;
  line-height: 1.8;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.86);
  color: #475569;
}

.grid-item strong {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.grid-item span {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 900px) {
  .error-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .error-page {
    padding: 20px;
  }

  .error-copy,
  .error-panel {
    padding: 24px;
    border-radius: 24px;
  }

  .error-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }

  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
