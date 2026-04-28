<template>
  <div class="channel-apply-page">
    <div class="page-header">
      <h2 class="page-title">申请创建频道</h2>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="max-width: 600px"
    >
      <el-form-item label="频道名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入频道名称" />
      </el-form-item>

      <el-form-item label="频道描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入频道描述"
        />
      </el-form-item>

      <el-form-item label="频道类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio value="topic">主题频道</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="申请理由" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请说明申请理由"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交申请</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  description: '',
  type: 'topic',
  reason: '',
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入频道名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入频道描述', trigger: 'blur' }],
})

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  ElMessage.success('频道申请已提交，请耐心等待审核')
  router.back()
}
</script>

<style scoped>
.channel-apply-page {
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
</style>
