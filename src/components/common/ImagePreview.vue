<script lang="ts" setup>
const props = withDefaults(defineProps<{
  src?: string
  previewSrcList?: string[]
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  width?: number
  height?: number
  lazy?: boolean
}>(), {
  fit: 'cover',
  width: 60,
  height: 60,
  lazy: true,
})

const srcList = computed(() => props.previewSrcList || (props.src ? [props.src] : []))
</script>

<template>
  <el-image
    :src="src"
    :preview-src-list="srcList"
    :fit="fit"
    :style="{ width: `${width}px`, height: `${height}px` }"
    :lazy="lazy"
    class="image-preview"
  />
</template>

<style scoped>
.image-preview {
  border-radius: var(--el-border-radius-base);
  flex-shrink: 0;
}
</style>
