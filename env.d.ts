/// <reference types="vite/client" />

declare module 'uno.css'

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MOCK?: string
  readonly VITE_DEV_PROXY_TARGET?: string
  readonly VITE_ENABLE_DEV_TOOLS?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_LOG_BUFFER_SIZE?: string
  readonly VITE_ENABLE_LOG_PERSISTENCE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
