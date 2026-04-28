<template>
  <div class="user-level-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="query.level" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="lv in 10" :key="lv" :label="`Lv.${lv}`" :value="lv" />
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
          <span>用户等级列表</span>
          <div>
            <el-button type="success" @click="handleExport">导出</el-button>
            <el-button type="warning" @click="ruleDialogVisible = true">配置规则</el-button>
          </div>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="username" label="用户" min-width="120" align="center" />
        <el-table-column prop="level" label="当前等级" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :color="levelColor(row.level)" effect="dark" style="border: none">
              Lv.{{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="experience" label="经验值" min-width="120" align="center" />
        <el-table-column label="升级来源" min-width="200" align="center">
          <template #default="{ row }">
            <div class="progress-group">
              <div class="progress-item">
                <span class="progress-label">发文</span>
                <el-progress :percentage="row.articlePercent" :color="'#409eff'" :stroke-width="8" />
              </div>
              <div class="progress-item">
                <span class="progress-label">互动</span>
                <el-progress :percentage="row.interactPercent" :color="'#67c23a'" :stroke-width="8" />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAdjust(row)">调整等级</el-button>
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

    <el-dialog v-model="adjustDialogVisible" title="调整等级" width="440px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ adjustTarget.username }}</span>
        </el-form-item>
        <el-form-item label="当前等级">
          <el-tag>Lv.{{ adjustTarget.level }}</el-tag>
        </el-form-item>
        <el-form-item label="新等级">
          <el-select v-model="adjustForm.newLevel" placeholder="请选择等级" style="width: 100%">
            <el-option v-for="lv in 10" :key="lv" :label="`Lv.${lv}`" :value="lv" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="adjustForm.remark" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdjust">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ruleDialogVisible" title="配置等级规则" width="560px">
      <el-form label-width="120px">
        <el-divider content-position="left">经验来源权重</el-divider>
        <el-form-item label="发文经验">
          <el-input-number v-model="ruleForm.articleWeight" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="互动经验">
          <el-input-number v-model="ruleForm.interactWeight" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="登录经验">
          <el-input-number v-model="ruleForm.loginWeight" :min="0" :max="100" />
        </el-form-item>
        <el-divider content-position="left">每日上限</el-divider>
        <el-form-item label="每日经验上限">
          <el-input-number v-model="ruleForm.dailyLimit" :min="0" :max="10000" />
        </el-form-item>
        <el-form-item label="单次互动上限">
          <el-input-number v-model="ruleForm.singleInteractLimit" :min="0" :max="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRules">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface UserLevel {
  id: number
  username: string
  level: number
  experience: number
  articlePercent: number
  interactPercent: number
}

const query = reactive({
  username: '',
  level: '' as number | string,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<UserLevel[]>([])
const loading = ref(false)
const adjustDialogVisible = ref(false)
const ruleDialogVisible = ref(false)

const adjustTarget = ref<UserLevel>({} as UserLevel)
const adjustForm = reactive({
  newLevel: 1,
  remark: '',
})

const ruleForm = reactive({
  articleWeight: 30,
  interactWeight: 40,
  loginWeight: 30,
  dailyLimit: 500,
  singleInteractLimit: 50,
})

function levelColor(level: number) {
  const colors = [
    '#909399', '#67c23a', '#409eff', '#e6a23c', '#f56c6c',
    '#9b59b6', '#1abc9c', '#e74c3c', '#8e44ad', '#c0392b',
  ]
  return colors[Math.min(level - 1, 9)]
}

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, username: '张三', level: 5, experience: 3200, articlePercent: 60, interactPercent: 40 },
      { id: 2, username: '李四', level: 8, experience: 8900, articlePercent: 70, interactPercent: 80 },
      { id: 3, username: '王五', level: 2, experience: 600, articlePercent: 20, interactPercent: 30 },
      { id: 4, username: '赵六', level: 10, experience: 15000, articlePercent: 90, interactPercent: 95 },
      { id: 5, username: '孙七', level: 3, experience: 1200, articlePercent: 35, interactPercent: 50 },
    ]
    pagination.total = 5
    loading.value = false
  }, 300)
}

function handleReset() {
  query.username = ''
  query.level = ''
  pagination.current = 1
  handleQuery()
}

function handleExport() {
  ElMessage.success('导出功能开发中')
}

function handleAdjust(row: UserLevel) {
  adjustTarget.value = { ...row }
  adjustForm.newLevel = row.level
  adjustForm.remark = ''
  adjustDialogVisible.value = true
}

function confirmAdjust() {
  adjustTarget.value.level = adjustForm.newLevel
  const target = tableData.value.find((item) => item.id === adjustTarget.value.id)
  if (target) {
    target.level = adjustForm.newLevel
  }
  adjustDialogVisible.value = false
  ElMessage.success('等级调整成功')
}

function saveRules() {
  ruleDialogVisible.value = false
  ElMessage.success('规则保存成功')
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.user-level-page {
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

.progress-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-label {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  width: 30px;
}

.progress-item :deep(.el-progress) {
  flex: 1;
}
</style>
