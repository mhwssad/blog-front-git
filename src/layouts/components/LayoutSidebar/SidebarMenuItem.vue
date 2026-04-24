<template>
  <el-sub-menu v-if="hasChildren" :index="String(item.id)">
    <template #title>
      <el-icon v-if="item.icon">
        <component :is="getIconComponent(item.icon)" />
      </el-icon>
      <span>{{ item.name }}</span>
    </template>
    <SidebarMenuItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :get-icon-component="getIconComponent"
    />
  </el-sub-menu>
  <el-menu-item v-else :index="menuIndex">
    <el-icon v-if="item.icon">
      <component :is="getIconComponent(item.icon)" />
    </el-icon>
    <template #title>{{ item.name }}</template>
  </el-menu-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { AppMenuInfo } from '@/router/menu'

defineOptions({
  name: 'SidebarMenuItem',
})

interface Props {
  item: AppMenuInfo
  getIconComponent: (iconName: string) => ReturnType<typeof import('@/utils/iconUtils').IconUtils.getIcon>
}

const props = defineProps<Props>()

const hasChildren = computed(() => (props.item.children?.length ?? 0) > 0)
const menuIndex = computed(() => props.item.path || String(props.item.id))
</script>
