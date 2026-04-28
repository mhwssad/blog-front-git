<template>
  <div class="ai-config-page">
    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>模型配置</span>
          <el-switch v-model="formData.enabled" active-text="启用 AI 功能" inactive-text="已关闭" />
        </div>
      </template>
      <el-form :model="formData" label-width="120px" :disabled="!formData.enabled">
        <el-form-item label="模型选择">
          <el-select v-model="formData.model" style="width: 100%">
            <el-option label="GPT-4o" value="gpt-4o" />
            <el-option label="GPT-4o-mini" value="gpt-4o-mini" />
            <el-option label="Claude 3.5 Sonnet" value="claude-3.5-sonnet" />
            <el-option label="DeepSeek V3" value="deepseek-v3" />
            <el-option label="Qwen-Max" value="qwen-max" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="formData.apiKey" type="password" show-password placeholder="请输入 API Key" />
        </el-form-item>
        <el-form-item label="API Endpoint">
          <el-input v-model="formData.apiEndpoint" placeholder="请输入 API Endpoint" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>
        <span>额度配置</span>
      </template>
      <el-form :model="formData" label-width="120px" :disabled="!formData.enabled">
        <el-form-item label="每日总调用上限">
          <el-input-number v-model="formData.dailyTotalLimit" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="单用户每日上限">
          <el-input-number v-model="formData.dailyUserLimit" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="上下文长度">
          <el-input-number v-model="formData.contextLength" :min="256" :max="128000" :step="256" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>
        <span>数据范围</span>
      </template>
      <el-form :model="formData" label-width="120px" :disabled="!formData.enabled">
        <el-form-item label="允许读取">
          <el-checkbox-group v-model="formData.dataScope">
            <el-checkbox label="公开文章" value="public_article" />
            <el-checkbox label="公开资料" value="public_profile" />
            <el-checkbox label="私聊内容" value="private_message" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>
        <span>提示词模板</span>
      </template>
      <el-form :model="formData" label-width="120px" :disabled="!formData.enabled">
        <el-form-item label="系统提示词">
          <el-input
            v-model="formData.systemPrompt"
            type="textarea"
            :rows="8"
            placeholder="请输入系统提示词模板"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div style="display: flex; justify-content: flex-end; gap: 12px">
      <el-button @click="handleReset">重置默认</el-button>
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'

interface AiConfig {
  enabled: boolean
  model: string
  apiKey: string
  apiEndpoint: string
  dailyTotalLimit: number
  dailyUserLimit: number
  contextLength: number
  dataScope: string[]
  systemPrompt: string
}

const defaultConfig: AiConfig = {
  enabled: false,
  model: 'gpt-4o',
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1',
  dailyTotalLimit: 10000,
  dailyUserLimit: 100,
  contextLength: 4096,
  dataScope: ['public_article', 'public_profile'],
  systemPrompt: '你是一个友好的博客助手，负责帮助用户解答技术问题。',
}

const formData = reactive<AiConfig>({ ...defaultConfig, dataScope: [...defaultConfig.dataScope] })

function handleReset() {
  Object.assign(formData, { ...defaultConfig, dataScope: [...defaultConfig.dataScope] })
  ElMessage.success('已恢复默认配置')
}

function handleSave() {
  ElMessage.success('配置保存成功')
}

onMounted(() => {
  Object.assign(formData, { ...defaultConfig, dataScope: [...defaultConfig.dataScope] })
})
</script>

<style scoped>
.ai-config-page {
  padding: 20px;
}
</style>
