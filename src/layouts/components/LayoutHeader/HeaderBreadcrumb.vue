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
import { computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import * as ElementPlusIcons from '@element-plus/icons-vue'

interface BreadcrumbItem {
  path: string
  title: string
  icon?: string
}

const route = useRoute()

// 图标名称到组件的映射
const iconMap: Record<string, any> = {
  Home: markRaw(ElementPlusIcons.House),
  User: markRaw(ElementPlusIcons.User),
  Lock: markRaw(ElementPlusIcons.Lock),
  Menu: markRaw(ElementPlusIcons.Menu),
  Setting: markRaw(ElementPlusIcons.Setting),
  Bell: markRaw(ElementPlusIcons.Bell),
  Document: markRaw(ElementPlusIcons.Document),
  Files: markRaw(ElementPlusIcons.Folder),
}

// 获取图标组件
function getIconComponent(iconName: string) {
  return iconMap[iconName] || iconMap.Menu
}

// 面包屑列表
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  const list: BreadcrumbItem[] = []

  matched.forEach((item, index) => {
    // 如果是最后一个且是重定向路由，跳过
    if (index === matched.length - 1 && item.redirect) {
      return
    }

    list.push({
      path: item.path,
      title: (item.meta?.title as string) || '未知',
      icon: item.meta?.icon as string
    })
  })

  // 如果为空，添加首页
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
  margin-right: 4px;
  font-size: 14px;
  vertical-align: middle;
}

.breadcrumb-title {
  font-weight: 500;
}
</style>
