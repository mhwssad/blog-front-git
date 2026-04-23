<template>
  <div class="forbidden-page">
    <el-result
      icon="warning"
      title="403"
      sub-title="当前账号没有访问该页面的权限"
    >
      <template #extra>
        <el-button type="primary" @click="router.push('/admin')">
          返回首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.forbidden-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}
</style>
