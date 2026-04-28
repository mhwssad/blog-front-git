<template>
  <div class="audit-log-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="操作人">
          <el-input v-model="query.operator" placeholder="请输入操作人" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="query.operationType" placeholder="全部" clearable style="width: 160px">
            <el-option label="用户管理" value="user" />
            <el-option label="内容管理" value="content" />
            <el-option label="系统配置" value="config" />
            <el-option label="安全管理" value="security" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
          <span>审计日志</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="time" label="时间" min-width="180" align="center" />
        <el-table-column prop="operator" label="操作人" min-width="120" align="center" />
        <el-table-column prop="operationType" label="操作类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ operationTypeLabel(row.operationType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="280" align="center" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" min-width="140" align="center" />
        <el-table-column prop="result" label="结果" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'

interface AuditLog {
  id: number
  time: string
  operator: string
  operationType: 'user' | 'content' | 'config' | 'security'
  description: string
  ip: string
  result: 'success' | 'failure'
}

const query = reactive({
  operator: '',
  operationType: '' as string,
  dateRange: null as [string, string] | null,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<AuditLog[]>([])
const loading = ref(false)

function operationTypeLabel(type: string) {
  const map: Record<string, string> = { user: '用户管理', content: '内容管理', config: '系统配置', security: '安全管理' }
  return map[type] || type
}

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, time: '2026-04-28 10:30:00', operator: 'admin', operationType: 'user', description: '修改用户 张三 的状态为禁用', ip: '192.168.1.100', result: 'success' },
      { id: 2, time: '2026-04-28 10:15:00', operator: 'admin', operationType: 'content', description: '审核通过文章《Vue 3 最佳实践》', ip: '192.168.1.100', result: 'success' },
      { id: 3, time: '2026-04-28 09:45:00', operator: 'root', operationType: 'config', description: '修改系统配置：开启注册功能', ip: '192.168.1.1', result: 'success' },
      { id: 4, time: '2026-04-28 09:30:00', operator: 'admin', operationType: 'security', description: '封禁用户 李四 的账号', ip: '192.168.1.100', result: 'success' },
      { id: 5, time: '2026-04-28 09:00:00', operator: 'admin', operationType: 'content', description: '删除评论 #205（违规内容）', ip: '192.168.1.100', result: 'failure' },
      { id: 6, time: '2026-04-27 17:20:00', operator: 'root', operationType: 'user', description: '重置用户 王五 的密码', ip: '192.168.1.1', result: 'success' },
      { id: 7, time: '2026-04-27 16:00:00', operator: 'admin', operationType: 'config', description: '修改邮件服务器配置', ip: '192.168.1.100', result: 'failure' },
      { id: 8, time: '2026-04-27 14:30:00', operator: 'admin', operationType: 'security', description: '处理举报 #12：删除违规内容', ip: '192.168.1.100', result: 'success' },
      { id: 9, time: '2026-04-27 11:00:00', operator: 'root', operationType: 'user', description: '分配角色 编辑者 给用户 赵六', ip: '192.168.1.1', result: 'success' },
      { id: 10, time: '2026-04-27 09:15:00', operator: 'admin', operationType: 'content', description: '批量审核通过 5 篇文章', ip: '192.168.1.100', result: 'success' },
    ]
    pagination.total = 10
    loading.value = false
  }, 300)
}

function handleReset() {
  query.operator = ''
  query.operationType = ''
  query.dateRange = null
  pagination.current = 1
  handleQuery()
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.audit-log-page {
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
