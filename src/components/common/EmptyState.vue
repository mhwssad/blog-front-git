<script lang="ts" setup>
withDefaults(defineProps<{
  description?: string
  imageSize?: number
}>(), {
  description: '暂无数据',
  imageSize: 100,
})
</script>

<template>
  <el-empty :description="description" :image-size="imageSize">
    <slot />
  </el-empty>
</template>
