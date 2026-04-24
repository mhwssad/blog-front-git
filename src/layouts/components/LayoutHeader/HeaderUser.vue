<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="user-wrapper">
      <el-avatar :size="32" :src="currentUser?.avatar">
        <el-icon><UserFilled /></el-icon>
      </el-avatar>
      <span class="user-name">{{ currentUser?.nickname || currentUser?.username }}</span>
      <el-icon class="dropdown-icon">
        <ArrowDown />
      </el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const currentUser = computed(() => authStore.currentUser)

// 处理下拉菜单命令
async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.user-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
}

.user-wrapper:hover {
  background-color: var(--color-gray-100);
}

.user-name {
  max-width: 120px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  transition: transform 0.3s;
}

.user-wrapper:hover .dropdown-icon {
  transform: rotate(180deg);
}

.el-dropdown-menu :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.el-dropdown-menu :deep(.el-icon) {
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }

  .dropdown-icon {
    display: none;
  }
}
</style>
