<template>
  <div class="series-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="系列名">
          <el-input v-model="query.name" placeholder="请输入系列名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="query.author" placeholder="请输入作者" clearable style="width: 200px" />
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
          <span>系列列表</span>
          <el-button type="primary" @click="handleAdd">新增系列</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="系列名" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" min-width="120" align="center" />
        <el-table-column prop="articleCount" label="文章数" min-width="100" align="center" />
        <el-table-column prop="totalRead" label="总阅读" min-width="100" align="center" />
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

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑系列' : '新增系列'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="系列名">
          <el-input v-model="formData.name" placeholder="请输入系列名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入系列描述" />
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

interface Series {
  id: number
  name: string
  author: string
  articleCount: number
  totalRead: number
  createTime: string
  description: string
}

const query = reactive({
  name: '',
  author: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<Series[]>([])
const loading = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const formData = reactive({
  name: '',
  description: '',
})

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: 'Vue 3 全栈开发', author: '张三', articleCount: 12, totalRead: 8500, createTime: '2026-01-10 09:00:00', description: '从零到一掌握 Vue 3 全栈开发' },
      { id: 2, name: 'Spring Boot 实战', author: '李四', articleCount: 8, totalRead: 6200, createTime: '2026-02-05 14:30:00', description: 'Spring Boot 企业级开发实战' },
      { id: 3, name: '算法与数据结构', author: '王五', articleCount: 15, totalRead: 12000, createTime: '2026-03-12 10:15:00', description: '常见算法与数据结构详解' },
      { id: 4, name: 'DevOps 工具链', author: '赵六', articleCount: 6, totalRead: 3800, createTime: '2026-04-01 16:00:00', description: 'CI/CD、容器化、监控一体化实践' },
    ]
    pagination.total = 4
    loading.value = false
  }, 300)
}

function handleReset() {
  query.name = ''
  query.author = ''
  pagination.current = 1
  handleQuery()
}

function handleAdd() {
  isEdit.value = false
  editingId.value = null
  formData.name = ''
  formData.description = ''
  formDialogVisible.value = true
}

function handleEdit(row: Series) {
  isEdit.value = true
  editingId.value = row.id
  formData.name = row.name
  formData.description = row.description
  formDialogVisible.value = true
}

function handleSubmit() {
  if (isEdit.value && editingId.value) {
    const target = tableData.value.find((item) => item.id === editingId.value)
    if (target) {
      target.name = formData.name
      target.description = formData.description
    }
    ElMessage.success('编辑成功')
  } else {
    tableData.value.push({
      id: Date.now(),
      name: formData.name,
      author: '当前用户',
      articleCount: 0,
      totalRead: 0,
      createTime: new Date().toLocaleString(),
      description: formData.description,
    })
    pagination.total = tableData.value.length
    ElMessage.success('新增成功')
  }
  formDialogVisible.value = false
}

function handleDelete(row: Series) {
  ElMessageBox.confirm(`确定要删除系列 "${row.name}" 吗？`, '提示', {
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
.series-management-page {
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
