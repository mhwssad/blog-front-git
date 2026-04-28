<template>
  <div class="channel-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="频道名">
          <el-input v-model="query.name" placeholder="请输入频道名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>频道列表</span>
          <el-button type="primary" @click="handleAdd">新增频道</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="name" label="频道名" min-width="140" align="center" />
        <el-table-column prop="type" label="类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'topic' ? 'info' : 'success'">
              {{ row.type === 'topic' ? '主题' : '大厅' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" min-width="100" align="center" />
        <el-table-column prop="messageCount" label="消息数" min-width="100" align="center" />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" align="center" />
        <el-table-column label="操作" min-width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑频道' : '新增频道'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="频道名">
          <el-input v-model="formData.name" placeholder="请输入频道名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入频道描述" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="主题频道" value="topic" />
            <el-option label="大厅频道" value="hall" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Channel {
  id: number
  name: string
  type: 'topic' | 'hall'
  memberCount: number
  messageCount: number
  status: 'active' | 'disabled'
  createTime: string
  description: string
}

const query = reactive({
  name: '',
  status: '' as string,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<Channel[]>([])
const loading = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const formData = reactive({
  name: '',
  description: '',
  type: 'topic' as 'topic' | 'hall',
})

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '技术交流', type: 'topic', memberCount: 256, messageCount: 3200, status: 'active', createTime: '2026-01-15 10:00:00', description: '技术讨论与分享频道' },
      { id: 2, name: '综合大厅', type: 'hall', memberCount: 1200, messageCount: 15000, status: 'active', createTime: '2026-01-10 08:00:00', description: '综合聊天大厅' },
      { id: 3, name: '前端开发', type: 'topic', memberCount: 180, messageCount: 2100, status: 'active', createTime: '2026-02-20 14:00:00', description: '前端技术交流频道' },
      { id: 4, name: '后端开发', type: 'topic', memberCount: 150, messageCount: 1800, status: 'disabled', createTime: '2026-03-05 09:30:00', description: '后端技术交流频道' },
      { id: 5, name: '新人接待', type: 'hall', memberCount: 800, messageCount: 9500, status: 'active', createTime: '2026-01-12 08:00:00', description: '新用户接待与引导频道' },
    ]
    pagination.total = 5
    loading.value = false
  }, 300)
}

function handleReset() {
  query.name = ''
  query.status = ''
  pagination.current = 1
  handleQuery()
}

function handleAdd() {
  isEdit.value = false
  editingId.value = null
  formData.name = ''
  formData.description = ''
  formData.type = 'topic'
  formDialogVisible.value = true
}

function handleEdit(row: Channel) {
  isEdit.value = true
  editingId.value = row.id
  formData.name = row.name
  formData.description = row.description
  formData.type = row.type
  formDialogVisible.value = true
}

function handleSubmit() {
  if (isEdit.value && editingId.value) {
    const target = tableData.value.find((item) => item.id === editingId.value)
    if (target) {
      target.name = formData.name
      target.description = formData.description
      target.type = formData.type
    }
    ElMessage.success('编辑成功')
  } else {
    tableData.value.push({
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      memberCount: 0,
      messageCount: 0,
      status: 'active',
      createTime: new Date().toLocaleString(),
      description: formData.description,
    })
    pagination.total = tableData.value.length
    ElMessage.success('新增成功')
  }
  formDialogVisible.value = false
}

function handleDelete(row: Channel) {
  ElMessageBox.confirm(`确定要删除频道 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    tableData.value = tableData.value.filter((item) => item.id !== row.id)
    pagination.total = tableData.value.length
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.channel-management-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
