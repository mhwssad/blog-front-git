<template>
  <el-alert
    v-if="userLevel < requiredLevel"
    :title="`${feature}需要 Lv.${requiredLevel}，你当前 Lv.${userLevel}`"
    type="warning"
    :closable="false"
    show-icon
  />
</template>

<script lang="ts" setup>
interface Props {
  requiredLevel: number
  userLevel: number
  feature: string
}

defineProps<Props>()
</script>
