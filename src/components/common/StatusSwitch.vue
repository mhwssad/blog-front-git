<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue: number
  activeValue?: number
  inactiveValue?: number
  activeText?: string
  inactiveText?: string
  permission?: string
  loading?: boolean
}>(), {
  activeValue: 1,
  inactiveValue: 0,
  activeText: '正常',
  inactiveText: '停用',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const switchValue = computed({
  get: () => props.modelValue,
  set: (val: number) => {
    emit('update:modelValue', val)
    emit('change', val)
  },
})
</script>

<template>
  <el-switch
    v-if="permission"
    v-permission.disable="permission"
    v-model="switchValue"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :active-text="activeText"
    :inactive-text="inactiveText"
    :loading="loading"
    inline-prompt
  />
  <el-switch
    v-else
    v-model="switchValue"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :active-text="activeText"
    :inactive-text="inactiveText"
    :loading="loading"
    inline-prompt
  />
</template>
