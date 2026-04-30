import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'

const vueBaseRules = pluginVue.configs.base.rules
const vueEssentialRules =
  (
    pluginVue.configs['flat/essential' as keyof typeof pluginVue.configs] as
      | { rules?: Record<string, unknown> }
      | undefined
  )?.rules ?? {}
const vueRecommendedRules =
  (
    pluginVue.configs['flat/recommended' as keyof typeof pluginVue.configs] as
      | { rules?: Record<string, unknown> }
      | undefined
  )?.rules ?? {}
const prettierConflictRules = (configPrettier as { rules?: Record<string, 0 | 'off'> }).rules ?? {}
const vueProcessor = pluginVue.processors['.vue'] as {
  preprocess: (text: string, filename: string) => string[]
  postprocess: (messages: unknown[][], filename: string) => unknown[]
  supportsAutofix?: boolean
}

// 自动导入的全局变量
const autoImportGlobals = {
  // Vue APIs
  ref: 'readonly',
  reactive: 'readonly',
  computed: 'readonly',
  watch: 'readonly',
  watchEffect: 'readonly',
  onMounted: 'readonly',
  onUnmounted: 'readonly',
  onBeforeMount: 'readonly',
  onBeforeUnmount: 'readonly',
  nextTick: 'readonly',
  defineComponent: 'readonly',
  defineProps: 'readonly',
  defineEmits: 'readonly',
  withDefaults: 'readonly',
  toRef: 'readonly',
  toRefs: 'readonly',
  isRef: 'readonly',
  unref: 'readonly',
  shallowRef: 'readonly',
  triggerRef: 'readonly',
  customRef: 'readonly',
  // Vue Router
  useRouter: 'readonly',
  useRoute: 'readonly',
  onBeforeRouteUpdate: 'readonly',
  onBeforeRouteLeave: 'readonly',
  // Pinia
  defineStore: 'readonly',
  storeToRefs: 'readonly',
  // VueUse
  useMouse: 'readonly',
  useWindowSize: 'readonly',
  useStorage: 'readonly',
  useToggle: 'readonly',
  useDateFormat: 'readonly',
  useClipboard: 'readonly',
  // Element Plus 组件（自动导入）
  ElButton: 'readonly',
  ElInput: 'readonly',
  ElForm: 'readonly',
  ElFormItem: 'readonly',
  ElTable: 'readonly',
  ElTableColumn: 'readonly',
  ElDialog: 'readonly',
  ElMessageBox: 'readonly',
  ElMessage: 'readonly',
  ElNotification: 'readonly',
  ElLoading: 'readonly',
}

export default [
  // ==================== 全局忽略 ====================
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.turbo/**',
      '**/auto-imports.d.ts',
      '**/components.d.ts',
      '**/types/auto-imports.d.ts',
      '**/uno.css',
      'mock/**',
    ],
  },

  // ==================== JavaScript/TypeScript 文件 ====================
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...autoImportGlobals,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // ==================== Vue 文件 ====================
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: typescriptParser,
        jsxPragma: 'h',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': typescriptEslint,
    },
    processor: vueProcessor,
    rules: {
      ...vueBaseRules,
      ...vueEssentialRules,
      ...vueRecommendedRules,

      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineProps', 'defineEmits', 'defineExpose', 'defineOptions', 'defineSlots'],
        },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 1 },
          multiline: { max: 1 },
        },
      ],
      'vue/no-unused-refs': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
  },

  // ==================== TypeScript 文件 ====================
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig*.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...typescriptEslint.configs['recommended-type-checked'].rules,

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    },
  },

  // ==================== JavaScript 文件 ====================
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'no-undef': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // ==================== 覆盖 Prettier 冲突规则 ====================
  {
    rules: prettierConflictRules,
  },

  // ==================== 测试文件 ====================
  {
    files: ['**/__tests__/**', '**/*.spec.{ts,js}', '**/*.test.{ts,js}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/no-v-html': 'off',
    },
  },

  // ==================== Vite 配置文件 ====================
  {
    files: ['vite.config.*', 'uno.config.*'],
    rules: {
      'no-console': 'off',
      'import/no-default-export': 'off',
    },
  },
]
