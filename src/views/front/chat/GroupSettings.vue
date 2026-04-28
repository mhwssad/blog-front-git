<template>
  <div class="group-settings-page">
    <div class="page-header">
      <h2 class="page-title">群设置</h2>
      <el-button type="primary" @click="handleSave">保存设置</el-button>
    </div>

    <div class="settings-section">
      <h3 class="section-title">基本信息</h3>
      <el-form label-width="100px" style="max-width: 600px">
        <el-form-item label="群名称">
          <el-input v-model="form.name" placeholder="请输入群名称" />
        </el-form-item>
        <el-form-item label="群公告">
          <el-input
            v-model="form.announcement"
            type="textarea"
            :rows="3"
            placeholder="请输入群公告"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section">
      <h3 class="section-title">群类型与权限</h3>
      <el-form label-width="100px" style="max-width: 600px">
        <el-form-item label="群类型">
          <el-radio-group v-model="form.groupType">
            <el-radio value="public">公开群</el-radio>
            <el-radio value="private">私有群</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入群方式">
          <el-radio-group v-model="form.joinType">
            <el-radio value="direct">直接加入</el-radio>
            <el-radio value="approval">审批后加入</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section">
      <h3 class="section-title">群管理</h3>
      <div class="admin-list">
        <div
          v-for="admin in admins"
          :key="admin.id"
          class="admin-item"
        >
          <span class="admin-name">{{ admin.username }}</span>
          <el-tag size="small" :type="admin.role === 'creator' ? 'danger' : 'warning'">
            {{ admin.role === 'creator' ? '创建者' : '管理员' }}
          </el-tag>
          <el-button
            v-if="admin.role !== 'creator'"
            size="small"
            type="danger"
            link
            @click="removeAdmin(admin.id)"
          >
            移除
          </el-button>
        </div>
      </div>
      <el-button type="primary" link style="margin-top: 12px" @click="handleAddAdmin">
        添加管理员
      </el-button>
    </div>

    <div class="settings-section danger-section">
      <h3 class="section-title">危险操作</h3>
      <el-popconfirm title="确定要解散群聊吗？此操作不可恢复。" @confirm="handleDissolve">
        <template #reference>
          <el-button type="danger">解散群聊</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const groupId = Number(route.params.id)

const form = reactive({
  name: '前端技术交流群',
  announcement: '欢迎大家加入，请友善交流。',
  groupType: 'public' as 'public' | 'private',
  joinType: 'direct' as 'direct' | 'approval',
})

interface Admin {
  id: number
  username: string
  role: 'creator' | 'admin'
}

const admins = ref<Admin[]>([
  { id: 1, username: '张三', role: 'creator' },
  { id: 2, username: '李四', role: 'admin' },
  { id: 3, username: '王五', role: 'admin' },
])

function handleSave(): void {
  ElMessage.success('设置已保存')
}

function removeAdmin(id: number): void {
  admins.value = admins.value.filter((a) => a.id !== id)
  ElMessage.success('已移除管理员')
}

function handleAddAdmin(): void {
  ElMessage.info('添加管理员功能开发中')
}

function handleDissolve(): void {
  ElMessage.success('群聊已解散')
  router.back()
}

onMounted(() => {
  void groupId
})
</script>

<style scoped>
.group-settings-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-name {
  font-size: 14px;
  min-width: 80px;
}

.danger-section {
  border-bottom: none;
}
</style>
