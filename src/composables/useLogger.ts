import { createLogger, type Logger } from '@/utils/logger'

type Scope = 'app' | 'http' | 'router' | 'store' | 'chat' | 'file' | 'storage' | 'auth'

const registry = new Map<string, Logger>()

function get(scope: string): Logger {
  let logger = registry.get(scope)
  if (!logger) {
    logger = createLogger(scope)
    registry.set(scope, logger)
  }
  return logger
}

export const log = {
  app: get('app'),
  http: get('http'),
  router: get('router'),
  store: get('store'),
  chat: get('chat'),
  file: get('file'),
  storage: get('storage'),
  auth: get('auth'),
} as const satisfies Record<Scope, Logger>

export function createScopedLogger(scope: string): Logger {
  return get(scope)
}
