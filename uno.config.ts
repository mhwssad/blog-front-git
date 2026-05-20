import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // UnoCSS 预设配置
  presets: [
    // 默认预设，包含 Tailwind CSS 和 Windi CSS 的实用类
    presetWind3(),
    // 属性化模式预设，如 <div flex="~ items-center">
    presetAttributify(),
    // 图标预设
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    // 移除 presetWebFonts 以避免 Google Fonts 网络请求超时
    // 如需使用自定义字体，请在 CSS 中手动引入
  ],
  // 自定义快捷方式
  shortcuts: {
    // 布局相关
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'flex-col-between': 'flex flex-col justify-between',
    // 定位相关
    'absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'fixed-center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    // 尺寸相关
    'full-size': 'w-full h-full',
    'screen-size': 'w-screen h-screen',
    // 文本相关
    'text-ellipsis': 'overflow-hidden text-ellipsis whitespace-nowrap',
    'text-line-clamp-2': 'overflow-hidden line-clamp-2',
    'text-line-clamp-3': 'overflow-hidden line-clamp-3',
    // 过渡动画
    'transition-base': 'transition-all duration-300 ease-in-out',
    // 卡片样式
    'card-base': 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4',
    // 按钮样式
    'btn-base': 'px-4 py-2 rounded cursor-pointer transition-base',
    'btn-primary': 'btn-base bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    'btn-secondary': 'btn-base bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    // 输入框样式
    'input-base': 'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600',
  },
  // 自定义主题
  theme: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        dark: '#2563eb',
        light: '#60a5fa',
      },
      success: {
        DEFAULT: '#10b981',
        dark: '#059669',
        light: '#34d399',
      },
      warning: {
        DEFAULT: '#f59e0b',
        dark: '#d97706',
        light: '#fbbf24',
      },
      danger: {
        DEFAULT: '#ef4444',
        dark: '#dc2626',
        light: '#f87171',
      },
    },
    // 内置字体族，不使用 Google Fonts
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, Monaco, monospace',
    },
  },
  // 规则
  rules: [],
  // 变换器
  transformers: [
    // @apply 指令
    transformerDirectives(),
    // 变体组，如 <div class="hover:(bg-red-500 text-white)">
    transformerVariantGroup(),
  ],
  // Safelist 始终生成的类名
  safelist: [],
  // 注意：移除了 content.filesystem 配置，让 UnoCSS 使用默认的智能扫描
  // 默认会自动扫描项目源码并排除 node_modules
})
