import type { App, ComponentPublicInstance } from 'vue'
import { loggerConfig } from '@/config'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface LogRecord {
  id: string
  timestamp: string
  level: Exclude<LogLevel, 'silent'>
  scope: string
  message: string
  args: unknown[]
}

interface LoggerOptions {
  scope: string
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
}

const LOG_STORAGE_KEY = 'app_log_records'
const DEFAULT_SCOPE = 'app'
const defaultLevel = normalizeLogLevel(loggerConfig.level)
const maxBufferSize = Number.isFinite(loggerConfig.bufferSize) && loggerConfig.bufferSize > 0 ? loggerConfig.bufferSize : 200

const logStore = {
  records: loadPersistedLogs(),
}

function normalizeLogLevel(level?: string | null): LogLevel {
  if (!level) {
    return 'info'
  }

  return level in LOG_LEVEL_PRIORITY ? (level as LogLevel) : 'info'
}

function shouldLog(level: Exclude<LogLevel, 'silent'>): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[defaultLevel]
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function persistLogs(): void {
  if (!loggerConfig.enablePersistence || !isBrowser()) {
    return
  }

  try {
    window.sessionStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logStore.records))
  } catch {
    // 日志持久化失败不影响主流程
  }
}

function loadPersistedLogs(): LogRecord[] {
  if (!loggerConfig.enablePersistence || !isBrowser()) {
    return []
  }

  try {
    const raw = window.sessionStorage.getItem(LOG_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as LogRecord[]
    return Array.isArray(parsed) ? parsed.slice(-maxBufferSize) : []
  } catch {
    return []
  }
}

function stringifyMessage(message: unknown): string {
  if (typeof message === 'string') {
    return message
  }

  if (message instanceof Error) {
    return message.message
  }

  try {
    return JSON.stringify(message)
  } catch {
    return String(message)
  }
}

function createRecord(
  level: Exclude<LogLevel, 'silent'>,
  scope: string,
  message: unknown,
  args: unknown[]
): LogRecord {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    level,
    scope,
    message: stringifyMessage(message),
    args,
  }
}

function writeToConsole(record: LogRecord): void {
  const label = `%c[${record.level.toUpperCase()}][${record.scope}]`
  const styleMap: Record<LogRecord['level'], string> = {
    debug: 'color: #909399; font-weight: bold',
    info: 'color: #409eff; font-weight: bold',
    warn: 'color: #e6a23c; font-weight: bold',
    error: 'color: #f56c6c; font-weight: bold',
  }

  const consoleArgs = [label, styleMap[record.level], record.message, ...record.args] as const

  if (record.level === 'error') {
    console.error(...consoleArgs)
    return
  }

  if (record.level === 'warn') {
    console.warn(...consoleArgs)
    return
  }

  if (record.level === 'info') {
    console.info(...consoleArgs)
    return
  }

  console.debug(...consoleArgs)
}

function pushRecord(record: LogRecord): void {
  logStore.records.push(record)
  if (logStore.records.length > maxBufferSize) {
    logStore.records.splice(0, logStore.records.length - maxBufferSize)
  }
  persistLogs()
}

function emit(level: Exclude<LogLevel, 'silent'>, scope: string, message: unknown, args: unknown[]): void {
  if (!shouldLog(level)) {
    return
  }

  const record = createRecord(level, scope, message, args)
  pushRecord(record)
  writeToConsole(record)
}

export interface Logger {
  debug: (message: unknown, ...args: unknown[]) => void
  info: (message: unknown, ...args: unknown[]) => void
  warn: (message: unknown, ...args: unknown[]) => void
  error: (message: unknown, ...args: unknown[]) => void
}

export function createLogger(options: string | LoggerOptions): Logger {
  const scope = typeof options === 'string' ? options : options.scope

  return {
    debug: (message, ...args) => emit('debug', scope || DEFAULT_SCOPE, message, args),
    info: (message, ...args) => emit('info', scope || DEFAULT_SCOPE, message, args),
    warn: (message, ...args) => emit('warn', scope || DEFAULT_SCOPE, message, args),
    error: (message, ...args) => emit('error', scope || DEFAULT_SCOPE, message, args),
  }
}

function resolveComponentName(instance: ComponentPublicInstance | null): string | undefined {
  return instance?.$options.name || instance?.$options.__name
}

export function getLogRecords(): LogRecord[] {
  return [...logStore.records]
}

export function clearLogRecords(): void {
  logStore.records = []

  if (!loggerConfig.enablePersistence || !isBrowser()) {
    return
  }

  try {
    window.sessionStorage.removeItem(LOG_STORAGE_KEY)
  } catch {
    // 忽略清理失败
  }
}

let loggerInstalled = false

export function installLogger(app: App): void {
  if (loggerInstalled) {
    return
  }

  const appLogger = createLogger(DEFAULT_SCOPE)

  app.config.errorHandler = (error, instance, info) => {
    appLogger.error('Vue runtime error', {
      info,
      component: resolveComponentName(instance),
      error,
    })
  }

  if (import.meta.env.DEV) {
    app.config.warnHandler = (message, instance, trace) => {
      appLogger.warn('Vue warning', {
        message,
        component: resolveComponentName(instance),
        trace,
      })
    }
  }

  if (isBrowser()) {
    window.addEventListener('error', event => {
      appLogger.error('Window error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      })
    })

    window.addEventListener('unhandledrejection', event => {
      appLogger.error('Unhandled promise rejection', event.reason)
    })
  }

  loggerInstalled = true
}

export const appLogger = createLogger(DEFAULT_SCOPE)
