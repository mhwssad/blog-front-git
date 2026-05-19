<template>
  <div class="migration-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="来源平台" class="filter-item">
          <el-input
            v-model="searchForm.sourcePlatform"
            class="filter-control"
            clearable
            placeholder="如 wordpress / hexo"
          />
        </el-form-item>
        <el-form-item label="作者 ID" class="filter-item">
          <el-input-number
            v-model="searchForm.authorId"
            :min="1"
            controls-position="right"
            class="filter-control"
            placeholder="归属作者"
          />
        </el-form-item>
        <el-form-item label="任务状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control"
            clearable
            placeholder="全部状态"
          >
            <el-option
              v-for="option in TASK_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:migration:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            v-permission="'content:migration:create'"
            type="success"
            plain
            @click="openCreateDialog"
          >
            创建任务
          </el-button>
          <el-button
            v-permission="'content:migration:query'"
            link
            type="primary"
            @click="refreshTaskList"
          >
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <section class="summary-grid">
      <article class="summary-tile">
        <span class="summary-tile__label">当前页任务</span>
        <strong class="summary-tile__value">{{ migrationStore.tasks.length }}</strong>
      </article>
      <article class="summary-tile">
        <span class="summary-tile__label">待执行任务</span>
        <strong class="summary-tile__value">{{ waitingTaskCount }}</strong>
      </article>
      <article class="summary-tile">
        <span class="summary-tile__label">成功导入文章</span>
        <strong class="summary-tile__value">{{ pageSuccessCount }}</strong>
      </article>
      <article class="summary-tile">
        <span class="summary-tile__label">失败 / 跳过文章</span>
        <strong class="summary-tile__value">{{ pageFailedCount + pageSkippedCount }}</strong>
      </article>
    </section>

    <DataTable
      :data="migrationStore.tasks"
      :loading="migrationStore.loading"
      :total="migrationStore.total"
      :current-page="pagination.current"
      :page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="迁移任务"
      @update:current-page="pagination.current = $event"
      @update:page-size="pagination.size = $event"
      @size-change="handleSizeChange"
      @page-change="handleCurrentChange"
    >
      <template #header-extra>
        <span class="card-header__meta">{{ migrationStore.total }} 条</span>
      </template>

      <el-table-column prop="id" label="任务 ID" min-width="88" align="center" />
      <el-table-column label="来源平台" min-width="130" align="center">
        <template #default="{ row }">
          <el-tag effect="plain">{{ formatSourcePlatform(row.sourcePlatform) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="作者 ID" min-width="96" align="center">
        <template #default="{ row }"> #{{ row.authorId }} </template>
      </el-table-column>
      <el-table-column label="状态" min-width="116" align="center">
        <template #default="{ row }">
          <el-tag :type="getTaskStatusTagType(row.status)" effect="light">
            {{ formatTaskStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="处理进度" min-width="180" align="center">
        <template #default="{ row }">
          <div class="progress-cell">
            <el-progress
              :percentage="calculateTaskProgress(row)"
              :status="row.status === MigrationTaskStatus.FAILED ? 'exception' : undefined"
              :stroke-width="10"
            />
            <span class="progress-cell__meta">
              {{ row.successCount }}/{{ row.totalCount || 0 }} 成功
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalCount" label="总数" min-width="80" align="center" />
      <el-table-column prop="successCount" label="成功" min-width="80" align="center" />
      <el-table-column prop="failedCount" label="失败" min-width="80" align="center" />
      <el-table-column prop="skippedCount" label="跳过" min-width="80" align="center" />
      <el-table-column label="创建时间" min-width="168" align="center">
        <template #default="{ row }">
          {{ formatCreateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        :fixed="isCompactTable ? false : 'right'"
        :min-width="isCompactTable ? 220 : 320"
        align="center"
        class-name="action-column"
      >
        <template #default="{ row }">
          <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
            <el-button
              v-permission="'content:migration:query'"
              link
              type="primary"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-permission="'content:migration:execute'"
              link
              type="warning"
              :disabled="!canPrecheck(row)"
              @click="handlePrecheck(row)"
            >
              预检
            </el-button>
            <el-button
              v-permission="'content:migration:execute'"
              link
              type="success"
              :disabled="!canExecute(row)"
              @click="handleExecute(row)"
            >
              执行
            </el-button>
            <el-button
              v-permission="'content:migration:export'"
              link
              type="danger"
              :disabled="row.failedCount <= 0"
              @click="handleExportFailures(row)"
            >
              导出失败
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog
      v-model="createDialogVisible"
      title="创建迁移任务"
      width="640px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-alert
        title="仅支持 JSON v1 格式，分类编码和标签需提前在系统中存在。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        label-width="88px"
        class="create-form"
      >
        <el-form-item label="作者 ID" prop="authorId">
          <el-input-number
            v-model="createForm.authorId"
            :min="1"
            controls-position="right"
            class="create-form__control"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            maxlength="256"
            show-word-limit
            placeholder="记录迁移来源、批次或导入说明"
          />
        </el-form-item>
        <el-form-item label="迁移文件" prop="fileList">
          <el-upload
            v-model:file-list="createForm.fileList"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".json,application/json"
            class="migration-upload"
            :on-change="handleMigrationFileChange"
            :on-remove="handleMigrationFileRemove"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽 JSON 文件到此处，或<em>点击选择</em></div>
            <template #tip>
              <div class="el-upload__tip">单文件上传，建议先做预检再执行导入。</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <div class="file-preview">
        <template v-if="filePreview.parseError">
          <el-alert :title="filePreview.parseError" type="error" :closable="false" show-icon />
        </template>
        <template v-else-if="selectedFile">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="文件名" :span="2">
              {{ selectedFile.name }}
            </el-descriptions-item>
            <el-descriptions-item label="大小">
              {{ FileUtils.formatFileSize(selectedFile.size) }}
            </el-descriptions-item>
            <el-descriptions-item label="来源平台">
              {{ filePreview.sourcePlatform || '未识别' }}
            </el-descriptions-item>
            <el-descriptions-item label="文章数">
              {{ filePreview.postCount ?? '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </div>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreateTask">
          创建任务
        </el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailVisible"
      title="迁移任务详情"
      size="min(980px, 100vw)"
      destroy-on-close
    >
      <template v-if="migrationStore.currentTask">
        <section class="detail-section">
          <div class="detail-section__header">
            <div>
              <h3 class="detail-section__title">
                任务 #{{ migrationStore.currentTask.id }}
              </h3>
              <p class="detail-section__subtitle">
                {{ formatSourcePlatform(migrationStore.currentTask.sourcePlatform) }} 导入到作者
                #{{ migrationStore.currentTask.authorId }}
              </p>
            </div>
            <div class="detail-section__actions">
              <el-button
                v-permission="'content:migration:execute'"
                type="warning"
                plain
                :disabled="!canPrecheck(migrationStore.currentTask)"
                @click="handlePrecheck(migrationStore.currentTask)"
              >
                执行预检
              </el-button>
              <el-button
                v-permission="'content:migration:execute'"
                type="success"
                :disabled="!canExecute(migrationStore.currentTask)"
                @click="handleExecute(migrationStore.currentTask)"
              >
                执行导入
              </el-button>
              <el-button
                v-permission="'content:migration:export'"
                type="danger"
                plain
                :disabled="migrationStore.currentTask.failedCount <= 0"
                @click="handleExportFailures(migrationStore.currentTask)"
              >
                导出失败
              </el-button>
            </div>
          </div>

          <el-descriptions :column="4" border class="detail-descriptions">
            <el-descriptions-item label="任务状态">
              <el-tag :type="getTaskStatusTagType(migrationStore.currentTask.status)" effect="light">
                {{ formatTaskStatus(migrationStore.currentTask.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总文章数">
              {{ migrationStore.currentTask.totalCount }}
            </el-descriptions-item>
            <el-descriptions-item label="成功数">
              {{ migrationStore.currentTask.successCount }}
            </el-descriptions-item>
            <el-descriptions-item label="失败数">
              {{ migrationStore.currentTask.failedCount }}
            </el-descriptions-item>
            <el-descriptions-item label="跳过数">
              {{ migrationStore.currentTask.skippedCount }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
              {{ formatCreateTime(migrationStore.currentTask.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="成功率">
              {{ formatRatio(migrationStore.currentTask.successCount, migrationStore.currentTask.totalCount) }}
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <div class="detail-section__header">
            <div>
              <h3 class="detail-section__title">预检结果</h3>
              <p class="detail-section__subtitle">预检失败时会返回具体文章错误明细。</p>
            </div>
          </div>

          <template v-if="activePrecheckResult">
            <el-alert
              :title="activePrecheckResult.passed ? '预检通过，可以执行导入。' : '预检未通过，请先修复错误。'"
              :type="activePrecheckResult.passed ? 'success' : 'warning'"
              :closable="false"
              show-icon
            />
            <div class="precheck-summary">
              <article class="precheck-summary__item">
                <span>总文章数</span>
                <strong>{{ activePrecheckResult.totalCount }}</strong>
              </article>
              <article class="precheck-summary__item">
                <span>错误数</span>
                <strong>{{ activePrecheckResult.errors.length }}</strong>
              </article>
            </div>

            <el-table
              v-if="activePrecheckResult.errors.length > 0"
              :data="activePrecheckResult.errors"
              size="small"
              border
              stripe
              table-layout="auto"
            >
              <el-table-column prop="externalPostId" label="外部文章 ID" min-width="150" align="center" />
              <el-table-column prop="title" label="标题" min-width="220" align="center" show-overflow-tooltip />
              <el-table-column prop="errorMessage" label="错误信息" min-width="260" align="center" show-overflow-tooltip />
            </el-table>
          </template>
          <el-empty v-else description="尚未执行预检" :image-size="84" />
        </section>

        <section class="detail-section">
          <div class="detail-section__header detail-section__header--records">
            <div>
              <h3 class="detail-section__title">迁移记录</h3>
              <p class="detail-section__subtitle">按单篇文章查看成功、失败或跳过原因。</p>
            </div>
            <div class="record-toolbar">
              <el-select
                v-model="recordQuery.status"
                clearable
                class="record-toolbar__control"
                placeholder="全部记录状态"
                @change="handleRecordSearch"
              >
                <el-option
                  v-for="option in RECORD_STATUS_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-button v-permission="'content:migration:query'" type="primary" plain @click="handleRecordSearch">
                刷新记录
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="migrationStore.recordLoading"
            :data="migrationStore.records"
            :size="isCompactTable ? 'small' : 'default'"
            border
            stripe
            table-layout="auto"
          >
            <el-table-column prop="id" label="记录 ID" min-width="90" align="center" />
            <el-table-column prop="externalPostId" label="外部文章 ID" min-width="160" align="center" show-overflow-tooltip />
            <el-table-column prop="title" label="文章标题" min-width="220" align="center" show-overflow-tooltip />
            <el-table-column label="处理状态" min-width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="getRecordStatusTagType(row.status)" effect="light">
                  {{ formatRecordStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="errorMessage" label="错误信息" min-width="280" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.errorMessage || '-' }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination pagination--drawer">
            <el-pagination
              v-model:current-page="recordQuery.current"
              v-model:page-size="recordQuery.size"
              :total="migrationStore.recordTotal"
              :page-sizes="[10, 20, 50, 100]"
              :layout="paginationLayout"
              :small="isCompactTable"
              @current-change="handleRecordCurrentChange"
              @size-change="handleRecordSizeChange"
            />
          </div>
        </section>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useMigrationStore } from '@/stores'
import type {
  BlogMigrationPrecheckResultVO,
  BlogMigrationTaskVO,
  MigrationRecordStatus,
  MigrationTaskQueryRequest,
} from '@/types/api-types'
import { MigrationTaskStatus } from '@/types/api-types'
import { FileUtils, formatCreateTime } from '@/utils'

interface CreateFormState {
  authorId: number | undefined
  remark: string
  fileList: UploadFile[]
}

interface FilePreviewState {
  sourcePlatform: string
  postCount: number | null
  parseError: string
}

const migrationStore = useMigrationStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const TASK_STATUS_OPTIONS = [
  { label: '已创建', value: MigrationTaskStatus.CREATED },
  { label: '预检通过', value: MigrationTaskStatus.PRECHECKED },
  { label: '执行中', value: MigrationTaskStatus.RUNNING },
  { label: '已完成', value: MigrationTaskStatus.COMPLETED },
  { label: '失败', value: MigrationTaskStatus.FAILED },
  { label: '已取消', value: MigrationTaskStatus.CANCELLED },
]

const RECORD_STATUS_OPTIONS = [
  { label: '待处理', value: 0 },
  { label: '成功', value: 1 },
  { label: '失败', value: 2 },
  { label: '已跳过', value: 3 },
]

const searchForm = reactive<MigrationTaskQueryRequest>({
  current: 1,
  size: 10,
  sourcePlatform: undefined,
  authorId: undefined,
  status: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const detailVisible = ref(false)
const createDialogVisible = ref(false)
const submitting = ref(false)
const createFormRef = ref<FormInstance>()
const selectedFile = ref<File | null>(null)
const activeTaskId = ref<number | null>(null)

const createForm = reactive<CreateFormState>({
  authorId: undefined,
  remark: '',
  fileList: [],
})

const filePreview = reactive<FilePreviewState>({
  sourcePlatform: '',
  postCount: null,
  parseError: '',
})

const createFormRules: FormRules<CreateFormState> = {
  authorId: [{ required: true, message: '请输入作者 ID', trigger: 'change' }],
  fileList: [
    {
      validator: (_rule, value: UploadFile[], callback) => {
        if (!value.length || !selectedFile.value) {
          callback(new Error('请选择迁移 JSON 文件'))
          return
        }
        if (filePreview.parseError) {
          callback(new Error('迁移文件解析失败'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}

const recordQuery = reactive({
  current: 1,
  size: 10,
  status: undefined as MigrationRecordStatus | undefined,
})

const activePrecheckResult = computed<BlogMigrationPrecheckResultVO | null>(() => {
  if (!activeTaskId.value) {
    return null
  }

  const result = migrationStore.precheckResult
  return result && result.taskId === activeTaskId.value ? result : null
})

const waitingTaskCount = computed(() =>
  migrationStore.tasks.filter(task =>
    [MigrationTaskStatus.CREATED, MigrationTaskStatus.PRECHECKED, MigrationTaskStatus.RUNNING].includes(task.status)
  ).length
)

const pageSuccessCount = computed(() =>
  migrationStore.tasks.reduce((sum, task) => sum + task.successCount, 0)
)

const pageFailedCount = computed(() =>
  migrationStore.tasks.reduce((sum, task) => sum + task.failedCount, 0)
)

const pageSkippedCount = computed(() =>
  migrationStore.tasks.reduce((sum, task) => sum + task.skippedCount, 0)
)

function buildTaskQuery(): MigrationTaskQueryRequest {
  return {
    current: pagination.current,
    size: pagination.size,
    sourcePlatform: searchForm.sourcePlatform?.trim() || undefined,
    authorId: searchForm.authorId || undefined,
    status: searchForm.status,
  }
}

async function fetchTasks(): Promise<void> {
  try {
    await migrationStore.fetchTasks(buildTaskQuery())
  } catch {
    ElMessage.error('获取迁移任务列表失败')
  }
}

async function fetchRecords(): Promise<void> {
  if (!activeTaskId.value) {
    return
  }

  try {
    await migrationStore.fetchRecords(activeTaskId.value, {
      current: recordQuery.current,
      size: recordQuery.size,
      status: recordQuery.status,
    })
  } catch {
    ElMessage.error('获取迁移记录失败')
  }
}

async function openTaskDetail(taskId: number): Promise<void> {
  activeTaskId.value = taskId
  detailVisible.value = true
  recordQuery.current = 1

  const detail = await migrationStore.fetchTaskById(taskId)
  if (!detail) {
    ElMessage.error('获取迁移任务详情失败')
    detailVisible.value = false
    return
  }

  await fetchRecords()
}

function handleSearch(): void {
  pagination.current = 1
  void fetchTasks()
}

function handleReset(): void {
  searchForm.sourcePlatform = undefined
  searchForm.authorId = undefined
  searchForm.status = undefined
  pagination.current = 1
  pagination.size = 10
  void fetchTasks()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchTasks()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchTasks()
}

function handleRecordCurrentChange(current: number): void {
  recordQuery.current = current
  void fetchRecords()
}

function handleRecordSizeChange(size: number): void {
  recordQuery.size = size
  recordQuery.current = 1
  void fetchRecords()
}

function handleRecordSearch(): void {
  recordQuery.current = 1
  void fetchRecords()
}

function refreshTaskList(): void {
  void fetchTasks()
}

function resetCreateDialog(): void {
  createForm.authorId = undefined
  createForm.remark = ''
  createForm.fileList = []
  selectedFile.value = null
  filePreview.sourcePlatform = ''
  filePreview.postCount = null
  filePreview.parseError = ''
  createFormRef.value?.clearValidate()
}

function openCreateDialog(): void {
  resetCreateDialog()
  createDialogVisible.value = true
}

async function parseMigrationFile(file: File): Promise<void> {
  filePreview.sourcePlatform = ''
  filePreview.postCount = null
  filePreview.parseError = ''

  try {
    const text = await FileUtils.readAsText(file)
    const payload = JSON.parse(text) as { sourcePlatform?: string; posts?: unknown[] }

    if (!payload.sourcePlatform || !Array.isArray(payload.posts)) {
      filePreview.parseError = 'JSON 结构无效，需包含 sourcePlatform 和 posts 数组'
      return
    }

    filePreview.sourcePlatform = String(payload.sourcePlatform).toLowerCase()
    filePreview.postCount = payload.posts.length
  } catch {
    filePreview.parseError = 'JSON 文件解析失败，请检查编码和格式'
  }
}

function handleMigrationFileRemove(): void {
  selectedFile.value = null
  filePreview.sourcePlatform = ''
  filePreview.postCount = null
  filePreview.parseError = ''
}

function handleMigrationFileChange(file: UploadFile, files: UploadFile[]): void {
  createForm.fileList = files.slice(-1)
  selectedFile.value = file.raw ?? null

  if (!selectedFile.value) {
    filePreview.parseError = '未获取到上传文件'
    return
  }

  if (!selectedFile.value.name.toLowerCase().endsWith('.json')) {
    filePreview.parseError = '仅支持 .json 文件'
    return
  }

  void parseMigrationFile(selectedFile.value)
}

async function handleCreateTask(): Promise<void> {
  if (!createFormRef.value) {
    return
  }

  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid || !selectedFile.value || !createForm.authorId) {
    return
  }

  const formData = new FormData()
  formData.append('authorId', String(createForm.authorId))
  if (createForm.remark.trim()) {
    formData.append('remark', createForm.remark.trim())
  }
  formData.append('file', selectedFile.value)

  submitting.value = true
  try {
    const task = await migrationStore.createTask(formData)
    if (!task) {
      ElMessage.error('创建迁移任务失败')
      return
    }

    ElMessage.success('迁移任务已创建')
    createDialogVisible.value = false
    await fetchTasks()
    await openTaskDetail(task.id)
  } finally {
    submitting.value = false
  }
}

async function handleViewDetail(row: BlogMigrationTaskVO): Promise<void> {
  await openTaskDetail(row.id)
}

function canPrecheck(task: BlogMigrationTaskVO): boolean {
  return task.status !== MigrationTaskStatus.RUNNING && task.status !== MigrationTaskStatus.CANCELLED
}

function canExecute(task: BlogMigrationTaskVO): boolean {
  return task.status === MigrationTaskStatus.PRECHECKED
}

async function handlePrecheck(task: BlogMigrationTaskVO): Promise<void> {
  const result = await migrationStore.precheck(task.id)
  if (!result) {
    ElMessage.error('预检失败')
    return
  }

  ElMessage[result.passed ? 'success' : 'warning'](
    result.passed ? '预检通过，可以执行导入' : `预检未通过，共 ${result.errors.length} 条错误`
  )

  await fetchTasks()
  if (detailVisible.value && activeTaskId.value === task.id) {
    await migrationStore.fetchTaskById(task.id)
  }
}

async function handleExecute(task: BlogMigrationTaskVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定执行迁移任务 #${task.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  const executedTask = await migrationStore.execute(task.id)
  if (!executedTask) {
    ElMessage.error('执行迁移失败')
    return
  }

  ElMessage.success('迁移任务已执行')
  await fetchTasks()

  if (detailVisible.value && activeTaskId.value === task.id) {
    await migrationStore.fetchTaskById(task.id)
    await fetchRecords()
  }
}

async function handleExportFailures(task: BlogMigrationTaskVO): Promise<void> {
  const exported = await migrationStore.exportFailures(task.id)
  if (!exported) {
    ElMessage.error('导出失败记录失败')
    return
  }

  const blob =
    exported instanceof Blob
      ? exported
      : new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json;charset=utf-8' })
  FileUtils.downloadBlob(blob, `blog-migration-failures-${task.id}.xlsx`)
  ElMessage.success('失败记录导出已开始')
}

function calculateTaskProgress(task: BlogMigrationTaskVO): number {
  if (!task.totalCount) {
    return task.status === MigrationTaskStatus.PRECHECKED ? 10 : 0
  }

  const finishedCount = task.successCount + task.failedCount + task.skippedCount
  return Math.min(100, Math.round((finishedCount / task.totalCount) * 100))
}

function formatSourcePlatform(value?: string): string {
  if (!value) {
    return '-'
  }

  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatTaskStatus(status: MigrationTaskStatus): string {
  const option = TASK_STATUS_OPTIONS.find(item => item.value === status)
  return option?.label ?? `状态 ${status}`
}

function formatRecordStatus(status: MigrationRecordStatus): string {
  const option = RECORD_STATUS_OPTIONS.find(item => item.value === status)
  return option?.label ?? `状态 ${status}`
}

function getTaskStatusTagType(
  status: MigrationTaskStatus
): 'info' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case MigrationTaskStatus.PRECHECKED:
      return 'warning'
    case MigrationTaskStatus.COMPLETED:
      return 'success'
    case MigrationTaskStatus.FAILED:
      return 'danger'
    default:
      return 'info'
  }
}

function getRecordStatusTagType(
  status: MigrationRecordStatus
): 'info' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'danger'
    case 3:
      return 'warning'
    default:
      return 'info'
  }
}

function formatRatio(value: number, total: number): string {
  if (!total) {
    return '0%'
  }

  return `${Math.round((value / total) * 100)}%`
}

onMounted(() => {
  void fetchTasks()
})
</script>

<style scoped>
.migration-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1680px;
  margin: 0 auto;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 0;
  align-items: center;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-item {
  margin-right: 16px;
}

.filter-control {
  width: 220px;
}

.search-actions {
  margin-right: 0;
  margin-left: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.summary-tile__label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.summary-tile__value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
}

.detail-section__subtitle,
.progress-cell__meta {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.detail-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 10px;
}

.table-actions--compact {
  flex-direction: column;
}

.action-column {
  border-left: 2px solid var(--el-border-color);
}

.progress-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.create-form {
  margin-top: 16px;
}

.create-form__control,
.migration-upload {
  width: 100%;
}

.file-preview {
  min-height: 48px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-section__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-section__subtitle {
  margin: 6px 0 0;
}

.detail-section__actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.detail-descriptions :deep(.el-descriptions__label) {
  width: 112px;
}

.precheck-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.precheck-summary__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.precheck-summary__item span {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.precheck-summary__item strong {
  font-size: 22px;
  line-height: 1;
}

.detail-section__header--records {
  align-items: flex-end;
}

.record-toolbar {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.record-toolbar__control {
  width: 180px;
}

.pagination--drawer {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control,
  .record-toolbar__control {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content),
  .record-toolbar {
    width: 100%;
    justify-content: center;
  }

  .detail-section__header,
  .detail-section__header--records,
  .detail-section__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .precheck-summary {
    grid-template-columns: 1fr;
  }
}
</style>
