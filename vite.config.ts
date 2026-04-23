import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableMock = env.VITE_ENABLE_MOCK === 'true'
  const proxyTarget = env.VITE_DEV_PROXY_TARGET

  return {
    plugins: [
      vue(),
      vueDevTools(),
      mockDevServerPlugin({
        enabled: enableMock,
        prefix: '^/api',
        log: 'error',
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/,
        ],
      }),
      Components({
        resolvers: [ElementPlusResolver(), VueUseComponentsResolver()],
        dts: 'src/components.d.ts',
        extensions: ['vue', 'tsx'],
        deep: true,
        dirs: ['src/components'],
        directoryAsNamespace: false,
      }),
      UnoCSS(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: !enableMock && proxyTarget ? { '^/api': { target: proxyTarget, changeOrigin: true } } : undefined,
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/types/**',
          '**/coverage/**',
          '**/.vscode/**',
          '**/.idea/**',
        ],
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'element-plus', '@element-plus/icons-vue'],
      exclude: [],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus') || id.includes('@element-plus/icons-vue')) return 'element-plus'
              if (id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/')) return 'vue-vendor'
            }
            return undefined
          },
        },
      },
    },
  }
})
