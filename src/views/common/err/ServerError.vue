<template>
  <div class="error-shell">
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <div class="error-body">
      <section class="error-copy">
        <p class="error-code">500</p>
        <h1 class="error-heading">服务器开小差了</h1>
        <p class="error-text">服务器遇到了内部错误，无法完成您的请求。请稍后重试，或联系管理员。</p>
        <div class="error-actions">
          <button class="action-primary" @click="router.push('/')">返回首页</button>
          <button class="action-secondary" @click="router.back()">返回上页</button>
        </div>
      </section>

      <aside class="error-panel">
        <div class="panel-card">
          <h3 class="panel-title">您可以尝试</h3>
          <ul class="panel-list">
            <li>刷新页面后重试</li>
            <li>清除浏览器缓存</li>
            <li>检查网络连接</li>
            <li>稍后再访问</li>
          </ul>
        </div>
        <div class="panel-grid">
          <div class="panel-cell">
            <div class="cell-value">500</div>
            <div class="cell-label">状态码</div>
          </div>
          <div class="panel-cell">
            <div class="cell-value">{{ time }}</div>
            <div class="cell-label">发生时间</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 500 服务器错误页面
 * @description 服务器发生内部错误时显示，提供返回首页和上一页操作
 * @module common/err/ServerError
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 错误发生时间（格式：HH:mm）
const time = ref('')

// 挂载时记录当前时间
onMounted(() => {
  const now = new Date()
  // 补零格式化小时和分钟
  time.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})
</script>

<style scoped>
.error-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, rgba(249, 115, 22, 0.06) 0%, transparent 50%),
    linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.glow-left {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -80px;
  background: rgba(14, 165, 233, 0.12);
}

.glow-right {
  width: 350px;
  height: 350px;
  bottom: -80px;
  right: -60px;
  background: rgba(249, 115, 22, 0.1);
}

.error-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  max-width: 1120px;
  width: 100%;
  padding: 48px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  border-radius: 28px;
  box-shadow: 0 8px 40px rgba(15, 23, 42, 0.08);
}

.error-code {
  margin: 0 0 8px;
  font-size: 80px;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.error-heading {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.error-text {
  margin: 0 0 32px;
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
}

.error-actions {
  display: flex;
  gap: 12px;
}

.action-primary {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.action-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 78, 216, 0.3);
}

.action-secondary {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 500;
  color: #475569;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-secondary:hover {
  transform: translateY(-2px);
}

.error-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-card {
  padding: 24px;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  border-radius: 20px;
  color: #fff;
}

.panel-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.panel-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  opacity: 0.9;
}

.panel-list li::before {
  content: '→ ';
  opacity: 0.7;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.panel-cell {
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  text-align: center;
}

.cell-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.cell-label {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 900px) {
  .error-body {
    grid-template-columns: 1fr;
    padding: 32px 24px;
  }
}

@media (max-width: 640px) {
  .error-shell {
    padding: 24px 16px;
  }

  .error-body {
    padding: 24px 16px;
  }

  .error-code {
    font-size: 56px;
  }

  .error-heading {
    font-size: 22px;
  }

  .error-actions {
    flex-direction: column;
  }
}
</style>
