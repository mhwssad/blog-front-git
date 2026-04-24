<template>
  <div class="header-breadcrumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="item.path"
        :to="index === breadcrumbList.length - 1 ? '' : item.path"
      >
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <component :is="getIconComponent(item.icon)" />
        </el-icon>
        <span class="breadcrumb-title">{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IconUtils } from '@/utils/iconUtils'

interface BreadcrumbItem {
  path: string
  title: string
  icon?: string
}

const route = useRoute()

function getIconComponent(iconName: string) {
  return IconUtils.getIcon(iconName)
}

const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  const list: BreadcrumbItem[] = []

  matched.forEach((item, index) => {
    if (index === matched.length - 1 && item.redirect) {
      return
    }

    list.push({
      path: item.path,
      title: (item.meta?.title as string) || '未知',
      icon: item.meta?.icon as string
    })
  })

  if (list.length === 0) {
    list.push({
      path: '/admin',
      title: '首页',
      icon: 'Home'
    })
  }

  return list
})
</script>

<style scoped>
.header-breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb-icon {
  margin-right: var(--spacing-xs);
  font-size: var(--font-size-sm);
  vertical-align: middle;
}

.breadcrumb-title {
  font-weight: 500;
}

@media (max-width: 640px) {
  .header-breadcrumb {
    display: none;
  }
}
</style>
