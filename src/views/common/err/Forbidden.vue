<script setup lang="ts">
/**
 * 403 无权限页面
 * @description 用户已登录但缺乏访问当前资源的权限时显示
 * @module common/err/Forbidden
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { getFirstAccessibleMenuPath } from '@/router/menu'

const router = useRouter()
const authStore = useAuthStore()

// 根据登录状态确定主导航目标
/**
 * 主导航目标路径
 * @description 已登录用户跳转工作台，未登录用户跳转登录页
 */
const primaryTarget = computed(() => {
  if (!authStore.isLoggedIn) {
    return '/login'
  }

  // 获取用户有权访问的第一个菜单路径
  return getFirstAccessibleMenuPath(authStore.userMenus) ?? '/'
})

/**
 * 跳转到主导航目标
 */
function goPrimary(): void {
  void router.replace(primaryTarget.value)
}

/**
 * 回到首页
 */
function goHome(): void {
  void router.replace('/')
}
</script>

<template>
  <section class="error-page error-page-403">
    <div class="mesh mesh-one"></div>
    <div class="mesh mesh-two"></div>

    <div class="error-shell">
      <div class="error-panel">
        <div class="panel-topline">403 / Access Denied</div>
        <div class="panel-code">403</div>
        <div class="panel-lock">
          <span class="lock-ring"></span>
          <span class="lock-body"></span>
        </div>
      </div>

      <div class="error-copy">
        <span class="error-badge">Permission Block</span>
        <h1 class="error-title">你已到达页面入口，但没有进入权限。</h1>
        <p class="error-description">
          当前账号缺少访问该资源所需的菜单或权限标识。系统已拦截这次访问，避免未授权进入后台模块。
        </p>

        <div class="hint-card">
          <div class="hint-title">排查方向</div>
          <p>确认当前账号角色、菜单授权，以及接口返回的 `current-user-menus` 是否包含当前路由。</p>
        </div>

        <div class="error-actions">
          <button class="action-button action-primary" @click="goPrimary">
            {{ authStore.isLoggedIn ? '返回工作台' : '前往登录' }}
          </button>
          <button class="action-button action-secondary" @click="goHome">回到首页</button>
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
    radial-gradient(circle at 20% 20%, rgba(248, 113, 113, 0.18), transparent 24%),
    radial-gradient(circle at 82% 76%, rgba(251, 191, 36, 0.18), transparent 28%),
    linear-gradient(135deg, #fff7ed 0%, #fff1f2 48%, #f8fafc 100%);
}

.mesh {
  position: absolute;
  border-radius: 999px;
  opacity: 0.5;
  filter: blur(16px);
}

.mesh-one {
  top: -120px;
  right: -80px;
  width: 280px;
  height: 280px;
  background: rgba(251, 146, 60, 0.22);
}

.mesh-two {
  left: -100px;
  bottom: -120px;
  width: 320px;
  height: 320px;
  background: rgba(248, 113, 113, 0.18);
}

.error-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 24px;
  width: min(1080px, 100%);
}

.error-panel,
.error-copy {
  padding: 34px;
  border: 1px solid rgba(251, 146, 60, 0.18);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 26px 72px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.panel-topline {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c2410c;
}

.panel-code {
  margin-top: 18px;
  font-size: clamp(88px, 16vw, 156px);
  line-height: 0.9;
  font-weight: 800;
  color: #7c2d12;
}

.panel-lock {
  position: relative;
  width: 120px;
  height: 128px;
  margin-top: 24px;
}

.lock-ring {
  position: absolute;
  top: 0;
  left: 28px;
  width: 64px;
  height: 64px;
  border: 12px solid #f59e0b;
  border-bottom: none;
  border-radius: 64px 64px 0 0;
}

.lock-body {
  position: absolute;
  bottom: 0;
  width: 120px;
  height: 82px;
  border-radius: 22px;
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
  box-shadow: inset 0 -10px 18px rgba(124, 45, 18, 0.16);
}

.error-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.error-title {
  margin-top: 22px;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.08;
  font-weight: 700;
  color: #111827;
}

.error-description {
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.8;
  color: #4b5563;
}

.hint-card {
  margin-top: 24px;
  padding: 18px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.14), rgba(251, 113, 133, 0.1));
}

.hint-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9a3412;
}

.hint-card p {
  margin-top: 10px;
  color: #7c2d12;
  line-height: 1.7;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.action-button {
  min-width: 150px;
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
  background: linear-gradient(135deg, #ea580c 0%, #b91c1c 100%);
  box-shadow: 0 14px 32px rgba(185, 28, 28, 0.18);
  color: #fff;
}

.action-secondary {
  border-color: rgba(251, 146, 60, 0.28);
  background: rgba(255, 255, 255, 0.88);
  color: #7c2d12;
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

  .error-panel,
  .error-copy {
    padding: 24px;
    border-radius: 24px;
  }

  .error-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
