<template>
  <div class="report-list-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="对象类型">
          <el-select v-model="query.targetType" placeholder="全部" clearable style="width: 140px">
            <el-option label="文章" value="article" />
            <el-option label="评论" value="comment" />
            <el-option label="消息" value="message" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
            <el-option label="已驳回" value="dismissed" />
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
          <span>举报列表</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="targetType" label="对象类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ targetTypeLabel(row.targetType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="对象ID" min-width="100" align="center" />
        <el-table-column prop="reporter" label="举报人" min-width="120" align="center" />
        <el-table-column prop="reason" label="原因" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportTime" label="举报时间" min-width="180" align="center" />
        <el-table-column label="操作" min-width="100" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending' || row.status === 'processing'"
              link
              type="primary"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button v-else link type="primary" @click="handleView(row)">查看</el-button>
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

    <el-dialog v-model="processDialogVisible" :title="isViewMode ? '举报详情' : '处理举报'" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="举报人">{{ currentRow.reporter }}</el-descriptions-item>
        <el-descriptions-item label="举报时间">{{ currentRow.reportTime }}</el-descriptions-item>
        <el-descriptions-item label="对象类型">{{ targetTypeLabel(currentRow.targetType) }}</el-descriptions-item>
        <el-descriptions-item label="对象ID">{{ currentRow.targetId }}</el-descriptions-item>
        <el-descriptions-item label="举报原因" :span="2">{{ currentRow.reason }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 16px">
        <div style="font-weight: 500; margin-bottom: 8px">被举报内容</div>
        <div class="content-preview">{{ currentRow.targetContent }}</div>
      </div>
      <div v-if="!isViewMode" style="margin-top: 16px">
        <el-form label-width="100px">
          <el-form-item label="处理结果">
            <el-radio-group v-model="processForm.result">
              <el-radio value="delete_content">删除内容</el-radio>
              <el-radio value="mute_user">禁言用户</el-radio>
              <el-radio value="ban_account">封禁账号</el-radio>
              <el-radio value="log_only">仅记录</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="processForm.remark" type="textarea" :rows="3" placeholder="请输入处理备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="processDialogVisible = false">关闭</el-button>
        <el-button v-if="!isViewMode" type="primary" @click="confirmProcess">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Report {
  id: number
  targetType: 'article' | 'comment' | 'message'
  targetId: number
  reporter: string
  reason: string
  status: 'pending' | 'processing' | 'resolved' | 'dismissed'
  reportTime: string
  targetContent: string
}

const query = reactive({
  targetType: '' as string,
  status: '' as string,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<Report[]>([])
const loading = ref(false)
const processDialogVisible = ref(false)
const isViewMode = ref(false)
const currentRow = ref<Report>({} as Report)

const processForm = reactive({
  result: 'delete_content',
  remark: '',
})

function targetTypeLabel(type: string) {
  const map: Record<string, string> = { article: '文章', comment: '评论', message: '消息' }
  return map[type] || type
}

function statusTagType(status: string): 'info' | 'warning' | 'success' | 'danger' | 'primary' {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'primary'> = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success',
    dismissed: 'info',
  }
  return map[status] || 'info'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理',
    dismissed: '已驳回',
  }
  return map[status] || status
}

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, targetType: 'article', targetId: 101, reporter: '用户A', reason: '文章内容涉嫌抄袭', status: 'pending', reportTime: '2026-04-20 10:00:00', targetContent: '这是被举报的文章内容，涉嫌抄袭...' },
      { id: 2, targetType: 'comment', targetId: 205, reporter: '用户B', reason: '评论包含人身攻击', status: 'processing', reportTime: '2026-04-19 14:30:00', targetContent: '这条评论包含攻击性语言...' },
      { id: 3, targetType: 'message', targetId: 302, reporter: '用户C', reason: '发送垃圾广告', status: 'resolved', reportTime: '2026-04-18 09:15:00', targetContent: '这是垃圾广告消息内容...' },
      { id: 4, targetType: 'article', targetId: 108, reporter: '用户D', reason: '文章包含虚假信息', status: 'dismissed', reportTime: '2026-04-17 16:20:00', targetContent: '这篇文章的内容经过核实...' },
      { id: 5, targetType: 'comment', targetId: 210, reporter: '用户E', reason: '恶意刷屏', status: 'pending', reportTime: '2026-04-16 11:45:00', targetContent: '该用户在短时间内发送了大量重复评论...' },
    ]
    pagination.total = 5
    loading.value = false
  }, 300)
}

function handleReset() {
  query.targetType = ''
  query.status = ''
  pagination.current = 1
  handleQuery()
}

function handleProcess(row: Report) {
  currentRow.value = { ...row }
  isViewMode.value = false
  processForm.result = 'delete_content'
  processForm.remark = ''
  processDialogVisible.value = true
}

function handleView(row: Report) {
  currentRow.value = { ...row }
  isViewMode.value = true
  processDialogVisible.value = true
}

function confirmProcess() {
  const target = tableData.value.find((item) => item.id === currentRow.value.id)
  if (target) {
    target.status = 'resolved'
  }
  processDialogVisible.value = false
  ElMessage.success('处理完成')
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.report-list-page {
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

.content-preview {
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}
</style>
